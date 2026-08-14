import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import { plural, type LmsStrings } from '@/lib/dictionaries/lms';
import type { MapModel, Station, StationState } from '@/lib/programme/journey-map';
import type { Missing } from '@/lib/programme/gate';
import type { LevelBadgeStanding } from '@/lib/programme/level-badges';
import { LevelBadge } from '@/components/lms/LevelBadge';
import { ProgressRing } from '@/components/lms/ProgressRing';
import { Arrow } from '@/components/ui';

/**
 * The map itself: one vertical rail of seven stations.
 *
 * A vertical rail at every width, not a serpentine or a two-column board. A
 * winding layout needs absolute x positions, and absolute x positions are
 * physical — they cannot mirror under dir="rtl" without a second set of
 * coordinates and a second set of bugs. The rail in account/journey/page.tsx
 * is already proven correct in both directions and is built entirely from
 * logical properties, so this copies its geometry: `relative ps-*` on the item,
 * the connector at `start-*`, the node at `start-0`.
 *
 * Nothing here drags, and nothing here animates. Every station is a link or
 * plain text, so it is keyboard-operable by construction rather than by a
 * retrofitted key handler.
 *
 * Only logical utilities: ms-/me-/ps-/pe-/start-/end-/text-start. A single
 * `pl-`, `left-`, `ml-` or `mr-` in this file fails scripts/probe-a11y.
 */

/*
 * The tone vocabulary of STANDING_TONE in academy/parts.tsx, so the map does
 * not become a fifth independent status palette — but reading from the -text
 * tokens rather than the surface ones.
 *
 * The pill is 0.82rem, which is small text and needs 4.5:1 against what is
 * actually behind it. What is behind it is not the page: it is the page seen
 * through a 15% tint, and inside the "you are here" card it is the page seen
 * through two stacked tints. `text-ok` measured that way is 4.33:1 on --ground
 * and 4.09:1 in a card in the light theme, and 2.97:1 / 2.72:1 in the dark one,
 * where --color-ok has no correction at all. `text-brand-orange-text` was
 * 4.31:1 and 4.07:1. --color-ok-text flips with the theme and --color-brand-
 * orange-text has been darkened; both are measured against the composite. See
 * the token block in globals.css.
 */
const STATE_TONE: Record<StationState, string> = {
  complete: 'bg-ok/15 text-ok-text',
  current: 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange',
  open: 'bg-surface-2 text-ink-3',
  locked: 'border border-line bg-surface-2 text-ink-3',
};

const TITLE_ID = 'lms-journey-map-title';

const RING_TONE: Record<StationState, 'orange' | 'ok' | 'muted'> = {
  complete: 'ok',
  current: 'orange',
  open: 'orange',
  locked: 'muted',
};

export function JourneyMap({
  model,
  lang,
  t,
  tPath,
  badges,
  children,
}: {
  model: MapModel;
  lang: Locale;
  t: LmsStrings;
  tPath: Dictionary['account']['path'];
  badges: LevelBadgeStanding[];
  children?: ReactNode;
}) {
  /*
   * The map owns an h2, the way SkillMap and BadgeWall do.
   *
   * Without one the seven station h3s had no h2 of their own to sit under, so
   * they attached to whatever heading happened to precede them on the page —
   * the next-certificate card's, which names a level, making the entire path
   * read as a subsection of "Level 2". And on the page where that card renders
   * its empty state, which has no heading at all, the outline went straight
   * from the h1 to an h3. Both are WCAG 1.3.1: a section that is drawn as a
   * section has to be marked up as one.
   *
   * The <nav> keeps its accessible name by pointing at that same heading
   * instead of repeating the text in an aria-label.
   */
  return (
    <section aria-labelledby={TITLE_ID} className="mx-auto max-w-3xl">
      {children}

      <h2 id={TITLE_ID} className="mb-6 text-[1.35rem] font-extrabold tracking-tight">
        {t.stationList}
      </h2>

      <nav aria-labelledby={TITLE_ID}>
        <ol className="relative">
          {model.stations.map((station, i) => (
            <StationRow
              key={station.key}
              station={station}
              lang={lang}
              t={t}
              tPath={tPath}
              badges={badges}
              isLast={i === model.stations.length - 1}
            />
          ))}
        </ol>
      </nav>
    </section>
  );
}

function StationRow({
  station,
  lang,
  t,
  tPath,
  badges,
  isLast,
}: {
  station: Station;
  lang: Locale;
  t: LmsStrings;
  tPath: Dictionary['account']['path'];
  badges: LevelBadgeStanding[];
  isLast: boolean;
}) {
  const stateLabel = stateWord(station.state, t);
  const heading =
    station.kind === 'orientation'
      ? t.stationOrientation
      : t.stationLevel.replace('{n}', String(station.number));

  const ringValue = t.ringValue
    .replace('{done}', String(station.done))
    .replace('{total}', String(station.total));

  // The badges array is keyed by level number, orientation being 0 — the same
  // numbering the stations use, so no mapping table is needed between them.
  const badge = badges.find((b) => b.levelNumber === station.number);

  const locked = station.state === 'locked';
  const href = station.nextSlug
    ? `/${lang}/academy/${station.nextSlug}`
    : `/${lang}/account/path`;

  return (
    // ps-24 clears the 5rem node with a gap; the connector sits on its centre.
    // Both are logical, so the whole rail mirrors under dir="rtl" untouched.
    <li className="relative ps-24 pb-10">
      {!isLast && (
        <span
          aria-hidden
          className={`absolute start-[2.5rem] top-24 bottom-0 w-[2px] ${
            station.state === 'complete' ? 'bg-ok' : 'bg-line'
          }`}
        />
      )}

      <span className="absolute start-0 top-0">
        <ProgressRing
          percent={station.percent}
          label={station.title[lang]}
          valueText={ringValue}
          size="md"
          tone={RING_TONE[station.state]}
          lang={lang}
        >
          {station.state === 'complete' ? (
            <span aria-hidden>✓</span>
          ) : locked ? (
            // The padlock is decoration; the word "Locked" is rendered as real
            // text in the state pill below. A bare 🔒 inside a label tells a
            // screen-reader user nothing, which is the fault this replaces.
            <span aria-hidden>🔒</span>
          ) : (
            <span dir="ltr" className="tabular">
              {station.number}
            </span>
          )}
        </ProgressRing>
      </span>

      <div
        className={
          station.youAreHere
            ? 'rounded-2xl border-2 border-brand-orange bg-brand-orange/[0.08] p-5'
            : ''
        }
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-[1.12rem] font-extrabold">{heading}</h3>
          <span
            className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${STATE_TONE[station.state]}`}
          >
            {stateLabel}
          </span>
          {station.youAreHere && (
            <span className="rounded-full bg-brand-orange px-3 py-1 text-[0.82rem] font-extrabold text-brand-orange-ink">
              {t.youAreHere}
            </span>
          )}
        </div>

        <p className="mt-1 text-[0.95rem] font-bold text-ink-2">{station.title[lang]}</p>

        {station.description[lang] && (
          <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-2">
            {station.description[lang]}
          </p>
        )}

        <p className="mt-3 text-[0.88rem] font-bold text-ink-3">
          {station.hasCourses
            ? // The count that picks the form is {total}, the noun being
              // counted — the orientation station holds exactly one course, so
              // this is the string that used to read "0 من 1 دورات".
              plural(t.coursesOf, station.total, lang)
                .replace('{done}', String(station.done))
                .replace('{total}', String(station.total))
            : t.nothingSetYet}
        </p>

        {badge && (
          <div className="mt-4 flex justify-start">
            <LevelBadge badge={badge} lang={lang} t={t} size="sm" />
          </div>
        )}

        {locked ? (
          <p className="mt-4 text-[0.9rem] font-bold text-ink-3">
            {t.lockedUntil.replace('{what}', reasonText(station.lockedBy, tPath, lang))}
          </p>
        ) : (
          <Link
            href={href as Parameters<typeof Link>[0]['href']}
            {...(station.youAreHere ? { 'aria-current': 'step' as const } : {})}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-[0.92rem] font-extrabold transition-colors hover:border-brand-orange hover:bg-surface-2"
          >
            {t.openStation}
            {/* The accessible name has to differ per row, or a screen reader
                reads seven identical links. */}
            <span className="sr-only"> — {station.title[lang]}</span>
            {/* Not a hard-coded arrow character. U+2192 is not Bidi_Mirrored,
                so under dir="rtl" `ms-2` moves it to the visual left of the
                label and it goes on pointing rightwards — a forward action
                wearing a backward arrow, on all seven stations. <Arrow> picks
                the character the locale actually reads. The codepoint is named
                rather than typed here because probe-a11y.mts §4 reads this file
                as text and cannot tell a glyph in prose from one in markup. */}
            <Arrow lang={lang} />
          </Link>
        )}
      </div>
    </li>
  );
}

function stateWord(state: StationState, t: LmsStrings): string {
  switch (state) {
    case 'complete':
      return t.stateComplete;
    case 'current':
      return t.stateCurrent;
    case 'open':
      return t.stateOpen;
    case 'locked':
      return t.stateLocked;
  }
}

/**
 * The gate's structured refusal, said as something a learner can act on.
 * Modelled on reasonText in account/path/page.tsx so the two pages give the
 * same explanation for the same lock.
 */
function reasonText(missing: Missing[], t: Dictionary['account']['path'], lang: Locale): string {
  const first = missing[0];
  if (!first) return t.locked;
  switch (first.kind) {
    case 'sign-in':
      return t.needSignIn;
    case 'orientation':
      return t.needOrientation;
    case 'challenge':
      return t.needChallenge;
    case 'course':
      // Naming the course is the whole point: "finish Teamwork" is a route,
      // "finish a prerequisite" is a shrug.
      return `${t.needCourse} ${first.title[lang]}`;
    case 'level':
      return `${t.levelWord} ${first.number}`;
  }
}
