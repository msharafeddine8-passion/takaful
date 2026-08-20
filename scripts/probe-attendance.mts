/*
 * Attendance gets saved more than once — a duration is corrected, someone
 * turns out not to have come after all — and it pays out in volunteer hours.
 * So the rule it must obey is: one person, one activity, one hour entry, for
 * ever. This walks the same statements saveAttendanceAction runs and reads the
 * volunteer's totals back after each save.
 *
 * Everything happens inside a transaction that is rolled back, so the database
 * is exactly as the run found it.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

let confirmed = 0;
let holes = 0;
function check(label: string, pass: boolean, note = '') {
  if (pass) {
    confirmed++;
    console.log(`  ok       ${label}${note ? `  — ${note}` : ''}`);
  } else {
    holes++;
    console.log(`  HOLE     ${label}${note ? `  — ${note}` : ''}`);
  }
}

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

const actId = randomUUID();
const volunteerId = randomUUID();
const supervisorId = randomUUID();

const mkUser = async (id: string, name: string) => {
  await c.query(
    `INSERT INTO users (id,email,password_hash,locale,status) VALUES ($1,$2,'x','ar','active')`,
    [id, `probe-att-${id}@example.invalid`],
  );
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1,$2)', [id, name]);
};

/** The same sequence saveAttendanceAction performs, in the same order. */
async function save(attended: boolean, minutes: number) {
  const { rows } = await c.query<{ id: string; hour_entry_id: string | null }>(
    `SELECT id, hour_entry_id FROM activity_attendance
      WHERE activity_id=$1 AND user_id=$2 FOR UPDATE`,
    [actId, volunteerId],
  );
  const existing = rows[0] ?? null;
  let entryId = existing?.hour_entry_id ?? null;

  if (attended) {
    if (entryId) {
      await c.query(`UPDATE hour_entries SET minutes=$2, status='verified' WHERE id=$1`, [entryId, minutes]);
    } else {
      entryId = randomUUID();
      await c.query(
        `INSERT INTO hour_entries (id,user_id,activity_id,worked_on,minutes,status,verified_by,verified_at)
         VALUES ($1,$2,$3,current_date,$4,'verified',$5,now())`,
        [entryId, volunteerId, actId, minutes, supervisorId],
      );
    }
  } else if (entryId) {
    // Rejected, not zeroed and not deleted: chk_hours_minutes forbids zero,
    // and the figure is the evidence of what was corrected.
    await c.query(
      `UPDATE hour_entries SET status='rejected', reject_reason=$2 WHERE id=$1`,
      [entryId, 'سُجِّل الغياب لهذا النشاط بعد أن كان مسجَّلاً حضوراً'],
    );
  }

  await c.query(
    `INSERT INTO activity_attendance
       (id,activity_id,user_id,attended,minutes,confirmed_by,note,hour_entry_id)
     VALUES ($1,$2,$3,$4,$5,$6,NULL,$7)
     ON CONFLICT (activity_id,user_id) DO UPDATE
       SET attended=EXCLUDED.attended, minutes=EXCLUDED.minutes,
           confirmed_by=EXCLUDED.confirmed_by, hour_entry_id=EXCLUDED.hour_entry_id`,
    [existing?.id ?? randomUUID(), actId, volunteerId, attended,
     attended ? minutes : null, supervisorId, entryId],
  );
}

const totals = async () => {
  const v = await c.query<{ m: string }>(
    `SELECT COALESCE(SUM(minutes),0)::TEXT AS m FROM hour_entries
      WHERE user_id=$1 AND status IN ('pending','verified')`, [volunteerId]);
  const rows = await c.query<{ n: string }>(
    `SELECT count(*)::TEXT AS n FROM hour_entries WHERE user_id=$1`, [volunteerId]);
  return { minutes: Number(v.rows[0].m), entries: Number(rows.rows[0].n) };
};

console.log('--- attendance becomes hours, exactly once ---');

await mkUser(volunteerId, 'متطوّع الحضور');
await mkUser(supervisorId, 'مشرف');
await c.query(
  `INSERT INTO activities (id,title_ar,title_en,capacity,starts_at,ends_at,is_open,is_archived)
   VALUES ($1,'نشاط الحضور','probe attendance',10,
           now() - interval '1 day', now() - interval '1 day' + interval '3 hours', true, false)`,
  [actId],
);
await c.query(
  `INSERT INTO activity_registrations (id,activity_id,user_id,status) VALUES ($1,$2,$3,'registered')`,
  [randomUUID(), actId, volunteerId],
);

await save(true, 180);
let t = await totals();
check('present for three hours credits 180 minutes', t.minutes === 180 && t.entries === 1,
  `${t.minutes} min across ${t.entries} entry`);

await save(true, 180);
t = await totals();
check('saving the identical sheet again does not double it', t.minutes === 180 && t.entries === 1,
  `${t.minutes} min across ${t.entries} entry`);

await save(true, 120);
t = await totals();
check('correcting 180 to 120 moves the total rather than adding to it', t.minutes === 120 && t.entries === 1,
  `${t.minutes} min across ${t.entries} entry`);

await save(false, 0);
t = await totals();
check('marking absent takes the hours back off', t.minutes === 0 && t.entries === 1,
  `${t.minutes} min across ${t.entries} entry`);

const rejected = await c.query<{ reason: string | null }>(
  `SELECT reject_reason AS reason FROM hour_entries WHERE activity_id=$1`, [actId]);
check('and the rejection says why', Boolean(rejected.rows[0]?.reason));

await save(true, 90);
t = await totals();
check('marking present again credits once, not twice', t.minutes === 90 && t.entries === 1,
  `${t.minutes} min across ${t.entries} entry`);

const att = await c.query<{ n: string }>(
  `SELECT count(*)::TEXT AS n FROM activity_attendance WHERE activity_id=$1`, [actId]);
check('one attendance row throughout', Number(att.rows[0].n) === 1);

console.log('\n--- a cancelled activity refuses attendance ---');
await c.query(`UPDATE activities SET cancelled_at=now(), cancel_reason='اختبار' WHERE id=$1`, [actId]);
let refused = false;
try {
  await c.query(
    `UPDATE activity_attendance SET minutes = 60 WHERE activity_id=$1 AND user_id=$2`,
    [actId, volunteerId],
  );
} catch {
  refused = true;
}
check('the database refuses it, whatever the form believes', refused);

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
