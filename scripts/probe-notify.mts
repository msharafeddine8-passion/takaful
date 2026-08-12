/**
 * Notifications: written with the event, unmutable when consequential,
 * and readable in both languages.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

let holes = 0, confirmed = 0;
function check(label: string, ok: boolean, detail = '') {
  if (!ok) holes += 1; else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail ? '  — ' + detail : ''}`);
}
async function mustFail(name: string, sql: string, params: unknown[] = []) {
  await c.query('SAVEPOINT s');
  try {
    await c.query(sql, params);
    await c.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  HOLE     ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    await c.query('ROLLBACK TO SAVEPOINT s');
    console.log(`  rejected ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

const MARK = `nt-${Date.now()}`;
const u = randomUUID();
await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
  [u, `${MARK}@example.test`, 'x']);
await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [u, 'Probe']);

console.log('\n--- shape ---');
await mustFail(
  'a notification of a kind we do not recognise',
  `INSERT INTO notifications (id, user_id, kind, title_ar, title_en)
   VALUES ($1, $2, 'gossip', 'x', 'x')`, [randomUUID(), u],
);
await mustFail(
  'an absolute link, which would break when the domain moves',
  `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, link)
   VALUES ($1, $2, 'hours.verified', 'x', 'x', 'https://elsewhere.example/x')`,
  [randomUUID(), u],
);

const n1 = randomUUID();
await c.query(
  `INSERT INTO notifications (id, user_id, kind, title_ar, title_en, body_ar, body_en, link)
   VALUES ($1, $2, 'application.rejected', 'قرار بشأن طلبك', 'A decision on your application',
           'لم تكتمل الشروط هذه المرة.', 'The criteria were not met this time.', '/account')`,
  [n1, u]);
check('a notification carries both languages', true);

const stored = (await c.query<{ title_ar: string; title_en: string; read_at: Date | null }>(
  'SELECT title_ar, title_en, read_at FROM notifications WHERE id = $1', [n1])).rows[0];
check('Arabic survived the round trip', stored.title_ar === 'قرار بشأن طلبك', stored.title_ar);
check('it starts unread', stored.read_at === null);

console.log('\n--- unread counting ---');
for (let i = 0; i < 3; i += 1) {
  await c.query(
    `INSERT INTO notifications (id, user_id, kind, title_ar, title_en)
     VALUES ($1, $2, 'hours.verified', 'اعتُمدت ساعاتك', 'Hours verified')`,
    [randomUUID(), u]);
}
let unread = (await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL', [u])).rows[0].n;
check('four unread', unread === '4', unread);

await c.query('UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL', [u]);
unread = (await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL', [u])).rows[0].n;
check('marking all read clears the count', unread === '0');

const kept = (await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM notifications WHERE user_id = $1', [u])).rows[0].n;
check('but nothing is deleted — the history stays', kept === '4', kept);

console.log('\n--- muting ---');
await c.query(
  `INSERT INTO notification_preferences (user_id, muted_kinds)
   VALUES ($1, ARRAY['activity.reminder','course.available'])`, [u]);
const prefs = (await c.query<{ muted: string[] }>(
  'SELECT muted_kinds AS muted FROM notification_preferences WHERE user_id = $1', [u])).rows[0];
check('a person can mute the noisy kinds', prefs.muted.includes('activity.reminder'));
check('but a decision on their application is not mutable in the first place',
  !prefs.muted.includes('application.rejected'));

console.log('\n--- email delivery log ---');
await mustFail(
  'marking a delivery sent with no send time',
  `INSERT INTO email_deliveries (id, user_id, to_email, subject, status)
   VALUES ($1, $2, 'x@example.test', 's', 'sent')`, [randomUUID(), u],
);
await mustFail(
  'marking a delivery failed with no error recorded',
  `INSERT INTO email_deliveries (id, user_id, to_email, subject, status)
   VALUES ($1, $2, 'x@example.test', 's', 'failed')`, [randomUUID(), u],
);
await c.query(
  `INSERT INTO email_deliveries (id, notification_id, user_id, to_email, subject)
   VALUES ($1, $2, $3, 'x@example.test', 'A decision on your application')`,
  [randomUUID(), n1, u]);
check('a queued delivery links back to what it is telling them about', true);

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
