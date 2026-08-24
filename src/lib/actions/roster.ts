'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { execute, isDbConfigured, queryOne, transaction } from '@/lib/db';
import { audit, currentUser, setMembershipStatus } from '@/lib/auth';
import { requireCapability } from '@/lib/authz';
import { notifyIn } from '@/lib/notify';
import { isLocale, type Locale } from '@/lib/i18n';
import { findRosterMatch, formatMemberNumber, phoneTail, type MatchStrength } from '@/lib/roster';

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}
function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export type ClaimState = { error?: string; notFound?: boolean };

/**
 * Which matches the association is willing to accept without a human looking.
 *
 * All four are two independent facts agreeing: something that identifies the
 * line — a phone number already on it, or the membership number — and
 * something that corroborates the person holding it, either a name that folds
 * to the same name or the right date of birth. Someone who can produce a pair
 * was recognised years ago, and making them wait for an administrator to press
 * a button that says nothing more than "yes, that is them" was the friction
 * this whole feature existed to remove, reintroduced one step later.
 *
 * The date of birth pairs were added after the name-only version turned out to
 * work for a minority of real members. The roster is in Arabic and most people
 * register in Latin script, so ten of the sixteen volunteers who got this far
 * had to be approved by hand — and everyone who typed their membership number
 * instead of their phone was told, wrongly, that no such record existed. A
 * birthday reads the same in both alphabets.
 *
 * `phone-only` and `number-only` are deliberately not here. One fact is not
 * two: a phone that matches while nothing else does is the ordinary case of a
 * household sharing a number, and telling a mother she is her son is not a
 * small mistake. Those go to staff — but they are recorded first, which is
 * what `number-only` had to be invented to fix.
 */
const SELF_EVIDENT: readonly MatchStrength[] = [
  'phone-and-name',
  'phone-and-dob',
  'number-and-name',
  'number-and-dob',
];

/**
 * Everything that happens when the association recognises somebody.
 *
 * Shared by the automatic path and the staff-review path on purpose. When these
 * were going to be two blocks of similar-looking code, one of them would
 * eventually have grown a step the other lacked, and the difference between a
 * volunteer recognised by a person and one recognised by a rule would have been
 * something nobody could state.
 *
 * `reviewer` is null when no human was involved, and it stays null the whole
 * way down — into approved_by, granted_by, awarded_by and the status history.
 * Writing the claimant's own id there instead would read, forever after, as
 * though they had approved themselves.
 */
async function recogniseFromRoster(opts: {
  rosterId: string;
  memberNumber: number;
  userId: string;
  reviewer: string | null;
  reason: string;
}): Promise<void> {
  const label = formatMemberNumber(opts.memberNumber);

  await transaction(async (client) => {
    await client.query(
      `UPDATE volunteer_roster
          SET approved_by = $1, approved_at = now()
        WHERE id = $2 AND approved_at IS NULL`,
      [opts.reviewer, opts.rosterId],
    );

    /*
     * The number comes from the roster, not from member_number_seq. That is
     * the point of the whole feature: someone volunteering since 2018 keeps
     * T014 instead of being handed T474 because they got round to signing up
     * late. The WHERE guard leaves an already-numbered profile alone.
     */
    /*
     * The card token is issued in the same statement as the number, because a
     * member with a number and no token has a membership card with no QR on
     * it, and nothing would ever notice — migration 026 backfilled the people
     * who already had numbers, and everyone after them arrives through here.
     *
     * gen_random_bytes rather than anything derived from the number: the whole
     * point of the token is that holding one card tells you nothing about the
     * next. Both guards keep an existing value untouched.
     */
    await client.query(
      `UPDATE profiles
          SET member_number = $1,
              card_token = COALESCE(card_token, encode(gen_random_bytes(16), 'hex'))
        WHERE user_id = $2 AND member_number IS NULL`,
      [opts.memberNumber, opts.userId],
    );

    await notifyIn(client, {
      userId: opts.userId,
      kind: 'application.accepted',
      titleAr: `تم التعرّف عليك — رقم عضويتك ${label} 🎉`,
      titleEn: `You have been recognised — membership number ${label} 🎉`,
      bodyAr: 'أهلاً بعودتك. حسابك مرتبط الآن بسجلّك في الجمعية.',
      bodyEn: 'Welcome back. Your account is now linked to your record with the association.',
      link: '/account',
    });
  });

  await setMembershipStatus({
    userId: opts.userId,
    next: 'accepted_volunteer',
    changedBy: opts.reviewer,
    actorRole: opts.reviewer ? 'applications.review' : null,
    reason: opts.reason,
  });

  await execute(
    `INSERT INTO user_roles (user_id, role, scope_type, granted_by)
     VALUES ($1, 'volunteer', 'self', $2)
     ON CONFLICT DO NOTHING`,
    [opts.userId, opts.reviewer],
  );
  await execute(
    `INSERT INTO stage_progress (user_id, stage, awarded_by, note)
     VALUES ($1, 1, $2, $3)
     ON CONFLICT (user_id, stage) DO NOTHING`,
    [opts.userId, opts.reviewer, opts.reason],
  );
}

/**
 * A volunteer says "I am already one of you".
 *
 * When the evidence speaks for itself — see SELF_EVIDENT — this recognises them
 * on the spot: their old membership number, volunteer standing, stage one. When
 * it does not, it records the claim and stops, and a member of staff who knows
 * the person decides in /staff/roster.
 */
export async function claimRosterAction(
  _prev: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const lang = localeOf(formData);
  if (!isDbConfigured()) return { error: 'dbUnavailable' };

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const phone = text(formData, 'phone');
  const numberRaw = text(formData, 'memberNumber').replace(/[^\d]/g, '');
  const memberNumber = numberRaw ? Number(numberRaw) : null;
  const dateOfBirth = text(formData, 'dateOfBirth');

  /* The date of birth is corroboration, never an identifier. On its own it
   * would match a line the claimant has no other claim to, and four people on
   * this roster share a birthday. */
  if (!phoneTail(phone) && !memberNumber) return { error: 'needIdentifier' };

  // One claim per account. Someone who already claimed cannot go shopping for
  // a second, better number.
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM volunteer_roster WHERE claimed_by = $1',
    [user.id],
  );
  if (existing) redirect(`/${lang}/account`);

  const match = await findRosterMatch({
    phone,
    memberNumber,
    accountName: user.fullName,
    dateOfBirth,
  });
  if (!match) return { notFound: true };
  // Already spoken for. Said plainly rather than silently ignored, because the
  // usual cause is a real person whose entry someone else has claimed.
  if (match.entry.claimed_by) return { error: 'alreadyClaimed' };

  /*
   * RETURNING rather than a bare update: the WHERE is what makes two people
   * racing for one roster line safe, and without a returned row there is no
   * way to tell the loser that they lost.
   */
  const claimed = await queryOne<{ id: string }>(
    `UPDATE volunteer_roster
        SET claimed_by = $1, claimed_at = now()
      WHERE id = $2 AND claimed_by IS NULL
      RETURNING id`,
    [user.id, match.entry.id],
  );
  if (!claimed) return { error: 'alreadyClaimed' };

  await audit({
    actorId: user.id,
    action: 'roster.claimed',
    targetType: 'volunteer_roster',
    targetId: match.entry.id,
    newValue: { memberNumber: match.entry.member_number, strength: match.strength },
  });

  if (SELF_EVIDENT.includes(match.strength)) {
    const reason =
      `Recognised on the association roster as ${formatMemberNumber(match.entry.member_number)}` +
      ` — matched on ${match.strength}, no review required`;

    await recogniseFromRoster({
      rosterId: match.entry.id,
      memberNumber: match.entry.member_number,
      userId: user.id,
      reviewer: null,
      reason,
    });

    /* Recorded separately from roster.approved so that a year from now it is
     * possible to ask which recognitions a person made and which a rule did. */
    await audit({
      actorId: null,
      action: 'roster.auto_approved',
      targetType: 'volunteer_roster',
      targetId: match.entry.id,
      newValue: { memberNumber: match.entry.member_number, userId: user.id, strength: match.strength },
      reason,
    });
  }

  redirect(`/${lang}/account`);
}

/**
 * Staff confirm the claim, and only here does anything actually change: the
 * person becomes a volunteer, carrying the number the association gave them
 * years ago rather than a fresh one off the end of the sequence.
 */
export async function approveClaimAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const rosterId = text(formData, 'rosterId');
  if (!isDbConfigured() || !rosterId) return;

  const reviewer = await requireCapability('applications.review');

  const entry = await queryOne<{
    id: string;
    member_number: number;
    claimed_by: string | null;
    approved_at: string | null;
    full_name: string;
  }>(
    `SELECT id, member_number, claimed_by, approved_at, full_name
       FROM volunteer_roster WHERE id = $1`,
    [rosterId],
  );
  if (!entry?.claimed_by || entry.approved_at) return;
  // Nobody waves their own claim through.
  if (entry.claimed_by === reviewer.id) return;

  const label = formatMemberNumber(entry.member_number);
  const reason = `Recognised on the association roster as ${label}`;

  await recogniseFromRoster({
    rosterId,
    memberNumber: entry.member_number,
    userId: entry.claimed_by,
    reviewer: reviewer.id,
    reason,
  });

  await audit({
    actorId: reviewer.id,
    action: 'roster.approved',
    targetType: 'volunteer_roster',
    targetId: rosterId,
    newValue: { memberNumber: entry.member_number, userId: entry.claimed_by },
    reason,
  });

  revalidatePath(`/${lang}/staff/roster`);
}

export type LinkState = { error?: string; ok?: string };

/**
 * Staff attach an account to a roster line nobody has claimed.
 *
 * The claim form is how this is meant to happen — the volunteer produces two
 * facts and the platform recognises them. This is for the case the form
 * cannot reach: somebody the association is certain about who has not filled
 * it in.
 *
 * It had to exist. Without it, an administrator looking at a member they know
 * is on the roster has no way to say so, and the only button that looked like
 * it would help was "grant role: volunteer" — which wrote a role, moved no
 * membership status, and left a real person unable to register for anything
 * for two days while the page displayed "volunteer" next to their name.
 *
 * Deliberately does the same thing the approval queue does, through the same
 * function, so a link made this way and a claim approved in the ordinary way
 * produce records that cannot be told apart in what they grant — only in the
 * audit reason, which says a person did it without the volunteer asking.
 */
export async function linkAccountToRosterAction(
  _prev: LinkState,
  formData: FormData,
): Promise<LinkState> {
  const lang = localeOf(formData);
  const email = text(formData, 'email').toLowerCase();
  const numberRaw = text(formData, 'memberNumber').replace(/[^\d]/g, '');
  const memberNumber = numberRaw ? Number(numberRaw) : null;
  if (!isDbConfigured()) return { error: 'unavailable' };
  if (!email || !memberNumber) return { error: 'needBoth' };

  const reviewer = await requireCapability('applications.review');

  const account = await queryOne<{ id: string; full_name: string; member_number: number | null }>(
    `SELECT u.id, p.full_name, p.member_number
       FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE lower(u.email) = $1`,
    [email],
  );
  if (!account) return { error: 'noAccount' };
  // Nobody links themselves, for the same reason nobody approves their own claim.
  if (account.id === reviewer.id) return { error: 'notYourself' };
  if (account.member_number !== null) return { error: 'alreadyNumbered' };

  const entry = await queryOne<{ id: string; full_name: string; claimed_by: string | null }>(
    'SELECT id, full_name, claimed_by FROM volunteer_roster WHERE member_number = $1',
    [memberNumber],
  );
  if (!entry) return { error: 'noLine' };
  if (entry.claimed_by) return { error: 'lineTaken' };

  const label = formatMemberNumber(memberNumber);
  const reason =
    `Linked to roster line ${label} by a member of staff — the volunteer did not use the claim ` +
    `form. Roster name "${entry.full_name}", account name "${account.full_name}".`;

  /*
   * The claim is written first, because recogniseFromRoster answers a claim
   * rather than creating one: it sets approved_at on a line and expects a
   * claimant to already be on it. Guarded on claimed_by so two members of
   * staff pressing this at once cannot both proceed.
   */
  const claimed = await queryOne<{ id: string }>(
    `UPDATE volunteer_roster SET claimed_by = $1, claimed_at = now()
      WHERE id = $2 AND claimed_by IS NULL
      RETURNING id`,
    [account.id, entry.id],
  );
  if (!claimed) return { error: 'lineTaken' };

  await recogniseFromRoster({
    rosterId: entry.id,
    memberNumber,
    userId: account.id,
    reviewer: reviewer.id,
    reason,
  });

  await audit({
    actorId: reviewer.id,
    action: 'roster.linked_by_staff',
    targetType: 'volunteer_roster',
    targetId: entry.id,
    newValue: { memberNumber, userId: account.id, email },
    reason,
  });

  revalidatePath(`/${lang}/staff/roster`);
  return { ok: `${label} · ${account.full_name}` };
}

/**
 * Staff say this is not that person. The roster line is released so the real
 * volunteer can claim it, and the claimant is told — a claim that disappears
 * without a word is how someone concludes the site is broken.
 */
export async function rejectClaimAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const rosterId = text(formData, 'rosterId');
  const reason = text(formData, 'reason');
  if (!isDbConfigured() || !rosterId || !reason) return;

  const reviewer = await requireCapability('applications.review');

  const entry = await queryOne<{ claimed_by: string | null; member_number: number }>(
    'SELECT claimed_by, member_number FROM volunteer_roster WHERE id = $1 AND approved_at IS NULL',
    [rosterId],
  );
  if (!entry?.claimed_by) return;

  await transaction(async (client) => {
    await client.query(
      `UPDATE volunteer_roster
          SET claimed_by = NULL, claimed_at = NULL
        WHERE id = $1 AND approved_at IS NULL`,
      [rosterId],
    );
    await notifyIn(client, {
      userId: entry.claimed_by!,
      kind: 'application.rejected',
      titleAr: 'بخصوص ربط حسابك بسجلّ التطوّع',
      titleEn: 'About linking your account to a volunteering record',
      bodyAr: reason,
      bodyEn: reason,
      link: '/account',
    });
  });

  await audit({
    actorId: reviewer.id,
    action: 'roster.rejected',
    targetType: 'volunteer_roster',
    targetId: rosterId,
    previousValue: { claimedBy: entry.claimed_by },
    reason,
  });

  revalidatePath(`/${lang}/staff/roster`);
}
