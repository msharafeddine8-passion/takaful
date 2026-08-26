import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, Kicker } from '@/components/ui';
import { currentUser } from '@/lib/auth';
import { isDbConfigured } from '@/lib/db';
import { rolesFor, viewerOf } from '@/lib/volunteer-roles';
import { volunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';
import { MyRolesTimeline } from '@/components/account/MyRoles';

/**
 * «مهامي ومناصبي» — a volunteer's own record of what they have been.
 *
 * The counterpart of the staff timeline on staff/members/[id], and deliberately
 * the same object rather than a summary of it: same rows, same periods, same
 * badges, minus the four things only an administrator does to them.
 *
 * ── THE VIEWER IS EXPLICIT, AND THAT IS THE WHOLE PROTOCOL ────────────────
 *
 * rolesFor takes a Viewer and has no default, on the argument at the head of
 * lib/volunteer-roles.ts: an optional viewer has exactly one easy call and it
 * is the one that leaks. viewerOf() is the only thing on this page that decides
 * who is reading, and it is handed the session — so a volunteer gets the
 * volunteer's answer and a member of staff reading their own record gets the
 * staff one, both from the one function that authz.ts backs.
 *
 * NOT `ANONYMOUS`, and not the reader's own id compared against a column
 * anywhere on this page. There is no self-read special case: visibleTo()'s
 * header argues that showing somebody a role written about them but marked
 * staff-only is a decision about how the association speaks to its volunteers,
 * and if it is ever wanted it belongs in a fourth Viewer member where the probe
 * can see it — never in a page quietly widening its own filter.
 *
 * Never prerendered and never indexed: the page is about whoever is signed in.
 */

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  return {
    title: volunteerRoleStrings(lang).mine.pageTitle,
    alternates: alternatesFor(lang, '/account/roles'),
    robots: { index: false, follow: false },
  };
}

/*
 * Props typed here rather than as PageProps<'/[lang]/account/roles'>.
 *
 * The generated route union in .next/types is build output, and this route is
 * new — so the helper cannot name it until the next build, and `npx tsc
 * --noEmit` on a fresh checkout would fail on a page that is perfectly correct.
 * This is the shape the generator emits for a page under [lang], written out.
 */
export default async function MyRolesPage(props: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = volunteerRoleStrings(lang);

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

  /* One viewer, named, on the line above the read. See the header. */
  const viewer = viewerOf(user);
  const roles = await rolesFor(user.id, viewer);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Kicker>{t.mine.kicker}</Kicker>
        <h1 className="mt-2.5 text-[clamp(1.7rem,1.3rem+1.6vw,2.4rem)] font-extrabold tracking-tight">
          {t.mine.pageTitle}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-ink-2">
          {t.mine.pageLede}
        </p>

        {/* Ordered and split by the component, from the sequence rolesFor
            returned. Nothing on this page sorts, re-dates or re-filters it. */}
        <MyRolesTimeline roles={roles} lang={lang} t={t} />

        {/* Who writes this, and what to do when it is wrong. Said after the
            record rather than before it: somebody arriving here wants to read
            their record, not to be told in advance who owns it. */}
        <p className="mt-8 max-w-[62ch] text-[0.88rem] leading-relaxed text-ink-3">
          {t.mine.recordedNote}
        </p>

        <Link
          href={`/${lang}/account` as Parameters<typeof Link>[0]['href']}
          className="mt-8 inline-flex min-h-11 items-center font-bold text-brand-blue hover:underline dark:text-brand-orange"
        >
          {t.mine.back}
        </Link>

        {/* Clears the fixed bottom bar on a phone, which is rendered by the
            dashboard and overlaps the foot of every account page under it. */}
        <div aria-hidden className="h-20 lg:hidden" />
      </Container>
    </Section>
  );
}
