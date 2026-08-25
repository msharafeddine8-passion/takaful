import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { practical } from '@/lib/dictionaries/practical';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { can } from '@/lib/authz';
import { isDbConfigured } from '@/lib/db';
import { countPhrase } from '@/lib/when';
import { COURSE_CONTENT } from '@/lib/course-content';
import { reviewQueue } from '@/lib/practical-submissions';
import { reviewPracticalAction } from '@/lib/actions/practical';

/**
 * The trainer's queue.
 *
 * What is on this page is a name, a course, a day and the work. Nothing else
 * about the person is fetched — see the note at the top of
 * lib/practical-submissions.ts — because a trainer deciding whether a risk
 * assessment holds up has no use for a date of birth, and the surest way to
 * keep a safeguarding field off a screen is for the query never to select it.
 *
 * The two buttons submit the same form with a different `decision`. One form
 * rather than two means the feedback a trainer typed belongs to whichever
 * button they press, instead of living in a box beside the wrong one.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/staff/practical'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: practical(lang).queueTitle,
    alternates: alternatesFor(lang, '/staff/practical'),
    robots: { index: false, follow: false },
  };
}

export default async function StaffPracticalPage(props: PageProps<'/[lang]/staff/practical'>) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = practical(lang);

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
   * The capability, on the server, before the queue is read. Rendering the
   * page and hiding the buttons would still have fetched other people's work
   * into the response — the refusal has to come before the query, not before
   * the JSX.
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

  /*
   * A trainer's own submissions are dropped from the list rather than shown
   * with the buttons disabled. The action refuses it and migration 041 refuses
   * it; hiding it here means a reviewer never sees a control that could only
   * fail. Same reasoning as the hours queue.
   */
  const reviewable = queue.filter((item) => item.learnerId !== user.id);
  const hiddenOwn = queue.length - reviewable.length;

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
          {countPhrase(reviewable.length, t.queueWaiting)}
        </p>

        {hiddenOwn > 0 && (
          <p className="mt-2 text-[0.88rem] text-ink-3">{t.ownWorkHidden}</p>
        )}

        {reviewable.length === 0 ? (
          <p className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
            {t.queueEmpty}
          </p>
        ) : (
          <div className="mt-8 space-y-5">
            {reviewable.map((item) => {
              const course = COURSE_CONTENT[item.courseSlug];
              return (
                <article key={item.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[1.05rem] font-extrabold">{item.fullName}</h2>
                    {/* Already 'YYYY-MM-DD' in Beirut, as text from the query.
                        A Date rebuilt here would show work sent just after
                        midnight as the previous day. */}
                    <p className="text-[0.85rem] text-ink-3" dir="ltr">
                      {item.submittedOn}
                    </p>
                  </div>

                  <p className="mt-1 text-[0.94rem] font-bold text-brand-blue dark:text-brand-orange">
                    {course?.title[lang] ?? item.courseSlug}
                  </p>
                  <p className="mt-0.5 text-[0.88rem] text-ink-3">
                    {course?.practical?.title[lang] ?? item.taskId} ·{' '}
                    {countPhrase(item.previousAttempts, t.previousAttempts)}
                  </p>

                  <h3 className="mt-4 text-[0.88rem] font-bold text-ink-3">{t.workHeading}</h3>
                  <p className="mt-1.5 whitespace-pre-line rounded-xl border border-line bg-surface-2 p-4 text-[0.95rem] leading-relaxed text-ink-2">
                    {item.body}
                  </p>

                  <form action={reviewPracticalAction} className="mt-4 border-t border-line pt-4">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="submissionId" value={item.id} />

                    <label
                      htmlFor={`feedback-${item.id}`}
                      className="mb-1.5 block text-[0.88rem] font-bold"
                    >
                      {t.feedbackLabel}
                    </label>
                    <p className="mb-2 text-[0.83rem] text-ink-3">{t.feedbackRequired}</p>
                    {/*
                     * Not marked `required`, because it is required for one of
                     * the two buttons and optional for the other. The action
                     * refuses a return with nothing written, so pressing the
                     * wrong one with an empty box changes nothing rather than
                     * sending somebody's work back in silence.
                     */}
                    <textarea
                      id={`feedback-${item.id}`}
                      name="feedback"
                      rows={3}
                      className="w-full rounded-xl border border-line bg-ground px-4 py-2.5 text-[0.95rem] leading-relaxed outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
                    />

                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        name="decision"
                        value="approved"
                        className="min-h-11 rounded-full bg-ok px-6 py-2.5 text-[0.92rem] font-extrabold text-white transition-opacity hover:opacity-90"
                      >
                        {t.approve}
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="changes_requested"
                        className="min-h-11 rounded-full border-2 border-brand-orange px-6 py-2.5 text-[0.92rem] font-extrabold transition-colors hover:bg-brand-orange/10"
                      >
                        {t.requestChanges}
                      </button>
                    </div>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
