import { LevelBadge } from './LevelBadge';
import { highestLevelIn, type LevelBadgeStanding } from '@/lib/programme/level-badges';
import type { Locale } from '@/lib/i18n';
import { plural, type LmsStrings, type PluralForms } from '@/lib/dictionaries/lms';

/**
 * The seven level medallions, in the order the map above them reads:
 * orientation first, then levels one to six.
 *
 * Server component. Two-up on a 375px phone, four across a tablet, all seven
 * on one line on a laptop — the whole point of a wall is that it is taken in
 * at a glance, and seven circles wrapping mid-row loses that.
 *
 * The cell is the repository's existing card surface written out rather than
 * `Card` from '@/components/ui': `Card` carries a `hover:-translate-y-1` that
 * belongs to something you click, and a badge cell is not a link.
 */

const TITLE_ID = 'lms-badge-wall-title';

export function BadgeWall({
  badges,
  lang,
  t,
  viewCertificateLabel,
}: {
  badges: LevelBadgeStanding[];
  lang: Locale;
  t: LmsStrings;
  /** Pass `dict.account.path.viewCertificate`. */
  viewCertificateLabel?: string;
}) {
  const ordered = [...badges].sort((a, b) => a.levelNumber - b.levelNumber);
  const remaining = 6 - highestLevelIn(ordered);

  return (
    <section aria-labelledby={TITLE_ID} className="mt-12">
      <h2 id={TITLE_ID} className="text-[1.35rem] font-extrabold tracking-tight">
        {t.badgesTitle}
      </h2>
      <p className="mt-2 max-w-[64ch] text-[1rem] leading-relaxed text-ink-2">{t.badgesLede}</p>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {ordered.map((badge) => (
          <li key={badge.code} className="rounded-2xl border border-line bg-surface p-4">
            <LevelBadge
              badge={badge}
              lang={lang}
              t={t}
              size="md"
              viewCertificateLabel={viewCertificateLabel}
            />
          </li>
        ))}
      </ul>

      {remaining > 0 && <Remaining n={remaining} forms={t.remainingLevels} lang={lang} />}
    </section>
  );
}

/**
 * "N levels left". Split around the placeholder rather than replaced into it:
 * the count is a Latin digit and needs `dir="ltr"` of its own so it does not
 * reorder inside an Arabic sentence.
 *
 * The form is chosen by `plural` first, because "1 levels to go" was what this
 * rendered on the last level, and Arabic's "يتبقّى 1 من المستويات" was no
 * better. The one- and two- forms spell the count as a word and carry no {n}
 * at all, which this split handles without a special case: `before` becomes
 * the whole sentence and the ltr span renders empty.
 */
function Remaining({ n, forms, lang }: { n: number; forms: PluralForms; lang: Locale }) {
  const [before = '', ...rest] = plural(forms, n, lang).split('{n}');
  return (
    <p className="mt-5 text-[0.95rem] text-ink-2">
      {before}
      <span dir="ltr" className="tabular">
        {n}
      </span>
      {rest.join('{n}')}
    </p>
  );
}
