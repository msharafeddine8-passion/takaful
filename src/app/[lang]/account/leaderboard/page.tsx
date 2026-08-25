import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale, type Locale } from '@/lib/i18n';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { formatNumber, formatPercent } from '@/lib/format';
import { beirutToday, countPhrase } from '@/lib/when';
import {
  WINDOW_KINDS, buildBoards, parseWindow, windowFor,
  type Board, type BoardEntry, type BoardKind, type WindowKind,
} from '@/lib/leaderboard';
import { leaderboardRows } from '@/lib/leaderboard-data';
import {
  leaderboardStrings, type CountForms, type LeaderboardStrings,
} from '@/lib/dictionaries/leaderboard';

/**
 * لوحات الأثر — five rankings, and a promise to everybody who is not on them.
 *
 * SIGNED IN ONLY, and noindex. Unlike «صنّاع الاستمرارية» this page compares
 * people, and a comparison belongs inside the association rather than on the
 * open web. Consent to «صفحات التقدير» is honoured here as it is there — only
 * people whose choice allows listing appear — but the smaller audience is a
 * second layer under that one, not a substitute for it.
 *
 * NOTHING ON THIS PAGE DECIDES VISIBILITY. `buildBoards` in lib/leaderboard.ts
 * asks lib/visibility.ts once per person and returns entries that already
 * carry the name that may be printed. There is no row here with a name in it
 * that was not permitted, and no branch that could publish one.
 *
 * WHAT THE PAGE CANNOT SAY, because the data it is given has no field for it:
 * how many people are on a board, who is last, anybody's absences, anybody's
 * rejected or pending hours, any admin note, and any comparison with a
 * previous period. See the header of lib/leaderboard.ts.
 *
 * WHAT IT ALWAYS SAYS: the reader's own position, on every board, whether or
 * not they chose to be listed and whether or not they are in the ten. That is
 * `seesOwnStanding` in visibility.ts written out — opting out of being ranked
 * in front of others is not opting out of knowing where you stand.
 *
 * No JavaScript. The period is a query string on a GET form, so a shared link
 * shows what the sender was looking at and the page works on a phone with the
 * network half gone.
 */

export async function generateMetadata(
  props: PageProps<'/[lang]/account/leaderboard'>,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const t = leaderboardStrings(lang);
  return {
    title: t.title,
    alternates: alternatesFor(lang, '/account/leaderboard'),
    // Every other account page is noindex and so is this one. A ranking of
    // named volunteers is the last thing that should be cached by a search
    // engine or copied into a link preview.
    robots: { index: false, follow: false },
  };
}

export default async function LeaderboardPage(
  props: PageProps<'/[lang]/account/leaderboard'>,
) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const t = leaderboardStrings(lang);

  if (!isDbConfigured()) {
    return <Frame lang={lang} t={t} window="month"><Notice text={t.unavailable} /></Frame>;
  }

  const user = await currentUser();
  if (!user) redirect(`/${lang}/login`);

  const params = await props.searchParams;
  const kind: WindowKind = parseWindow(params.w);

  /*
   * One clock reading for the whole page, from Beirut.
   *
   * Two separate things hang off it and both are wrong if the server's own
   * date is used: which week or month a figure falls in, and whether somebody
   * is still seventeen. The server runs in GMT, where between midnight and two
   * in the morning it is still yesterday — so a page loaded at half past
   * midnight on the first of the month would show last month and call it this
   * one. Read once so a request that straddles midnight cannot judge two
   * people by two different calendars.
   */
  const today = beirutToday();
  const rows = await leaderboardRows(windowFor(kind, today));
  const boards = buildBoards({ rows, viewerId: user.id, today });

  return (
    <Frame lang={lang} t={t} window={kind}>
      <div className="mt-8 space-y-10">
        {boards.map((board) => (
          <BoardSection key={board.board} board={board} kind={kind} lang={lang} t={t} />
        ))}
      </div>

      <div className="mt-12 space-y-3 border-t border-line pt-6 text-[0.88rem] leading-relaxed text-ink-3">
        <p className="max-w-[62ch]">{t.ties}</p>
        <p className="max-w-[62ch]">{t.privacyNote}</p>
        <p className="max-w-[62ch]">
          {t.visibilityHint}{' '}
          <Link
            href={`/${lang}/account/profile` as Parameters<typeof Link>[0]['href']}
            className="font-extrabold text-brand-blue underline underline-offset-4 dark:text-brand-orange"
          >
            {t.visibilityLink}
          </Link>
          .
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ pieces */

/** The heading, the lede and the period control, in every state the page has. */
function Frame({
  lang, t, window, children,
}: {
  lang: Locale;
  t: LeaderboardStrings;
  window: WindowKind;
  children: ReactNode;
}) {
  return (
    <Section>
      <Container className="max-w-4xl">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.6rem,1.25rem+1.5vw,2.2rem)] font-extrabold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">{t.lede}</p>

        <form
          method="get"
          className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface-2 p-4"
        >
          <div className="min-w-[11rem] flex-1">
            <label htmlFor="w" className="block text-[0.84rem] font-extrabold text-ink-3">
              {t.windowLabel}
            </label>
            <select
              id="w"
              name="w"
              defaultValue={window}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-[0.95rem] outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25"
            >
              {WINDOW_KINDS.map((option) => (
                <option key={option} value={option}>{t.windows[option]}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-blue px-6 text-[0.92rem] font-extrabold text-white transition-colors hover:bg-brand-blue-dark"
          >
            {t.apply}
          </button>
        </form>

        {children}
      </Container>
    </Section>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <p className="mt-6 rounded-xl border border-line bg-surface-2 px-5 py-4 text-ink-2">{text}</p>
  );
}

/**
 * One board.
 *
 * An `<ol>` and not a `<ul>`, which is the opposite of the choice «صنّاع
 * الاستمرارية» makes and for the same reason: that page is a thank-you whose
 * order means nothing, and this page IS a ranking. Marking it as one is what
 * lets a screen reader announce it correctly.
 *
 * The list numbering is switched off and the rank is printed from `entry.rank`
 * instead. An ordered list numbers its rows 1, 2, 3 whatever they contain, and
 * ties do not: two people on rank two must both read "2", and the row after
 * them must read "4". Letting the browser count would silently break every tie
 * on the page.
 */
function BoardSection({
  board, kind, lang, t,
}: {
  board: Board;
  kind: WindowKind;
  lang: Locale;
  t: LeaderboardStrings;
}) {
  const b = t.boards[board.board];
  return (
    <section aria-labelledby={`board-${board.board}`}>
      <h2 id={`board-${board.board}`} className="text-[1.15rem] font-extrabold">
        {b.title}
      </h2>
      {/* Said before the list, not under it. A reader who meets the ranking
          first has already decided what it means by the time a note arrives. */}
      <p className="mt-2 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">{b.note}</p>

      {board.entries.length === 0 ? (
        <Notice text={t.boardEmpty} />
      ) : (
        <ol className="mt-4 list-none space-y-2">
          {/* No index in this callback and none available to one: the rank is
              a value the ranking assigned, never a position in an array. */}
          {board.entries.map((entry) => (
            <li key={entry.id}>
              <Row entry={entry} board={board.board} lang={lang} t={t} />
            </li>
          ))}
        </ol>
      )}

      <YourStanding board={board} kind={kind} lang={lang} t={t} />
    </section>
  );
}

/**
 * The figure, in this board's own unit.
 *
 * The reliability board holds a rounded percentage and must be printed as one:
 * a bare «٩٠» beside a name reads as ninety of something, and the something a
 * reader would guess is activities.
 */
function figureText(board: BoardKind, value: number, lang: Locale): string {
  return board === 'reliable' ? formatPercent(value, lang) : formatNumber(value, lang);
}

function Row({
  entry, board, lang, t,
}: {
  entry: BoardEntry;
  board: BoardKind;
  lang: Locale;
  t: LeaderboardStrings;
}) {
  const b = t.boards[board];
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 sm:gap-3.5 sm:p-3.5 ${
        entry.isViewer
          ? 'border-brand-orange/60 bg-brand-orange/[0.07]'
          : 'border-line bg-surface'
      }`}
    >
      {/* dir="ltr" on the numeral alone. A rank is a number and not prose, and
          in an RTL row a bare digit next to a name can otherwise reorder. */}
      <span
        dir="ltr"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[0.95rem] font-black tabular-nums text-ink-2"
      >
        <span className="sr-only">{t.rankLabel}</span>
        {formatNumber(entry.rank, lang)}
      </span>

      <Portrait entry={entry} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.98rem] font-extrabold leading-snug">
          {entry.name}
          {entry.isViewer && (
            <span className="ms-2 rounded-full bg-brand-orange/20 px-2 py-0.5 align-middle text-[0.72rem] font-extrabold text-brand-orange-text dark:text-brand-orange">
              {t.youLabel}
            </span>
          )}
        </p>
        {/* Ties are said in a word on every row that shares a rank, rather than
            left for the reader to notice two identical numbers. Two rows have
            to be printed one above the other; saying they are equal is what
            stops the stacking from being read as an order. */}
        {entry.tied && (
          <p className="mt-0.5 text-[0.78rem] font-bold text-ink-3">{t.equalLabel}</p>
        )}
      </div>

      <div className="shrink-0 text-end">
        <p className="text-[1.05rem] font-black leading-none text-brand-blue dark:text-sky-300">
          {figureText(board, entry.figure, lang)}
        </p>
        <p className="mt-1 text-[0.74rem] font-bold text-ink-3">{b.figureLabel}</p>
        {entry.secondary !== null && (
          <p className="mt-1 text-[0.74rem] text-ink-3">
            {b.secondaryLabel}: {formatNumber(entry.secondary, lang)}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * A photograph, or the initial.
 *
 * The same public route the page of thanks uses, and consent was decided by
 * the same module — `entry.photo` is only ever true for an adult who chose
 * «اسمي وصورتي». The route checks again from the database on every request,
 * because a URL is a request and never a permission.
 */
function Portrait({ entry }: { entry: BoardEntry }) {
  return (
    <div
      aria-hidden
      className="hidden size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-2 min-[380px]:grid"
    >
      {entry.photo && entry.photoVersion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/public/photo/${entry.id}?v=${entry.photoVersion}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[0.95rem] font-extrabold text-ink-3">
          {[...entry.name][0] ?? '·'}
        </span>
      )}
    </div>
  );
}

/**
 * Where the reader stands, said to the reader alone.
 *
 * Shown on every board in every state, including when they are already in the
 * list above — the number is the same number, because it came from the same
 * ranking, and repeating it is what makes the page answer the question the
 * reader actually came with.
 *
 * When there is no position, the sentence is about the board's dates and never
 * about the person. «لا موقع لك على هذه اللوحة ضمن هذه المدة» is true, is not
 * a ranking, and cannot be read as a low one.
 */
function YourStanding({
  board, kind, lang, t,
}: {
  board: Board;
  kind: WindowKind;
  lang: Locale;
  t: LeaderboardStrings;
}) {
  const box =
    'mt-3 rounded-2xl border border-dashed border-line bg-surface-2 px-4 py-3 text-[0.9rem] leading-relaxed';

  if (!board.you) return <p className={`${box} text-ink-3`}>{t.youNone}</p>;

  const position = t.yourPosition[kind].replace('{n}', formatNumber(board.you.rank, lang));

  return (
    <div className={box}>
      <p className="font-extrabold text-ink">{position}</p>
      {board.you.toTenth !== null && (
        <p className="mt-0.5 text-ink-2">
          {t.toTenth.replace('{n}', distance(board.you.toTenth, t.units[board.board], lang))}
        </p>
      )}
      {board.you.tied && <p className="mt-0.5 text-ink-3">{t.youEqual}</p>}
    </div>
  );
}

/**
 * «٢٥ نقطة», «ساعتان», «نقطة مئوية واحدة».
 *
 * Arabic counts in five bands and the noun changes shape in each, so the
 * distance to tenth place cannot be a number glued to a word — see countPhrase
 * in lib/when.ts. The numeral is localised BEFORE countPhrase is called
 * because countPhrase fills `{n}` with String(n), which would leave a Latin
 * digit sitting inside an Arabic sentence; filling it first makes the second
 * replacement a no-op.
 */
function distance(value: number, forms: CountForms, lang: Locale): string {
  const n = formatNumber(value, lang);
  return countPhrase(value, {
    ...forms,
    few: forms.few.replace('{n}', n),
    many: forms.many.replace('{n}', n),
  });
}
