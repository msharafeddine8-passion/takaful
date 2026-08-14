import type { Locale } from '@/lib/i18n';
import type { LmsStrings } from '@/lib/dictionaries/lms';
import { bandLabel, type SkillStanding } from '@/lib/programme/skills';
import { ProgressBar } from '@/components/academy/parts';

/**
 * What the learner has built, by area.
 *
 * A list of labelled bars, deliberately not a radar chart. A radar needs fixed
 * axis positions, which mirror wrongly under dir="rtl"; it is illegible at
 * 375px, which is where most of these volunteers read; and it has no
 * meaningful reading order for a screen reader — the same seven numbers in a
 * shape nobody can tab through. A bar list carries exactly the same
 * information with none of that.
 *
 * The bar is the existing ProgressBar from academy/parts.tsx. Three places in
 * this repo already hand-rolled that markup and two of them lost the
 * aria-label doing it.
 */
export function SkillMap({
  skills,
  lang,
  t,
}: {
  skills: SkillStanding[];
  lang: Locale;
  t: LmsStrings;
}) {
  return (
    <section aria-labelledby="skill-map-title">
      <h2 id="skill-map-title" className="text-[1.3rem] font-extrabold">
        {t.skillsTitle}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[0.98rem] leading-relaxed text-ink-2">{t.skillsLede}</p>

      {skills.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">
          {t.notStartedYet}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {skills.map((skill) => (
            <li key={skill.key} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-[1rem] font-extrabold">{skill.label[lang]}</h3>
                {/* The band is a word, never a colour on its own. */}
                <span className="text-[0.85rem] font-extrabold text-ink-2">
                  {bandLabel(skill.band, t)}
                </span>
              </div>

              <div className="mt-3">
                <ProgressBar
                  percent={skill.percent}
                  label={skill.label[lang]}
                  tone={skill.band === 'strong' ? 'ok' : 'orange'}
                />
              </div>

              {/* A bare ratio, so it reads left-to-right in both locales. */}
              <p className="mt-2 text-[0.85rem] font-bold text-ink-3">
                {t.skillValue
                  .replace('{done}', String(skill.passed))
                  .replace('{total}', String(skill.total))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
