import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead } from '@/components/ui';
import { COURSES, type CourseStatus } from '@/lib/courses';
import { COURSE_CONTENT } from '@/lib/course-content';

export async function generateMetadata(props: PageProps<'/[lang]/academy'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.nav.academy,
    description: dict.home.academyLede,
    alternates: alternatesFor(lang, '/academy'),
  };
}

const STATUS_LABEL: Record<CourseStatus, Record<Locale, string>> = {
  available: { ar: 'متاحة', en: 'Available' },
  draft: { ar: 'قيد المراجعة', en: 'In review' },
  soon: { ar: 'قريباً', en: 'Coming soon' },
};

const STATUS_STYLE: Record<CourseStatus, string> = {
  available: 'bg-brand-orange text-[#241503]',
  draft: 'bg-brand-blue text-white',
  soon: 'border border-line bg-surface-2 text-ink-3',
};

export default async function AcademyPage(props: PageProps<'/[lang]/academy'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const minutesLabel = lang === 'ar' ? 'دقيقة' : 'min';
  const openLabel = lang === 'ar' ? 'افتح الدورة ←' : 'Open course →';

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.home.academyTitle}
          title={dict.home.academyLede}
          lede={dict.journey.lede}
        />

        <div className="mb-5 flex items-center gap-3">
          <span className="tabular grid h-9 w-9 place-items-center rounded-lg bg-brand-grey text-[0.95rem] font-bold text-white">
            1
          </span>
          <h2 className="text-[1.25rem] font-extrabold">
            {dict.journey.levelWord} 1 — {dict.journey.levels[0].title}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => {
            const hasContent = Boolean(COURSE_CONTENT[course.slug]);
            const dim = course.status === 'soon';

            const card = (
              <article
                className={`flex h-full flex-col gap-3 rounded-2xl border p-6 transition-colors ${
                  dim
                    ? 'border-dashed border-line bg-surface/60'
                    : 'border-line bg-surface hover:border-brand-orange'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[0.72rem] font-extrabold ${STATUS_STYLE[course.status]}`}
                  >
                    {STATUS_LABEL[course.status][lang]}
                  </span>
                  <span className="tabular text-[0.8rem] font-semibold text-ink-3">
                    {course.minutes} {minutesLabel}
                  </span>
                </div>

                <h3 className={`text-[1.15rem] font-extrabold leading-snug ${dim ? 'text-ink-2' : ''}`}>
                  {course.title[lang]}
                </h3>
                <p className={`text-[0.93rem] leading-relaxed ${dim ? 'text-ink-3' : 'text-ink-2'}`}>
                  {course.summary[lang]}
                </p>

                {hasContent && (
                  <span className="mt-auto pt-2 text-[0.88rem] font-extrabold text-brand-orange-dark dark:text-brand-orange">
                    {openLabel}
                  </span>
                )}
              </article>
            );

            return hasContent ? (
              <Link key={course.slug} href={`/${lang}/academy/${course.slug}`} className="h-full">
                {card}
              </Link>
            ) : (
              <div key={course.slug} className="h-full">
                {card}
              </div>
            );
          })}
        </div>

        <p className="mt-8 max-w-[62ch] rounded-xl border border-line bg-surface p-5 text-[0.92rem] leading-relaxed text-ink-2">
          {lang === 'ar'
            ? 'المستويات من الثاني إلى السادس قيد الإعداد. كل دورة تُراجَع وتُعتمد من الجمعية قبل نشرها للمتطوعين.'
            : 'Levels 2 to 6 are in preparation. Every course is reviewed and approved by the association before it is published to volunteers.'}
        </p>
      </Container>
    </Section>
  );
}
