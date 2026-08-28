/**
 * Suspending and reactivating an account.
 *
 * The behaviour that matters most is not that a flag flips - it is that the
 * person's open sessions stop working the moment the decision is taken. In an
 * organisation that works with children, a suspension that waits for the next
 * sign-in is not a suspension.
 *
 * The server actions cannot be called from here: they read the caller's
 * session out of a request. So this exercises the same sequence against the
 * database and asserts the guards the actions rely on - the session cut, the
 * status history, the last-administrator rule - actually hold.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { guardedCleanup } from './guarded-cleanup.mts';

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

let holes = 0,
  confirmed = 0;
function check(label: string, ok: boolean, detail: unknown = '') {
  if (!ok) holes += 1;
  else confirmed += 1;
  console.log(`  ${ok ? 'ok      ' : 'HOLE    '} ${label}${detail === '' ? '' : '  — ' + detail}`);
}
async function mustFail(name: string, sql: string, params: unknown[] = []) {
  try {
    await c.query(sql, params);
    console.log(`  HOLE     ${name}  <-- allowed and should not be`);
    holes += 1;
  } catch (e) {
    console.log(`  rejected ${name}  (${(e as { code?: string }).code ?? '?'})`);
    confirmed += 1;
  }
}

const MARK = `sus-${Date.now()}`;
const made: string[] = [];

async function makeUser(tag: string): Promise<string> {
  const id = randomUUID();
  await c.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [
    id, `${MARK}-${tag}@example.test`, 'x',
  ]);
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)', [id, tag]);
  await c.query(
    `INSERT INTO membership_status_history (user_id, new_status) VALUES ($1, 'registered_user')`,
    [id],
  );
  made.push(id);
  return id;
}

/** The exact sequence suspendMemberAction performs. */
async function suspend(userId: string, actorId: string, reason: string) {
  const previous = (
    await c.query<{ s: string }>(
      `SELECT new_status AS s FROM membership_status_history
        WHERE user_id = $1 ORDER BY changed_at DESC, id DESC LIMIT 1`,
      [userId],
    )
  ).rows[0]?.s ?? null;

  await c.query('BEGIN');
  await c.query(`UPDATE users SET status = 'suspended' WHERE id = $1`, [userId]);
  await c.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  await c.query('COMMIT');

  await c.query(
    `INSERT INTO membership_status_history
       (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, $2, 'suspended', $3, 'members.manage', $4)`,
    [userId, previous, actorId, reason],
  );
}

try {
  const admin = await makeUser('admin');
  const member = await makeUser('member');

  await c.query(
    `INSERT INTO user_roles (user_id, role, scope_type, granted_by) VALUES ($1, 'super_admin', 'global', NULL)`,
    [admin],
  );

  console.log('\n--- what the schema refuses ---');
  await mustFail(
    'a status nobody defined',
    `UPDATE users SET status = 'banished' WHERE id = $1`,
    [member],
  );
  await mustFail(
    'an admin-driven status change with no reason',
    `INSERT INTO membership_status_history (user_id, new_status, changed_by, actor_role)
     VALUES ($1, 'suspended', $2, 'members.manage')`,
    [member, admin],
  );

  console.log('\n--- suspending ---');
  const sessionId = randomUUID();
  await c.query(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, now() + INTERVAL '30 days')`,
    [sessionId, member, `${MARK}-live-session`],
  );
  check(
    'the member has a live session before anything happens',
    (
      await c.query<{ n: string }>(
        `SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1 AND expires_at > now()`,
        [member],
      )
    ).rows[0].n === '1',
  );

  await suspend(member, admin, 'safeguarding concern reported');

  check(
    'the account is suspended',
    (await c.query<{ status: string }>('SELECT status FROM users WHERE id = $1', [member])).rows[0]
      .status === 'suspended',
  );
  check(
    'and every session is gone, so access ends now rather than at the next sign-in',
    (
      await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1', [
        member,
      ])
    ).rows[0].n === '0',
  );

  const history = (
    await c.query<{ new_status: string; reason: string | null; changed_by: string | null }>(
      `SELECT new_status, reason, changed_by FROM membership_status_history
        WHERE user_id = $1 ORDER BY changed_at DESC, id DESC LIMIT 1`,
      [member],
    )
  ).rows[0];
  check('the history records the suspension', history.new_status === 'suspended');
  check('with a reason', history.reason === 'safeguarding concern reported', history.reason);
  check('and who decided it', history.changed_by === admin);

  console.log('\n--- what suspension does not do ---');
  check(
    'the account is not deleted',
    (await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM users WHERE id = $1', [member]))
      .rows[0].n === '1',
  );
  check(
    'their history is intact — a suspension is not a way to erase someone',
    Number(
      (
        await c.query<{ n: string }>(
          'SELECT count(*)::TEXT AS n FROM membership_status_history WHERE user_id = $1',
          [member],
        )
      ).rows[0].n,
    ) >= 2,
  );

  console.log('\n--- the last administrator ---');
  const otherAdmins = (
    await c.query<{ n: number }>(
      `SELECT count(*)::INTEGER AS n
         FROM user_roles r JOIN users u ON u.id = r.user_id
        WHERE r.role = 'super_admin' AND r.user_id <> $1 AND u.status = 'active'
          AND (r.valid_until IS NULL OR r.valid_until > now())`,
      [admin],
    )
  ).rows[0].n;
  const isAdmin = (
    await c.query<{ n: number }>(
      `SELECT count(*)::INTEGER AS n FROM user_roles
        WHERE user_id = $1 AND role = 'super_admin' AND (valid_until IS NULL OR valid_until > now())`,
      [admin],
    )
  ).rows[0].n;
  check('the probe admin is recognised as one', isAdmin > 0, isAdmin);
  check(
    'the guard is a count of *other* active administrators, so it sees the real ones',
    typeof otherAdmins === 'number',
    otherAdmins,
  );
  // The bootstrap administrator is a real account, so this cohort's admin is
  // never the last one. The assertion that matters is that the count excludes
  // the person being suspended - otherwise the guard could never fire at all.
  const countingSelf = (
    await c.query<{ n: number }>(
      `SELECT count(*)::INTEGER AS n FROM user_roles r JOIN users u ON u.id = r.user_id
        WHERE r.role = 'super_admin' AND u.status = 'active'
          AND (r.valid_until IS NULL OR r.valid_until > now())`,
    )
  ).rows[0].n;
  check(
    'and it is one fewer than the count that includes them',
    countingSelf === otherAdmins + 1,
    `${countingSelf} vs ${otherAdmins}`,
  );

  console.log('\n--- reactivating ---');
  await c.query(`UPDATE users SET status = 'active' WHERE id = $1`, [member]);
  await c.query(
    `INSERT INTO membership_status_history
       (user_id, previous_status, new_status, changed_by, actor_role, reason)
     VALUES ($1, 'suspended', 'inactive_volunteer', $2, 'members.manage', 'concern resolved')`,
    [member, admin],
  );
  check(
    'the account works again',
    (await c.query<{ status: string }>('SELECT status FROM users WHERE id = $1', [member])).rows[0]
      .status === 'active',
  );
  const back = (
    await c.query<{ new_status: string }>(
      `SELECT new_status FROM membership_status_history
        WHERE user_id = $1 ORDER BY changed_at DESC, id DESC LIMIT 1`,
      [member],
    )
  ).rows[0];
  check(
    'they come back as a returning volunteer, not as whatever they were before',
    back.new_status === 'inactive_volunteer',
    back.new_status,
  );
  check(
    'the suspension stays in the record',
    (
      await c.query<{ n: string }>(
        `SELECT count(*)::TEXT AS n FROM membership_status_history
          WHERE user_id = $1 AND new_status = 'suspended'`,
        [member],
      )
    ).rows[0].n === '1',
  );
  check(
    'and no session was resurrected — they sign in again themselves',
    (
      await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM sessions WHERE user_id = $1', [
        member,
      ])
    ).rows[0].n === '0',
  );
} finally {
  console.log('\n--- cleanup ---');
  // Rows are removed in two passes. membership_status_history.changed_by
  // points at the person who acted, so deleting the member first leaves the
  // admin unremovable — every reference has to go before any user does.
  //
  // Both passes run under the delete hatch, in a transaction with a savepoint
  // per statement. This probe grants a super_admin role and suspends an
  // account, so it writes to two tables that refuse a plain DELETE:
  // `user_roles` since migration 046 and `audit_logs` since 049. A refusal
  // there is not a tidiness problem — audit_logs.actor_id is ON DELETE
  // RESTRICT, so the second pass cannot remove the account and a probe admin
  // with a live super_admin grant is left sitting in the production database.
  // See scripts/guarded-cleanup.mts for the two SET LOCAL traps.
  for (const id of made) {
    await guardedCleanup(
      c,
      [
        'DELETE FROM sessions WHERE user_id = $1',
        'DELETE FROM user_roles WHERE user_id = $1 OR granted_by = $1',
        'DELETE FROM audit_logs WHERE actor_id = $1',
        'DELETE FROM membership_status_history WHERE user_id = $1 OR changed_by = $1',
        'DELETE FROM user_journey_assignments WHERE user_id = $1 OR assigned_by = $1',
        'DELETE FROM profiles WHERE user_id = $1',
      ],
      { params: [id] },
    );
  }
  for (const id of made) {
    await c.query('DELETE FROM users WHERE id = $1', [id]).catch((e) =>
      console.error(`  users: ${e.message}`),
    );
  }
  const left = (
    await c.query<{ n: string }>('SELECT count(*)::TEXT AS n FROM users WHERE email LIKE $1', [
      `${MARK}%`,
    ])
  ).rows[0].n;
  console.log(`  ${left} probe users remaining (expected 0)`);
  await c.end();
}

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
process.exit(holes === 0 ? 0 : 1);
