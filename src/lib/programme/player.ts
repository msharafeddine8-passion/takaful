/**
 * Where a course is broken into screens, and which screen a reader lands on.
 *
 * The academy has been one page per course since it was written: every module,
 * every quiz and the finish bar stacked into a single document. That works
 * when a course is short. Safeguarding is fourteen modules, and on a phone it
 * is a forty-screen scroll with no way to tell where you are in it, no way to
 * get back to where you stopped except by remembering how far down it was, and
 * a "resume" button that jumps to an anchor and then leaves you scrolling
 * through material you have already read.
 *
 * So: one unit per screen, and a unit is addressable. The reader's position
 * becomes a URL, which means the back button works, a bookmark works, and a
 * link to "the module about disclosure" is a thing that can be sent.
 *
 * Kept free of the database and of React on purpose. Every rule about
 * ordering and resuming is decided here, by pure functions over plain data,
 * so the probe can put a course with no modules or a reader who has read the
 * last unit but not the first through it without a server. `server-only` in
 * lib/db.ts means anything that reaches for a connection cannot be imported by
 * a plain script, and this is the part that most needs testing.
 */

/**
 * Modules are the content. The assessment is the one screen that is not
 * content — it is where an attempt gets submitted — and it only exists for a
 * course that asks questions. Several of the electives ask none.
 */
export type UnitKind = 'module' | 'assessment' | 'practical';

export type Unit = {
  id: string;
  kind: UnitKind;
  /** 1-based, for "3 of 14". Includes the assessment, because the reader
   *  counts it as a step even though it teaches nothing. */
  position: number;
};

/**
 * The reserved id of the assessment screen, and the one string no module is
 * allowed to use.
 *
 * The obvious choice was 'assessment'. field-safety already has a module with
 * that id — its first one — so the reserved word would have produced two units
 * called the same thing, and every reader opening that course would have
 * landed on the submit screen instead of the opening module. The leading
 * underscore is what makes it unauthorable: module ids are written by hand as
 * plain words, and probe-player asserts across all 41 courses that none of
 * them starts with one.
 *
 * Renaming the module instead was the wrong repair. Module ids are the key in
 * course_module_progress, so changing one discards every record of somebody
 * having read it.
 */
export const ASSESSMENT_ID = '_finish';

/**
 * The practical screen, when a course sets written work — see
 * lib/programme/practical.ts. Underscored for the same reason as above, and
 * protected by the same assertion: no authored module id starts with one.
 */
export const PRACTICAL_ID = '_practical';

/**
 * `hasPractical` is optional, so every existing call site keeps the units it
 * always had. A course that sets no written work — which is nearly all of them
 * — produces exactly the list it produced before the screen existed.
 *
 * The practical sits BEFORE the assessment. It is part of finishing the
 * course, and putting it after would mean the reader pressed "complete the
 * course", saw a score and then found there was still something to write.
 */
export function unitsOf({
  moduleIds,
  hasQuestions,
  hasPractical = false,
}: {
  moduleIds: string[];
  hasQuestions: boolean;
  hasPractical?: boolean;
}): Unit[] {
  const units: Unit[] = moduleIds.map((id, i) => ({
    id,
    kind: 'module' as const,
    position: i + 1,
  }));
  if (hasPractical) {
    units.push({ id: PRACTICAL_ID, kind: 'practical', position: units.length + 1 });
  }
  if (hasQuestions) {
    units.push({ id: ASSESSMENT_ID, kind: 'assessment', position: units.length + 1 });
  }
  return units;
}

export function findUnit(units: Unit[], id: string): Unit | null {
  return units.find((u) => u.id === id) ?? null;
}

/**
 * The screen to open when somebody asks for the course rather than for a
 * particular part of it.
 *
 * The first unread module, because that is where they stopped. Not the last
 * one they *read* — modules can be marked in any order, and after reading
 * 1, 2 and 4 the place to go back to is 3.
 *
 * Everything read and questions to answer means the assessment. Everything
 * read with no assessment means the last module, so that "resume" on a
 * finished elective reopens it rather than returning null and sending the
 * reader to a page that cannot exist.
 */
export function resumeUnitId(units: Unit[], readIds: readonly string[]): string | null {
  if (units.length === 0) return null;
  const read = new Set(readIds);
  const firstUnread = units.find((u) => u.kind === 'module' && !read.has(u.id));
  if (firstUnread) return firstUnread.id;
  return units[units.length - 1].id;
}

export function neighbours(units: Unit[], id: string): { prev: Unit | null; next: Unit | null } {
  const i = units.findIndex((u) => u.id === id);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? units[i - 1] : null,
    next: i + 1 < units.length ? units[i + 1] : null,
  };
}

export type UnitState = 'done' | 'current' | 'ahead';

/**
 * What each unit looks like in the contents list.
 *
 * "Current" is the unit being viewed, not the furthest one reached — the list
 * is a map of where the reader is, and a reader who has jumped back to module
 * 2 to check something is, at that moment, at module 2.
 *
 * The assessment is only ever 'done' when the course has actually been passed.
 * Submitting a failed attempt is not finishing; showing a tick against it
 * would say the course was complete on a screen that also offers to retake it.
 */
export function unitStates(
  units: Unit[],
  readIds: readonly string[],
  currentId: string,
  passed: boolean,
  /**
   * The practical is 'done' only once a trainer has accepted it — not when it
   * has been submitted. A tick beside work that is still sitting in somebody's
   * queue tells the learner the course is finished, and they find out it is
   * not when the certificate does not arrive. Optional, so the calls that
   * predate written work are unchanged.
   */
  practicalApproved = false,
): Map<string, UnitState> {
  const read = new Set(readIds);
  const out = new Map<string, UnitState>();
  for (const u of units) {
    const done =
      u.kind === 'assessment' ? passed
        : u.kind === 'practical' ? practicalApproved
          : read.has(u.id);
    out.set(u.id, u.id === currentId ? 'current' : done ? 'done' : 'ahead');
  }
  return out;
}

/**
 * How far through, as the reader would count it.
 *
 * Modules only. Adding the assessment to the denominator means a fourteen
 * module course sits at 93% with every word read, which reads as an error
 * rather than as "one step left" — and the step that is left is already
 * announced by its own button.
 */
export function unitProgress(
  units: Unit[],
  readIds: readonly string[],
): { done: number; total: number; percent: number } {
  const modules = units.filter((u) => u.kind === 'module');
  const read = new Set(readIds);
  const done = modules.filter((m) => read.has(m.id)).length;
  const total = modules.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
