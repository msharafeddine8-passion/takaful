/*
 * Tell the people whose visibility the association changed for them.
 *
 * Migration 038 flipped the default: appearing on the honour board and the
 * volunteer listings is now the ordinary state, and it applied that to the
 * accounts where nobody had ever answered the question. That is a decision the
 * association is entitled to make about its own recognition pages. It is not a
 * decision anybody should discover by finding their own name on the internet.
 *
 * So: one notification each, saying what changed, that it applies to them, and
 * where the switch is. Not a nudge to keep it — the message has to read the
 * same whichever way they would rather go, or it is not information.
 *
 * WHO IT WRITES TO
 *
 * Only the accounts the migration actually stood in for: visibility_chosen_at
 * IS NULL. Somebody who chose for themselves was never touched and does not
 * need telling, and telling them anyway would be a message about a change that
 * did not happen to them.
 *
 * IDEMPOTENT
 *
 * Re-running does not send a second copy. The check is for an existing
 * notification of this kind carrying this link — cheap, and it means a run
 * interrupted half way can simply be run again.
 *
 *   npx tsx --env-file=.env.local scripts/announce-visibility.mts --dry
 *   npx tsx --env-file=.env.local scripts/announce-visibility.mts
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const DRY = process.argv.includes('--dry');

const LINK = '/account/recognition';

const TITLE_AR = 'صار اسمك يظهر في صفحات التقدير';
const TITLE_EN = 'Your name now appears on the recognition pages';

const BODY_AR =
  'كانت الجمعية تعتبر من لم يختر أنه لا يرغب بالظهور، ولم يكن أحد قد سُئل أصلاً. '
  + 'صارت تعتبر الظهور هو الحال المعتاد لمن تطوّع معها، فاسمك الآن يظهر في لوحة الشرف '
  + 'ولوائح المتطوّعين. إن كنت تفضّل ألا تظهر فبإمكانك إخفاءه من إعداداتك في أي وقت، '
  + 'ويسري ذلك فوراً. ساعاتك ونقاطك وشهاداتك لا تتأثر بهذا الخيار إطلاقاً.';

const BODY_EN =
  'Until now the association treated anybody who had not chosen as somebody who would '
  + 'rather not appear — and nobody had ever been asked. It now treats appearing as the '
  + 'ordinary state for a volunteer, so your name appears on the honours board and the '
  + 'volunteer listings. If you would rather it did not, you can hide it from your '
  + 'settings at any time and it takes effect immediately. Your hours, your points and '
  + 'your certificates are unaffected either way.';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

/*
 * The same predicate the migration used, so the two cannot drift: whoever it
 * stood in for is whoever hears about it. Deactivated accounts are skipped —
 * they are not on any public page and a notification nobody will read is a
 * message to a filing cabinet.
 */
const { rows } = await client.query<{ user_id: string; full_name: string }>(`
  SELECT p.user_id, p.full_name
    FROM profiles p
    JOIN users u ON u.id = p.user_id
   WHERE p.visibility_chosen_at IS NULL
     AND p.public_visibility <> 'hidden'
     AND u.status <> 'deactivated'
     AND NOT EXISTS (
       SELECT 1 FROM notifications n
        WHERE n.user_id = p.user_id
          AND n.kind = 'account.welcome'
          AND n.link = $1
          AND n.title_ar = $2
     )
   ORDER BY p.full_name
`, [LINK, TITLE_AR]);

console.log(`${rows.length} account(s) to tell${DRY ? ' (dry run, nothing sent)' : ''}.`);

if (DRY) {
  for (const row of rows.slice(0, 20)) console.log(`  ${row.full_name}`);
  if (rows.length > 20) console.log(`  … and ${rows.length - 20} more`);
  await client.end();
  process.exit(0);
}

/*
 * Written directly rather than through notify(), and the reason is narrow: the
 * mute list must not silence this one. Somebody who turned off badge or
 * leaderboard notifications turned off news about their achievements — they
 * did not ask to be kept from hearing that the association changed a setting
 * on their behalf. It is the only message in the platform with that argument
 * behind it, which is why it is here in a script somebody has to run and not
 * in a code path that could quietly grow more callers.
 *
 * 'account.welcome' rather than a new kind: chk_notification_kind is a shared
 * CHECK and adding to it needs a migration, which for one announcement that
 * runs once is a schema change to carry forever. This is a message about the
 * account itself, which is what that kind already means.
 */
let sent = 0;
for (const row of rows) {
  await client.query(
    `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
     VALUES ($1, $2, 'account.welcome', $3, $4, $5, $6, $7)`,
    [randomUUID(), row.user_id, TITLE_AR, TITLE_EN, BODY_AR, BODY_EN, LINK],
  );
  sent += 1;
}

await client.query(
  `INSERT INTO audit_logs (actor_id, action, target_type, target_id, new_value, reason)
   VALUES (NULL, 'visibility.default_changed', 'system', 'all', $1, $2)`,
  [
    JSON.stringify({ told: sent }),
    'غيّرت الجمعية الإعداد الافتراضي للظهور، وأُبلغ كل من طُبِّق عليه.',
  ],
);

console.log(`Told ${sent} account(s).`);
await client.end();
