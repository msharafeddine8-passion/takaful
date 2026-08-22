import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import { countPhrase, formatDuration } from '@/lib/when';

/**
 * What this volunteer has actually done, as four things you can open.
 *
 * They were four identical bordered boxes containing a label and a value, and
 * they were not links — so the page showed somebody "3 activities" and gave
 * them nowhere to go and look at the three. Everything here is now a link to
 * the page that explains it, which is also what makes the tiles worth
 * pressing on a phone.
 *
 * The numeral carries the weight and the sentence sits under it. Both are
 * needed: the figure is what the eye counts, and the sentence is what makes it
 * mean something — "12" alone is not an achievement, and Arabic counted nouns
 * cannot be produced by putting a number in front of a word.
 */

type Tile = {
  href: string;
  label: string;
  /** Null where there is nothing to count yet — the sentence says so instead. */
  figure: string | null;
  sentence: string;
  icon: string;
  note?: string;
};

export function ImpactTiles({
  lang, dict, verifiedMinutes, pendingMinutes,
  coursesPassed, activitiesAttended, certificates,
}: {
  lang: Locale;
  dict: Dictionary;
  verifiedMinutes: number;
  pendingMinutes: number;
  coursesPassed: number;
  activitiesAttended: number;
  certificates: number;
}) {
  const p = dict.account.portal;
  const impact = dict.account.impact;
  const at = (path: string) => `/${lang}/account${path}`;

  /*
   * The hours figure is a duration, not a count — «ساعتان و30 دقيقة» has no
   * single numeral to enlarge.
   *
   * At zero it shows nothing rather than an em dash. A dash above the words
   * "no hours logged yet" is the same emptiness stated twice, and the dash
   * reads as a value that failed to load rather than as a nought.
   */
  const hoursFigure = verifiedMinutes > 0 ? formatDuration(verifiedMinutes, lang) : null;

  const tiles: Tile[] = [
    {
      href: at('/hours'),
      label: p.summaryHours,
      figure: hoursFigure,
      sentence: countPhrase(Math.floor(verifiedMinutes / 60), impact.hours),
      icon: '⏱',
      note: pendingMinutes > 0
        ? p.pendingNote.replace('{n}', formatDuration(pendingMinutes, lang))
        : undefined,
    },
    {
      href: at('/learning'),
      label: p.summaryCourses,
      // A zero is not shown as a numeral either. "0" over "no course started
      // yet" is the same nothing twice, and a row of zeroes on a new
      // volunteer's first visit reads as a scoreboard they are losing.
      figure: coursesPassed > 0 ? String(coursesPassed) : null,
      sentence: countPhrase(coursesPassed, impact.courses),
      icon: '📚',
    },
    {
      href: at('/activities'),
      label: p.summaryActivities,
      figure: activitiesAttended > 0 ? String(activitiesAttended) : null,
      sentence: countPhrase(activitiesAttended, impact.activities),
      icon: '🤝',
    },
    {
      href: at('/certificates'),
      label: p.summaryCertificates,
      figure: certificates > 0 ? String(certificates) : null,
      sentence: countPhrase(certificates, impact.certificates),
      icon: '🎖',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href as Parameters<typeof Link>[0]['href']}
          className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-orange hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        >
          <span className="flex items-center gap-2 text-[0.78rem] font-extrabold tracking-[0.1em] text-ink-3">
            <span aria-hidden className="text-[1rem]">{tile.icon}</span>
            {tile.label}
          </span>
          {tile.figure && (
            <span
              className="mt-2 text-[1.7rem] font-black leading-none tracking-tight text-brand-blue dark:text-sky-300"
              dir="ltr"
            >
              {tile.figure}
            </span>
          )}
          <span
            className={`text-[0.88rem] leading-snug text-ink-2 ${tile.figure ? 'mt-1.5' : 'mt-2'}`}
          >
            {tile.sentence}
          </span>
          {tile.note && (
            <span className="mt-1.5 text-[0.82rem] font-bold text-brand-orange-text dark:text-brand-orange">
              {tile.note}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
