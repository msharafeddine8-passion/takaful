import 'server-only';
import { randomUUID } from 'node:crypto';
import { query, queryOne, type Param } from './db';
import type { Locale } from './i18n';

/**
 * The five figures on the front page — and what this platform can stand behind.
 *
 * ── A FIGURE IS A CLAIM SOMEBODY MAKES, NOT A COUNT SOMEBODY RUNS ──────────
 *
 * Migration 053 argues this at length and it is the one sentence worth
 * repeating on every file that touches this feature: THE VALUE IS WRITTEN, NOT
 * DERIVED. `value_text` is text because "4,000+" is text, and nothing below
 * computes it, defaults it, or corrects it.
 *
 * The association is far older than this software: forty accounts against a
 * roster of four hundred and fifty-seven, ten activities recorded, and years of
 * work that predates the first row in this database. A derived figure would not
 * be a truer claim — it would be the association describing itself by how much
 * of its own history happens to have been typed in yet.
 *
 * ── SO WHAT IS evidenceFor() FOR? ──────────────────────────────────────────
 *
 * It answers a different question, and only for the staff screen: not "what is
 * the number" but "what could this platform show a sceptic today". It is a
 * floor under a claim, never a replacement for one, and the two are kept in
 * different shapes on purpose — an ImpactNumber carries `valueText`, an
 * Evidence carries a `count`, and no function here turns one into the other.
 *
 * AND WHERE THERE IS NOTHING TO COUNT IT SAYS SO, RATHER THAN COUNTING NOTHING.
 * See the head of evidenceFor(); it is the most important comment in this file.
 *
 * ── PROJECT FIGURES ARE NOT THE ASSOCIATION'S ──────────────────────────────
 *
 * Migration 055 added `project_id` so a figure can be about one project instead
 * of about the association, reusing this table rather than adding a second one.
 * Every read and every write below is scoped to `project_id IS NULL`: the front
 * page states what the association claims about itself, and «مسارك أرشد ٤٠٠
 * طالب» is a claim about مسارك. Scoping is not an optimisation here — a missing
 * filter would put a project's own figure into the association's five.
 *
 * ── DATES ──────────────────────────────────────────────────────────────────
 *
 * `updated_at` and `created_at` are TIMESTAMPTZ and take the Beirut correction.
 * There is no DATE column on this table, so the `AT TIME ZONE` trap the head of
 * lib/volunteer-role-view.ts describes cannot arise here — but the correction is
 * still spelled out rather than left to the server's timezone.
 */

/** A TIMESTAMPTZ as the day it happened in Beirut. The usual correction. */
const beirutDay = (column: string) =>
  `to_char(${column} AT TIME ZONE 'Asia/Beirut', 'YYYY-MM-DD')`;

// -------------------------------------------------------------- the figures

/** One line of «تكافل بالأرقام». */
export type ImpactNumber = {
  id: string;
  /**
   * The stable machine name. NOT EDITABLE — see ImpactPatch below.
   *
   * It is what pairs a row with its evidence hint, and it survives a correction
   * to the wording, which is the whole reason migration 053 gave it a column of
   * its own instead of matching on the label.
   */
  key: string;
  labelAr: string;
  /** May be '' — the reader falls back to the Arabic. */
  labelEn: string;
  /** "300+", "4,000+", "7". TEXT, because every one of those is text. */
  valueText: string;
  /** Internal. Where the figure comes from; never rendered publicly. */
  sourceNote: string | null;
  sortOrder: number;
  isPublished: boolean;
  /** 'YYYY-MM-DD' in Beirut. Never reconstruct a Date from it. */
  updatedOn: string;
};

/**
 * The label in one language, falling back to the Arabic.
 *
 * Here rather than in a page, because the front page and the staff screen both
 * have to answer the same question and two copies of `labelEn.trim() || labelAr`
 * are two chances to render an empty caption under a number. `label_en` defaults
 * to '' in the schema precisely so this fallback has something to test.
 */
export function impactLabel(row: ImpactNumber, lang: Locale): string {
  if (lang === 'ar') return row.labelAr;
  return row.labelEn.trim() || row.labelAr;
}

const NUMBER_COLUMNS = `n.id, n.key, n.label_ar, n.label_en, n.value_text,
  n.source_note, n.sort_order, n.is_published,
  ${beirutDay('n.updated_at')} AS updated_on`;

type NumberRow = {
  id: string;
  key: string;
  label_ar: string;
  label_en: string | null;
  value_text: string;
  source_note: string | null;
  sort_order: number;
  is_published: boolean;
  updated_on: string;
};

const toNumber = (row: NumberRow): ImpactNumber => ({
  id: row.id,
  key: row.key,
  labelAr: row.label_ar,
  // '' rather than null, matching the column's own default: "not written yet"
  // and "written as nothing" are not two different facts about a label.
  labelEn: row.label_en ?? '',
  valueText: row.value_text,
  sourceNote: row.source_note,
  sortOrder: row.sort_order,
  isPublished: row.is_published === true,
  updatedOn: row.updated_on,
});

/**
 * The figures the front page shows, in order.
 *
 * The WHERE and the ORDER BY together are exactly idx_in_shown — `(sort_order,
 * key) WHERE is_published` — which is why this is the cheap query it looks like.
 * `key` is the tiebreak so that two figures given the same sort order come back
 * in a stable order rather than in whichever order the planner felt like, which
 * would make the front page's five reshuffle between two requests.
 */
export async function publishedNumbers(): Promise<ImpactNumber[]> {
  const rows = await query<NumberRow>(
    `SELECT ${NUMBER_COLUMNS}
       FROM impact_numbers n
      WHERE n.is_published
        AND n.project_id IS NULL
      ORDER BY n.sort_order, n.key`,
  );
  return rows.map(toNumber);
}

/**
 * Every association figure, published or not, for the staff screen.
 *
 * Unpublished rows are listed rather than hidden: a figure taken off the front
 * page is one somebody decided not to claim yet, and it has to stay editable —
 * a withdrawn figure nobody can find again is a figure that gets retyped from
 * memory under a second key.
 */
export async function allNumbers(): Promise<ImpactNumber[]> {
  const rows = await query<NumberRow>(
    `SELECT ${NUMBER_COLUMNS}
       FROM impact_numbers n
      WHERE n.project_id IS NULL
      ORDER BY n.sort_order, n.key`,
  );
  return rows.map(toNumber);
}

/** One figure by id, published or not — for an edit form and for the audit line. */
export async function numberById(id: string): Promise<ImpactNumber | null> {
  const row = await queryOne<NumberRow>(
    `SELECT ${NUMBER_COLUMNS}
       FROM impact_numbers n
      WHERE n.id = $1 AND n.project_id IS NULL`,
    [id],
  );
  return row ? toNumber(row) : null;
}

// -------------------------------------------------------------- the writing

export type NumberProblem =
  /** chk_in_key: lowercase, starts with a letter, 2–49 characters. */
  | 'bad-key'
  /** uq_in_key_association: one figure per key across the association's rows. */
  | 'key-taken'
  /** chk_in_label: the Arabic label is what every reader falls back to. */
  | 'no-label'
  /** chk_in_value: a figure with no figure in it. */
  | 'no-value'
  | 'not-found'
  | 'db';

export type NumberResult = { ok: true; id: string } | { ok: false; reason: NumberProblem };

export type NumberInput = {
  key: string;
  labelAr: string;
  labelEn?: string;
  valueText: string;
  sourceNote?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
};

/** Mirrors chk_in_key, so a bad key is a sentence rather than a 500. */
const KEY_SHAPE = /^[a-z][a-z0-9_]{1,48}$/;

/** 23505 is unique_violation — on this table's association rows that is the key. */
const isDuplicate = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';

/**
 * Adds a figure the association claims about itself.
 *
 * It is created UNPUBLISHED unless the form says otherwise, which is the safer
 * default in one direction only: a figure that should be on the front page and
 * is not is a page somebody fixes in a minute, and a half-typed figure that
 * appeared on the front page is a claim the public has already read.
 *
 * Nothing here consults evidenceFor(). A new figure is not checked against what
 * the platform can count, is not warned about, and is not refused for
 * disagreeing with it — see the head of evidenceFor() for why that would be
 * exactly backwards.
 */
export async function createNumber(input: NumberInput, by: string): Promise<NumberResult> {
  const key = input.key.trim().toLowerCase();
  if (!KEY_SHAPE.test(key)) return { ok: false, reason: 'bad-key' };

  const labelAr = input.labelAr.trim();
  if (!labelAr) return { ok: false, reason: 'no-label' };

  const valueText = input.valueText.trim();
  if (!valueText) return { ok: false, reason: 'no-value' };

  try {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO impact_numbers
         (id, key, label_ar, label_en, value_text, source_note,
          sort_order, is_published, project_id, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9)
       RETURNING id`,
      [
        randomUUID(),
        key,
        labelAr,
        input.labelEn?.trim() ?? '',
        valueText,
        input.sourceNote?.trim() || null,
        input.sortOrder ?? 0,
        input.isPublished ?? false,
        by,
      ],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'db' };
  } catch (error) {
    if (isDuplicate(error)) return { ok: false, reason: 'key-taken' };
    return { ok: false, reason: 'db' };
  }
}

/**
 * Everything an edit may change. Absent means "leave it alone", and `null` is a
 * value rather than a synonym for absent: clearing a source note and not
 * mentioning it are different edits.
 *
 * `key` IS DELIBERATELY NOT HERE. It is the row's identity — the thing that
 * survives a correction to the wording — and it is what pairs the row with its
 * evidence hint. Letting a form rewrite it would mean an administrator fixing a
 * typo in «متطوّع نشط» could silently detach the figure from the only line on
 * the screen that says what the platform can actually evidence, and the hint
 * would then read "this platform does not track that" beside a figure it tracks
 * perfectly well. A key typed wrongly is fixed by adding the right row and
 * unpublishing the wrong one, which leaves both in the record.
 *
 * `isPublished` is not here either. It has setPublished() of its own, because
 * "this claim comes off the association's front page" is a decision somebody
 * takes and not a side effect of correcting a spelling — and because a
 * whole-row form that carried it would flip it back every time an edit was
 * saved from a stale tab. The same argument lib/projects.ts makes for a project
 * and lib/org-groups.ts for a committee.
 */
export type ImpactPatch = {
  labelAr?: string;
  labelEn?: string;
  valueText?: string;
  sourceNote?: string | null;
  sortOrder?: number;
};

/**
 * Corrects a figure.
 *
 * Only the columns present in the patch are written: an UPDATE listing every
 * column would blank a source note the moment somebody built a partial patch —
 * and the source note is the only answer this table keeps to "where did 4,000
 * come from?".
 */
export async function updateNumber(
  id: string,
  patch: ImpactPatch,
  by: string,
): Promise<NumberResult> {
  if (patch.labelAr !== undefined && !patch.labelAr.trim()) {
    return { ok: false, reason: 'no-label' };
  }
  if (patch.valueText !== undefined && !patch.valueText.trim()) {
    return { ok: false, reason: 'no-value' };
  }

  /* The SET clause is built from a fixed map of column names — the keys are this
   * file's own literals and never anything that arrived from a form, so there is
   * no path by which a caller names a column. */
  const sets: string[] = [];
  const params: Param[] = [id, by];
  const set = (column: string, value: Param) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (patch.labelAr !== undefined) set('label_ar', patch.labelAr.trim());
  if (patch.labelEn !== undefined) set('label_en', patch.labelEn.trim());
  if (patch.valueText !== undefined) set('value_text', patch.valueText.trim());
  if (patch.sourceNote !== undefined) set('source_note', patch.sourceNote?.trim() || null);
  if (patch.sortOrder !== undefined) set('sort_order', patch.sortOrder);

  // An empty patch is a no-op and not an error: a form saved unchanged should
  // leave updated_at and updated_by alone rather than record an edit nobody made
  // — and on this table `updated_by` is a name standing behind a public claim.
  try {
    if (sets.length === 0) {
      const existing = await numberById(id);
      return existing ? { ok: true, id } : { ok: false, reason: 'not-found' };
    }

    const row = await queryOne<{ id: string }>(
      `UPDATE impact_numbers SET ${sets.join(', ')}, updated_by = $2
        WHERE id = $1 AND project_id IS NULL
        RETURNING id`,
      params,
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

/**
 * Says whether the front page states this figure.
 *
 * ONE COLUMN, AND IT IS NOT A DELETE. Unpublishing takes a claim off the public
 * page and leaves the row, its wording, its source note and the name of whoever
 * last touched it exactly where they were — which is what makes the decision
 * reversible and answerable. There is no delete on this table anywhere in this
 * codebase, and a figure the association stopped claiming is part of the record
 * of what it once claimed.
 */
export async function setPublished(
  id: string,
  published: boolean,
  by: string,
): Promise<NumberResult> {
  try {
    const row = await queryOne<{ id: string }>(
      `UPDATE impact_numbers SET is_published = $2, updated_by = $3
        WHERE id = $1 AND project_id IS NULL
        RETURNING id`,
      [id, published, by],
    );
    return row ? { ok: true, id: row.id } : { ok: false, reason: 'not-found' };
  } catch {
    return { ok: false, reason: 'db' };
  }
}

// ------------------------------------------------------------- the evidence

/**
 * What was counted, so the screen can say so in words rather than in a bare
 * number. The dictionary holds one sentence per measure; this file holds none.
 */
export type EvidenceMeasure =
  /** Accounts whose current membership standing means "volunteers here now". */
  | 'active-volunteer-accounts'
  /** Rows in `activities` that have not been archived. */
  | 'recorded-activities'
  /** People with at least one passed course attempt in the academy. */
  | 'course-passers';

/**
 * THE THREE ANSWERS, AND THE MISSING FOURTH.
 *
 * `not-tracked` carries NO NUMBER AT ALL, and that is the whole design. A
 * variant of the shape `{ count: 0 }` would let a screen render a zero beside
 * «٤٬٠٠٠+ عائلة تلقّت دعماً», and there is no wording that makes such a zero
 * read as anything but "this claim is false". It is not false: the platform has
 * no beneficiary records, so it has nothing to say. Making the two states
 * different SHAPES rather than different values means no page can confuse them
 * by forgetting a check, and no later edit can turn one into the other by
 * accident.
 *
 * `unreadable` exists for the same reason one step out. A count that failed is
 * not evidence of absence, and reporting a dead connection as "this platform
 * does not track that" would be the identical lie in a different costume.
 */
export type Evidence =
  | { kind: 'counted'; measure: EvidenceMeasure; count: number }
  | { kind: 'not-tracked' }
  | { kind: 'unreadable' };

/**
 * `count(*)` is bigint, which the driver hands back as a string. Cast in SQL so
 * nobody downstream does arithmetic on '10' — the same note migration 012 leaves
 * beside the course_progress view.
 */
async function counted(
  measure: EvidenceMeasure,
  sql: string,
  params: Param[] = [],
): Promise<Evidence> {
  try {
    const row = await queryOne<{ n: number }>(sql, params);
    if (!row) return { kind: 'unreadable' };
    return { kind: 'counted', measure, count: row.n };
  } catch {
    return { kind: 'unreadable' };
  }
}

/**
 * The standings that mean "this person volunteers here now".
 *
 * The pair — and not the four in VOLUNTEER_STANDING — because this is the same
 * question cardStatusOf() in lib/card-view.ts answers with 'active':
 * `inactive_volunteer` and `volunteer_alumni` are genuine volunteers who are not
 * currently on duty, and «متطوّع نشط» is a claim about who is. Written here as
 * this file's own literals and bound as a parameter, never interpolated.
 */
const ACTIVE_STANDING = ['accepted_volunteer', 'active_volunteer'] as const;

/**
 * WHAT THIS PLATFORM COULD SHOW A SCEPTIC TODAY — OR THAT IT COULD SHOW NOTHING.
 *
 * ── THE ONE RULE THIS FUNCTION EXISTS TO KEEP ──────────────────────────────
 *
 * WHERE THE PLATFORM HOLDS NO RECORD, THIS RETURNS 'not-tracked' AND NEVER A
 * ZERO. The distinction is not pedantry and the cost of getting it wrong is
 * concrete: a zero rendered beside «٤٬٠٠٠+ عائلة تلقّت دعماً» reads to the
 * administrator looking at it as "the system says this claim is false", and the
 * plausible next action is that they quietly reduce or delete a TRUE claim
 * about their own association because a screen implied it was wrong. The truth
 * is narrower and duller: this platform has no beneficiary records, so it has
 * no opinion. It must say that, in those words.
 *
 * ── AND A COUNTED FIGURE IS A FLOOR, NOT A CORRECTION ──────────────────────
 *
 * The three keys that ARE counted come back badly short of what the association
 * claims — thirty-odd volunteer accounts against «٣٠٠+», ten recorded
 * activities against «٥٠٠+» — and that gap is not an error in either number. It
 * is the distance between the association and the part of it that has been
 * typed into a database first opened in 2026. The screen's wording carries that;
 * this function only supplies the count and the name of what was counted.
 *
 * ── WHY AN UNKNOWN KEY IS 'not-tracked' AND NOT AN ERROR ───────────────────
 *
 * `key` is free text: an administrator may add «وجبة وُزّعت» tomorrow, and this
 * file must not be the reason they cannot. A key nobody wrote a counter for is
 * precisely a figure the platform does not track, so the default branch is the
 * honest answer rather than a fallthrough — and it is also the safe one, since
 * the alternative default would be a number about something else.
 */
export async function evidenceFor(key: string): Promise<Evidence> {
  switch (key) {
    /*
     * Accounts, not people. `users.status = 'active'` as well as the standing,
     * because a suspended account is not somebody volunteering here — the same
     * two conditions cardStatusOf() applies before it will call a card active.
     *
     * The standing is read as the NEWEST row of membership_status_history with
     * the same `ORDER BY changed_at DESC, id DESC` membershipStatus() uses in
     * lib/auth.ts. The history is the source of truth and there is no current
     * status column to read instead; ordering it differently here would make
     * this screen and the person's own page disagree about what they are.
     */
    case 'active_volunteers':
      return counted(
        'active-volunteer-accounts',
        `SELECT count(*)::int AS n
           FROM users u
          WHERE u.status = 'active'
            AND (SELECT h.new_status
                   FROM membership_status_history h
                  WHERE h.user_id = u.id
                  ORDER BY h.changed_at DESC, h.id DESC
                  LIMIT 1) = ANY($1::text[])`,
        [[...ACTIVE_STANDING]],
      );

    /*
     * Rows in `activities` that have not been archived — and archived is the
     * only thing filtered out, because it is the only column that means "this
     * row should not have been written". A cancelled activity IS a recorded
     * activity: it was planned, announced and called off, and migration 020
     * keeps `cancelled_at` precisely so that history survives. The screen says
     * "recorded on this platform" rather than "run", which is what makes
     * counting it correct rather than generous.
     */
    case 'activities_run':
      return counted(
        'recorded-activities',
        `SELECT count(*)::int AS n FROM activities WHERE NOT is_archived`,
      );

    /*
     * People who have passed at least one course in the academy.
     *
     * THIS IS THE ONE KEY WHERE THE SCHEMA HAD TO BE READ RATHER THAN OBEYED,
     * so the choice is written down. `course_attempts` is append-only and
     * chk_attempt_passed refuses a pass the score does not support, which makes
     * a passed attempt the strongest record of training this database holds —
     * stronger than a certificate, which is issued by an administrator and can
     * be revoked, and stronger than course_module_progress, which records
     * reading rather than passing. DISTINCT user_id because the claim counts
     * people and somebody who passed four courses is one person.
     *
     * WHAT IT DOES NOT EVIDENCE, and the screen's wording says so: it does not
     * know anybody's age, so it evidences "trained" and not «شاب وشابة»
     * (profiles_sensitive holds the date of birth and nothing on this screen
     * goes near it); and it counts the volunteer academy only, not the
     * association's own training programmes, whose participants never had
     * accounts here. It is a floor under the claim and nothing more.
     */
    case 'youth_trained':
      return counted(
        'course-passers',
        `SELECT count(DISTINCT a.user_id)::int AS n FROM course_attempts a WHERE a.passed`,
      );

    /*
     * NOT TRACKED, AND THESE TWO ARE THE REASON THE STATE EXISTS.
     *
     * `families_supported` — there is no beneficiary anywhere in this schema.
     * Not a table, not a column, not a count that could stand in for one. The
     * platform records volunteers and what they were trained and rostered to
     * do; the families they did it for were never its subject. Nothing here is
     * a near-enough proxy, and a near-enough proxy is how a screen ends up
     * asserting a number nobody measured.
     *
     * `sustained_projects` — `projects` has four seeded rows, and the temptation
     * to return 4 beside «٧ مشاريع مستدامة» has to be refused for a subtler
     * reason than the one above: the count would be real, and it would still be
     * an answer to a different question. Those four rows are the projects that
     * have a page on this website. "Sustained" is a claim about a project
     * outliving its funding and going on running, which no column on that table
     * records, and 4 beside 7 would read as "three of these do not exist".
     */
    default:
      return { kind: 'not-tracked' };
  }
}
