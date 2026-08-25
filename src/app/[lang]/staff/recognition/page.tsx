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
import { isDbConfigured } from '@/lib/db';
import { badgeStandings, unexplainedCodes, recentChanges } from '@/lib/recognition-overview';
import { formatDate } from '@/lib/when';
import { VOLUNTEER_STANDING } from '@/lib/account-state';
import { recognitionAdmin } from '@/lib/dictionaries/recognition-admin';
import {
  RecomputeOne, RecomputeAll, PreviewAll, GrantBadge, WithdrawBadge,
} from '@/components/staff/RecognitionForms';

/**
 * Running the recognition system.
 *
 * The page shows the catalogue and nothing about individuals. There is no
 * ranked list of volunteers here, no "who has the fewest badges", no per-person
 * total — not because it would be hard, but because a page that a coordinator
 * opens to fix one record should not also be a page that tells them who is
 * behind. The counts are per badge: how many hold it, how many lost it, how
 * many were given it by hand. Those answer questions about the system. A column
 * of names would answer a question about people, and nobody asked it.
 *
 * The 'held by' figures are the honest test of whether a threshold is set
 * sensibly. A badge nobody holds is either too high or describes something the
 * association does not actually do; a badge everybody holds means nothing.
 * Reading the table is how somebody decides to change one — which is a code
 * change, reviewed, not a number typed into a box on this page. Thresholds are
 * the definition of what the association honours, and a definition that can be
 * edited from a form is one that quietly changes and takes everyone's badges
 * with it.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/recognition'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: recognitionAdmin(lang).title,
    alternates: alternatesFor(lang, '/staff/recognition'),
    robots: { index: false, follow: false },
  };
}

const KIND_LABELS: Record<string, Record<'ar' | 'en', string>> = {
  hours: { ar: 'الساعات', en: 'Hours' },
  courses: { ar: 'الدورات', en: 'Courses' },
  activities: { ar: 'الأنشطة', en: 'Activities' },
  stages: { ar: 'المراحل', en: 'Stages' },
  levels: { ar: 'المستويات', en: 'Levels' },
  certificates: { ar: 'الشهادات', en: 'Certificates' },
  membership: { ar: 'سنوات الانتساب', en: 'Years of membership' },
  accepted: { ar: 'القبول كمتطوّع', en: 'Accepted as a volunteer' },
  continuity: { ar: 'الاستمرارية', en: 'Continuity' },
  balanced: { ar: 'التوازن', en: 'Balance' },
  reliability: { ar: 'الالتزام', en: 'Reliability' },
};

export default async function StaffRecognitionPage(
  props: PageProps<'/[lang]/staff/recognition'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = recognitionAdmin(lang);

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
        <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {dict.account.staff.forbidden}
        </p>
      </Container></Section>
    );
  }

  const [standings, orphans, changes] = await Promise.all([
    badgeStandings(), unexplainedCodes(), recentChanges(),
  ]);

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <section className="mt-9 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.05rem] font-extrabold">{t.recomputeTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
            {t.recomputeLede}
          </p>
          <RecomputeOne lang={lang} t={t} />
          <div className="mt-6 border-t border-line pt-5">
            <p className="max-w-[62ch] text-[0.9rem] leading-relaxed text-ink-2">
              {t.previewHint}
            </p>
            <PreviewAll lang={lang} t={t} />
            <div className="mt-6 border-t border-line pt-5">
              <RecomputeAll lang={lang} t={t} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.05rem] font-extrabold">{t.grantTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
            {t.grantLede}
          </p>
          <GrantBadge lang={lang} t={t} />
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[1.05rem] font-extrabold">{t.withdrawTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
            {t.withdrawLede}
          </p>
          <WithdrawBadge lang={lang} t={t} />
        </section>

        <section className="mt-9">
          <h2 className="text-[1.05rem] font-extrabold">{t.catalogueTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
            {t.catalogueLede}
          </p>

          {/* Thirty-seven rows of five columns will not fit a phone. Scrolling
              the table inside its own box keeps the page itself from scrolling
              sideways, which in RTL is how a layout starts hiding its first
              column instead of its last. */}
          <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[34rem] border-collapse text-[0.9rem]">
              <thead>
                <tr className="border-b border-line text-start text-[0.78rem] font-extrabold tracking-[0.08em] text-ink-3">
                  <th scope="col" className="px-4 py-3 text-start">{t.colCode}</th>
                  <th scope="col" className="px-4 py-3 text-start">{t.colKind}</th>
                  <th scope="col" className="px-4 py-3 text-start">{t.colThreshold}</th>
                  <th scope="col" className="px-4 py-3 text-start">{t.colHolders}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => (
                  <tr key={s.def.code} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <span aria-hidden="true">{s.def.icon}</span>{' '}
                      <span className="font-bold">{s.def.title[lang]}</span>
                      <span className="block text-[0.78rem] text-ink-3" dir="ltr">{s.def.code}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {KIND_LABELS[s.def.kind]?.[lang] ?? s.def.kind}
                    </td>
                    {/* Minutes in the table, hours to a person. A threshold of
                        3000 is fifty hours and reads as neither. */}
                    <td className="px-4 py-3 text-ink-2" dir="ltr">
                      {s.def.kind === 'hours'
                        ? `${Math.round(s.def.threshold / 60)} h`
                        : s.def.threshold}
                    </td>
                    <td className="px-4 py-3 font-extrabold" dir="ltr">
                      {s.held}
                      {(s.withdrawn > 0 || s.byHand > 0) && (
                        <span className="ms-2 text-[0.78rem] font-normal text-ink-3">
                          {s.byHand > 0 && `✋ ${s.byHand}`}
                          {s.byHand > 0 && s.withdrawn > 0 && ' · '}
                          {s.withdrawn > 0 && `↩ ${s.withdrawn}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            * Shown only when there is something to show.
            *
            * An empty "no orphans" panel is a permanent piece of furniture that
            * everybody learns to ignore, and then the day it fills up nobody
            * looks. It appears when it matters or not at all.
            */}
          {orphans.length > 0 && (
            <div className="mt-5 rounded-2xl border-2 border-warn bg-warn/10 p-5">
              <p className="text-[0.92rem] font-extrabold text-warn-text">
                {lang === 'ar'
                  ? 'شارات محفوظة لا يعرفها النظام'
                  : 'Badges held that the system cannot describe'}
              </p>
              <p className="mt-1.5 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-2">
                {lang === 'ar'
                  ? 'إمّا شارات مُنحت بقرار برمز من خارج القائمة — وهذا صحيح — أو رمز حُذف أو أُعيدت تسميته في الكود، '
                    + 'وعندها يحمل متطوّعون شارة بلا اسم ولا وصف على صفحتهم.'
                  : 'Either badges granted by decision under a code of their own — which is correct — or a code '
                    + 'renamed or removed in the source, in which case volunteers are holding a badge with no '
                    + 'title and no description on their page.'}
              </p>
              <ul className="mt-3 space-y-1 text-[0.88rem]" dir="ltr">
                {orphans.map((o) => (
                  <li key={o.code}>
                    <span className="font-bold">{o.code}</span> — {o.held}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-[1.05rem] font-extrabold">{t.standingTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">
            {t.standingLede}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {VOLUNTEER_STANDING.map((s) => (
              <li
                key={s}
                className="rounded-full border border-line bg-surface-2 px-4 py-1.5 text-[0.85rem] font-bold"
                dir="ltr"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-[1.05rem] font-extrabold">{t.logTitle}</h2>
          <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-ink-2">{t.logLede}</p>
          {changes.length === 0 ? (
            <p className="mt-4 text-ink-2">{t.logEmpty}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {changes.map((c, i) => (
                /*
                 * Keyed by index, and that is correct here rather than lazy:
                 * this list is read-only, never reordered and never filtered in
                 * place, and audit_logs.id is not selected because the page has
                 * no use for it. Two entries can share a timestamp, an actor and
                 * an action — a recompute over two people in the same second —
                 * so a composed key would not be unique either.
                 */
                <li key={i} className="rounded-xl border border-line bg-surface px-5 py-3.5">
                  <p className="text-[0.78rem] font-extrabold tracking-[0.1em] text-ink-3">
                    {t.actions[c.action] ?? c.action}
                    {' · '}
                    {formatDate(c.at, lang)}
                  </p>
                  <p className="mt-1 text-[0.92rem]">
                    <span className="font-extrabold">{c.actor ?? t.someone}</span>
                    {c.subject ? ` → ${c.subject}` : ''}
                    {c.code ? <span dir="ltr"> · {c.code}</span> : null}
                  </p>
                  {c.reason && (
                    <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-2">{c.reason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          href={`/${lang}/staff`}
          className="mt-9 inline-block font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          ← {dict.account.staff.dashboard.title}
        </Link>
      </Container>
    </Section>
  );
}
