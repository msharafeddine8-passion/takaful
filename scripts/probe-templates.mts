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

console.log('\n3. holding a form back still works');
{
  /*
   * Nothing is held at the moment — the four that were have been written out.
   * The machinery has to keep working anyway, because the next form somebody
   * is unsure about will need it, so it is exercised against a constructed
   * template rather than against whatever happens to be in the catalogue.
   * Asserting "at least one form is held" would mean inventing a held form to
   * keep a test green, which is the wrong way round.
   */
  const draft = {
    slug: 'a-draft', title: { ar: 'ع', en: 'e' }, purpose: { ar: 'ع', en: 'e' },
    course: null, orientation: 'portrait' as const, review: 'needs-review' as const,
    reviewBecause: {
      ar: 'سبب مكتوب بطول كافٍ ليشرح لماذا يحتاج هذا النموذج مراجعة مختص قبل استعماله.',
      en: 'A reason long enough to explain why this form needs a specialist to look at it first.',
    },
    sections: [],
  };
  check('a held form is not printable', !isPrintable(draft));
  check('and a held form with a reason and no fields is otherwise sound',
    problemsWith(draft).length === 0, problemsWith(draft).join('|'));
  check('the library never offers a held form',
    printableTemplates().every((t) => t.review === 'ready'),
    `${printableTemplates().length} offered`);

  /* And whatever is held in the catalogue, if anything ever is again. */
  const held = TEMPLATES.filter((t) => t.review === 'needs-review');
  check('every held form in the catalogue carries no fields and says why',
    held.every((t) => t.sections.length === 0 && (t.reviewBecause?.ar.length ?? 0) > 40),
    held.length ? held.map((t) => t.slug).join(',') : 'none held right now');
}

console.log('\n3b. the forms somebody could be harmed by');
{
  /*
   * These four were held back at first, on the association's instruction that
   * a model should not write child protection, safety or legal content as
   * final. That instruction was lifted and they are now written out, so the
   * guard changes shape rather than disappearing.
   *
   * What is checked now is that each still ends with a person's name against
   * it and records that the association adopted the wording. An incident
   * report nobody signed is a document nobody stands behind; a safety
   * checklist nobody signed is a column of ticks nobody made — and a form
   * with no adoption line cannot be told apart from a draft that escaped.
   */
  const DUTY = [
    'incident-report',
    'safeguarding-referral',
    'photo-consent',
    'field-safety-checklist',
  ];
  for (const slug of DUTY) {
    const t = templateBySlug(slug);
    check(`${slug} is marked as carrying a duty`, t?.carriesDuty === true, t ? '' : 'missing');
  }
  check('and nothing else claims to', TEMPLATES.filter((t) => t.carriesDuty).length === DUTY.length,
    TEMPLATES.filter((t) => t.carriesDuty).map((t) => t.slug).join(','));

  /* problemsWith enforces both halves; this states them where they can be read. */
  check('each ends with somebody signing it',
    DUTY.every((s) => {
      const t = templateBySlug(s);
      const last = t?.sections[t.sections.length - 1];
      return last?.fields.some((f) => f.kind === 'signoff') ?? false;
    }));
  check('each records that the association adopted the wording',
    DUTY.every((s) => (problemsWith(templateBySlug(s)!)).length === 0));

  /*
   * The two facts a model must not invent, because they are facts about
   * Lebanon and about this association rather than expertise: which body is
   * competent to receive a referral, and what the law requires of an image
   * consent. Both are blanks on the form. If either is ever filled in with a
   * named body or a cited statute that nobody verified, this fails.
   */
  const referral = templateBySlug('safeguarding-referral');
  const bodyNamed = JSON.stringify(referral).match(/وزارة|مكتب حماية|Ministry|Union for Protection|UPEL/);
  check('the referral form names no external body on the model’s authority',
    bodyNamed === null, bodyNamed?.[0] ?? 'left as a field the association fills');

  const consent = templateBySlug('photo-consent');
  const lawCited = JSON.stringify(consent).match(/قانون رقم|المادة \d|Law No|Article \d/);
  check('the consent form cites no statute on the model’s authority',
    lawCited === null, lawCited?.[0] ?? 'legal basis left to the association’s review');
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
