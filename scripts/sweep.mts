/**
 * Removes anything a probe left behind.
 *
 *   npx tsx --env-file=.env.local scripts/sweep.mts
 *
 * Every probe cleans up after itself in a finally block. This exists because
 * that is not enough: a probe that throws partway through its own cleanup —
 * a foreign key it deleted in the wrong order, a table it forgot — leaves
 * rows in a database that also holds real people. Running this after a failed
 * probe is the difference between a clean slate and a slow accumulation of
 * accounts nobody remembers creating.
 *
 * It only ever touches addresses under example.test and example.invalid, both
 * reserved domains that cannot belong to anyone. A real member's address can
 * never match.
 *
 * `.invalid` used to be missing, and the omission was expensive. Probes use
 * both, so every fixture created under `.invalid` was invisible here and
 * stayed in the production database. One such account had accumulated 37
 * course attempts and 28 certificates — so the association's own reports
 * counted 30 certificates when 2 were real. All the while this printed
 * "Nothing to sweep", which is the worst way to be wrong.
 */
import { Client } from 'pg';

/* An array rather than a second pattern, so adding a third reserved domain is
 * one entry and not a second code path to keep in step with the first. */
const SUFFIXES = ['%@example.test', '%@example.invalid'];

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();

/*
 * Journey versions a probe created and did not remove.
 *
 * These matter more than the stray accounts. A leftover version is
 * configuration sitting in the association's own programme data, and the one
 * time it went unnoticed the default journey ended up carrying six
 * requirements nobody had decided on. Named 'probe %' by convention, and
 * never the default one — that guard is not negotiable.
 */
const versions = (
  await c.query<{ id: string; name: string }>(
    `SELECT id, name FROM journey_versions WHERE name LIKE 'probe %' AND NOT is_default`,
  )
).rows;

for (const v of versions) {
  for (const sql of [
    `DELETE FROM hour_allocations WHERE requirement_id IN (
       SELECT r.id FROM stage_requirements r JOIN journey_stages s ON s.id = r.stage_id
        WHERE s.version_id = $1)`,
    `DELETE FROM stage_requirement_progress WHERE requirement_id IN (
       SELECT r.id FROM stage_requirements r JOIN journey_stages s ON s.id = r.stage_id
        WHERE s.version_id = $1)`,
    `DELETE FROM stage_requirements WHERE stage_id IN (
       SELECT id FROM journey_stages WHERE version_id = $1)`,
    'DELETE FROM user_journey_assignments WHERE version_id = $1',
    'DELETE FROM journey_stages WHERE version_id = $1',
    'DELETE FROM journey_versions WHERE id = $1',
  ]) {
    await c.query(sql, [v.id]).catch((e) => console.error(`  ${v.name}: ${(e as Error).message}`));
  }
  console.log(`removed probe journey: ${v.name}`);
}

const stale = (
  await c.query<{ id: string; email: string }>(
    'SELECT id, email FROM users WHERE email LIKE ANY($1) ORDER BY email',
    [SUFFIXES],
  )
).rows;

if (stale.length === 0 && versions.length === 0) {
  console.log('Nothing to sweep.');
  await c.end();
  process.exit(0);
}

console.log(`${stale.length} probe account(s) to remove:`);
for (const u of stale) console.log(`  ${u.email}`);

/*
 * Two passes, and the order inside the first one matters. Several columns
 * point at the person who *acted* rather than the person acted upon —
 * changed_by, verified_by, granted_by, decided_by — so removing one probe
 * account can leave another unremovable. Every reference goes first, then the
 * users.
 */
const references = [
  'DELETE FROM sessions WHERE user_id = $1',
  'DELETE FROM auth_tokens WHERE user_id = $1',
  'DELETE FROM email_deliveries WHERE user_id = $1',
  'DELETE FROM achievements WHERE user_id = $1',
  'DELETE FROM certificates WHERE user_id = $1',
  'DELETE FROM course_module_progress WHERE user_id = $1',
  'DELETE FROM course_attempts WHERE user_id = $1',
  'DELETE FROM hour_allocations WHERE user_id = $1',
  'DELETE FROM hour_entries WHERE user_id = $1 OR verified_by = $1',
  'DELETE FROM activity_attendance WHERE user_id = $1 OR confirmed_by = $1',
  'DELETE FROM activity_registrations WHERE user_id = $1',
  'DELETE FROM volunteer_applications WHERE user_id = $1 OR decided_by = $1',
  'DELETE FROM notifications WHERE user_id = $1',
  'DELETE FROM notification_preferences WHERE user_id = $1',
  'DELETE FROM profile_photos WHERE user_id = $1',
  'DELETE FROM stage_requirement_progress WHERE user_id = $1',
  'DELETE FROM stage_progress WHERE user_id = $1 OR awarded_by = $1',
  'DELETE FROM user_roles WHERE user_id = $1 OR granted_by = $1',
  'DELETE FROM audit_logs WHERE actor_id = $1',
  'DELETE FROM membership_status_history WHERE user_id = $1 OR changed_by = $1',
  'DELETE FROM user_journey_assignments WHERE user_id = $1 OR assigned_by = $1',
  'DELETE FROM activities WHERE created_by = $1',
  'DELETE FROM profiles WHERE user_id = $1',
];

let failures = 0;
for (const u of stale) {
  for (const sql of references) {
    try {
      await c.query(sql, [u.id]);
    } catch (error) {
      const e = error as { code?: string; message?: string };
      // A table that does not exist yet is not a failure — the sweep runs
      // against databases at different migration levels.
      if (e.code === '42P01') continue;
      console.error(`  ${u.email}: ${sql.split(' ')[3]} — ${e.message}`);
      failures += 1;
    }
  }
}

for (const u of stale) {
  try {
    await c.query('DELETE FROM users WHERE id = $1', [u.id]);
  } catch (error) {
    console.error(`  ${u.email}: ${(error as Error).message}`);
    failures += 1;
  }
}

const left = (
  await c.query<{ n: string }>(
    'SELECT count(*)::TEXT AS n FROM users WHERE email LIKE ANY($1)', [SUFFIXES])
).rows[0].n;

console.log(`\n${left} probe account(s) remaining (expected 0)`);
await c.end();
process.exit(left === '0' && failures === 0 ? 0 : 1);
