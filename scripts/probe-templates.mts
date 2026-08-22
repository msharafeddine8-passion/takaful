/*
 * The printable forms, and the two ways a paper form goes wrong quietly.
 *
 * The first is layout. Grid columns that do not add up to twelve produce a
 * table slightly wider than the page, the last column falls off at the
 * printer, and nobody reports it — they write smaller, or in the margin. The
 * column that falls off is the one on the end, which on most of these sheets
 * is the signature.
 *
 * The second is worse. Four of these forms touch child protection, safety or
 * consent, and are held until somebody qualified approves them. A held form
 * that slips out with `review: 'ready'` becomes a safeguarding document the
 * association never signed off, filled in by a volunteer who has no way of
 * knowing that. So: a held form must carry no fields at all, and must say why
 * it is held. Both directions are checked, because the failure that matters
 * is a draft escaping — not a ready form being held back.
 *
 * PURE: no database, no network.
 */

import { TEMPLATES, templateBySlug, printableTemplates } from '../src/lib/templates/catalogue.ts';
import { problemsWith, writableFields, isPrintable, COLUMNS } from '../src/lib/templates/validate.ts';
import { pick } from '../src/lib/templates/types.ts';
import { COURSES } from '../src/lib/courses.ts';

let ok = 0;
const holes: string[] = [];
function check(what: string, passed: boolean, detail: unknown = ''): void {
  const line = `${what}${detail === '' ? '' : '  — ' + String(detail)}`;
  if (passed) ok += 1; else holes.push(line);
  console.log(`  ${passed ? 'ok      ' : 'HOLE    '} ${line}`);
}

console.log('1. the catalogue holds together');
{
  const slugs = TEMPLATES.map((t) => t.slug);
  check('there are forms at all', TEMPLATES.length > 0, `${TEMPLATES.length} forms`);
  check('no two share a slug', new Set(slugs).size === slugs.length,
    `${new Set(slugs).size} distinct of ${slugs.length}`);
  check('every slug is url-safe', slugs.every((s) => /^[a-z0-9-]+$/.test(s)),
    slugs.filter((s) => !/^[a-z0-9-]+$/.test(s)).join(',') || 'all clean');
  check('lookup finds every one of them', slugs.every((s) => templateBySlug(s)?.slug === s));
  check('lookup does not invent one', templateBySlug('no-such-form') === undefined);
}

console.log('\n2. nothing prints crooked');
{
  const all = TEMPLATES.flatMap((t) => problemsWith(t));
  check('no layout or state problem in the whole catalogue', all.length === 0,
    all.length ? all.join(' | ') : `${TEMPLATES.length} forms checked`);

  // Said again explicitly, because this is the one that reaches the printer.
  const grids = TEMPLATES.flatMap((t) =>
    t.sections.flatMap((s) =>
      s.fields.filter((f) => f.kind === 'grid').map((f) => ({
        slug: t.slug,
        sum: (f as Extract<typeof f, { kind: 'grid' }>).columns.reduce((n, c) => n + c.width, 0),
      })),
    ),
  );
  check('every table spans exactly twelve columns',
    grids.every((g) => g.sum === COLUMNS),
    grids.filter((g) => g.sum !== COLUMNS).map((g) => `${g.slug}:${g.sum}`).join(',') ||
      `${grids.length} tables`);
  check('and there are tables to check', grids.length > 0, `${grids.length}`);
}

console.log('\n3. the held ones are actually held');
{
  const held = TEMPLATES.filter((t) => t.review === 'needs-review');
  check('some forms are held', held.length > 0, `${held.length} held`);
  check('none of them carries a single field to fill in',
    held.every((t) => t.sections.length === 0),
    held.filter((t) => t.sections.length > 0).map((t) => t.slug).join(',') || 'all empty');
  check('every one says why, in both languages',
    held.every((t) => (t.reviewBecause?.ar.length ?? 0) > 40 && (t.reviewBecause?.en.length ?? 0) > 40),
    held.filter((t) => !t.reviewBecause).map((t) => t.slug).join(',') || 'all explained');
  check('none of them is printable', held.every((t) => !isPrintable(t)));
  check('the library will not offer one',
    printableTemplates().every((t) => t.review === 'ready'),
    `${printableTemplates().length} offered`);

  /*
   * The subjects the association said a model must not write as final. If a
   * form on one of these ever flips to 'ready', this is what says so.
   */
  const MUST_BE_HELD = [
    'incident-report',
    'safeguarding-referral',
    'photo-consent',
    'field-safety-checklist',
  ];
  for (const slug of MUST_BE_HELD) {
    const t = templateBySlug(slug);
    check(`${slug} is still held for a specialist`, t?.review === 'needs-review', t?.review ?? 'missing');
  }
}

console.log('\n4. the ready ones are usable');
{
  const ready = printableTemplates();
  check('there are ready forms', ready.length > 0, `${ready.length} ready`);
  check('each has somewhere to write', ready.every((t) => writableFields(t) >= 5),
    ready.filter((t) => writableFields(t) < 5).map((t) => `${t.slug}:${writableFields(t)}`).join(',') ||
      'all have fields');
  check('each has a heading and a purpose in both languages',
    ready.every((t) => t.title.ar && t.title.en && t.purpose.ar && t.purpose.en));
  check('none is only guidance with no form',
    ready.every((t) => t.sections.some((s) => s.fields.some((f) => f.kind !== 'note'))));
  check('each is portrait or landscape, deliberately',
    ready.every((t) => t.orientation === 'portrait' || t.orientation === 'landscape'));
  check('every section has a title in both languages',
    ready.every((t) => t.sections.every((s) => s.title.ar && s.title.en)));
}

console.log('\n5. what they point at exists');
{
  const known = new Set(COURSES.map((c) => c.slug));
  const linked = TEMPLATES.filter((t) => t.course !== null);
  check('every form that names a course names a real one',
    linked.every((t) => known.has(t.course as string)),
    linked.filter((t) => !known.has(t.course as string)).map((t) => `${t.slug}→${t.course}`).join(',') ||
      `${linked.length} linked`);
  check('most forms are tied to a course', linked.length >= TEMPLATES.length / 2,
    `${linked.length} of ${TEMPLATES.length}`);
}

console.log('\n6. both languages are really there');
{
  /*
   * An English string that is byte-identical to the Arabic one is almost
   * always a copy-paste that was never translated. Headings like '#' and '✓'
   * are the honest exceptions, so single characters do not count.
   */
  const untranslated: string[] = [];
  for (const t of TEMPLATES) {
    const pairs: [string, string, string][] = [
      [`${t.slug} title`, t.title.ar, t.title.en],
      [`${t.slug} purpose`, t.purpose.ar, t.purpose.en],
    ];
    for (const s of t.sections) {
      pairs.push([`${t.slug} section`, s.title.ar, s.title.en]);
      for (const f of s.fields) {
        if (f.kind === 'grid') for (const c of f.columns) pairs.push([`${t.slug} column`, c.head.ar, c.head.en]);
        if (f.kind === 'line' || f.kind === 'box') pairs.push([`${t.slug} label`, f.label.ar, f.label.en]);
      }
    }
    for (const [where, ar, en] of pairs) {
      if (ar.length > 1 && ar === en) untranslated.push(`${where}: "${ar}"`);
    }
  }
  check('nothing is left in one language on both sides', untranslated.length === 0,
    untranslated.slice(0, 4).join(' | ') || 'all translated');

  check('pick() returns the Arabic for ar', pick({ ar: 'نعم', en: 'yes' }, 'ar') === 'نعم');
  check('pick() returns the English for en', pick({ ar: 'نعم', en: 'yes' }, 'en') === 'yes');
}

console.log('\n7. the validator catches what it is for');
{
  const base = {
    slug: 'x', title: { ar: 'ع', en: 'e' }, purpose: { ar: 'ع', en: 'e' },
    course: null, orientation: 'portrait' as const,
  };
  const bad = problemsWith({
    ...base, review: 'ready',
    sections: [{ title: { ar: 'ع', en: 'e' }, fields: [
      { kind: 'grid', columns: [{ head: { ar: 'ع', en: 'e' }, width: 5 }], rows: 2 },
    ] }],
  });
  check('a table that does not add up is caught', bad.some((p) => p.includes('add up to 5')), bad.join('|'));

  const escaped = problemsWith({
    ...base, review: 'needs-review', reviewBecause: { ar: 'ع', en: 'e' },
    sections: [{ title: { ar: 'ع', en: 'e' }, fields: [{ kind: 'note', text: { ar: 'ع', en: 'e' } }] }],
  });
  check('a held form carrying a form is caught',
    escaped.some((p) => p.includes('carries')), escaped.join('|'));

  const silent = problemsWith({ ...base, review: 'needs-review', sections: [] });
  check('a held form with no reason is caught',
    silent.some((p) => p.includes('no reason')), silent.join('|'));

  const hollow = problemsWith({ ...base, review: 'ready', sections: [] });
  check('a ready form with no sections is caught',
    hollow.some((p) => p.includes('no sections')), hollow.join('|'));

  const sound = problemsWith({
    ...base, review: 'ready',
    sections: [{ title: { ar: 'ع', en: 'e' }, fields: [
      { kind: 'line', label: { ar: 'ع', en: 'e' }, width: 12 },
    ] }],
  });
  check('and a sound form is left alone', sound.length === 0, sound.join('|'));
}

/* ------------------------------------------------------------------ */
if (holes.length) {
  console.log('\nholes:');
  for (const hole of holes) console.log(`  - ${hole}`);
}
console.log(`\n${ok} behaviours confirmed, ${holes.length} hole(s).`);
if (holes.length) process.exitCode = 1;
