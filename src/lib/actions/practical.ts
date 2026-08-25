'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isLocale, type Locale } from '@/lib/i18n';
import {
  submitPractical,
  recordReview,
} from '@/lib/practical-submissions';
import { practicalTaskFor, type Decision } from '@/lib/programme/practical';
import { practicalDictionaries, type PracticalStrings } from '@/lib/dictionaries/practical';
import { notify } from '@/lib/notify';

/**
 * Sending work in, and judging it.
 *
 * The permission checks are here and in the database, and nowhere in a
 * component. A check in JSX hides a button and leaves the POST working, which
 * on this feature would mean anybody who can read a course could record a
 * verdict on somebody else's work under a trainer's name.
 *
 * Both actions write an audit line. The row already carries who decided and
 * when — that is the record a learner reads — but audit_log is the record
 * somebody reads when the question is not "what was I told" but "who has been
 * marking work this month", and those are different questions asked by
 * different people.
 */

/** Refusals the forms can show, keyed to the practical dictionary. */
type Refusal = keyof PracticalStrings['errors'];

export type PracticalFormState = {
  error?: Refusal;
  /** Echoed back so a refusal does not erase what somebody wrote. */
  values?: { body?: string };
  /** Increments each run; the form uses it as a remount key. */
  attempt?: number;
  done?: boolean;
};

/*
 * The empty state is NOT exported from here. A 'use server' file may export
 * async functions and nothing else — an exported object is a build failure,
 * not a lint warning — so the form declares its own starting value, exactly as
 * ChallengeForm does.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '');
}

// ------------------------------------------------------------------ writing

export async function submitPracticalAction(
  prev: PracticalFormState,
  formData: FormData,
): Promise<PracticalFormState> {
  const lang = localeOf(formData);
  const slug = text(formData, 'slug').trim();
  const body = text(formData, 'body');
  const attempt = (prev.attempt ?? 0) + 1;

  if (!isDbConfigured()) return { error: 'db', values: { body }, attempt };

  const user = await currentUser();
  /*
   * Signed out is 'db' rather than a message of its own on purpose. The
   * practical screen does not render this form to a visitor at all — it offers
   * the sign-in link the rest of the player offers — so reaching here without
   * a session means a stale tab, and a stale tab wants "try again", not a
   * lecture about accounts.
   */
  if (!user) return { error: 'db', values: { body }, attempt };

  if (!practicalTaskFor(slug)) return { error: 'no-task', values: { body }, attempt };

  const result = await submitPractical(user.id, slug, body);
  if (!result.ok) return { error: result.reason, values: { body }, attempt };

  await audit({
    actorId: user.id,
    action: 'practical.submitted',
    targetType: 'course',
    targetId: slug,
    newValue: { attemptNo: result.attemptNo, characters: body.trim().length },
  });

  // 'layout' so the contents list inside the player picks up the new state as
  // well as the practical screen itself.
  revalidatePath(`/${lang}/academy/${slug}`, 'layout');
  revalidatePath(`/${lang}/account`);
  return { done: true, attempt };
}

// ---------------------------------------------------------------- reviewing

/**
 * A trainer's verdict.
 *
 * Returns nothing: the staff page is a plain form and re-renders from the
 * database, so there is no state to thread back. Every refusal is a no-op — a
 * second trainer reaching a submission that was decided while they were
 * reading it changes nothing, which is the correct outcome and not an error
 * worth interrupting them over.
 */
export async function reviewPracticalAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const submissionId = text(formData, 'submissionId').trim();
  const feedback = text(formData, 'feedback');
  const raw = text(formData, 'decision').trim();

  if (!isDbConfigured()) return;
  if (raw !== 'approved' && raw !== 'changes_requested') return;
  const decision: Decision = raw;

  const reviewer = await currentUser();
  if (!reviewer) return;

  /*
   * The capability is resolved here, once, against the session — not read from
   * the form and not re-derived downstream. recordReview() is handed the
   * answer rather than the user, so there is exactly one place in this feature
   * that decides whether somebody may judge work.
   */
  const capable = can(reviewer, 'practical.review');

  const result = await recordReview({
    submissionId,
    reviewerId: reviewer.id,
    capable,
    decision,
    feedback,
  });
  if (!result.ok) return;

  await audit({
    actorId: reviewer.id,
    action: decision === 'approved' ? 'practical.approved' : 'practical.returned',
    targetType: 'practical_submission',
    targetId: submissionId,
    /*
     * The feedback goes in as the reason when work is sent back, and is
     * deliberately not copied in on an approval. An audit line exists to say
     * why something was refused; an approval needs no defence, and duplicating
     * a trainer's optional praise into a second table is a second copy of
     * somebody's words to keep correct.
     */
    reason: decision === 'changes_requested' ? feedback.trim() : undefined,
    newValue: { courseSlug: result.courseSlug },
  });

  /*
   * The learner is told, whichever way it went.
   *
   * Without this the only way to find out a trainer had read your work was to
   * open the course page and look — so the people who check are told and the
   * people who assume no news means no verdict wait for a message that was
   * never coming.
   *
   * Both languages are written into the row, as every notification here is;
   * which one a reader sees is decided when it is rendered, not when it is
   * sent, because a person can change their language afterwards.
   *
   * The trainer's feedback is NOT copied in. It lives on the submission,
   * where it sits beside the work it is about — a paragraph about somebody's
   * writing, lifted out of its context into a notification list, is a harder
   * thing to read and a second copy of their words to keep correct.
   */
  const t = practicalDictionaries;
  await notify({
    userId: result.learnerId,
    kind: 'practical.reviewed',
    titleAr: decision === 'approved' ? t.ar.notifyApprovedTitle : t.ar.notifyReturnedTitle,
    titleEn: decision === 'approved' ? t.en.notifyApprovedTitle : t.en.notifyReturnedTitle,
    bodyAr: decision === 'approved' ? t.ar.notifyApprovedBody : t.ar.notifyReturnedBody,
    bodyEn: decision === 'approved' ? t.en.notifyApprovedBody : t.en.notifyReturnedBody,
    link: `/academy/${result.courseSlug}`,
  }).catch((error) => {
    /* A notification that fails must not undo a review that succeeded. The
     * verdict is already written and audited; losing the message is a smaller
     * harm than a trainer pressing the button twice because it looked broken. */
    console.error('[practical] could not notify', result.learnerId, error);
  });

  revalidatePath(`/${lang}/staff/practical`);
  revalidatePath(`/${lang}/staff`);
  revalidatePath(`/${lang}/academy/${result.courseSlug}`, 'layout');
}
