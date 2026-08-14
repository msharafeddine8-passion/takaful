import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import { DIFFICULTY_LABEL, type Course, type CourseStatus } from '@/lib/courses';
import type { LevelDef } from '@/lib/programme/definition';

/**
 * The academy's shared pieces.
 *
 * One file rather than one per component: these are small, they are only used
 * by the academy, and keeping them together is what stops a second, slightly
 * different progress bar appearing the next time somebody adds a page.
 *
 * Everything here is a server component. None of it needs state, and a course
 * page that ships no extra JavaScript loads faster on the phone most of these
 * volunteers are reading it on.
 */

export type Standing = 'not-started' | 'in-progress' | 'completed';

/**
 * «دورة واحدة», «دورتان», «6 دورات», «11 دورة»: Arabic gives a counted noun a
 * different form at one, two, three-to-ten and eleven-plus, so a single
 * template cannot say this correctly. English fills the same four slots.
 */
export function courseCountLabel(n: number, t: Dictionary['account']['academy']): string {
  if (n === 1) return t.coursesCountOne;
  if (n === 2) return t.coursesCountTwo;
  if (n >= 3 && n <= 10) return t.coursesCountFew.replace('{n}', String(n));
  return t.coursesCount.replace('{n}', String(n));
}

export function standingLabel(s: Standing, t: Dictionary['account']['academy']): string {
  return s === 'completed' ? t.completed : s === 'in-progress' ? t.inProgress : t.notStarted;
}

const STANDING_TONE: Record<Standing, string> = {
  'not-started': 'bg-surface-2 text-ink-3',
  'in-progress': 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange',
  completed: 'bg-ok/15 text-ok',
};

const STATUS_TONE: Record<CourseStatus, string> = {
  available: 'bg-brand-orange text-[#241503]',
  draft: 'bg-brand-blue text-white',
  soon: 'border border-line bg-surface-2 text-ink-3',
};

export function StatusBadge({
  status,
  t,
}: {
  status: CourseStatus;
  t: Dictionary['account']['academy'];
}) {
  const label =
    status === 'available' ? t.statusAvailable : status === 'draft' ? t.statusDraft : t.statusSoon;
  return (
    <span className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${STATUS_TONE[status]}`}>
      {label}
    </span>
  );
}

export function StandingBadge({
  standing,
  t,
}: {
  standing: Standing;
  t: Dictionary['account']['academy'];
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[0.82rem] font-extrabold ${STANDING_TONE[standing]}`}
    >
      {standing === 'completed' ? '✓ ' : ''}
      {standingLabel(standing, t)}
    </span>
  );
}

/**
 * A labelled fact. Used for the course facts rather than a table, because a
 * table of six two-word rows wraps badly on a 375px screen and a wrapping grid
 * does not.
 */
export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      {/* 0.78rem, not 0.7: below about 12px Arabic diacritics and the dot
          patterns that distinguish letters stop being legible on a phone. */}
      <dt className="text-[0.82rem] font-bold tracking-[0.1em] text-ink-3">{label}</dt>
      <dd className="mt-1 text-[0.98rem] font-extrabold leading-snug">{value}</dd>
    </div>
  );
}

export function ProgressBar({
  percent,
  label,
  tone = 'orange',
}: {
  percent: number;
  label: string;
  tone?: 'orange' | 'ok';
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full ${tone === 'ok' ? 'bg-ok' : 'bg-brand-orange'}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/**
 * The primary action. A link rather than a button because it navigates, which
 * means it opens in a new tab on a middle-click and is announced as a link —
 * both of which a <button onClick={router.push}> quietly takes away.
 */
export function PrimaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      // min-h-12 is the touch target. Below about 44px a thumb misses it, and
      // most of these volunteers are reading on a phone.
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-orange px-7 text-[1rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark focus-visible:outline-2"
    >
      {children}
    </Link>
  );
}

export function SecondaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as Parameters<typeof Link>[0]['href']}
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}

/** A course card for the index. */
export function CourseCard({
  lang,
  t,
  course,
  standing,
  percent,
  locked,
}: {
  lang: Locale;
  t: Dictionary['account']['academy'];
  course: Course;
  standing: Standing;
  percent: number | null;
  locked: boolean;
}) {
  const openable = course.status === 'available';

  const body = (
    <article
      className={`flex h-full flex-col rounded-2xl border p-5 transition-colors sm:p-6 ${
        openable
          ? 'border-line bg-surface hover:border-brand-orange'
          : 'border-dashed border-line bg-surface/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-[1.7rem] leading-none" aria-hidden>
          {course.icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <StatusBadge status={course.status} t={t} />
          {openable && standing !== 'not-started' && <StandingBadge standing={standing} t={t} />}
        </div>
      </div>

      <h3 className={`mt-3 text-[1.12rem] font-extrabold leading-snug ${openable ? '' : 'text-ink-2'}`}>
        {course.title[lang]}
      </h3>
      <p className={`mt-2 text-[0.93rem] leading-relaxed ${openable ? 'text-ink-2' : 'text-ink-3'}`}>
        {course.summary[lang]}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] font-bold text-ink-3">
        <span>{course.level === null ? t.electiveWord : `${t.level} ${course.level}`}</span>
        <span aria-hidden>·</span>
        <span>{DIFFICULTY_LABEL[course.difficulty][lang]}</span>
        <span aria-hidden>·</span>
        <span dir="ltr">
          {course.minutes} {lang === 'ar' ? 'دقيقة' : 'min'}
        </span>
      </div>

      {openable && percent !== null && percent > 0 && (
        <div className="mt-4">
          <ProgressBar
            percent={percent}
            label={course.title[lang]}
            tone={standing === 'completed' ? 'ok' : 'orange'}
          />
        </div>
      )}

      {locked && (
        <p className="mt-3 text-[0.82rem] font-bold text-ink-3">🔒 {t.lockedTitle}</p>
      )}

      {openable && (
        <span className="mt-auto pt-4 text-[0.9rem] font-extrabold text-brand-orange-text dark:text-brand-orange">
          {standing === 'completed' ? t.review : standing === 'in-progress' ? t.resume : t.start} →
        </span>
      )}
    </article>
  );

  return openable ? (
    <Link href={`/${lang}/academy/${course.slug}` as Parameters<typeof Link>[0]['href']} className="h-full">
      {body}
    </Link>
  ) : (
    <div className="h-full">{body}</div>
  );
}

/**
 * A stage of the path, as a heading. The catalogue is organised the way the
 * training is organised — a volunteer takes a level together, as one stage —
 * so the heading carries what a stage needs: which level, what it is for,
 * and how far through it the signed-in volunteer is.
 */
export function LevelHeading({
  lang,
  level,
  count,
  done,
  t,
}: {
  lang: Locale;
  level: LevelDef;
  count: number;
  /** Passed courses in this level, or null when nobody is signed in. */
  done: number | null;
  t: Dictionary['account']['academy'];
}) {
  const complete = done !== null && count > 0 && done === count;
  return (
    <div className="mb-5 mt-12 border-b border-line pb-4 first:mt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {/* Level 0 is the orientation, not a numbered stage; its title says
            what it is and a «Level 0» chip would only puzzle. */}
        <h2 className="text-[1.35rem] font-extrabold">
          {level.number === 0
            ? level.title[lang]
            : `${t.level} ${level.number}: ${level.title[lang]}`}
        </h2>
        <span className="text-[0.85rem] font-bold text-ink-3">
          {courseCountLabel(count, t)}
        </span>
        {done !== null && done > 0 && (
          <span
            className={`rounded-full px-3 py-0.5 text-[0.8rem] font-extrabold ${
              complete ? 'bg-ok/15 text-ok-text' : 'bg-brand-orange/15 text-brand-orange-text dark:text-brand-orange'
            }`}
          >
            {complete ? '✓ ' : ''}
            {t.levelDoneOf.replace('{done}', String(done)).replace('{total}', String(count))}
          </span>
        )}
      </div>
      <p className="mt-2 max-w-[70ch] text-[0.95rem] leading-relaxed text-ink-2">
        {level.description[lang]}
      </p>
    </div>
  );
}
