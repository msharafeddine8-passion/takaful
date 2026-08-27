/*
 * Admin notes and custom profile fields: a validator that is the only thing
 * standing there, a visibility ladder that filters in SQL, and a note the
 * subject can never read.
 *
 * THE FAILURE THIS PROBE EXISTS FOR IS SILENT IN BOTH DIRECTIONS.
 *
 * Migration 048 stores every custom answer in one JSONB column and says, in the
 * comment on that column, that Postgres cannot check the value against the
 * definition's kind — the application validates on write, and there is nothing
 * underneath it. A validator that quietly stopped checking would look exactly
 * like a validator that works: forms would submit, answers would be stored,
 * profiles would render. The first sign would be a `javascript:` URL in an
 * href on somebody's profile page.
 *
 * So every kind is asserted in BOTH directions — a valid value accepted and an
 * invalid one refused — and the two checks that matter most carry a CONTROL. A
 * validator that refused everything would satisfy half of these lines, and
 * "rejects javascript:alert(1)" is a green line under a function that returns
 * false unconditionally.
 *
 * PURE: no database, no network. Only profile-field-kinds.ts is imported, which
 * has no `server-only` for exactly this reason. admin-notes.ts,
 * profile-fields.ts and actions/admin-profile.ts are read as TEXT — the rules
 * asserted about them are about what the code can reach, and an import is how
 * that stops being true.
 *
 * DELIBERATELY WRITES NOTHING. DATABASE_URL points at production, and
 * admin_notes and profile_field_defs both carry delete-refusing triggers from
 * migration 048 — a test row inserted here could only be removed by a
 * deliberate transaction with SET LOCAL takaful.allow_delete = 'on' in it.
 */

import { repoSource } from './source-text.mts';
import {
  FIELD_KINDS,
  MAX_TEXT,
  VISIBILITIES,
  canSee,
  filterByVisibility,
  isCalendarDay,
  isFieldKind,
  isVisibility,
  safeUrl,
  validateValue,
  visibleTo,
  type Audience,
  type FieldKind,
  type FieldOption,
  type ValidatableDef,
  type Visibility,
} from '../src/lib/profile-field-kinds.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1;
  else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

/*
 * Reads go through the shared reader, which normalises CRLF to LF; see the
 * header of scripts/source-text.mts for the two failures that paid for it. It
 * returns '' for a file that is not there, so every use below asserts the
 * length before asserting anything about the contents.
 */
const readSource = (...parts: string[]): string => repoSource(...parts);

/**
 * The same file with its comments removed.
 *
 * Every assertion below that reads source is about what the code does, and
 * these files explain themselves at length — admin-notes.ts spends a paragraph
 * on the word "viewer" while explaining why it has no viewer argument. Scanning
 * the raw text would fail on the documentation, which teaches the next person
 * that the honest fix is to delete the comment.
 */
const codeOf = (src: string): string =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

const OPTIONS: FieldOption[] = [
  { value: 'field', ar: 'ميداني', en: 'Field' },
  { value: 'media', ar: 'إعلام', en: 'Media' },
  { value: 'logistics', ar: 'لوجستيات', en: 'Logistics' },
];

const def = (
  kind: FieldKind,
  over: Partial<ValidatableDef> = {},
): ValidatableDef => ({
  kind,
  options: kind === 'select' || kind === 'multiselect' ? OPTIONS : [],
  required: false,
  ...over,
});

const accepts = (d: ValidatableDef, raw: unknown): boolean => validateValue(d, raw).ok;
const refuses = (d: ValidatableDef, raw: unknown, reason?: string): boolean => {
  const verdict = validateValue(d, raw);
  return !verdict.ok && (reason === undefined || verdict.reason === reason);
};
const valueOf = (d: ValidatableDef, raw: unknown): unknown => {
  const verdict = validateValue(d, raw);
  return verdict.ok ? verdict.value : undefined;
};

/* ------------------------------------------------------------------ */
console.log('1. every kind accepts what it is and refuses what it is not');
{
  check('the closed set is the migration\'s eight kinds and no more',
    FIELD_KINDS.length === 8
    && FIELD_KINDS.every((kind) => isFieldKind(kind))
    && !isFieldKind('richtext'),
    FIELD_KINDS.join(','));

  /*
   * One case per kind, both directions, in one table so that adding a ninth
   * kind without a validator case is a failing line rather than a quiet gap.
   */
  const cases: { kind: FieldKind; good: unknown; bad: unknown; why: string }[] = [
    { kind: 'text', good: 'الجامعة اللبنانية', bad: 'two\nlines',
      why: 'a single-line field is single-line' },
    { kind: 'longtext', good: 'ملاحظة طويلة عن الخبرة السابقة.', bad: 42,
      why: 'a number is not prose' },
    { kind: 'number', good: '2019', bad: 'nineteen',
      why: 'Number("nineteen") is NaN and would be stored as null' },
    { kind: 'date', good: '2019-06-30', bad: '30/06/2019',
      why: 'the column is compared as YYYY-MM-DD text' },
    { kind: 'select', good: 'media', bad: 'security',
      why: 'not one of the definition\'s options' },
    { kind: 'multiselect', good: ['media', 'field'], bad: 'media',
      why: 'a bare string is a caller that did not use getAll()' },
    { kind: 'checkbox', good: 'on', bad: 'maybe',
      why: 'a tick-box is ticked or it is not' },
    { kind: 'url', good: 'https://example.org', bad: 'example.org',
      why: 'no scheme at all, so nothing to trust' },
  ];

  check('there is a case for every kind in the set',
    new Set(cases.map((c) => c.kind)).size === FIELD_KINDS.length,
    `${cases.length} cases`);

  for (const one of cases) {
    check(`${one.kind}: accepts a valid value`, accepts(def(one.kind), one.good),
      JSON.stringify(one.good));
    check(`${one.kind}: refuses a value that is not one`, refuses(def(one.kind), one.bad),
      `${JSON.stringify(one.bad)} — ${one.why}`);
  }

  // ---- the number cases the migration's JSONB column cannot survive.
  check('number refuses NaN', refuses(def('number'), Number.NaN, 'wrong-kind'));
  check('number refuses Infinity', refuses(def('number'), Number.POSITIVE_INFINITY, 'wrong-kind'));
  check('number refuses a string that overflows to Infinity',
    refuses(def('number'), '1e400', 'wrong-kind'),
    'JSON.stringify turns Infinity into null, so it would be stored as no answer at all');
  check('number keeps a real number as a number',
    valueOf(def('number'), '2019') === 2019, 'not the string "2019"');
  check('CONTROL: number still accepts a negative and a decimal',
    accepts(def('number'), '-3.5') && valueOf(def('number'), '-3.5') === -3.5,
    'a check that refused every number would pass all three lines above');

  // ---- dates stay text and never become a Date.
  check('date keeps the text it was given', valueOf(def('date'), '2019-06-30') === '2019-06-30');
  check('date refuses the 30th of February', refuses(def('date'), '2025-02-30'),
    'new Date() rolls it forward to March and would store a different day');
  check('date accepts the 29th in a leap year', isCalendarDay('2024-02-29'));
  check('and refuses it in a common one', !isCalendarDay('2025-02-29'));
  check('CONTROL: a century that is not a leap year',
    !isCalendarDay('1900-02-29') && isCalendarDay('2000-02-29'),
    'the 400-year rule, which a naive %4 check gets wrong twice');

  check('text refuses a value past its cap',
    refuses(def('text'), 'ا'.repeat(MAX_TEXT + 1), 'too-long'), `cap ${MAX_TEXT}`);
  check('CONTROL: and accepts one exactly at it',
    accepts(def('text'), 'ا'.repeat(MAX_TEXT)));

  check('multiselect refuses an unknown option among valid ones',
    refuses(def('multiselect'), ['media', 'security'], 'unknown-option'),
    'one bad entry refuses the answer rather than being dropped from it');
  check('multiselect deduplicates rather than refusing a repeat',
    JSON.stringify(valueOf(def('multiselect'), ['media', 'media'])) === '["media"]');
  check('checkbox reads an absent box as false, which is how browsers post one',
    valueOf(def('checkbox'), undefined) === false);
  check('checkbox reads a ticked one as true', valueOf(def('checkbox'), 'on') === true);
}

/* ------------------------------------------------------------------ */
console.log('\n2. a url answer cannot become a script on somebody\'s profile');
{
  /*
   * THIS IS THE ONE THAT IS AN ATTACK RATHER THAN A TYPO.
   *
   * A url is displayed on a profile, which means it is rendered into an href.
   * `javascript:alert(1)` there is stored XSS that fires for every reader of
   * that profile — including staff, whose sessions are the ones worth taking.
   */
  const url = def('url');

  check('javascript:alert(1) is refused', refuses(url, 'javascript:alert(1)', 'unsafe-url'));
  check('and so is the same thing with whitespace in front',
    refuses(url, '   javascript:alert(1)', 'unsafe-url'),
    'the URL parser trims, so a regex on the raw string would miss this');
  check('and with a tab inside the scheme',
    refuses(url, 'java\tscript:alert(1)', 'unsafe-url'),
    'the parser strips tabs and newlines from a scheme; a regex does not');
  check('and in capitals', refuses(url, 'JavaScript:alert(1)', 'unsafe-url'));
  check('a data: URL is refused too', refuses(url, 'data:text/html,<script>alert(1)</script>', 'unsafe-url'));
  check('a scheme-relative //host is refused', refuses(url, '//evil.example/x', 'unsafe-url'),
    'no scheme, so nothing was checked');

  check('https://example.org is accepted', accepts(url, 'https://example.org'));
  check('and plain http is accepted too', accepts(url, 'http://example.org/page'),
    'the association links to plenty of things that are not on https');
  check('what is stored is what the parser saw',
    String(valueOf(url, 'https://EXAMPLE.org')).startsWith('https://example.org'),
    'so nothing downstream renders a different URL from the one that was checked');

  /*
   * THE CONTROL.
   *
   * Every line above asserts a refusal. A safeUrl() that returned null on
   * everything would satisfy all of them, and so would a validateValue() that
   * refused every value of every kind. Two controls, pulling the other way:
   * the accepted URLs above, and the same dangerous string offered to a kind
   * that has no business rejecting it.
   */
  check('CONTROL: the very same string is a perfectly good text answer',
    accepts(def('text'), 'javascript:alert(1)')
    && valueOf(def('text'), 'javascript:alert(1)') === 'javascript:alert(1)',
    'the refusal is the url rule doing work, not a global ban on the substring');
  check('CONTROL: safeUrl returns a value rather than always null',
    safeUrl('https://takaful.example') !== null && safeUrl('javascript:alert(1)') === null);
}

/* ------------------------------------------------------------------ */
console.log('\n3. a select answer must be one of the definition\'s own options');
{
  const select = def('select');
  check('an authored option is accepted', accepts(select, 'field'));
  check('a value outside the options is refused',
    refuses(select, 'security', 'unknown-option'), 'security is not one of the three');
  check('and so is one that only looks like an option',
    refuses(select, 'Field', 'unknown-option'), 'values are compared exactly, not case-folded');
  check('the label is not the value',
    refuses(select, 'ميداني', 'unknown-option'),
    'a form posting the Arabic label rather than the value is a bug worth seeing');
  check('CONTROL: every authored option is accepted, so the check is not refusing all',
    OPTIONS.every((option) => accepts(select, option.value)), `${OPTIONS.length} options`);

  /*
   * The same definition with an empty option list. The migration's
   * chk_pfd_has_opts refuses to store one, and this asserts the validator does
   * not fall open if a row ever gets past it.
   */
  check('a select with no options accepts nothing',
    refuses({ kind: 'select', options: [], required: false }, 'anything', 'unknown-option'),
    'a form that cannot be filled in is better than one that accepts anything');
}

/* ------------------------------------------------------------------ */
console.log('\n4. required is enforced, and optional really is optional');
{
  for (const kind of FIELD_KINDS) {
    const blankFor: Record<FieldKind, unknown> = {
      text: '   ',
      longtext: '',
      number: '',
      date: '',
      select: '',
      multiselect: [],
      checkbox: false,
      url: '',
    };
    check(`${kind}: an optional field accepts an empty answer`,
      accepts(def(kind), blankFor[kind]) && valueOf(def(kind), blankFor[kind]) !== undefined,
      'and stores nothing, which is how an answer is cleared');
    check(`${kind}: a required field refuses the same empty answer`,
      refuses(def(kind, { required: true }), blankFor[kind], 'required'));
  }

  check('an optional empty answer reads as no answer rather than as a value',
    valueOf(def('text'), '   ') === null,
    'null is what setValues turns into a DELETE of the row');
  check('an unticked required checkbox is a missing answer, not a false one',
    refuses(def('checkbox', { required: true }), undefined, 'required')
    && refuses(def('checkbox', { required: true }), 'off', 'required'),
    'a required tick-box is a consent, and an untouched one is not consent');
  check('CONTROL: a ticked required checkbox passes',
    accepts(def('checkbox', { required: true }), 'on'),
    'without this, "required checkbox always refuses" would look identical');
  check('CONTROL: a required field with a real answer passes',
    accepts(def('text', { required: true }), 'الجامعة اللبنانية')
    && accepts(def('select', { required: true }), 'media'));
}

/* ------------------------------------------------------------------ */
console.log('\n5. the visibility ladder, and what a volunteer genuinely cannot see');
{
  check('the three visibilities are the migration\'s three',
    VISIBILITIES.length === 3
    && VISIBILITIES.every((v) => isVisibility(v))
    && !isVisibility('everyone'),
    VISIBILITIES.join(','));

  const seen = (audience: Audience) => [...visibleTo(audience)].sort().join(',');
  check('signed out sees only public fields', seen('public') === 'public');
  check('a volunteer sees public and volunteers', seen('volunteers') === 'public,volunteers');
  check('staff see all three', seen('staff') === 'public,staff,volunteers');

  /*
   * The same rule driven as a filter over a set of definitions, which is the
   * shape a page actually deals with.
   */
  const FIELDS: { key: string; visibility: Visibility }[] = [
    { key: 'university', visibility: 'public' },
    { key: 'department', visibility: 'volunteers' },
    { key: 'internal_note_flag', visibility: 'staff' },
  ];
  const keysFor = (audience: Audience) =>
    filterByVisibility(FIELDS, audience).map((f) => f.key).join(',');

  check('a stranger is shown one field', keysFor('public') === 'university');
  check('a volunteer is shown two', keysFor('volunteers') === 'university,department');
  check('staff are shown all three',
    keysFor('staff') === 'university,department,internal_note_flag');

  /*
   * THE CONTROL, and the assertion this section exists for. Everything above
   * could be satisfied by a filter that returned its input unchanged — the
   * counts would still rise with the audience.
   */
  check('CONTROL: the staff-only field is genuinely absent for a volunteer',
    !filterByVisibility(FIELDS, 'volunteers').some((f) => f.visibility === 'staff')
    && !canSee('volunteers', 'staff')
    && !canSee('public', 'volunteers'),
    'not merely last in the list, and not hidden by a page — absent from the result');
  check('CONTROL: and the filter is not simply returning everything',
    filterByVisibility(FIELDS, 'public').length < FIELDS.length
    && filterByVisibility(FIELDS, 'staff').length === FIELDS.length);

  // ---- and the rule is applied in SQL rather than after the fetch.
  const fields = readSource('src', 'lib', 'profile-fields.ts');
  const fieldsCode = codeOf(fields);
  check('the persistence module is there to read', fields.length > 0);
  check('valuesFor filters in the query, not in the caller',
    /d\.visibility = ANY\(\$2::text\[\]\)/.test(fieldsCode)
    && /visibleTo\(audienceOf\(viewer\)\)/.test(fieldsCode),
    'a page that fetched everything and rendered some is one careless line from rendering all');
  check('and the viewer argument has no default',
    /export async function valuesFor\(\s*userId: string,\s*viewer: SessionUser \| null,?\s*\)/.test(fieldsCode)
    && !/viewer[^)]*=\s*(null|undefined)/.test(fieldsCode),
    'a default would be the permissive one, and a forgotten argument looks like correct code');
  check('a retired definition is excluded from what anybody is shown',
    /d\.archived_at IS NULL/.test(fieldsCode));
  check('the pure rules are imported rather than restated here',
    /from '\.\/profile-field-kinds'/.test(fieldsCode)
    && !/'public'\s*,\s*'volunteers'\s*,\s*'staff'/.test(fieldsCode),
    'one ladder, in the module a probe can drive');
}

/* ------------------------------------------------------------------ */
console.log('\n6. the subject can never read their own notes');
{
  const notes = readSource('src', 'lib', 'admin-notes.ts');
  const notesCode = codeOf(notes);
  check('the notes module is there to read', notes.length > 0);
  check('and it is server-only', /^import 'server-only';/m.test(notes),
    'a client bundle importing this would be the whole rule undone');

  /*
   * THE ASSERTION THE WHOLE SECTION IS FOR.
   *
   * The rule is not "no page currently shows somebody their own notes" — that
   * is a fact about today's pages. It is that this module offers no way to,
   * which is a fact about the code. So: the exported surface is enumerated and
   * checked against an allowlist, and the reader is checked for the shape that
   * would let it be pointed at a reader instead of a subject.
   */
  const exported = [...notesCode.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)].map((m) => m[1]);
  const ALLOWED = ['notesAbout', 'addNote', 'editNote', 'archiveNote'];
  check('the module exports exactly four functions', exported.length === 4,
    exported.join(',') || 'none found');
  check('and they are the four this feature is allowed to have',
    exported.every((name) => ALLOWED.includes(name))
    && ALLOWED.every((name) => exported.includes(name)),
    exported.join(','));

  check('there is exactly one read, and it is notesAbout',
    exported.filter((name) => /^(notes|read|list|get|fetch)/i.test(name)).length === 1,
    'a second reader is where a viewer argument would arrive');

  const signature = /export async function notesAbout\(([^)]*)\)/.exec(notesCode)?.[1] ?? '';
  const params = signature.split(',').map((p) => p.trim()).filter((p) => p !== '');
  check('notesAbout takes exactly one parameter', params.length === 1, signature.trim() || 'none');
  check('and that parameter is the subject',
    /^userId\s*:\s*string$/.test(params[0] ?? ''), params[0] ?? 'none');

  /*
   * No argument anywhere that could be flipped. A boolean in an exported
   * signature is how "show the subject their own notes" gets added without a
   * new function, and a viewer/audience parameter is how it gets added while
   * looking like the visibility work next door.
   */
  const signatures = [...notesCode.matchAll(/export\s+(?:async\s+)?function\s+\w+\(([^)]*)\)/g)]
    .map((m) => m[1]);
  check('no exported function takes a boolean',
    !signatures.some((s) => /:\s*boolean/.test(s)),
    'a flag is a second behaviour hiding inside a function that already passed review');
  check('no exported function takes a viewer, an audience or a visibility',
    !signatures.some((s) => /viewer|audience|visibility|reader|self|own/i.test(s)),
    signatures.map((s) => s.trim()).join(' | ') || 'no signatures found');
  check('and no exported name suggests one either',
    !exported.some((name) => /self|mine|^my|own|viewer|visible/i.test(name)),
    exported.join(','));

  /*
   * The query itself. One SELECT, scoped to the subject, with no branch in it —
   * a CASE or an OR on who is asking would be the rule undone in SQL while
   * every signature above still passed.
   */
  const selects = notesCode.match(/SELECT[\s\S]*?FROM admin_notes/g) ?? [];
  check('there is exactly one SELECT from admin_notes', selects.length === 1, `${selects.length}`);
  check('it is scoped to the subject',
    /WHERE n\.user_id = \$1 AND n\.archived_at IS NULL/.test(notesCode));
  check('and there is no branch in the file on who is asking',
    !/\bCASE WHEN\b/i.test(notesCode) && !/author_id = \$/.test(notesCode),
    'the file never compares a reader to an author, because it has no reader');

  check('the author is joined for one column, and it is the name',
    /a\.full_name AS author_name/.test(notesCode) && !/\ba\.\*/.test(notesCode));
  check('the join is a LEFT JOIN',
    /LEFT JOIN profiles a ON a\.user_id = n\.author_id/.test(notesCode),
    'a missing profile row must not make a note disappear');
  check('nothing here goes near the sensitive profile',
    !/profiles_sensitive/.test(notesCode),
    'the date of birth and the safeguarding fields live there');

  check('every day handed upward is shifted to Beirut by Postgres',
    /AT TIME ZONE 'Asia\/Beirut'/.test(notesCode) && /YYYY-MM-DD/.test(notesCode));
  check('and no JS Date is built from a stored timestamp',
    !/new Date\(/.test(notesCode),
    'a note written at 00:30 Beirut on the 5th would read as the 4th');

  check('removal is archiving, and nothing deletes a note',
    /archived_at = now\(\)/.test(notesCode) && !/DELETE FROM admin_notes/i.test(notesCode),
    'migration 048 refuses the DELETE anyway; this is the application agreeing');
}

/* ------------------------------------------------------------------ */
console.log('\n7. the write path checks who the caller is, and the log does not copy the note');
{
  const action = readSource('src', 'lib', 'actions', 'admin-profile.ts');
  const actionCode = codeOf(action);
  check('the write path exists', action.length > 0);
  check('it is a server action', /^'use server'/m.test(action));

  const capabilities = [...new Set(
    [...actionCode.matchAll(/requireCapability\((\w+)\)/g)].map((m) => m[1]),
  )];
  check('every action asserts a capability before it writes',
    (actionCode.match(/await requireCapability\(/g) ?? []).length >= 7,
    `${(actionCode.match(/await requireCapability\(/g) ?? []).length} calls`);
  check('notes and field definitions are not the same capability',
    /const NOTES: Capability = 'members\.manage'/.test(actionCode)
    && /const FIELDS: Capability = '(?!members\.manage)[a-z.]+'/.test(actionCode)
    && capabilities.length === 2,
    capabilities.join(',') + ' — different acts, different audiences');
  check('the actor comes from the session and never from the form',
    /const actor = await requireCapability/.test(actionCode)
    && !/formData\.get\('(actorId|authorId|by|userIdOf)/.test(actionCode),
    'the one thing a form may never say is who is asking');
  check('the note author is the actor',
    /addNote\(userId, actor\.id, body\)/.test(actionCode));

  /*
   * THE AUDIT RULE. audit_logs is read by whoever holds audit.read, is exported
   * and is kept; a note is read on one member page. Copying the body across
   * would publish the narrower record to the wider audience in the name of
   * accountability, so the log records that a note exists and about whom.
   */
  const auditCalls = [...actionCode.matchAll(/await audit\(\{[\s\S]*?\n  \}\);/g)].map((m) => m[0]);
  check('every write writes an audit line',
    auditCalls.length >= 7, `${auditCalls.length} audit calls`);
  const noteAudits = auditCalls.filter((call) => /admin-note\./.test(call));
  check('the note audit lines say who and about whom', noteAudits.length === 3
    && noteAudits.every((call) => /targetType: 'user'/.test(call) && /noteId/.test(call)),
    `${noteAudits.length} note audit lines`);
  check('and none of them carries the body',
    noteAudits.every((call) => !/\bbody\b/.test(call)),
    'not as newValue, not as previousValue, and not as a reason');
  check('the answers audit line records which fields changed, not what they say',
    auditCalls.some((call) => /values-set/.test(call) && /fields: keys/.test(call))
    && !auditCalls.some((call) => /values-set/.test(call) && /entries|result\.problems|raw/.test(call)),
    'an answer sits behind a visibility; the log would route it around one');

  check('a field definition is validated against the closed sets before any write',
    /isFieldKind\(kind\)/.test(actionCode) && /isVisibility\(visibility\)/.test(actionCode),
    'a hand-built request is a no-op rather than a 500 from a CHECK constraint');
  check('the key is not in the update path',
    /Omit<DefInput, 'key'>/.test(actionCode)
    && !/updateFieldDef\([^)]*key/.test(actionCode),
    'stored answers reference the definition; migration 048 says the key may not change');
  check('a definition moving outward is logged with what it used to be',
    /previousValue: \{[\s\S]*?visibility: before\.visibility/.test(actionCode),
    '"it was staff-only last week" has to be answerable');

  // The validator is where the values go, and the action does not second-guess it.
  const fieldsCode = codeOf(readSource('src', 'lib', 'profile-fields.ts'));
  /*
   * CONTROL, and it comes first: everything in this block is a regex over
   * `fieldsCode`, and half of them are satisfied by an absence. Read nothing
   * and the two negative clauses below go green on their own.
   */
  check('CONTROL: profile-fields.ts was actually found and read',
    fieldsCode.length > 200 && /export async function setValues/.test(fieldsCode),
    fieldsCode.length === 0 ? 'read nothing' : `${fieldsCode.length} chars of code`);
  check('setValues re-reads every definition from the database',
    /FROM profile_field_defs d WHERE d\.id = ANY\(\$1::uuid\[\]\)/.test(fieldsCode),
    'validating against a definition that arrived in the same request proves nothing');
  check('and validates with the pure function rather than a second copy of it',
    /validateValue\(found, entry\.raw\)/.test(fieldsCode)
    && !/protocol|javascript:/i.test(fieldsCode),
    'one validator, in the module this probe drives');
  check('a bad answer refuses the whole submission rather than half-writing it',
    /reason: 'invalid'/.test(fieldsCode) && /transaction\(async \(client\)/.test(fieldsCode),
    'a half-written form re-rendered from the database looks like it saved');
  check('a retired field is refused rather than written to',
    /reason: 'archived-field'/.test(fieldsCode));

  /*
   * The kind is the one property a stored answer was validated against, and
   * nothing ever re-validates a row. Changing it under fifty existing answers
   * would leave fifty values that no longer match their definition, in a column
   * the migration says Postgres cannot check.
   */
  check('the kind is frozen once somebody has answered',
    /patch\.kind !== existing\.kind/.test(fieldsCode)
    && /SELECT 1 FROM profile_field_values WHERE field_id = \$1 LIMIT 1/.test(fieldsCode)
    && /reason: 'kind-locked'/.test(fieldsCode),
    'retire the field and declare a new one; the old answers stay answers to the old question');
  /*
   * Both offsets are required to EXIST before they are compared.
   *
   * `indexOf` answers −1 for something it cannot find, and −1 is less than
   * every real offset. So a file that had lost its `FOR UPDATE` entirely —
   * which is precisely the defect this line exists to catch — would have
   * satisfied `-1 < n` and reported the lock as correctly placed.
   */
  const lockAt = fieldsCode.indexOf('FOR UPDATE');
  const lockedAt = fieldsCode.indexOf("reason: 'kind-locked'");
  check('and that check sits inside the same transaction as the row lock',
    lockAt !== -1 && lockedAt !== -1 && lockAt < lockedAt,
    lockAt === -1 ? 'no FOR UPDATE anywhere in the module'
      : lockedAt === -1 ? "no reason: 'kind-locked' anywhere in the module"
        : 'an answer arriving between the check and the UPDATE must not slip past it');
}

/* ------------------------------------------------------------------ */
console.log('\n8. migration 048 is what these modules think it is');
{
  const migration = readSource('migrations', '048_admin_notes_and_custom_fields.sql');
  check('migration 048 is written', migration.length > 0);
  check('it is safe to run twice',
    /CREATE TABLE IF NOT EXISTS admin_notes/.test(migration)
    && /CREATE OR REPLACE FUNCTION/.test(migration)
    && /DROP TRIGGER IF EXISTS/.test(migration));
  check('both tables refuse deletes with a trigger rather than by convention',
    /BEFORE DELETE ON admin_notes/.test(migration)
    && /BEFORE DELETE ON profile_field_defs/.test(migration)
    && (migration.match(/RAISE EXCEPTION/g) ?? []).length >= 2,
    'which is why this probe writes nothing');
  check('a note carries its author, and the column is NOT NULL',
    /author_id\s+UUID\s+NOT NULL/.test(migration),
    'an unattributable note is the failure mode');
  check('the kinds in the CHECK constraint are the kinds this code knows',
    FIELD_KINDS.every((kind) => new RegExp(`'${kind}'`).test(migration)),
    FIELD_KINDS.join(','));
  check('the visibilities match too',
    VISIBILITIES.every((v) => new RegExp(`'${v}'`).test(migration)));
  check('visibility defaults inward',
    /visibility\s+TEXT\s+NOT NULL DEFAULT 'staff'/.test(migration),
    'a field that appears public by default is a field somebody publishes by accident');
  check('a select must have something to select from',
    /chk_pfd_has_opts/.test(migration));
  check('and the migration says plainly that the application is the only validator',
    /Postgres cannot check the value against the def's kind/.test(migration),
    'which is the specification section 1 is written against');

  /*
   * profile_field_values is the one table here with no delete trigger, and that
   * is deliberate: an answer is a person's own data and clearing one has to be
   * possible. Asserted so that "add the trigger to all three for consistency"
   * shows up as a failing line rather than as a tidy-looking commit.
   */
  check('an answer may be deleted, and the code relies on that',
    !/BEFORE DELETE ON profile_field_values/.test(migration)
    && /DELETE FROM profile_field_values/.test(codeOf(readSource('src', 'lib', 'profile-fields.ts'))),
    'clearing an optional answer removes the row rather than storing an empty one');
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
