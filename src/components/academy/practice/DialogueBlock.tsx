'use client';

import { useState } from 'react';
import { nextTurn } from '@/lib/practice';
import { practiceBlockStrings } from '@/lib/dictionaries/practice-blocks';
import type { Locale } from '@/lib/i18n';

/**
 * A conversation, turn by turn.
 *
 * The transcript stays on the page as it grows, and that is the point. A
 * scenario that replaces one situation with the next teaches a series of
 * separate decisions; a volunteer who has just closed a child down needs to
 * see the sentence that did it still sitting above the silence it caused.
 *
 * A reply that ends the conversation ends it here too. Letting the reader
 * carry on regardless would be the comfortable choice and would teach the
 * opposite of the thing — that a promise of secrecy or a leading question
 * costs nothing, when in the room it costs everything that came after.
 *
 * ── DIRECTION ──────────────────────────────────────────────────────────────
 *
 * Whose line is whose is carried by the inline edge — the other person at the
 * start, the reader at the end — with `me-auto` and `ms-auto` rather than
 * `mr-auto` and `ml-auto`, so the transcript mirrors when the page does. There
 * are no arrows anywhere in this component: an arrow meaning "next" points
 * left in Arabic and right in English, and a component handed one as a
 * character cannot flip it. Each line is also named in text, because an edge
 * is not something a screen reader announces.
 *
 * Nothing is recorded and nothing is marked.
 */

export function DialogueBlock({
  lang, title, speaker, opening, turns, afterword,
}: {
  lang: Locale;
  title: string;
  speaker: string;
  opening: string;
  turns: {
    replies: { text: string; says: string; note: string; ends?: boolean; best?: boolean }[];
  }[];
  afterword: string;
}) {
  const t = practiceBlockStrings[lang].dialogue;
  /** One reply index per turn already taken, in order. */
  const [taken, setTaken] = useState<number[]>([]);

  const last = taken.length ? turns[taken.length - 1].replies[taken[taken.length - 1]] : null;
  const after = last === null ? 0 : nextTurn(taken.length - 1, turns.length, last.ends === true);
  const over = after === null;
  const closedEarly = over && last?.ends === true;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-brand-orange/40">
      <div className="bg-brand-orange/[0.12] px-5 py-3">
        <p className="text-[0.78rem] font-extrabold text-ink-3">{t.kicker}</p>
        {/* h3: these sit under the module's h1 alongside the block headings,
            which are h2. */}
        <h3 className="mt-1 text-[1.05rem] font-extrabold">{title}</h3>
      </div>

      <div className="bg-surface p-5">
        <div className="flex flex-col gap-3">
          <Line who={speaker} said={opening} mine={false} />

          {taken.map((choice, turn) => {
            const reply = turns[turn].replies[choice];
            return (
              <div key={turn} className="flex flex-col gap-3">
                <Line who={t.you} said={reply.text} mine />
                <Line who={speaker} said={reply.says} mine={false} />
                <p className="border-s-[3px] border-line ps-3 text-[0.9rem] leading-relaxed text-ink-2">
                  {reply.best && (
                    <span className="font-extrabold text-ok-text">
                      <span aria-hidden>✓ </span>
                      {t.best}.{' '}
                    </span>
                  )}
                  {reply.note}
                </p>
              </div>
            );
          })}
        </div>

        {!over && (
          <div className="mt-5">
            <p className="text-[0.78rem] font-extrabold text-ink-3">
              {t.yourReply} · {t.turn.replace('{n}', String(taken.length + 1)).replace('{total}', String(turns.length))}
            </p>
            <ul className="mt-2 space-y-2">
              {turns[taken.length].replies.map((reply, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setTaken((prev) => [...prev, i])}
                    className="w-full rounded-xl border-2 border-line p-4 text-start text-[0.95rem] leading-snug hover:bg-surface-2"
                  >
                    {reply.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* role="status" so the end of the conversation is announced. Without
            it a screen reader user presses a reply and, once the choices
            disappear, has nothing telling them why. */}
        {over && (
          <div role="status" className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
            <p
              className={`text-[0.92rem] font-extrabold ${closedEarly ? 'text-danger-text' : 'text-ok-text'}`}
            >
              {closedEarly ? t.closed : t.reached}
            </p>
            <p className="mt-3 text-[0.78rem] font-extrabold text-ink-3">{t.afterwordHeading}</p>
            <p className="mt-1 text-[0.94rem] leading-relaxed text-ink-2">{afterword}</p>
            <button
              type="button"
              onClick={() => setTaken([])}
              className="mt-3 inline-flex min-h-11 items-center px-2 text-[0.9rem] font-bold text-ink-3 hover:underline"
            >
              {t.restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** One line of the transcript, named in text as well as placed on an edge. */
function Line({ who, said, mine }: { who: string; said: string; mine: boolean }) {
  return (
    <div
      className={`max-w-[46ch] rounded-xl border p-3 ${
        mine ? 'ms-auto border-brand-blue/40 bg-brand-blue/[0.06]' : 'me-auto border-line bg-surface-2'
      }`}
    >
      <p className="text-[0.74rem] font-extrabold text-ink-3">{who}</p>
      <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{said}</p>
    </div>
  );
}
