import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary, type Dictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Arrow, Container, Section, Kicker } from '@/components/ui';
import { RegisterForm } from '@/components/account/AuthForms';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';

export async function generateMetadata(props: PageProps<'/[lang]/join'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.account.join.title,
    description: dict.account.join.lede,
    alternates: alternatesFor(lang, '/join'),
    robots: { index: false },
  };
}

export default async function JoinPage(props: PageProps<'/[lang]/join'>) {
  // Never prerender an account page: what it shows depends on who is asking.
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.join;
  const c = dict.account.chooser;

  if (isDbConfigured() && (await currentUser())) redirect(`/${lang}/account`);

  const { as } = await props.searchParams;
  const path = doorFrom(as);

  /*
   * The question was being asked in the wrong order. Everyone registered the
   * same way, and only afterwards — buried on the account page — did an
   * existing volunteer discover there was a way to be recognised rather than
   * to apply. So the fork comes first, at the door, in the words people use
   * about themselves.
   *
   * Three doors, not two. For a while there were only the last two, and the
   * person who arrives here most often — somebody who has never volunteered and
   * wants to start — had neither of them. They would take the roster door,
   * because it is the one that says "volunteer"; the roster search would find
   * nothing; and the front door of a volunteering association would have opened
   * by telling its newest volunteer that it does not know them.
   */
  if (!path) {
    return (
      <Section>
        <Container className="max-w-4xl">
          <Kicker>{t.kicker}</Kicker>
          <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
            {c.title}
          </h1>
          <p className="mb-8 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">
            {c.lede}
          </p>

          {/*
            * One row of three, not one card and then a pair.
            *
            * The three doors carry the same shape, roughly the same amount of
            * text and the same call to action, and differ only in their accent.
            * Otherwise whichever one was added last reads as an afterthought
            * bolted onto a finished choice, and people pick from the two that
            * look like the real options.
            *
            * `h-full` on each link with `mt-auto` on the call to action: the
            * three cards match in height and the three "continue" links sit on
            * one line, which is what makes the row read as one question with
            * three answers rather than three unrelated boxes.
            *
            * Three columns only from md. At 640px three columns of Arabic
            * prose are about four words wide; below that they stack, which is
            * also the order they are read in on a phone — and the order below
            * is deliberate. See DOORS.
            */}
          <ul className="grid gap-4 md:grid-cols-3">
            {DOORS.map((door) => (
              <li key={door.slug}>
                <Link
                  href={`/${lang}/join?as=${door.slug}`}
                  className={`flex h-full flex-col rounded-2xl border-2 p-6 transition-colors ${door.card}`}
                >
                  <p className="text-[1.15rem] font-extrabold leading-snug">{c[door.title]}</p>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{c[door.body]}</p>
                  <span className={`mt-auto inline-block pt-4 font-extrabold ${door.cta}`}>
                    {c.continueCta}
                    {/* U+2190 was typed here literally, which is right in
                        Arabic and backwards in English: the bidi algorithm
                        does not mirror arrow glyphs. <Arrow> picks per locale. */}
                    <Arrow lang={lang} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-[0.94rem] text-ink-2">
            {t.haveAccount}{' '}
            <Link href={`/${lang}/login`} className="font-bold text-brand-blue hover:underline dark:text-brand-orange">
              {t.loginLink}
            </Link>
          </p>
        </Container>
      </Section>
    );
  }

  const door = DOORS.find((d) => d.slug === path)!;

  return (
    <Section>
      <Container className="max-w-lg">
        <Kicker>{t.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {c[door.title]}
        </h1>
        <p className="mb-2 mt-3 text-[1.02rem] leading-relaxed text-ink-2">{c[door.lede]}</p>
        <Link
          href={`/${lang}/join`}
          className="mb-8 inline-block text-[0.9rem] font-bold text-brand-blue hover:underline dark:text-sky-300"
        >
          {c.changeChoice}
        </Link>

        <RegisterForm lang={lang} t={dict.account.join} errors={dict.account.errors} next={path} />

        <p className="mt-6 text-center text-[0.94rem] text-ink-2">
          {t.haveAccount}{' '}
          <Link href={`/${lang}/login`} className="font-bold text-brand-blue hover:underline dark:text-brand-orange">
            {t.loginLink}
          </Link>
        </p>
      </Container>
    </Section>
  );
}

/*
 * The three doors, in the order a visitor meets them.
 *
 * ── THE ORDER ──────────────────────────────────────────────────────────────
 *
 * Most-common first, and the most common visitor at a volunteering
 * association's front door is somebody who does not volunteer there yet. The
 * roster door serves a finite, known population — the names already on the
 * association's kashf — and the academy door serves people who came for the
 * courses and said so. Neither of those grows; the first one is the whole point
 * of the page.
 *
 * That does not weaken the reason the fork exists at all, which was to let an
 * existing volunteer discover they can be *recognised* rather than apply. That
 * person knows what they are, and reads a door that opens «أنا متطوّع في تكافل»
 * as being about them wherever it sits. What they could not do was find it after
 * registration, buried on the dashboard — and it is still here, at the door,
 * second of three, with its own accent and its own promise about the membership
 * number. The one thing that would undo it is putting it *behind* the new
 * volunteer's door, as a fallback for when the application form is the wrong
 * form. It is not behind anything.
 *
 * ── THE SLUGS ──────────────────────────────────────────────────────────────
 *
 * `volunteer` and `learner` are load-bearing and mean exactly what they meant
 * before: links to them have been sent to people. The third door needed a name
 * of its own rather than a redefinition of `volunteer`, hence `new-volunteer`.
 */
const DOORS = [
  {
    slug: 'new-volunteer',
    title: 'newVolunteerTitle',
    body: 'newVolunteerBody',
    lede: 'newVolunteerLede',
    card: 'border-brand-orange bg-brand-orange/5 hover:bg-brand-orange/10',
    cta: 'text-brand-orange-text dark:text-brand-orange',
  },
  {
    slug: 'volunteer',
    title: 'volunteerTitle',
    body: 'volunteerBody',
    lede: 'volunteerLede',
    /* Blue rather than the orange it used to wear alone. Two orange cards side
     * by side is not two emphases, it is none. Blue is the accent this site
     * already uses for a real second option — a tinted card with a coloured
     * border, not a grey one — so the door loses nothing but the collision. */
    card: 'border-brand-blue/40 bg-brand-blue/[0.05] hover:bg-brand-blue/[0.09]',
    cta: 'text-brand-blue dark:text-sky-300',
  },
  {
    slug: 'learner',
    title: 'learnerTitle',
    body: 'learnerBody',
    lede: 'learnerLede',
    /* The plain card it has always had. `text-ink` and not `text-ink-2` on the
     * link: quietest of the three is not the same as faded, and this is still
     * a complete answer to the question the page asks. */
    card: 'border-line bg-surface hover:bg-surface-2',
    cta: 'text-ink',
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  title: keyof Dictionary['account']['chooser'];
  body: keyof Dictionary['account']['chooser'];
  lede: keyof Dictionary['account']['chooser'];
  card: string;
  cta: string;
}>;

type Door = (typeof DOORS)[number]['slug'];

/**
 * Which door this is, or null for the chooser itself.
 *
 * Matched against the table rather than a hand-written list of string
 * comparisons, so a fourth door is one entry and not two edits that can
 * disagree. Anything unrecognised — a typo, an old link, a probe — falls back
 * to showing the choice rather than guessing on somebody's behalf.
 */
function doorFrom(as: string | string[] | undefined): Door | null {
  return DOORS.find((d) => d.slug === as)?.slug ?? null;
}
