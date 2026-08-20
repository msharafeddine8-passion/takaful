/**
 * Dates and times written the way a volunteer reads them out loud.
 *
 * The listing used to print `2026-08-25T09:00`, which is a machine's way of
 * saying it. Somebody scanning a page for "the thing on Tuesday" has to decode
 * that. So Arabic gets «الثلاثاء في 25 - 8 - 2026» and «الساعة 9 صباحًا»,
 * and English keeps the ordinary Intl formatting.
 *
 * Digits stay Latin on purpose. The association's own paperwork, ID cards and
 * phone keypads use them, and a date is copied between the site and paper more
 * often than it is read aloud.
 */
import type { Locale } from './i18n';

const AR_WEEKDAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

/*
 * Every activity in this system happens in Lebanon, so every time is read in
 * Lebanon. Left to the runtime's own zone, a 9am activity would render as 6am
 * to anybody looking at it: the site is served from Vercel, whose servers run
 * in UTC, and the pages are rendered there rather than on the volunteer's
 * phone. A volunteer three hours early — or late — for a field activity is not
 * a formatting nicety.
 */
const ZONE = 'Asia/Beirut';

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Calendar parts as they read in Beirut, whatever zone the server keeps. */
function partsInZone(d: Date): {
  year: number; month: number; day: number; hour: number; minute: number; weekday: number;
} {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONE,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
    hour12: false,
  });
  const got: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) got[p.type] = p.value;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    year: Number(got.year),
    month: Number(got.month),
    day: Number(got.day),
    // 24:00 is midnight at the start of the next day in some locales' output.
    hour: Number(got.hour) % 24,
    minute: Number(got.minute),
    weekday: Math.max(0, weekdays.indexOf(got.weekday)),
  };
}

/** «الثلاثاء في 25 - 8 - 2026» / «Tue, 25 Aug 2026» */
export function formatDate(value: Date | string | null, lang: Locale): string {
  const d = toDate(value);
  if (!d) return '—';
  if (lang !== 'ar') {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONE,
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }).format(d);
  }
  const p = partsInZone(d);
  return `${AR_WEEKDAYS[p.weekday]} في ${p.day} - ${p.month} - ${p.year}`;
}

/**
 * «الساعة 9 صباحًا», «الساعة 12:30 بعد الظهر», «الساعة 8 مساءً».
 *
 * Three periods rather than two, because «7 مساءً» and «7 صباحًا» are twelve
 * hours apart and a volunteer turning up for the wrong one has wasted their
 * evening. Minutes appear only when there are any.
 */
export function formatTime(value: Date | string | null, lang: Locale): string {
  const d = toDate(value);
  if (!d) return '—';
  if (lang !== 'ar') {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: ZONE, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(d);
  }
  const { hour: h24, minute: minutes } = partsInZone(d);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const period = h24 < 12 ? 'صباحًا' : h24 < 18 ? 'بعد الظهر' : 'مساءً';
  const clock = minutes === 0 ? String(h12) : `${h12}:${String(minutes).padStart(2, '0')}`;
  return `الساعة ${clock} ${period}`;
}

/** Both, for places that show one line: «الثلاثاء في 25 - 8 - 2026، الساعة 9 صباحًا» */
export function formatDateTime(value: Date | string | null, lang: Locale): string {
  const d = toDate(value);
  if (!d) return '—';
  return lang === 'ar'
    ? `${formatDate(d, lang)}، ${formatTime(d, lang)}`
    : `${formatDate(d, lang)}, ${formatTime(d, lang)}`;
}

/** «من الساعة 9 صباحًا حتى الساعة 1 بعد الظهر» */
export function formatTimeRange(
  from: Date | string | null,
  to: Date | string | null,
  lang: Locale,
): string {
  const a = toDate(from);
  const b = toDate(to);
  if (!a && !b) return '—';
  if (!b) return formatTime(a, lang);
  if (!a) return formatTime(b, lang);
  return lang === 'ar'
    ? `من ${formatTime(a, lang)} حتى ${formatTime(b, lang)}`
    : `${formatTime(a, lang)} – ${formatTime(b, lang)}`;
}

/** «ساعة ودقيقة», «ساعتان», «45 دقيقة» — the counted-noun forms Arabic needs. */
export function formatDuration(totalMinutes: number | null, lang: Locale): string {
  if (totalMinutes === null || !Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const mins = Math.floor(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (lang !== 'ar') {
    return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
  }
  const hourWord = h === 0 ? '' : h === 1 ? 'ساعة' : h === 2 ? 'ساعتان' : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
  const minWord = m === 0 ? '' : m === 1 ? 'دقيقة' : m === 2 ? 'دقيقتان' : m <= 10 ? `${m} دقائق` : `${m} دقيقة`;
  return [hourWord, minWord].filter(Boolean).join(' و');
}
