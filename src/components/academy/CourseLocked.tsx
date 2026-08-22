import Link from 'next/link';
import { Container, Section, Kicker } from '@/components/ui';
import { courseBySlug } from '@/lib/courses';
import type { AccessState } from '@/lib/programme/access';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';

/**
 * What somebody sees instead of a course they may not read yet.
 *
 * Not a padlock laid over the content — the content is not on this page at
 * all. This is the whole response: what the course is, why it is shut, and the
 * one thing to do about it.
 *
 * A refusal that only says "locked" is a dead end. Naming the course that
 * stands in the way, and linking straight to it, turns the same refusal into
 * the next step — which is the difference between a wall and a door.
 */

export function CourseLocked({
  lang, dict, meta, state, missing,
}: {
  lang: Locale;
  dict: Dictionary;
  meta: { slug: string; title: Record<Locale, string>; summary?: Record<Locale, string> };
  state: AccessState;
  /** Slugs of the courses that are not passed yet, from the gate. */
  missing: string[];
}) {
  const a = dict.account.academy;
  const t = a.locked;

  const reason = {
    login_required: t.reasonSignIn,
    prerequisite_locked: t.reasonPrerequisite,
    preview_only: t.reasonUnpublished,
    staff_only: t.reasonStaff,
    public: '',
  }[state];

  /* Named, not counted. "3 prerequisites remaining" is not something anybody
   * can act on; the title of the next one is. */
  const blockers = missing
    .map((slug) => ({ slug, course: courseBySlug(slug) }))
    .filter((b) => b.course);

  const done = 0;
  const total = missing.length;

  return (
    <Section>
      <Container className="max-w-2xl">
        <Kicker>{a.heroTitle}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.5rem,1.25rem+1.3vw,2.1rem)] font-extrabold tracking-tight">
          {meta.title[lang]}
        </h1>
        {meta.summary && (
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{meta.summary[lang]}</p>
        )}

        <div className="mt-7 rounded-2xl border-2 border-line bg-surface-2 p-6">
          <p className="text-[1.05rem] font-extrabold">
            {/* A padlock and the word, not the padlock alone. */}
            <span aria-hidden className="me-2">🔒</span>
            {t.title}
          </p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{reason}</p>

          {state === 'prerequisite_locked' && blockers.length > 0 && (
            <div className="mt-5">
              <p className="text-[0.8rem] font-extrabold tracking-[0.12em] text-ink-3">
                {t.requiredTitle}
              </p>
              <ul className="mt-2 space-y-2">
                {blockers.map(({ slug, course }) => (
                  <li key={slug}>
                    <Link
                      href={`/${lang}/academy/${slug}` as Parameters<typeof Link>[0]['href']}
                      className="inline-flex min-h-11 items-center font-bold text-brand-blue underline decoration-line underline-offset-4 hover:text-brand-blue-dark dark:text-sky-300"
                    >
                      {course!.title[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* How far along, in the unit that matters: courses, not a
                  percentage of an abstract quantity. */}
              <p className="mt-3 text-[0.88rem] font-bold text-ink-2" dir="ltr">
                {done} / {total}
              </p>
            </div>
          )}

          {/*
            * One route out, matched to the reason. No "start the course"
            * button — offering to start something the server will refuse is
            * exactly the contradiction this page exists to remove.
            */}
          <div className="mt-6 flex flex-wrap gap-3">
            {state === 'login_required' ? (
              <Link
                href={`/${lang}/login` as Parameters<typeof Link>[0]['href']}
                className="inline-flex min-h-11 items-center rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
              >
                {t.signInCta}
              </Link>
            ) : blockers.length > 0 ? (
              <Link
                href={`/${lang}/academy/${blockers[0].slug}` as Parameters<typeof Link>[0]['href']}
                className="inline-flex min-h-11 items-center rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] hover:bg-brand-orange-dark"
              >
                {t.goToRequirement}
              </Link>
            ) : null}
            <Link
              href={`/${lang}/academy` as Parameters<typeof Link>[0]['href']}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-6 py-3 text-[0.95rem] font-bold hover:bg-surface"
            >
              {t.backToAcademy}
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
