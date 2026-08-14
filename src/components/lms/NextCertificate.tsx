import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import { plural, type LmsStrings } from '@/lib/dictionaries/lms';
import type { NextCertificate as NextCertificateModel } from '@/lib/programme/journey-map';
import { ProgressRing } from '@/components/lms/ProgressRing';

/**
 * What the learner is working towards, and what is still owed for it.
 *
 * `account.path.nextCertificate` has existed in all three dictionary files
 * since the programme landed and was referenced nowhere. Everything the
 * preview needs was already on ProgrammeStanding — this needs no query.
 *
 * It states what is left. It never says the certificate will arrive by itself:
 * issuing only happens when submitCourseAction calls issueEarnedCredentials,
 * and until that wiring exists a learner can finish a level and hold nothing.
 * That is what `ready` names, and why this component says "you have completed
 * everything this certificate needs" rather than "your certificate is on its
 * way".
 *
 * HEADINGS. All three branches are one <section> with one <h2>, and the h2 is
 * the kicker — "Next certificate" — not the certificate's own name. It used to
 * be the name, which put a heading reading "Level 2" between the page h1 and
 * the map below it, so the whole path map appeared to be part of this card. And
 * the empty state emitted no heading at all, which left the map's station h3s
 * following an h1 directly. The card is a section; its title is what the
 * section is about.
 */
const TITLE_ID = 'lms-next-certificate-title';

export function NextCertificate({
  next,
  lang,
  t,
}: {
  next: NextCertificateModel;
  lang: Locale;
  t: LmsStrings;
}) {
  if (!next) {
    return (
      <section
        aria-labelledby={TITLE_ID}
        className="rounded-xl border border-line bg-surface-2 px-5 py-4"
      >
        <h2 id={TITLE_ID} className="text-[0.82rem] font-extrabold tracking-[0.13em] text-ink-3">
          {t.nextCertificateTitle}
        </h2>
        <p className="mt-2 text-ink-2">{t.nextCertificateNone}</p>
      </section>
    );
  }

  const ringValue = t.ringValue
    .replace('{done}', String(next.done))
    .replace('{total}', String(next.total));

  if (next.ready) {
    return (
      <section aria-labelledby={TITLE_ID} className="rounded-2xl border border-ok/40 bg-ok/10 p-6">
        {/* text-ok-text, not text-ok: over its own bg-ok/10 tint #1e7a4d is
            3.12:1 in the dark theme, and this is 0.82rem text. */}
        <h2
          id={TITLE_ID}
          className="text-[0.82rem] font-extrabold tracking-[0.13em] text-ok-text"
        >
          {t.nextCertificateTitle}
        </h2>
        <p className="mt-2 text-[1.25rem] font-extrabold">{next.title[lang]}</p>
        <p className="mt-2 text-[1rem] leading-relaxed text-ink-2">{t.nextCertificateReady}</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={TITLE_ID}
      className="rounded-2xl border-2 border-brand-orange bg-brand-orange/[0.08] p-6"
    >
      <div className="flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-1">
          {/* The tracking is left in place: it is right for the English kicker,
              and globals.css suppresses letter-spacing under html[lang="ar"],
              where it would sever the joins of الشهادة القادمة. */}
          <h2
            id={TITLE_ID}
            className="text-[0.82rem] font-extrabold tracking-[0.13em] text-brand-orange-text dark:text-brand-orange"
          >
            {t.nextCertificateTitle}
          </h2>
          <p className="mt-2 text-[1.25rem] font-extrabold">{next.title[lang]}</p>
          <p className="mt-2 max-w-[58ch] text-[1rem] leading-relaxed text-ink-2">
            {plural(t.nextCertificateBody, next.remaining.length, lang)
              .replace('{n}', String(next.remaining.length))
              .replace('{title}', next.title[lang])}
          </p>
        </div>

        <ProgressRing
          percent={next.total > 0 ? (next.done / next.total) * 100 : 0}
          label={t.nextCertificateTitle}
          valueText={ringValue}
          size="sm"
          tone="orange"
          lang={lang}
        >
          {/* A bare ratio: a counter, not a sentence, so it is forced to LTR.
              Localised dates and percentages are not — they already read in
              the direction of their own locale. */}
          <span dir="ltr" className="tabular">
            {next.done}/{next.total}
          </span>
        </ProgressRing>
      </div>

      {next.remaining.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2">
          {next.remaining.map((course) => (
            <li key={course.slug}>
              <Link
                href={`/${lang}/academy/${course.slug}` as Parameters<typeof Link>[0]['href']}
                className="flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 py-2 font-bold transition-colors hover:border-brand-orange"
              >
                {course.title[lang]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
