/**
 * Crediting prior service as participation, for the things that GRANT.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local \
 *     scripts/credit-prior-activities.mts          # dry run, writes nothing
 *   npx tsx --conditions=react-server --env-file=.env.local \
 *     scripts/credit-prior-activities.mts --run    # grants the badges
 *
 * WHAT CHANGED, AND WHY THIS SCRIPT EXISTS
 *
 * lib/impact.ts has always turned carried-over hours into an activities figure
 * at the association's own rate — one activity per two hours — and every page
 * that PRINTS a count has always used it. Badges, journey stages and milestones
 * did not: they counted rows on activity_attendance. So a volunteer whose
 * dashboard said 151 activities did not hold «أول نشاط» and sat blocked on a
 * stage asking for one. Those three now read the credited figure.
 *
 * The engine will reach every affected person on its own — recomputeAchievements
 * runs on the achievements page — but it would do it one volunteer at a time,
 * over weeks, whenever each happened to log in. This grants them together, and
 * says so once.
 *
 * WHY DEFAULT-DRY
 *
 * DATABASE_URL points at production. Without --run this reads and prints and
 * touches nothing, so the cost of typing the command wrong is a wasted minute.
 *
 * ONE NOTIFICATION PER PERSON, NOT ONE PER BADGE.
 *
 * The property scripts/impact-backfill.mts established and lib/notify.ts
 * records. Somebody receiving eleven messages in one minute for work they did
 * in 2022 is being spammed by a bookkeeping change.
 *
 * WHAT IT GRANTS, AND WHAT IT LEAVES ALONE
 *
 * Only the badges this rule change unlocked — a badge somebody is owed for
 * some other reason is left to the engine, silently, exactly as before. So the
 * audit line for this run means one thing and not two.
 *
 * It applies the engine's own three filters: a retired badge is skipped, a
 * hand-granted badge is never touched, and a badge already held is not
 * regranted. ON CONFLICT DO NOTHING on top of that, so a second run grants
 * nothing twice.
 *
 * It writes no activity_attendance rows. It never will. A row there says a
 * named person was at a named activity on a named day, confirmed by a named
 * supervisor; a hundred and fifty invented ones would corrupt every register
 * and export with no way back. The figure stays derived.
 */
import { query, queryOne, execute } from '../src/lib/db.ts';
import { ACHIEVEMENTS, standingFor, type Standing } from '../src/lib/achievements.ts';
import { inCirculation, retiredCodesFrom } from '../src/lib/badge-circulation.ts';
import { activitiesCredited, activitiesFromCarriedMinutes } from '../src/lib/impact.ts';
import { journeyFor } from '../src/lib/journey.ts';
import { notify } from '../src/lib/notify.ts';

const RUN = process.argv.includes('--run');

/* ---------------------------------------------------------------- the set */

/*
 * Only people with carried-over hours can be affected: for everybody else
 * activitiesCredited(rows, 0) is rows, and the new rule is the old rule. Read
 * with the totals so the report can show the arithmetic rather than assert it.
 */
const people = await query<{
  id: string;
  name: string;
  carried: number;
  recorded: number;
}>(
  `SELECT u.id::TEXT                                   AS id,
          COALESCE(p.full_name, u.email)               AS name,
          COALESCE((SELECT SUM(h.minutes) FROM hour_entries h
                     WHERE h.user_id = u.id AND h.status = 'verified'
                       AND h.carried_over), 0)::INTEGER AS carried,
          (SELECT count(*) FROM activity_attendance aa
            WHERE aa.user_id = u.id AND aa.attended)::INTEGER AS recorded
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY u.created_at`,
);

const affected = people.filter((p) => p.carried > 0);

/* Read once per pass, not once per person — the engine does the same. */
const retired = retiredCodesFrom(
  await query<{ code: string; lifted_at: Date | null }>(
    'SELECT code, lifted_at FROM badge_retirements',
  ),
);
const inPlay = inCirculation(ACHIEVEMENTS, retired);

/** The standing as the OLD rule saw it: activities were a row count. */
function asBefore(standing: Standing, recorded: number): Standing {
  return {
    ...standing,
    activities: recorded,
    /* The combination badge read the same row count, so it has to be undone
     * with the same three thresholds the engine now applies in TypeScript. */
    balanced:
      standing.hours >= 3000 && recorded >= 5 && standing.certificates >= 5 ? 1 : 0,
  };
}

type Person = {
  id: string;
  name: string;
  carried: number;
  recorded: number;
  credited: number;
  /** Newly qualifying BECAUSE of this change, engine filters applied. */
  unlocked: string[];
  /** Qualifying for other reasons. Reported, deliberately not granted here. */
  otherDue: string[];
  /** Stage numbers whose required set becomes complete only under the new rule. */
  stagesOpened: number[];
  /** Activity requirements newly satisfied, for the report. */
  reqsSatisfied: Array<{ stage: number; label: string; target: number }>;
  /** They would be told 'first-activity' on their next account page render. */
  firstActivityMilestone: boolean;
};

const report: Person[] = [];

for (const person of affected) {
  const after = await standingFor(person.id);
  const before = asBefore(after, person.recorded);
  const credited = activitiesCredited(person.recorded, person.carried);

  const rows = await query<{ code: string; revoked_at: Date | null; automatic: boolean }>(
    'SELECT code, revoked_at, automatic FROM achievements WHERE user_id = $1',
    [person.id],
  );
  const held = new Map(rows.map((r) => [r.code, r.revoked_at]));
  const byHand = new Set(
    rows.filter((r) => !r.automatic && r.revoked_at === null).map((r) => r.code),
  );

  const unlocked: string[] = [];
  const otherDue: string[] = [];
  for (const def of inPlay) {
    if (byHand.has(def.code)) continue;
    /* Held and standing: nothing to do. Held and withdrawn: it can come back,
     * which the engine treats as earning it, so it counts here too. */
    if (held.has(def.code) && held.get(def.code) === null) continue;
    if (after[def.kind] < def.threshold) continue;
    if (before[def.kind] < def.threshold) unlocked.push(def.code);
    else otherDue.push(def.code);
  }

  /*
   * The journey, from the real evaluator rather than a second copy of it.
   *
   * journeyFor already reads the credited figure, so what it returns IS the
   * after-state. The before-state is recovered for activity requirements only,
   * which is the only kind this change can move: a requirement is newly
   * satisfied when the recorded rows fell short of its target and the credited
   * figure clears it. A stage newly OPENS when every required item on it is
   * satisfied now and at least one of them was not before.
   */
  const stagesOpened: number[] = [];
  const reqsSatisfied: Person['reqsSatisfied'] = [];
  const journey = await journeyFor(person.id);
  if (journey) {
    for (const stage of journey.stages) {
      if (stage.completedAt) continue;
      const required = stage.requirements.filter((r) => r.isRequired);
      if (required.length === 0) continue;

      let movedHere = false;
      let satisfiedBefore = 0;
      for (const r of required) {
        const isActivity = r.kind === 'activity' && r.progress !== null;
        const target = isActivity ? r.progress!.target : 0;
        const wasSatisfied =
          isActivity && r.satisfied ? person.recorded >= target : r.satisfied;
        if (wasSatisfied) satisfiedBefore += 1;
        if (isActivity && r.satisfied && !wasSatisfied) {
          movedHere = true;
          reqsSatisfied.push({ stage: stage.number, label: r.labelEn, target });
        }
      }
      const allSatisfiedNow = required.every((r) => r.satisfied);
      if (allSatisfiedNow && movedHere && satisfiedBefore < required.length) {
        stagesOpened.push(stage.number);
      }
    }
  }

  /*
   * The milestone is NOT sent by this script and cannot be: runMilestones
   * writes milestone_events and the notification in one transaction, on the
   * account page. What this can do is say how many are coming, so the figure
   * is not a surprise. One per person at most — 'first-activity' is one code.
   */
  const alreadyTold = await queryOne<{ code: string }>(
    `SELECT code FROM milestone_events WHERE user_id = $1 AND code = 'first-activity'`,
    [person.id],
  );
  const firstActivityMilestone = credited >= 1 && person.recorded < 1 && !alreadyTold;

  if (unlocked.length || stagesOpened.length || firstActivityMilestone || otherDue.length) {
    report.push({
      id: person.id,
      name: person.name,
      carried: person.carried,
      recorded: person.recorded,
      credited,
      unlocked,
      otherDue,
      stagesOpened,
      reqsSatisfied,
      firstActivityMilestone,
    });
  }
}

/* -------------------------------------------------------------- the report */

const hours = (m: number) => (m / 60).toFixed(m % 60 === 0 ? 0 : 1);
const willNotify = report.filter((p) => p.unlocked.length > 0);
const badgeCount = report.reduce((n, p) => n + p.unlocked.length, 0);
const milestoneCount = report.filter((p) => p.firstActivityMilestone).length;

console.log(`${people.length} accounts · ${affected.length} with carried-over hours`);
console.log(`${report.length} affected by the change\n`);

for (const p of report) {
  console.log(`  ${p.name}`);
  console.log(
    `    ${hours(p.carried)}h carried → +${activitiesFromCarriedMinutes(p.carried)} credited` +
      ` · ${p.recorded} recorded → ${p.credited} activities`,
  );
  console.log(`    badges unlocked : ${p.unlocked.length ? p.unlocked.join(', ') : '—'}`);
  if (p.otherDue.length) {
    console.log(`    due anyway      : ${p.otherDue.join(', ')}   (left to the engine)`);
  }
  console.log(
    `    stages opened   : ${p.stagesOpened.length ? p.stagesOpened.join(', ') : '—'}`,
  );
  for (const r of p.reqsSatisfied) {
    console.log(`        stage ${r.stage}: "${r.label}" (needs ${r.target})`);
  }
  console.log(`    milestone       : ${p.firstActivityMilestone ? 'first-activity, on their next account page' : '—'}`);
  console.log('');
}

console.log('─'.repeat(64));
console.log(`badges to grant        : ${badgeCount} across ${willNotify.length} people`);
console.log(`badge.earned sent      : ${willNotify.length}  (one per person)`);
console.log(`milestone.reached later: ${milestoneCount}  (fired by the account page, not here)`);
console.log(`stages opened          : ${report.reduce((n, p) => n + p.stagesOpened.length, 0)}`);

if (!RUN) {
  console.log('\nNothing written. Pass --run to grant these.');
  process.exit(0);
}

/* --------------------------------------------------------------- the apply */

console.log('\ngranting…');
let written = 0;

for (const p of willNotify) {
  const standing = await standingFor(p.id);
  const granted: string[] = [];

  for (const code of p.unlocked) {
    const def = ACHIEVEMENTS.find((d) => d.code === code)!;
    const value = standing[def.kind] ?? 0;

    /*
     * ON CONFLICT DO NOTHING against uq_achievement_live_once — a second run
     * grants nothing twice, and two runs at once cannot double a badge.
     * `automatic` is TRUE: this is the engine's rule applied, not somebody's
     * decision, and a hand-granted badge is one recomputing must never
     * withdraw.
     *
     * `value` is today's figure. The day this person actually crossed the line
     * is years ago and is not recoverable — nothing recorded it — and inventing
     * a date would be worse than an honest "counted when the system learned to
     * count it".
     */
    const inserted = await queryOne<{ id: string }>(
      `INSERT INTO achievements (user_id, code, value, automatic)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT DO NOTHING
       RETURNING id::TEXT`,
      [p.id, code, value],
    );
    if (inserted) {
      written += 1;
      granted.push(code);
      continue;
    }

    /*
     * A badge they held and lost to a correction, now earned again.
     *
     * The INSERT above cannot restore one: the row already exists, so
     * ON CONFLICT DO NOTHING quietly does nothing and the person is left
     * without a badge this run has just reported as unlocked. recomputeAchievements
     * un-revokes with an UPDATE instead, and the original earned_at stands — a
     * badge somebody lost and won back is the same badge, not a new one.
     *
     * Guarded on revoked_at IS NOT NULL AND automatic, so it can never reach a
     * standing badge and never overwrite a hand-granted one.
     */
    const restored = await queryOne<{ id: string }>(
      `UPDATE achievements
          SET revoked_at = NULL, revoke_reason = NULL, value = $3
        WHERE user_id = $1 AND code = $2
          AND revoked_at IS NOT NULL AND automatic
        RETURNING id::TEXT`,
      [p.id, code, value],
    );
    if (restored) {
      written += 1;
      granted.push(code);
    }
  }

  /* Nothing went in — a concurrent run, or a re-run. No message for no news. */
  if (granted.length === 0) continue;

  const n = granted.length;
  await notify({
    userId: p.id,
    kind: 'badge.earned',
    titleAr: n === 1 ? 'حصلت على شارة جديدة' : `حصلت على ${n} شارات جديدة`,
    titleEn: n === 1 ? 'You have earned a badge' : `You have earned ${n} new badges`,
    bodyAr:
      'احتسبت الجمعية مشاركتك في الأنشطة السابقة على المنصّة، فأضفنا إلى صفحة إنجازاتك ما تستحقّه عنها.',
    bodyEn:
      'The association has counted the activities you took part in before this platform, and we have added what they earn you to your achievements page.',
    link: '/account/achievements',
  }).catch((error) => console.error(`  notification failed for ${p.name}:`, error));
}

await execute(
  `INSERT INTO audit_logs (actor_id, action, target_type, target_id, new_value, reason)
   VALUES (NULL, 'achievements.backfilled', 'system', 'prior-activities', $1, $2)`,
  [
    JSON.stringify({ people: willNotify.length, badges: written }),
    'احتساب الساعات المنقولة مشاركةً في الأنشطة للشارات والمراحل، بمعدّل نشاط لكل ساعتين. إشعار واحد لكل شخص لا إشعار لكل شارة.',
  ],
);

console.log(`\n${written} badges granted to ${willNotify.length} people, one notification each.`);
