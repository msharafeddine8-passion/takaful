/**
 * What has actually happened to the email this site tried to send.
 *
 * Read-only. Reads DATABASE_URL from the environment
 * (node --env-file=.env.local) and never prints it.
 *
 * Addresses are masked: the question here is whether delivery works, and the
 * answer never needs a volunteer's inbox written to a terminal.
 */
import { Client } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const mask = (address: string): string => {
  const [user = '', domain = ''] = address.split('@');
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`;
};

const client = new Client({ connectionString: url, connectionTimeoutMillis: 15_000 });
await client.connect();

const present = (name: string) => ((process.env[name] ?? '').trim() ? 'set' : 'MISSING');
console.log('local environment');
console.log(`  RESEND_API_KEY  ${present('RESEND_API_KEY')}`);
console.log(`  EMAIL_FROM      ${present('EMAIL_FROM')}`);

const total = await client.query<{ status: string; n: string; newest: Date | null }>(`
  SELECT status, count(*) AS n, max(queued_at) AS newest
    FROM email_deliveries
   GROUP BY status
   ORDER BY n DESC
`);

console.log(`\nemail_deliveries by status`);
if (total.rows.length === 0) {
  console.log('  (no rows - nothing has ever tried to send)');
}
for (const r of total.rows) {
  const when = r.newest ? r.newest.toISOString().slice(0, 16).replace('T', ' ') : '-';
  console.log(`  ${r.status.padEnd(9)} ${String(r.n).padStart(5)}   newest ${when}`);
}

const resets = await client.query<{
  status: string;
  n: string;
  newest: Date | null;
}>(`
  SELECT status, count(*) AS n, max(queued_at) AS newest
    FROM email_deliveries
   WHERE subject ILIKE '%كلمة المرور%' OR subject ILIKE '%Reset your password%'
   GROUP BY status
   ORDER BY n DESC
`);

console.log(`\npassword-reset emails only`);
if (resets.rows.length === 0) {
  console.log('  (none - no reset has ever been requested)');
}
for (const r of resets.rows) {
  const when = r.newest ? r.newest.toISOString().slice(0, 16).replace('T', ' ') : '-';
  console.log(`  ${r.status.padEnd(9)} ${String(r.n).padStart(5)}   newest ${when}`);
}

const recent = await client.query<{
  queued_at: Date;
  status: string;
  to_email: string;
  subject: string;
  attempts: number;
  last_error: string | null;
}>(`
  SELECT queued_at, status, to_email, subject, attempts, last_error
    FROM email_deliveries
   ORDER BY queued_at DESC
   LIMIT 12
`);

console.log(`\nlast ${recent.rows.length} attempts`);
for (const r of recent.rows) {
  const when = r.queued_at.toISOString().slice(0, 16).replace('T', ' ');
  console.log(`  ${when}  ${r.status.padEnd(9)} ${mask(r.to_email).padEnd(26)} ${r.subject.slice(0, 40)}`);
  if (r.last_error) console.log(`${' '.repeat(20)}└ ${r.last_error.slice(0, 160)}`);
}

const users = await client.query<{ n: string; verified: string; addressed: string }>(`
  SELECT count(*) AS n,
         count(email_verified_at) AS verified,
         count(email) FILTER (WHERE email IS NOT NULL AND email <> '') AS addressed
    FROM users
   WHERE status <> 'deactivated'
`);
const u = users.rows[0];
console.log(`\nactive users ${u.n} - with an address ${u.addressed} - verified ${u.verified}`);

await client.end();
