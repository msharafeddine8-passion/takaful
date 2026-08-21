/*
 * A volunteer recognised from the association's roster never fills in an
 * application, and the application was where the emergency contact and the
 * guardian's consent were collected. This checks the record that replaced it
 * holds those rules in the database rather than in a form — particularly for a
 * minor, where the consequence of a missing guardian is not paperwork.
 *
 * Runs inside a transaction that is rolled back.
 */
import { Client } from 'pg';
import { randomUUID } from 'node:crypto';

let confirmed = 0;
let holes = 0;
function check(label: string, pass: boolean, note = '') {
  if (pass) { confirmed++; console.log(`  ok       ${label}${note ? `  — ${note}` : ''}`); }
  else { holes++; console.log(`  HOLE     ${label}${note ? `  — ${note}` : ''}`); }
}

const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
await c.connect();
await c.query('BEGIN');

const mkUser = async () => {
  const id = randomUUID();
  await c.query(
    `INSERT INTO users (id,email,password_hash,locale,status) VALUES ($1,$2,'x','ar','active')`,
    [id, `sg-${id}@example.invalid`],
  );
  await c.query('INSERT INTO profiles (user_id, full_name) VALUES ($1,$2)', [id, 'متطوّع']);
  return id;
};

const insert = async (
  userId: string,
  dob: string,
  extra: Partial<Record<'guardian_name' | 'guardian_phone' | 'guardian_consent', string>> = {},
) => {
  await c.query(
    `INSERT INTO safeguarding_records
       (user_id, date_of_birth, emergency_name, emergency_phone,
        guardian_name, guardian_phone, guardian_consent_at,
        code_of_conduct_at, safeguarding_at, data_consent_at)
     VALUES ($1,$2::DATE,'أم المتطوّع','03000000',$3,$4,$5, now(), now(), now())`,
    [userId, dob, extra.guardian_name ?? null, extra.guardian_phone ?? null,
     extra.guardian_consent ? new Date() : null],
  );
};

console.log('--- an adult volunteer ---');
const adult = await mkUser();
await insert(adult, '1998-04-12');
check('an adult record needs no guardian', true);

/* A refused statement poisons the transaction until it is rewound, so every
 * expected refusal runs between a savepoint and a rollback to it. */
async function expectRefusal(label: string, run: () => Promise<unknown>) {
  await c.query('SAVEPOINT sp');
  let refused = false;
  try { await run(); } catch { refused = true; }
  await c.query(refused ? 'ROLLBACK TO SAVEPOINT sp' : 'RELEASE SAVEPOINT sp');
  check(label, refused);
}

console.log('\n--- a minor ---');
const minorA = await mkUser();
await expectRefusal('a minor without a guardian is refused', () => insert(minorA, '2012-06-01'));

const minorB = await mkUser();
await expectRefusal('a named guardian who has not consented is still refused', () =>
  insert(minorB, '2012-06-01', { guardian_name: 'والد المتطوّع', guardian_phone: '03111111' }),
);

const minorC = await mkUser();
await insert(minorC, '2012-06-01', {
  guardian_name: 'والد المتطوّع', guardian_phone: '03111111', guardian_consent: 'yes',
});
check('a minor with a consenting guardian is accepted', true);

console.log('\n--- the emergency contact ---');
const noContact = await mkUser();
await expectRefusal('a blank emergency contact is refused', () =>
  c.query(
    `INSERT INTO safeguarding_records
       (user_id, date_of_birth, emergency_name, emergency_phone,
        code_of_conduct_at, safeguarding_at, data_consent_at)
     VALUES ($1,'1998-04-12'::DATE,'  ','  ', now(), now(), now())`,
    [noContact],
  ),
);

console.log('\n--- one record per person ---');
await expectRefusal('the same volunteer cannot hold two records', () =>
  insert(adult, '1998-04-12'),
);

await c.query('ROLLBACK');
await c.end();

console.log(`\n${confirmed} behaviours confirmed, ${holes} hole(s).`);
console.log('Rolled back; the database is unchanged.');
process.exit(holes === 0 ? 0 : 1);
