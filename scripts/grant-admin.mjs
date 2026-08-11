/**
 * Grants the first administrative role.
 *
 * The schema refuses a self-granted role, and there is no other admin to do
 * it, so the very first one has to be inserted here with granted_by NULL -
 * recorded as a system action rather than attributed to someone who did not
 * do it. Every later grant goes through the dashboard and names its grantor.
 */
import { Client } from 'pg';

const EMAIL = process.argv[2];
const ROLE = process.argv[3] ?? 'super_admin';
if (!EMAIL) {
  console.error('usage: node grant-admin.mjs <email> [role]');
  process.exit(1);
}

const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();

const found = await c.query(
  `SELECT u.id, u.email, u.status, p.full_name, u.created_at
     FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE lower(u.email) = lower($1)`,
  [EMAIL],
);

if (found.rows.length === 0) {
  console.log(`No account for ${EMAIL}.`);
  const all = await c.query('SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 10');
  console.log(`Accounts on record (${all.rows.length}):`);
  for (const r of all.rows) console.log('  -', r.email, r.created_at.toISOString().slice(0, 16));
  await c.end();
  process.exit(1);
}

const u = found.rows[0];
console.log('account :', u.full_name, '|', u.email);
console.log('created :', u.created_at.toISOString().slice(0, 16));
console.log('status  :', u.status);

const existing = await c.query(
  `SELECT role FROM user_roles WHERE user_id = $1 AND (valid_until IS NULL OR valid_until > now())`,
  [u.id],
);
console.log('roles   :', existing.rows.map((r) => r.role).join(', ') || '(none)');

if (existing.rows.some((r) => r.role === ROLE)) {
  console.log(`\nAlready holds ${ROLE}; nothing to do.`);
  await c.end();
  process.exit(0);
}

await c.query(
  `INSERT INTO user_roles (user_id, role, scope_type, granted_by) VALUES ($1, $2, 'global', NULL)`,
  [u.id, ROLE],
);
await c.query(
  `INSERT INTO audit_logs (actor_id, action, target_type, target_id, new_value, reason)
   VALUES (NULL, 'role.granted', 'user', $1, $2, $3)`,
  [
    u.id,
    JSON.stringify({ role: ROLE }),
    'Bootstrap: the first administrator, inserted directly because the schema forbids a self-grant and no other admin existed.',
  ],
);

const after = await c.query(
  `SELECT role, scope_type FROM user_roles WHERE user_id = $1 AND (valid_until IS NULL OR valid_until > now()) ORDER BY role`,
  [u.id],
);
console.log('\ngranted :', ROLE);
console.log('roles now:', after.rows.map((r) => `${r.role}(${r.scope_type})`).join(', '));

await c.end();
