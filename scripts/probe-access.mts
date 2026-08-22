/*
 * A locked course must not send its lessons to the browser.
 *
 * The academy had two access systems and enforced neither. The course page
 * called `eligibilityFor`, got back "not allowed", and then built and shipped
 * the whole course anyway — printing a padlock notice above the content, and a
 * "start the course" button underneath the sentence saying the reader could
 * not. Anybody with the URL, signed in or not, could read every module of
 * every level-six course.
 *
 * So this probe does not read the code and take its word for it. It asks the
 * running server for a locked course, as a stranger with no cookie, and looks
 * at what came back. That is the only check that would have caught the
 * original bug, because the original bug was a page that computed the right
 * answer and ignored it.
 *
 * Needs the dev server. Skips with a clear note when it is not running rather
 * than failing the suite for an unrelated reason.
 */

import { decideAccess, badgeFor } from '../src/lib/programme/access.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}
const eq = (what: string, got: unknown, want: unknown) =>
  check(what, Object.is(got, want), got === want ? '' : `got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);

/* ------------------------------------------------------------------ *
 * 1. The decision table
 * ------------------------------------------------------------------ */
console.log('\n1. who may read what');

const d = (over: Partial<Parameters<typeof decideAccess>[0]>) =>
  decideAccess({ kind: 'core', signedIn: true, prerequisitesMet: true, published: true, ...over });

eq('a core course with prerequisites met is readable', d({}).canRead, true);
eq('and can be attempted', d({}).canAttempt, true);

/*
 * The shop window is drawn by the course kind, not by the visitor. An earlier
 * version of this rule let anybody read anything with no prerequisites owed,
 * which reopened the leak from the other side.
 */
eq('a signed-out visitor cannot read a core course', d({ signedIn: false }).canRead, false);
eq('and the state says what would open it', d({ signedIn: false }).state, 'login_required');

/* The one thing that genuinely hides content. */
eq('unmet prerequisites shut a course', d({ prerequisitesMet: false }).canRead, false);
eq('and the state says why', d({ prerequisitesMet: false }).state, 'prerequisite_locked');
/* Reported as the lock, not as "sign in" — signing in would not open it, and
 * advice that does not work is worse than none. */
eq('signed out AND locked reports the lock, not the login',
  d({ signedIn: false, prerequisitesMet: false }).state, 'prerequisite_locked');

/* The shop window. gate.ts already drew the line here; this is the same
 * decision, moved somewhere it is actually enforced. */
eq('orientation is readable signed out', d({ kind: 'orientation', signedIn: false }).canRead, true);
eq('an elective is readable signed out', d({ kind: 'elective', signedIn: false }).canRead, true);
eq('and signing in makes the quiz available',
  d({ kind: 'elective', signedIn: true }).canAttempt, true);

eq('unpublished content is a preview for everybody',
  d({ published: false }).state, 'preview_only');
eq('including somebody who has met every prerequisite',
  d({ published: false, prerequisitesMet: true, signedIn: true }).canRead, false);
eq('staff-only content is shut to a volunteer', d({ staffOnly: true }).canRead, false);
check('nothing that cannot be read can be attempted',
  ([true, false] as const).every((s) =>
    ([true, false] as const).every((p) =>
      (['orientation', 'core', 'elective', 'challenge'] as const).every((k) => {
        const r = decideAccess({ kind: k, signedIn: s, prerequisitesMet: p, published: true });
        return r.canRead || !r.canAttempt;
      }))),
  'canAttempt without canRead would mean grading content nobody was shown');

console.log('\n2. the badge never contradicts the door');
eq('open reads as available', badgeFor('public'), 'available');
eq('locked reads as locked', badgeFor('prerequisite_locked'), 'locked');
eq('needing an account says so', badgeFor('login_required'), 'signIn');
eq('unwritten reads as coming', badgeFor('preview_only'), 'soon');
check('no state is labelled available unless it is readable',
  (['login_required', 'prerequisite_locked', 'preview_only', 'staff_only'] as const)
    .every((s) => badgeFor(s) !== 'available'),
  'the catalogue said «متاحة» over courses the page then refused to open');

/* ------------------------------------------------------------------ *
 * 3. What the server actually sends
 * ------------------------------------------------------------------ */
console.log('\n3. a locked course, fetched as a stranger');

const BASE = process.env.PROBE_BASE_URL ?? 'http://localhost:3000';
/** Level-six courses: locked for anybody who has not climbed the programme. */
const LOCKED = ['governance-and-accountability', 'transformational-leadership'];

async function get(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: { 'accept-language': 'ar' } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

const probe = await get(`/ar/academy/${LOCKED[0]}`);
if (probe === null) {
  console.log(`  ..      server not reachable at ${BASE} — skipping the fetch checks`);
} else {
  for (const slug of LOCKED) {
    const body = await get(`/ar/academy/${slug}`);
    if (body === null) { check(`${slug} responded`, false, 'no response'); continue; }

    /* The contradiction the association reported: both sentences on one page. */
    const saysLocked = body.includes('مقفلة');
    const offersStart = body.includes('ابدأ الدورة');
    check(`${slug}: does not offer to start a course it calls locked`,
      !(saysLocked && offersStart),
      saysLocked && offersStart ? 'both «مقفلة» and «ابدأ الدورة» present' : '');

    /* The leak itself. A locked page should be a description and a reason —
     * a fraction of the size of the full course. */
    check(`${slug}: sends a description, not a course`,
      body.length < 90_000,
      `${Math.round(body.length / 1024)}KB`);

    /* And never the answer key, which is the line that must never be crossed
     * even if the prose is one day made public. */
    for (const marker of ['correctId', '"correct"', 'explanation', 'feedback']) {
      check(`${slug}: no "${marker}" in the payload`, !body.includes(marker));
    }
  }

  /*
   * The other half, and the half that matters just as much.
   *
   * A gate is only correct if it lets the right people through. The first
   * version of this fix shut every course to signed-out visitors and looked
   * like a success — the locked courses were locked — while quietly closing
   * the association's shop window. These courses owe nothing, so a stranger
   * must still be able to read them.
   */
  console.log('\n4. an open course still opens');
  for (const slug of ['code-of-conduct-and-reporting', 'professional-identity']) {
    const body = await get(`/ar/academy/${slug}`);
    if (body === null) { check(`${slug} responded`, false, 'no response'); continue; }

    check(`${slug}: is not shown as locked to a stranger`,
      !body.includes('غير متاحة لك بعد'));
    check(`${slug}: still sends its lessons`,
      body.length > 60_000,
      `${Math.round(body.length / 1024)}KB`);
  }
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
