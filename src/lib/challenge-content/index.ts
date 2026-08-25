import type { LevelChallenge } from './types';

import { levelOneRun } from './level-1';
import { levelTwoRun } from './level-2';
import { levelThreeRun } from './level-3';
import { levelFourRun } from './level-4';
import { levelFiveRun } from './level-5';
import { levelSixRun } from './level-6';

/**
 * The authored decision runs, one per level that has one.
 *
 * All six levels now have one. The list is still the only thing that decides
 * that: `challengeForLevel` answers null for anything absent from it, and a
 * level with no run behaves exactly as it did before this feature existed —
 * the route answers notFound and the academy page offers nothing. That property
 * is what let level 6 stay unwritten for as long as it needed to, and it is
 * unchanged by its now being written.
 *
 * probe-level-challenge asserts the rules over whatever is in this list rather
 * than against a count, so a seventh level would need no change here beyond an
 * import and an entry.
 */
export const LEVEL_CHALLENGES: LevelChallenge[] = [
  levelOneRun,
  levelTwoRun,
  levelThreeRun,
  levelFourRun,
  levelFiveRun,
  levelSixRun,
];

export type { LevelChallenge, Step, Choice, Weight, Decision, L } from './types';
