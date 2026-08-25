import { redirect, notFound } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { COURSE_CONTENT } from '@/lib/course-content';
import { courseBySlug } from '@/lib/courses';
import { isDbConfigured } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { completedModules, questionsIn } from '@/lib/academy';
import { unitsOf, resumeUnitId } from '@/lib/programme/player';
import { practicalTaskFor } from '@/lib/programme/practical';

/**
 * "Open the course" — without saying which part.
 *
 * Every link that means the course rather than a particular module points
 * here: the catalogue card, the dashboard, the overview page's main button.
 * This works out where the reader stopped and sends them there, so the
 * resume point is decided in one place instead of at each of those call
 * sites, and none of them has to know what the reader has already read.
 *
 * A redirect rather than rendering the unit directly, because the address bar
 * has to end up on the unit. Otherwise the back button, a bookmark and a
 * shared link all point at "wherever I happen to be next time", which is not
 * what any of the three mean.
 */
export default async function LearnEntry(props: PageProps<'/[lang]/academy/[slug]/learn'>) {
  await connection();
  const { lang, slug } = await props.params;
  if (!isLocale(lang)) notFound();
  const course = COURSE_CONTENT[slug];
  if (!course || !courseBySlug(slug)) notFound();

  /*
   * No account, no record of where they stopped — the first unit is the only
   * honest answer. The unit page runs the access gate itself, so this does
   * not need to; deciding it in both places is how the two come to disagree.
   */
  const user = isDbConfigured() ? await currentUser() : null;
  const read = user ? await completedModules(user.id, slug) : [];

  const units = unitsOf({
    moduleIds: course.modules.map((m) => m.id),
    hasQuestions: questionsIn(slug).length > 0,
    hasPractical: practicalTaskFor(slug) !== null,
  });
  const target = resumeUnitId(units, read);

  /* A course with no modules and no questions has nowhere to go. It should
   * not exist, and probe-player asserts none does — but a redirect to
   * undefined would be a broken URL rather than a visible failure. */
  if (!target) redirect(`/${lang}/academy/${slug}`);
  redirect(`/${lang}/academy/${slug}/learn/${target}`);
}
