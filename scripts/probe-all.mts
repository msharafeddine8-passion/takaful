/**
 * Runs every probe and reports what held and what did not.
 *
 *   npm run probe
 *
 * The probes are this project's test suite. There is no test runner because
 * there is nothing a runner would add: each probe writes real rows, tries to
 * break the rules the schema is supposed to enforce, prints what it found,
 * and removes what it made. What was missing was a single command, because a
 * suite that has to be run fourteen times by hand is a suite that stops being
 * run.
 *
 * Order matters in one respect only: the pure ones go first, so a broken
 * database connection does not hide a broken function.
 *
 * A probe that fails leaves the run going. Stopping at the first failure
 * hides how much else is wrong, which is the thing you most want to know.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const DIR = path.join(process.cwd(), 'scripts');
const STUB = path.join(process.cwd(), 'stub-so.ts');
const TSCONFIG = path.join(process.cwd(), 'tsconfig.probe.json');

/*
 * The probes import from src/, which imports 'server-only' — a package that
 * throws outside a Next.js server. It is stubbed for the length of the run
 * rather than committed, so nothing in the repository pretends the guard is
 * not there.
 */
writeFileSync(STUB, 'export {};\n', 'utf8');
writeFileSync(
  TSCONFIG,
  JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: { paths: { '@/*': ['./src/*'], 'server-only': ['./stub-so.ts'] } },
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

const probes = readdirSync(DIR)
  .filter((f) => f.startsWith('probe-') && f.endsWith('.mts') && f !== 'probe-all.mts')
  .sort();

/*
 * Configuration the probes must leave exactly as they found it.
 *
 * This check exists because they did not. Two probes were writing requirements
 * onto the default journey — the one real volunteers are evaluated against —
 * and failing to remove them, so every run left the association's programme
 * configured with a little more fiction. Nothing caught it, because each probe
 * only ever checked its own rows.
 *
 * A count is a blunt instrument and it is enough: a probe that adds and
 * removes the same number of rows is not the failure mode anyone has.
 */
const CONFIG_TABLES = [
  'journey_versions',
  'journey_stages',
  'stage_requirements',
  'activities',
  'org_settings',
];

async function configSnapshot(): Promise<Record<string, number> | null> {
  if (!process.env.DATABASE_URL) return null;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await client.connect();
    const out: Record<string, number> = {};
    for (const table of CONFIG_TABLES) {
      try {
        const { rows } = await client.query<{ n: string }>(`SELECT count(*)::TEXT AS n FROM ${table}`);
        out[table] = Number(rows[0].n);
      } catch {
        // A table that does not exist at this migration level is not counted.
      }
    }
    return out;
  } catch {
    return null;
  } finally {
    await client.end().catch(() => {});
  }
}

const before = await configSnapshot();

type Result = { name: string; ok: boolean; confirmed: number; holes: number; note?: string };
const results: Result[] = [];

try {
  for (const file of probes) {
    process.stdout.write(`\n${'='.repeat(64)}\n${file}\n${'='.repeat(64)}\n`);

    /*
     * --conditions=react-server, and no --tsconfig.
     *
     * Most of src/lib starts with `import 'server-only'`, a marker package
     * whose exports map sends the `react-server` condition to an empty module
     * and everything else to a file that throws. Under plain Node a probe
     * importing any of those libraries died at the first import.
     *
     * This used to pass `--tsconfig tsconfig.probe.json`, a file that has
     * never existed in this repository. tsx ignored the missing path quietly
     * for a long time and now fails hard on it, which is how it surfaced.
     * Naming the condition is the honest fix: it is the mechanism the package
     * publishes, and it is exactly what Next does when it renders a server
     * component.
     */
    const run = spawnSync(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['tsx', '--conditions=react-server', '--env-file=.env.local', `scripts/${file}`],
      { encoding: 'utf8', shell: process.platform === 'win32' },
    );

    const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
    // Provider warnings about connection strings are noise on every run.
    const cleaned = output
      .split('\n')
      .filter((l) => !/WARNING|sslmode|libpq|postgresql\.org|trace-warnings|To prepare|- If you/.test(l))
      .join('\n');
    process.stdout.write(cleaned);

    const tally = cleaned.match(/(\d+) behaviours confirmed, (\d+) hole/);
    results.push({
      name: file.replace(/^probe-|\.mts$/g, ''),
      ok: run.status === 0,
      confirmed: tally ? Number(tally[1]) : 0,
      holes: tally ? Number(tally[2]) : 0,
      note: tally ? undefined : 'did not report a tally',
    });
  }
} finally {
  rmSync(STUB, { force: true });
  rmSync(TSCONFIG, { force: true });
}

console.log(`\n${'='.repeat(64)}\nsummary\n${'='.repeat(64)}`);
let confirmed = 0,
  holes = 0,
  failed = 0;
for (const r of results) {
  confirmed += r.confirmed;
  holes += r.holes;
  if (!r.ok) failed += 1;
  const mark = r.ok && r.holes === 0 ? 'ok  ' : 'FAIL';
  console.log(
    `  ${mark}  ${r.name.padEnd(14)} ${String(r.confirmed).padStart(3)} confirmed` +
      (r.holes > 0 ? `, ${r.holes} hole(s)` : '') +
      (r.note ? `  <-- ${r.note}` : ''),
  );
}
console.log(
  `\n${confirmed} behaviours confirmed across ${results.length} probes, ${holes} hole(s), ${failed} probe(s) failed.`,
);

let polluted = false;
/*
 * Only rows LEFT BEHIND fail the run.
 *
 * Both directions used to set `polluted`, so a run that tidied up after an
 * earlier crashed probe exited 1 while printing "0 hole(s), 0 probe(s)
 * failed" — red for having done the right thing. A suite that goes red for
 * benign reasons is a suite people stop reading, and then the run with a real
 * fault in it goes past unnoticed.
 */
let leftBehind = false;
const after = await configSnapshot();
if (before && after) {
  for (const table of CONFIG_TABLES) {
    const from = before[table],
      to = after[table];
    if (from === undefined || to === undefined || from === to) continue;
    polluted = true;

    /*
     * Which way it moved changes what it means, and printing "LEFT BEHIND" for
     * both directions cost half an hour of believing the association's journey
     * configuration had been deleted in production.
     *
     * MORE rows after than before is the real fault: a probe added something
     * and did not take it back.
     *
     * FEWER rows is usually the opposite. The run began while a previously
     * crashed probe's rows were still in the tables, so the "before" was the
     * polluted number and a sweep during this run put it right. Both counts
     * that triggered this — journey_stages 12 to 6 and stage_requirements 32
     * to 31 — turned out to match migration 025 exactly, stage for stage.
     *
     * So the line now says what to check rather than what to conclude.
     */
    if (to > from) {
      leftBehind = true;
      console.log(
        `\n  LEFT BEHIND  ${table}: ${from} before, ${to} after — a probe added ${to - from} ` +
          `row(s) and did not remove them. Run: npm run sweep`,
      );
    } else {
      console.log(
        `\n  FEWER ROWS   ${table}: ${from} before, ${to} after — ${from - to} row(s) went away ` +
          `during the run. Usually a sweep clearing up after an earlier crashed probe, which ` +
          `makes the 'before' the wrong number and this the right one. Compare against the seed ` +
          `migration before concluding anything was lost.`,
      );
    }
  }
  if (!polluted) console.log('\nConfiguration is exactly as the run found it.');
} else {
  console.log('\nCould not check configuration: no database.');
}

if (failed > 0 || holes > 0 || leftBehind) {
  console.log('\nRun `npm run sweep` — a probe that failed may not have cleaned up after itself.');
}
process.exit(failed === 0 && holes === 0 && !leftBehind ? 0 : 1);
