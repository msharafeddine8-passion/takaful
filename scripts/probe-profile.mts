/**
 * Profile photos and membership numbers: the rules that stop a card being
 * meaningless, and the ones that stop a photo table becoming a file dump.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { findCardByToken } from '../src/lib/certificates.ts';

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

const MARK = `prf-${Date.now()}`;
async function makeUser(tag: string) {
  const id = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [id, `${MARK}-${tag}@example.test`, 'x']);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
  await c.query(`INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`, [id]);
  return id;
}
const learner = await makeUser('learner');
const vol = await makeUser('vol');
const staff = await makeUser('staff');

console.log('\n--- membership numbers ---');
let n = (await c.query<{ member_number: number | null }>(
  'SELECT member_number FROM profiles WHERE user_id = $1', [learner])).rows[0].member_number;
check('a learner gets no membership number', n === null);

await c.query(
  `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
   VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', $2, 'applications.review', 'probe')`,
  [vol, staff]);
n = (await c.query<{ member_number: number | null }>(
  'SELECT member_number FROM profiles WHERE user_id = $1', [vol])).rows[0].member_number;
check('acceptance issues one', typeof n === 'number', String(n));

const first = n;
await c.query(
  `INSERT INTO membership_status_history (user_id, previous_status, new_status, changed_by, actor_role, reason)
   VALUES ($1, 'inactive_volunteer', 'accepted_volunteer', $2, 'applications.review', 'returned')`,
  [vol, staff]);
n = (await c.query<{ member_number: number | null }>(
  'SELECT member_number FROM profiles WHERE user_id = $1', [vol])).rows[0].member_number;
check('re-accepting does not change it — an old card still identifies them', n === first, String(n));

console.log('\n--- photo storage rules ---');
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
await mustFail(
  'a photo type we do not accept',
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/gif', $2, $3, $4)`,
  [vol, jpeg, jpeg.byteLength, randomUUID()],
);
await mustFail(
  'a byte_size that lies about the bytes',
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/jpeg', $2, 999, $3)`,
  [vol, jpeg, randomUUID()],
);
await mustFail(
  'a photo over the 300KB cap',
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/jpeg', $2, $3, $4)`,
  [vol, Buffer.alloc(400 * 1024, 1), 400 * 1024, randomUUID()],
);
await mustFail(
  'an empty photo',
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/jpeg', $2, 0, $3)`,
  [vol, Buffer.alloc(0), randomUUID()],
);

const v1 = randomUUID();
await c.query(
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/jpeg', $2, $3, $4)`, [vol, jpeg, jpeg.byteLength, v1]);
check('a valid photo is stored', true);

await mustFail(
  'a second photo for the same person',
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/jpeg', $2, $3, $4)`, [vol, jpeg, jpeg.byteLength, randomUUID()],
);

const v2 = randomUUID();
await c.query(
  `INSERT INTO profile_photos (user_id, content_type, bytes, byte_size, version)
   VALUES ($1, 'image/png', $2, $3, $4)
   ON CONFLICT (user_id) DO UPDATE SET content_type = EXCLUDED.content_type,
     bytes = EXCLUDED.bytes, byte_size = EXCLUDED.byte_size, version = EXCLUDED.version`,
  [vol, Buffer.from([0x89, 0x50, 0x4e, 0x47]), 4, v2]);
const stored = (await c.query<{ version: string; content_type: string }>(
  'SELECT version, content_type FROM profile_photos WHERE user_id = $1', [vol])).rows[0];
check('replacing changes the version, so caches stop serving the old one',
  stored.version === v2 && stored.version !== v1);
check('and the type follows the new file', stored.content_type === 'image/png');

console.log('\n--- deleting the person takes the photo with them ---');
await c.query('DELETE FROM profile_photos WHERE user_id = $1', [vol]);
const gone = (await c.query<{ n: string }>(
  'SELECT count(*) AS n FROM profile_photos WHERE user_id = $1', [vol])).rows[0].n;
check('removing a photo leaves nothing behind', gone === '0');

await c.query('ROLLBACK');

/*
 * findMember() reads through the application's connection pool, which cannot
 * see rows written inside the transaction above. So the card lookup is checked
 * against committed data, and cleaned up afterwards - the same reason the
 * activity and portal probes commit rather than roll back.
 */
console.log('\n--- what a scanned card shows (committed) ---');
const cMark = `${MARK}-card`;
let cardUser = '';
try {
  cardUser = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [cardUser, `${cMark}@example.test`, 'x']);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [cardUser, 'حامل البطاقة']);
  await c.query(`INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`, [cardUser]);
  await c.query(
    `INSERT INTO membership_status_history (user_id, previous_status, new_status, reason)
     VALUES ($1, 'volunteer_applicant', 'accepted_volunteer', 'probe')`, [cardUser]);

  const issued = (await c.query<{ member_number: number; card_token: string | null }>(
    'SELECT member_number, card_token FROM profiles WHERE user_id = $1', [cardUser])).rows[0];

  /*
   * This block used to call findMember(memberNumber) and conclude that "a
   * stranger learns the name and standing, and nothing more" — the leak,
   * written down as the requirement and ticked green. Membership numbers run
   * in sequence, so a stranger with a for-loop learned the name and standing
   * of every volunteer in the association.
   *
   * Lookup is by unguessable token now, and what a scan may reveal is decided
   * by the allowlist in lib/card-view.ts, which probe-card holds separately.
   */
  check('a number issued now comes with a card token', Boolean(issued.card_token));
  check('and the token is long enough not to be guessed',
    (issued.card_token ?? '').length >= 32, `${issued.card_token?.length} chars`);

  const found = await findCardByToken(issued.card_token ?? '');
  check('the token resolves to the holder', found?.full_name === 'حامل البطاقة', found?.full_name);
  check('and reports their standing', found?.account_status === 'active', found?.account_status ?? '');

  check('an invented token resolves to nothing', (await findCardByToken('0'.repeat(32))) === null);
  check('a token of the wrong shape never reaches the database',
    (await findCardByToken('../../etc/passwd')) === null);
  check('and neither does an empty one', (await findCardByToken('')) === null);
} finally {
  await c.query('DELETE FROM membership_status_history WHERE user_id = $1', [cardUser]);
  await c.query('DELETE FROM user_journey_assignments WHERE user_id = $1', [cardUser]);
  await c.query('DELETE FROM profiles WHERE user_id = $1', [cardUser]);
  await c.query('DELETE FROM users WHERE id = $1', [cardUser]);
  const left = (await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [`${MARK}%`])).rows[0].n;
  console.log(`\ncleanup: ${left} probe users remaining (expected 0)`);
}

await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
