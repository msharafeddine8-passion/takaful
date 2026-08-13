import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query } from '@/lib/db';
import { CourseEditor } from '@/components/staff/CourseEditor';

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/programme'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.programme.title,
    alternates: alternatesFor(lang, '/staff/programme'),
    robots: { index: false, follow: false },
  };
}

type Row = {
  slug: string;
  kind: string;
  status: string;
  origin: string;
  level_number: number | null;
  level_title_ar: string | null;
  level_title_en: string | null;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  minutes: number;
  pass_mark: number;
  content_version: number;
  reviewed_at: Date | null;
  module_count: string;
};

/**
 * The programme, as staff see it.
 *
 * Deliberately one page rather than a tree of screens. Forty-one courses is
 * small enough to read at once, and what a programme manager most needs is the
 * comparison — which levels are written, which courses have never been
 * reviewed, which are still drafts — not the ability to drill into one course
 * at a time and lose the shape.
 */
export default async function ProgrammePage(props: PageProps<'/[lang]/staff/programme'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.programme;

  if (!isDbConfigured()) notFound();
  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  // notFound rather than a refusal page: a staff URL should not confirm to a
  // volunteer that it exists.
  if (!can(user, 'programme.edit')) notFound();

  const mayPublish = can(user, 'programme.publish');

  const rows = await query<Row>(`
    SELECT c.slug, c.kind, c.status, c.origin, c.title_ar, c.title_en,
           c.summary_ar, c.summary_en, c.minutes, c.pass_mark,
           c.content_version, c.reviewed_at,
           l.number AS level_number, l.title_ar AS level_title_ar, l.title_en AS level_title_en,
           (SELECT count(*) FROM modules m WHERE m.course_id = c.id)::text AS module_count
      FROM courses c
      LEFT JOIN program_levels l ON l.id = c.level_id
     ORDER BY l.number NULLS LAST, c.sort_order
  `);

  // Group by level, electives last, preserving the query's order.
  const groups = new Map<string, { title: string; rows: Row[] }>();
  for (const row of rows) {
    const key = row.level_number === null ? 'electives' : String(row.level_number);
    const title =
      row.level_number === null
        ? t.title
        : `${row.level_number} · ${lang === 'ar' ? row.level_title_ar : row.level_title_en}`;
    if (!groups.has(key)) groups.set(key, { title: title ?? key, rows: [] });
    groups.get(key)!.rows.push(row);
  }

  const written = rows.filter((r) => Number(r.module_count) > 0).length;
  const published = rows.filter((r) => r.status === 'published').length;
  const unreviewed = rows.filter((r) => r.reviewed_at === null).length;

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.dashboard.title}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <dl className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label={t.courseCount} value={String(rows.length)} />
          <Stat label={t.contentWritten} value={`${written} / ${rows.length}`} />
          <Stat label={t.statusPublished} value={String(published)} />
          <Stat
            label={t.neverReviewed}
            value={String(unreviewed)}
            tone={unreviewed > 0 ? 'warn' : undefined}
          />
        </dl>

        {[...groups.entries()].map(([key, group]) => (
          <section key={key} className="mt-10">
            <h2 className="mb-4 text-[1.15rem] font-extrabold">{group.title}</h2>
            <ul className="flex flex-col gap-3">
              {group.rows.map((row) => (
                <li key={row.slug}>
                  <CourseEditor
                    lang={lang}
                    t={t}
                    mayPublish={mayPublish}
                    course={{
                      slug: row.slug,
                      kind: row.kind,
                      status: row.status,
                      origin: row.origin,
                      titleAr: row.title_ar,
                      titleEn: row.title_en,
                      summaryAr: row.summary_ar,
                      summaryEn: row.summary_en,
                      minutes: row.minutes,
                      passMark: row.pass_mark,
                      version: row.content_version,
                      hasContent: Number(row.module_count) > 0,
                      reviewedAt: row.reviewed_at
                        ? new Date(row.reviewed_at).toISOString().slice(0, 10)
                        : null,
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </Section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'warn';
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-[0.82rem] font-bold tracking-[0.08em] text-ink-3">{label}</dt>
      <dd
        className={`mt-1 text-[1.4rem] font-extrabold ${
          tone === 'warn' ? 'text-brand-orange-text dark:text-brand-orange' : ''
        }`}
        dir="ltr"
      >
        {value}
      </dd>
    </div>
  );
}
