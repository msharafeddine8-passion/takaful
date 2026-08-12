import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured, query, queryOne } from '@/lib/db';
import { COURSES } from '@/lib/courses';
import { archiveRequirementAction } from '@/lib/actions/journey';
import { RequirementForm } from '@/components/staff/RequirementForm';

export async function generateMetadata(props: PageProps<'/[lang]/staff/journey'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.staff.journeyBuilder.title,
    alternates: alternatesFor(lang, '/staff/journey'),
    robots: { index: false, follow: false },
  };
}

type StageRow = {
  id: string;
  number: number;
  title_ar: string;
  title_en: string;
};

type ReqRow = {
  id: string;
  stage_id: string;
  kind: string;
  label_ar: string;
  label_en: string;
  is_required: boolean;
  config: Record<string, string>;
};

export default async function JourneyBuilderPage(props: PageProps<'/[lang]/staff/journey'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.staff;
  const b = t.journeyBuilder;

  if (!isDbConfigured()) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.errors.dbUnavailable}
        </p>
      </Container></Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);
  if (!can(user, 'members.manage')) {
    return (
      <Section><Container className="max-w-2xl">
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{t.forbidden}</p>
      </Container></Section>
    );
  }

  const version = await queryOne<{ id: string; name: string }>(
    'SELECT id, name FROM journey_versions WHERE is_default LIMIT 1',
  );
  if (!version) notFound();

  const [stages, requirements, counts] = await Promise.all([
    query<StageRow>(
      'SELECT id, number, title_ar, title_en FROM journey_stages WHERE version_id = $1 ORDER BY number',
      [version.id],
    ),
    query<ReqRow>(
      `SELECT r.id, r.stage_id, r.kind, r.label_ar, r.label_en, r.is_required, r.config
         FROM active_stage_requirements r
         JOIN journey_stages s ON s.id = r.stage_id
        WHERE s.version_id = $1
        ORDER BY s.number, r.sort_order, r.id`,
      [version.id],
    ),
    // How many volunteers a change to each stage would actually touch. An
    // admin raising a threshold should see who it lands on before they save.
    query<{ number: number; n: string }>(
      `SELECT s.number, count(*) AS n
         FROM current_journey_assignment a
         JOIN journey_stages s ON s.version_id = a.version_id
        WHERE a.version_id = $1
          AND NOT EXISTS (
            SELECT 1 FROM stage_progress sp
             WHERE sp.user_id = a.user_id AND sp.stage = s.number
          )
        GROUP BY s.number`,
      [version.id],
    ),
  ]);

  const affected = new Map(counts.map((c) => [c.number, Number.parseInt(c.n, 10)]));
  const courses = COURSES.map((c) => ({ slug: c.slug, title: c.title[lang] }));

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {b.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{b.lede}</p>
        <p className="mt-3 text-[0.9rem] text-ink-3">
          {b.version}: <span className="font-bold">{version.name}</span>
        </p>
        <p className="mt-5 rounded-xl border border-line bg-surface-2 px-5 py-3.5 text-[0.93rem] text-ink-2">
          {b.hint}
        </p>

        <div className="mt-9 space-y-9">
          {stages.map((s) => {
            const reqs = requirements.filter((r) => r.stage_id === s.id);
            const n = affected.get(s.number) ?? 0;

            return (
              <section key={s.id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-[1.15rem] font-extrabold">
                    {b.stage} {s.number} — {lang === 'ar' ? s.title_ar : s.title_en}
                  </h2>
                  <span className="text-[0.85rem] text-ink-3">
                    {b.affects}: {n}
                  </span>
                </div>

                {reqs.length === 0 ? (
                  <p className="mt-4 text-[0.95rem] text-ink-3">{b.noRequirements}</p>
                ) : (
                  <ul className="mt-4 space-y-2.5">
                    {reqs.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
                      >
                        <span className="text-[0.95rem]">
                          <span className="font-bold">
                            {lang === 'ar' ? r.label_ar : r.label_en}
                          </span>
                          <span className="ms-2.5 font-mono text-[0.8rem] text-ink-3" dir="ltr">
                            {r.kind}
                            {r.config.minutes ? ` · ${Number(r.config.minutes) / 60}h` : ''}
                            {r.config.courseSlug ? ` · ${r.config.courseSlug}` : ''}
                            {r.config.passMark ? ` · ≥${r.config.passMark}%` : ''}
                          </span>
                          {!r.is_required && (
                            <span className="ms-2 text-[0.82rem] text-ink-3">
                              ({dict.account.journey.optional})
                            </span>
                          )}
                        </span>
                        <form action={archiveRequirementAction}>
                          <input type="hidden" name="lang" value={lang} />
                          <input type="hidden" name="requirementId" value={r.id} />
                          <button
                            type="submit"
                            className="text-[0.88rem] font-bold text-red-600 hover:underline dark:text-red-400"
                          >
                            {b.archive}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <details className="mt-5">
                  <summary className="cursor-pointer text-[0.93rem] font-bold text-brand-blue dark:text-brand-orange">
                    {b.addRequirement}
                  </summary>
                  <RequirementForm lang={lang} dict={dict} stageId={s.id} courses={courses} />
                </details>
              </section>
            );
          })}
        </div>

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {t.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
