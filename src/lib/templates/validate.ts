import type { Template, Field } from './types';

/**
 * What has to be true of a form before it is printed.
 *
 * A paper form fails quietly. Columns that do not add up produce a table
 * slightly off the edge of the page, and nobody reports it — they just write
 * smaller. A section with no fields prints a heading over blank paper. A
 * draft that slips out with `review: 'ready'` becomes a safeguarding document
 * the association never approved.
 *
 * None of those show up in a type. So they are checked here, by pure
 * functions the probe runs over the whole catalogue on every suite run.
 */

/** The grid every layout is measured in. Twelve divides by 2, 3, 4 and 6. */
export const COLUMNS = 12;

export function isPrintable(t: Template): boolean {
  return t.review === 'ready' && t.sections.length > 0;
}

function fieldProblems(f: Field, where: string): string[] {
  const out: string[] = [];
  switch (f.kind) {
    case 'line':
      if (f.width !== undefined && (f.width < 1 || f.width > COLUMNS)) {
        out.push(`${where}: a line is ${f.width} columns wide`);
      }
      break;
    case 'box':
      if (f.lines < 1) out.push(`${where}: a box has ${f.lines} lines to write on`);
      break;
    case 'grid': {
      const sum = f.columns.reduce((n, c) => n + c.width, 0);
      if (sum !== COLUMNS) out.push(`${where}: grid columns add up to ${sum}, not ${COLUMNS}`);
      if (f.columns.length === 0) out.push(`${where}: a grid with no columns`);
      if (f.rows < 1) out.push(`${where}: a grid with ${f.rows} rows to fill in`);
      break;
    }
    case 'checklist':
      if (f.items.length === 0) out.push(`${where}: a checklist with nothing to tick`);
      break;
    case 'signoff':
      if (f.roles.length === 0) out.push(`${where}: a sign-off with nobody to sign`);
      break;
    case 'note':
      break;
  }
  return out;
}

/**
 * Everything wrong with one template, as sentences. Empty means it is sound.
 *
 * Returns all of them rather than the first, because a probe that reports one
 * problem per run turns a catalogue-wide mistake into a catalogue-wide number
 * of runs.
 */
export function problemsWith(t: Template): string[] {
  const out: string[] = [];

  if (t.review === 'needs-review') {
    /* A draft has to say why it is a draft, and must not carry a form. The
     * reason is printed on the page in place of the fields — without it the
     * page is a refusal with no explanation, which reads as a bug. */
    if (!t.reviewBecause) out.push(`${t.slug}: held for review with no reason given`);
    if (t.sections.length > 0) {
      out.push(`${t.slug}: held for review but carries ${t.sections.length} section(s) of form`);
    }
  } else {
    if (t.sections.length === 0) out.push(`${t.slug}: marked ready but has no sections`);
    if (t.reviewBecause) out.push(`${t.slug}: marked ready but still carries a review reason`);
  }

  /*
   * A form somebody could be harmed by ends with a name against it.
   *
   * An incident report nobody signed is a document nobody stands behind; a
   * safety checklist nobody signed is a column of ticks nobody made. And the
   * adoption line beside the signature is what separates a form the
   * association has agreed to use from a draft that escaped — which matters
   * most for exactly these four, since they were held back for review before
   * being written out.
   */
  if (t.carriesDuty) {
    const last = t.sections[t.sections.length - 1];
    const signs = last?.fields.some((f) => f.kind === 'signoff') ?? false;
    if (!signs) out.push(`${t.slug}: carries a duty but does not end with a sign-off`);
    const adopts = t.sections.some((s) =>
      s.fields.some(
        (f) =>
          (f.kind === 'line' || f.kind === 'box') &&
          /اعتمدت الجمعية|adopted by the association/i.test(f.label.ar + f.label.en),
      ),
    );
    if (!adopts) out.push(`${t.slug}: carries a duty but records no adoption by the association`);
  }

  t.sections.forEach((s, i) => {
    if (s.fields.length === 0) out.push(`${t.slug}: section ${i + 1} has no fields`);
    s.fields.forEach((f, j) => out.push(...fieldProblems(f, `${t.slug} §${i + 1}.${j + 1}`)));
  });

  return out;
}

/** Somewhere to write, counted. Used to catch a "form" that is all guidance. */
export function writableFields(t: Template): number {
  let n = 0;
  for (const s of t.sections) {
    for (const f of s.fields) {
      if (f.kind === 'note') continue;
      if (f.kind === 'grid') n += f.rows * f.columns.length;
      else if (f.kind === 'checklist') n += f.items.length;
      else if (f.kind === 'signoff') n += f.roles.length;
      else n += 1;
    }
  }
  return n;
}
