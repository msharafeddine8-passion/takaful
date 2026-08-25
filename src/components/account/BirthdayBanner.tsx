import { birthdayHeadline, type MilestoneStrings } from '@/lib/dictionaries/milestones';

/**
 * «اليوم عيد ميلاد محمد 🎂» — one quiet line, on the day itself, and never
 * anything else.
 *
 * WHAT THIS COMPONENT CANNOT RENDER
 *
 * It takes names. Not dates, not ages, not a birth date it formats, not a
 * count of days until anybody's birthday — there is no prop here that could
 * carry one, which is the point of the shape rather than an accident of it.
 * Every rule about who may be named was applied before the names reached this
 * file, by publicBirthdayIdentity in src/lib/visibility.ts: a minor is never
 * here, somebody who did not switch greetings on is never here, and somebody
 * who chose not to appear publicly is never here.
 *
 * WHY IT IS SMALL
 *
 * A birthday is not an achievement. It earns nothing, moves nobody up a list,
 * and is worth one line under the hero rather than a card competing with the
 * thing the volunteer actually came to do. The association asked for a
 * greeting, not a celebration screen.
 *
 * Renders nothing at all when there is nobody to greet. An empty box saying
 * there are no birthdays today would put the subject of birthdays on the page
 * on all three hundred and sixty-four other days, which is both noise and,
 * quietly, a way of telling a reader that today is not somebody's.
 */
export function BirthdayBanner({ t, names }: { t: MilestoneStrings; names: string[] }) {
  const headline = birthdayHeadline(t, names);
  if (!headline) return null;

  return (
    <section
      aria-label={headline}
      className="mt-6 rounded-2xl border border-brand-orange/40 bg-brand-orange/10 px-5 py-4"
    >
      {/* Wraps rather than truncates. Several names on a 320px screen become
          three lines, which is fine; an ellipsis through somebody's name on
          the one day the page is about them is not. */}
      <p className="text-[1rem] font-extrabold leading-snug text-ink">{headline}</p>
      <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-2">{t.birthday.wish}</p>
    </section>
  );
}
