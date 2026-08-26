/**
 * What a custom profile answer may be, and who may see it.
 *
 * Migration 048 stores every answer in one JSONB column and says, in as many
 * words, that Postgres cannot check it against the definition's kind — that
 * would need a cross-row constraint. So the check is here, and this file is
 * the only thing standing between a `date` field and a value that says
 * "sometime in spring". Read that sentence as the specification rather than as
 * an apology for it: there is no second line of defence underneath.
 *
 * ── NO `server-only` ───────────────────────────────────────────────────────
 *
 * Deliberately, and for the same reason programme/practical.ts has none. Every
 * rule below is a pure function over its arguments, so probe-admin-profile can
 * drive all eight kinds, both directions of every check, and the whole
 * visibility ladder without a database and without a Next.js server. A rule
 * nobody can exercise cheaply is a rule that stops being exercised.
 *
 * The queries live next door in profile-fields.ts, which does import
 * `server-only`. The dependency runs that way and never back.
 *
 * ── THE URL CASE IS A SECURITY CHECK, NOT A TIDINESS ONE ───────────────────
 *
 * A url answer is displayed on a profile, which means it ends up in an href.
 * `javascript:alert(1)` in an href is stored XSS that fires for every person
 * who opens that profile — including staff, who are the accounts worth taking.
 * Only http: and https: are accepted, the scheme is read by the URL parser
 * rather than by a regex over the string, and what is stored is what the parser
 * produced, so nothing downstream can be looking at a different URL from the
 * one that was checked.
 *
 * ── DATES ARE TEXT ─────────────────────────────────────────────────────────
 *
 * 'YYYY-MM-DD', stored and compared as text, never parsed into a Date. The
 * session runs GMT and the association is in Beirut; `new Date('2026-08-19')`
 * is midnight UTC, which is the 19th at 02:00 in Beirut and the 18th at 21:00
 * in New York — and the day somebody graduated does not have a time zone. The
 * calendar check below therefore does its own leap-year arithmetic rather than
 * asking Date to do it, because Date would answer a question nobody asked.
 */

export const FIELD_KINDS = [
  'text',
  'longtext',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'url',
] as const;

export type FieldKind = (typeof FIELD_KINDS)[number];

export const VISIBILITIES = ['public', 'volunteers', 'staff'] as const;

export type Visibility = (typeof VISIBILITIES)[number];

export function isFieldKind(value: unknown): value is FieldKind {
  return typeof value === 'string' && (FIELD_KINDS as readonly string[]).includes(value);
}

export function isVisibility(value: unknown): value is Visibility {
  return typeof value === 'string' && (VISIBILITIES as readonly string[]).includes(value);
}

/** One choice on a select or multiselect. `value` is what gets stored. */
export type FieldOption = { value: string; ar: string; en: string };

export type FieldDef = {
  id: string;
  /** Stable machine name. Never changes once answers exist — the label does. */
  key: string;
  labelAr: string;
  labelEn: string;
  helpAr: string | null;
  helpEn: string | null;
  kind: FieldKind;
  options: FieldOption[];
  required: boolean;
  visibility: Visibility;
  sortOrder: number;
  /** 'YYYY-MM-DD' in Beirut, as text. Never reconstruct a Date from it. */
  archivedOn: string | null;
};

/** Everything a JSONB answer is allowed to be. Matches the migration's list. */
export type FieldValue = string | number | boolean | string[];

export type ValueRefusal =
  /* The field is required and the answer is blank, or an untouched tick-box. */
  | 'required'
  /* The value is not the shape its kind describes at all. */
  | 'wrong-kind'
  /* A select answer that is not one of the definition's own options. */
  | 'unknown-option'
  /* A url that is neither http: nor https:. See the header. */
  | 'unsafe-url'
  | 'too-long';

/**
 * `value: null` means "there is no answer", which is a legitimate result for an
 * optional field and is how an answer gets cleared — profile_field_values has
 * no row for a question nobody answered.
 */
export type ValueCheck =
  | { ok: true; value: FieldValue | null }
  | { ok: false; reason: ValueRefusal };

/**
 * Caps, so that one paste cannot make a profile page unreadable or a column
 * unbounded. Generous rather than tight: this is a guard rail, not a style
 * rule, and a rejected value costs somebody a retype.
 */
export const MAX_TEXT = 200;
export const MAX_LONGTEXT = 4000;
export const MAX_URL = 2048;
export const MAX_SELECTED = 64;

/** Only what the check actually reads, so a probe fixture is three fields. */
export type ValidatableDef = Pick<FieldDef, 'kind' | 'options' | 'required'>;

const ok = (value: FieldValue | null): ValueCheck => ({ ok: true, value });
const no = (reason: ValueRefusal): ValueCheck => ({ ok: false, reason });

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Is this text a day that exists?
 *
 * Its own arithmetic on purpose. `new Date('2025-02-30')` does not throw — it
 * rolls forward to the 2nd of March — so a Date-based check would silently
 * accept a date nobody meant and then store a different one.
 */
export function isCalendarDay(text: string): boolean {
  const parts = DAY.exec(text);
  if (!parts) return false;
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= lengths[month - 1];
}

/**
 * The scheme check, separated so the probe can name it.
 *
 * Returns the URL as the parser produced it, or null. Parsed rather than
 * pattern-matched because the parser is what a browser will use on the href:
 * a regex looking for a leading "javascript:" misses `java\tscript:alert(1)`,
 * ` javascript:alert(1)` and a dozen other spellings that the parser folds back
 * to the same scheme.
 */
export function safeUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // No scheme at all, so nothing to trust. A relative "/somewhere" belongs to
    // this site and a custom field is not a way to author links into it.
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return parsed.toString();
}

/** True when there is nothing here that counts as an answer. */
function unanswered(kind: FieldKind, value: FieldValue | null): boolean {
  if (value === null) return true;
  /*
   * A required tick-box is a consent or a confirmation, and an untouched one is
   * not either. `false` is a perfectly good answer for an optional checkbox and
   * a missing answer for a required one, which is why this cannot be folded
   * into the null check above.
   */
  if (kind === 'checkbox') return value === false;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * One value, checked against one definition.
 *
 * PURE. No database, no session, no clock.
 *
 * `raw` is unknown because it arrives from a form, and everything that arrives
 * from a form is a claim — including its type. A multiselect that posts a bare
 * string, a number field that posts "1e400" and a date field that posts
 * "2025-02-30" all have to stop here.
 */
export function validateValue(def: ValidatableDef, raw: unknown): ValueCheck {
  const read = readValue(def, raw);
  if (!read.ok) return read;
  if (def.required && unanswered(def.kind, read.value)) return no('required');
  return read;
}

/**
 * The per-kind half, with `required` deliberately left out.
 *
 * Splitting the two means the required rule is written once rather than eight
 * times, and eight copies of a rule is how seven of them end up subtly
 * different.
 */
function readValue(def: ValidatableDef, raw: unknown): ValueCheck {
  const blank = raw === null || raw === undefined;

  switch (def.kind) {
    case 'text':
    case 'longtext': {
      if (blank) return ok(null);
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim();
      if (body === '') return ok(null);
      // A single-line field is single-line. A pasted paragraph belongs in a
      // longtext, and letting it through here means a table cell three screens
      // tall on somebody's profile.
      if (def.kind === 'text' && /[\r\n]/.test(body)) return no('wrong-kind');
      const cap = def.kind === 'text' ? MAX_TEXT : MAX_LONGTEXT;
      if (body.length > cap) return no('too-long');
      return ok(body);
    }

    case 'number': {
      if (blank) return ok(null);
      if (typeof raw === 'number') {
        // NaN and Infinity are numbers to typeof and are not numbers to
        // anybody else. JSON cannot even represent them: JSON.stringify turns
        // both into null, so an unchecked Infinity would be stored as a
        // missing answer and read back as one.
        return Number.isFinite(raw) ? ok(raw) : no('wrong-kind');
      }
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim();
      // Checked before Number(), because Number('') is 0 — an empty box would
      // otherwise answer "zero" for every optional number field on the form.
      if (body === '') return ok(null);
      const parsed = Number(body);
      if (!Number.isFinite(parsed)) return no('wrong-kind');
      return ok(parsed);
    }

    case 'date': {
      if (blank) return ok(null);
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim();
      if (body === '') return ok(null);
      if (!isCalendarDay(body)) return no('wrong-kind');
      // Stored as the text it already is. See the header: a Date here would
      // move the day for anybody reading it from another time zone.
      return ok(body);
    }

    case 'select': {
      if (blank) return ok(null);
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim();
      if (body === '') return ok(null);
      if (!def.options.some((option) => option.value === body)) return no('unknown-option');
      return ok(body);
    }

    case 'multiselect': {
      if (blank) return ok(null);
      // A single value from a form arrives as a one-element array from
      // getAll(); a bare string is a caller that did not use getAll, and is a
      // bug worth surfacing rather than papering over.
      if (!Array.isArray(raw)) return no('wrong-kind');
      if (raw.some((entry) => typeof entry !== 'string')) return no('wrong-kind');
      const chosen = (raw as string[]).map((entry) => entry.trim()).filter((entry) => entry !== '');
      if (chosen.length === 0) return ok(null);
      if (chosen.length > MAX_SELECTED) return no('too-long');
      const allowed = new Set(def.options.map((option) => option.value));
      if (chosen.some((entry) => !allowed.has(entry))) return no('unknown-option');
      // Deduplicated rather than refused: a form that posts the same box twice
      // is a browser quirk, not somebody claiming two of something.
      return ok([...new Set(chosen)]);
    }

    case 'checkbox': {
      if (typeof raw === 'boolean') return ok(raw);
      // An absent checkbox is how every browser posts an unticked one, so
      // blank is `false` here rather than "no answer". The required rule then
      // reads that false as unanswered, which is the whole of what a required
      // tick-box means.
      if (blank) return ok(false);
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim().toLowerCase();
      if (body === 'on' || body === 'true' || body === '1' || body === 'yes') return ok(true);
      if (body === '' || body === 'off' || body === 'false' || body === '0' || body === 'no') {
        return ok(false);
      }
      return no('wrong-kind');
    }

    case 'url': {
      if (blank) return ok(null);
      if (typeof raw !== 'string') return no('wrong-kind');
      const body = raw.trim();
      if (body === '') return ok(null);
      if (body.length > MAX_URL) return no('too-long');
      const safe = safeUrl(body);
      // Its own refusal rather than 'wrong-kind'. "That is not a link" and
      // "that link would run code when somebody clicked it" are different
      // things to say to whoever typed it, and only one of them is a mistake.
      if (safe === null) return no('unsafe-url');
      return ok(safe);
    }
  }
}

// ------------------------------------------------------------- who sees what

/**
 * Who is looking.
 *
 * Three rungs, and the ladder only ever widens: 'public' is what a stranger
 * sees, 'volunteers' adds what the association shows its own members, 'staff'
 * adds the rest. Resolving a session into one of these is profile-fields.ts's
 * job — it needs isStaff() and therefore a server — but the ladder itself is
 * here so it can be driven straight.
 */
export type Audience = 'public' | 'volunteers' | 'staff';

const SEEN_BY: Record<Audience, readonly Visibility[]> = {
  public: ['public'],
  volunteers: ['public', 'volunteers'],
  staff: ['public', 'volunteers', 'staff'],
};

/** The visibilities this audience may be shown. Ordered widest-last. */
export function visibleTo(audience: Audience): readonly Visibility[] {
  return SEEN_BY[audience];
}

export function canSee(audience: Audience, visibility: Visibility): boolean {
  return SEEN_BY[audience].includes(visibility);
}

/**
 * The same rule as a filter, for anything already in memory.
 *
 * The query in profile-fields.ts filters in SQL instead — a page must not fetch
 * a staff-only answer and then decline to render it, because "fetched but not
 * rendered" is one careless line away from "rendered". This exists so the rule
 * itself can be exercised in both directions without a database.
 */
export function filterByVisibility<T extends { visibility: Visibility }>(
  rows: readonly T[],
  audience: Audience,
): T[] {
  return rows.filter((row) => canSee(audience, row.visibility));
}
