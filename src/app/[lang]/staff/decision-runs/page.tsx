import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { challengeLevels } from '@/lib/dictionaries/challenge-levels';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { reviewQueue } from '@/lib/level-challenge-runs';

/**
 * Decision runs that ended in `review`, for a person to read.
 *
 * ── WHAT THIS PAGE IS FOR ──────────────────────────────────────────────────
 *
 * Finishing a decision run closes a level, whatever the run said. That is
 * correct and this page does not touch it: `review` locks no door here, there
 * is no button on this screen, nothing is approved or refused, and a run that
 * is never opened from this list stays exactly as valid as one that is.
 *
 * What the reversal left open was that somebody could cross a safeguarding
 * line, close the level, and have no human being ever hear about it. This is
 * the answer to that, and it is deliberately the mildest one available: a list
 * that a coordinator reads.
 *
 * ── WHAT IS AND IS NOT ON IT ───────────────────────────────────────────────
 *
 * A name, a level, the day the run finished, and a link to read it. Nothing
 * else about the person is fetched — same rule and same reason as the trainer's
 * queue in /staff/practical, whose structure this page follows.
 *
 * Nothing is counted against a name and no two volunteers are ordered against
 * each other. The list arrives sorted by time and is rendered in the order it
 * arrives; there is no sort, no tally and no badge here. See the invariant
 * comment on reviewQueue() in lib/level-challenge-runs.ts.
 *
 * ── THE CAPABILITY ─────────────────────────────────────────────────────────
 *
 * `practical.review` — the capability for reading a learner's work and forming
 * a judgement about it. Its grant list is hours.verify's people plus
 * `instructor`, which is exactly the set of people a volunteer would actually
 * sit down with: the supervisor, the coordinator, or the trainer who taught the
 * course the decision came out of. No new capability was invented for this and
 * authz.ts is unchanged — isStaff() already lets these people through the door.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/decision-runs'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: challengeLevels(lang).staff.queueTitle,
    alternates: alternatesFor(lang, '/staff/decision-runs'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffDecisionRunsPage(
  props: PageProps<'/[lang]/staff/decision-runs'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = challengeLevels(lang).staff;

  if (!isDbConfigured()) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {dict.account.errors.dbUnavailable}
          </p>
        </Container>
      </Section>
    );
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  /*
   * The capability, on the server, before the queue is read. Rendering the page
   * and hiding the rows would still have fetched other people's rehearsals into
   * the response — the refusal has to come before the query, not before the JSX.
   */
  if (!can(user, 'practical.review')) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <p className="rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.forbidden}
          </p>
        </Container>
      </Section>
    );
  }

  const queue = await reviewQueue();

  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{dict.account.staff.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.queueTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.queueLede}</p>

        <p className="mt-5 text-[0.95rem] font-extrabold text-ink-2">
          {/* Counted noun, five bands in Arabic — countPhrase in lib/when.ts. */}
          {countPhrase(queue.length, t.queueWaiting)}
        </p>
        <p className="mt-2 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">
          {t.queueOrderNote}
        </p>

        {queue.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.queueEmpty}
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {/* Rendered in the order the query returned, which is by time. No
                sort here and nowhere to add one — see the header. */}
            {queue.map((item) => (
              <li key={item.id}>
                <Link
                  href={
                    `/${lang}/staff/decision-runs/${item.id}` as Parameters<
                      typeof Link
                    >[0]['href']
                  }
                  className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-orange hover:bg-brand-orange/[0.06]"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[1.05rem] font-extrabold">{item.fullName}</h2>
                    {/* Already 'YYYY-MM-DD' in Beirut, as text from the query. A
                        Date rebuilt here would show a run finished just after
                        midnight as the previous day. */}
                    <p className="text-[0.85rem] text-ink-3" dir="ltr">
                      {t.finishedOn} {item.finishedOn}
                    </p>
                  </div>
                  <p className="mt-1 text-[0.94rem] font-bold text-brand-blue dark:text-brand-orange">
                    {t.levelLabel.replace('{level}', String(item.level))}
                  </p>
                  <p className="mt-2 text-[0.88rem] font-extrabold text-brand-blue dark:text-brand-orange">
                    {t.readCta} →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
