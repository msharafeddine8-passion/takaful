/**
 * Grants the badges people have already earned. Points are not touched.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/impact-backfill.mts --run
 *
 * Without --run it prints what it would do and stops, so the default of typing
 * the command wrong is to do nothing.
 *
 * ONE notification per person, not one per badge.
 *
 * That is the whole reason this exists rather than a loop over
 * recomputeAchievements. Twenty-six people are owed a first-year badge and
 * twenty-five are owed continuity; most of them are owed three or four. Firing
 * the ordinary per-badge notification would put four unread messages in front
 * of somebody who did nothing today, for things they did in 2021 — and the
 * association's own instruction was that the engine must not announce itself
 * every time it runs.
 *
 * Points are deliberately left alone. Badges say "this happened"; points feed
 * a ranking, and a ranking assembled retroactively from a platform three weeks
 * old would put the people with the oldest roster lines at the top before
 * anybody had a chance to do anything on it. When the association decides how
 * it wants that to start, it will be its own run.
 */
import { query, queryOne, execute } from '../src/lib/db.ts';
import { standingFor, ACHIEVEMENTS } from '../src/lib/achievements.ts';
import { notify } from '../src/lib/notify.ts';

const RUN = process.argv.includes('--run');

const people = await query<{ id: string; name: string }>(
  `SELECT u.id, p.full_name AS name
     FROM users u JOIN profiles p ON p.user_id = u.id
    ORDER BY u.created_at`,
);

type Grant = { user: string; name: string; codes: string[] };
const grants: Grant[] = [];
let alreadyHeld = 0;

for (const person of people) {
  const standing = await standingFor(person.id);
  const held = new Set(
    (
      await query<{ code: string }>(
        'SELECT code FROM achievements WHERE user_id = $1 AND revoked_at IS NULL',
        [person.id],
      )
    ).map((r) => r.code),
  );

  const due = ACHIEVEMENTS.filter((d) => {
    const value = standing[d.kind] ?? 0;
    if (value < d.threshold) return false;
    if (held.has(d.code)) { alreadyHeld += 1; return false; }
    return true;
  });

  if (due.length) grants.push({ user: person.id, name: person.name, codes: due.map((d) => d.code) });
}

const total = grants.reduce((n, g) => n + g.codes.length, 0);
console.log(`${people.length} accounts · ${alreadyHeld} badges already held · ${total} to grant across ${grants.length} people\n`);
for (const g of grants) console.log(`  ${g.name.padEnd(28)} ${g.codes.join(', ')}`);

if (!RUN) {
  console.log('\nNothing written. Pass --run to grant these.');
  process.exit(0);
}

console.log('\ngranting…');
let written = 0;
for (const g of grants) {
  for (const code of g.codes) {
    const def = ACHIEVEMENTS.find((d) => d.code === code)!;
    const standing = await standingFor(g.user);
    /*
     * `value` records the figure at the moment of granting, which for a
     * backfill is today's figure and not the one they had when they crossed
     * the line. The true date is not recoverable — nothing recorded when
     * somebody's hours passed fifty — and inventing one would be worse than
     * an honest "counted on the day the system learned to count".
     *
     * ON CONFLICT DO NOTHING against uq_achievement_live_once, so running this
     * twice grants nothing the second time.
     */
    const done = await queryOne<{ id: string }>(
      `INSERT INTO achievements (user_id, code, value, automatic)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT DO NOTHING
       RETURNING id::TEXT`,
      [g.user, code, standing[def.kind] ?? 0],
    );
    if (done) written += 1;
  }

  /* One message, naming the count rather than listing four badges. */
  const n = g.codes.length;
  await notify({
    userId: g.user,
    kind: 'badge.earned',
    titleAr: n === 1 ? 'حصلت على شارة جديدة' : `حصلت على ${n} شارات`,
    titleEn: n === 1 ? 'You have earned a badge' : `You have earned ${n} badges`,
    bodyAr: 'أضفنا إلى صفحة إنجازاتك ما سبق أن حقّقته مع الجمعية.',
    bodyEn: 'We have added what you had already achieved with the association to your achievements page.',
    link: '/account/achievements',
  }).catch((error) => console.error(`  notification failed for ${g.name}:`, error));
}

await execute(
  `INSERT INTO audit_logs (actor_id, action, target_type, target_id, new_value, reason)
   VALUES (NULL, 'achievements.backfilled', 'system', 'backfill', $1, $2)`,
  [
    JSON.stringify({ people: grants.length, badges: written }),
    'منح الشارات المستحقّة سابقاً بعد توسيع مجموعة الشارات. إشعار واحد لكل شخص لا إشعار لكل شارة.',
  ],
);

console.log(`\n${written} badges granted to ${grants.length} people, one notification each.`);
