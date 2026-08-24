import type { Locale } from '@/lib/i18n';
import type { ChallengeMetric, ChallengeView } from '@/lib/challenges';
import {
  challengePlural,
  unitFormsFor,
  type ChallengeStrings,
} from '@/lib/dictionaries/challenges';

/**
 * A shared goal, as a volunteer sees it.
 *
 * WHAT IS ON THIS CARD AND WHAT IS NOT
 *
 * The community total, the target, the bar, the days left — all identical for
 * everybody looking at it. Then one line, «مساهمتك», which exists only when
 * the person reading has something in it.
 *
 * There is no other person on this card. No name, no count of contributors,
 * no "you are behind", and — the one that took deciding — no line at all for
 * somebody who has given nothing this month. A volunteer who was ill, or
 * working, or caring for a parent opens their account and finds a goal the
 * association is working towards, not a nought with their name on it. That is
 * enforced upstream by ownContribution(), which answers null rather than 0;
 * this component simply has no branch to render.
 *
 * The props are declared structurally rather than imported from
 * challenge-progress.ts, which is `server-only`. Keeping the display free of
 * that import is what lets the panel be rendered from anywhere.
 */

export type ChallengePanelCard = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  metric: ChallengeMetric;
  view: ChallengeView;
};

export function ChallengePanel({
  lang, t, cards,
}: {
  lang: Locale;
  t: ChallengeStrings;
  cards: readonly ChallengePanelCard[];
}) {
  /* No empty state. A page with no challenge running says nothing about
   * challenges — an empty box explaining that there is nothing to work towards
   * is a box that makes the account look unfinished. */
  if (cards.length === 0) return null;

  return (
    <section
      aria-labelledby="challenges-heading"
      className="mt-5 rounded-2xl border border-line bg-surface p-6"
    >
      <h2 id="challenges-heading" className="text-[0.82rem] font-bold tracking-[0.12em] text-ink-3">
        {t.panelTitle}
      </h2>
      <p className="mt-1.5 max-w-[58ch] text-[0.88rem] leading-relaxed text-ink-3">{t.panelLede}</p>

      <ul className="mt-4 space-y-6">
        {cards.map((card) => (
          <li key={card.id}>
            <ChallengeCardBody lang={lang} t={t} card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChallengeCardBody({
  lang, t, card,
}: { lang: Locale; t: ChallengeStrings; card: ChallengePanelCard }) {
  const v = card.view;
  const name = lang === 'ar' ? card.name_ar : card.name_en;
  const description = lang === 'ar' ? card.description_ar : card.description_en;
  const forms = unitFormsFor(t, card.metric);

  const doneLabel = challengePlural(forms, v.totalDisplay, lang);
  const targetLabel = challengePlural(forms, v.targetDisplay, lang);

  return (
    <div>
      <p className="text-[1.05rem] font-extrabold leading-snug">{name}</p>
      {description && (
        <p className="mt-1.5 max-w-[58ch] text-[0.9rem] leading-relaxed text-ink-2">{description}</p>
      )}

      {v.status === 'upcoming' ? (
        <p className="mt-3 text-[0.92rem] text-ink-2">{t.notStarted}</p>
      ) : (
        <>
          {/* The figure first and the bar under it: the sentence is what a
              volunteer reads out, and the bar is how far along it looks. */}
          <p className="mt-3 text-[0.92rem] text-ink-2">
            {t.communityDone}{' '}
            <span className="text-[1.15rem] font-extrabold text-ink">{doneLabel}</span>{' '}
            {t.ofTarget.replace('{target}', targetLabel)}
          </p>

          {/*
            * A native meter would fight the theme, so this is two divs — but it
            * still has to say what it is to a screen reader, hence the explicit
            * progressbar role and the text alternative. The width comes from
            * percentComplete(), which is clamped to 100 and can never be NaN:
            * a NaN in this style attribute renders a bar of no width, silently.
            */}
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={v.percent}
            aria-valuetext={`${v.percent}%`}
            aria-label={name}
            className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className={`h-full rounded-full ${v.complete ? 'bg-ok' : 'bg-brand-orange'}`}
              style={{ width: `${v.percent}%` }}
            />
          </div>

          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.85rem] text-ink-3">
            <span dir="ltr">{v.percent}%</span>
            {v.status === 'running' && (
              <span>{v.daysLeft === 1 ? t.lastDay : challengePlural(t.daysLeft, v.daysLeft, lang)}</span>
            )}
          </p>

          {/* --ok-text is redefined for dark mode in globals.css, so this needs
              no dark: variant — and --color-ok proper is a chip background,
              never small text. */}
          {v.complete && (
            <p className="mt-2 text-[0.92rem] font-bold text-ok-text">{t.reached}</p>
          )}
        </>
      )}

      {/*
        * Only ever rendered for somebody who has something in it. `null` is the
        * answer for everybody else, and there is deliberately no else branch:
        * "you contributed 0" is a sentence this platform must not form.
        */}
      {v.yourContribution !== null && (
        <p className="mt-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.9rem]">
          <span className="font-bold">{t.yourPart}: </span>
          {challengePlural(forms, v.yourContribution, lang)}
          <span className="mt-1 block text-[0.8rem] text-ink-3">{t.yourPartNote}</span>
        </p>
      )}
    </div>
  );
}
