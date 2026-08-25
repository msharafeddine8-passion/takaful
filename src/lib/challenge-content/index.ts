import type { LevelChallenge } from './types';

import { levelOneRun } from './level-1';
import { levelTwoRun } from './level-2';
import { levelThreeRun } from './level-3';
import { levelFourRun } from './level-4';
import { levelFiveRun } from './level-5';

/**
 * The authored decision runs, one per level that has one.
 *
 * NOT every level. Level 6 has no run written yet, and the engine answers null
 * for it rather than pretending — `challengeForLevel(6)` returns null, the
 * route answers notFound, and the academy page offers nothing for that level.
 * A level with no run behaves exactly as it did before this feature existed,
 * which is the same property the whole design rests on: this adds something
 * takeable and removes nothing.
 *
 * probe-level-challenge asserts the rules over whatever is in this list rather
 * than against a count, so authoring level 6 later needs no change here beyond
 * an import and an entry.
 */
export const LEVEL_CHALLENGES: LevelChallenge[] = [
  levelOneRun,
  levelTwoRun,
  levelThreeRun,
  levelFourRun,
  levelFiveRun,
];

export type { LevelChallenge, Step, Choice, Weight, Decision, L } from './types';
