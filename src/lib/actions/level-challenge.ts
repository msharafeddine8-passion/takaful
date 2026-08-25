'use server';

import { revalidatePath } from 'next/cache';
import { isDbConfigured } from '@/lib/db';
import { audit, currentUser } from '@/lib/auth';
import { isLocale, type Locale } from '@/lib/i18n';
import { startRun, recordDecision } from '@/lib/level-challenge-runs';

/**
 * Opening a decision run, and taking one decision in it.
 *
 * THE PERMISSION CHECKS ARE HERE AND IN THE MODULE BELOW, AND NOWHERE IN A
 * COMPONENT. A check in JSX hides a button and leaves the POST working, and on
 * this feature that would let anybody with a session write decisions into a run
 * for a level they have not finished — or, worse, name a level and a step and
 * have the server take their word for both.
 *
 * Everything arriving in the FormData is treated as a claim: the level is
 * re-checked against the learner's own passes, and the step and choice are
 * checked against what the stored run actually offers. The only thing taken
 * from the session rather than the form is who this is, which is the one thing
 * a form may never say.
 *
 * Both actions return void. The page is a plain form that re-renders from the
 * database, so there is no state to thread back — and every refusal is a no-op
 * rather than an error worth interrupting somebody's rehearsal over. A stale
 * tab posting yesterday's step changes nothing and re-renders on the step the
 * run is actually standing on.
 */

function localeOf(formData: FormData): Locale {
  const value = String(formData.get('lang') ?? 'ar');
  return isLocale(value) ? value : 'ar';
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '');
}

/**
 * The level, as an integer or null.
 *
 * Parsed rather than cast: a form saying "3; DROP" or "1e400" must become null
 * and stop here, not reach a query as NaN and surface as a 500.
 */
function levelOf(formData: FormData): number | null {
  const raw = text(formData, 'level').trim();
  if (!/^[1-6]$/.test(raw)) return null;
  return Number(raw);
}

function refresh(lang: Locale, level: number): void {
  revalidatePath(`/${lang}/academy/challenge/${level}`);
  revalidatePath(`/${lang}/account/journey`);
}

export async function startRunAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const level = levelOf(formData);
  if (!isDbConfigured() || level === null) return;

  const user = await currentUser();
  if (!user) return;

  // startRun re-checks that this learner has finished the level. It is not
  // asserted here and passed down; there is one place that decides it.
  const result = await startRun(user.id, level);
  if (!result.ok) return;

  await audit({
    actorId: user.id,
    action: 'level-challenge.started',
    targetType: 'level',
    targetId: String(level),
    /*
     * The run id and the seed, which are what makes a run readable back. No
     * decision and no outcome: the row itself is the record a learner reads,
     * and copying a person's answers into a second table is a second copy of
     * something about them to keep correct.
     */
    newValue: { runId: result.run.id, seed: result.run.seed },
  });

  refresh(lang, level);
}

export async function decideAction(formData: FormData): Promise<void> {
  const lang = localeOf(formData);
  const level = levelOf(formData);
  const step = text(formData, 'step').trim();
  const choice = text(formData, 'choice').trim();

  if (!isDbConfigured() || level === null) return;
  if (!step || !choice) return;

  const user = await currentUser();
  if (!user) return;

  /*
   * No audit line per decision, on purpose.
   *
   * audit_log answers "who has been doing what to whom" and is read by staff.
   * A volunteer's rehearsal answers are not that: they are about nobody but
   * themselves, they award nothing, and writing each one into a staff-readable
   * table would turn an optional exercise into a thing somebody could be read
   * about. Starting a run is logged because it is an action against the
   * account; what was chosen inside it is between the learner and the row.
   */
  const result = await recordDecision(user.id, level, { step, choice });
  if (!result.ok) return;

  refresh(lang, level);
}
