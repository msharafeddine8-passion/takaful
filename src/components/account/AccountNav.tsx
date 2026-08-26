import Link from 'next/link';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
/*
 * The passport's label comes from its own dictionary rather than from
 * dict.account.nav.
 *
 * Every other label here is `n.something`, because those namespaces were folded
 * into ar.ts / en.ts / types.ts long ago. The passport carries its own strings
 * on purpose — see the head of lib/dictionaries/passport.ts — and adding one
 * key to three files edited in lockstep by other work, to render one word, is
 * the conflict that module exists to avoid. Importing the one string is the
 * cheaper half of that trade, and folding the namespace in later removes this
 * import along with the module.
 */
import { passportStrings } from '@/lib/dictionaries/passport';
import { volunteerRoleStrings } from '@/lib/dictionaries/volunteer-roles';

/**
 * Getting around the account, without a wall of identical buttons.
 *
 * Every account page used to end in the same long row of eleven pills. Eleven
 * things of equal weight is a list nobody reads; people found pages by
 * remembering where the button sat, which is not navigation.
 *
 * So it is grouped by what the person is actually looking for — where they
 * stand, what they have done, who they are — and the groups are named. On a
 * phone the five things worth reaching in one tap sit in a bottom bar and the
 * rest live under "my account", because a bottom bar with eleven destinations
 * is the same wall of pills lying down.
 *
 * A server component: it renders links and nothing else, so there is no reason
 * to ship it to the browser. The current page is marked with aria-current
 * rather than colour alone.
 */

export type NavKey =
  | 'dashboard' | 'journey' | 'learning' | 'activities' | 'hours'
  | 'achievements' | 'leaderboard' | 'certificates' | 'card' | 'passport'
  | 'roles'
  | 'notifications' | 'profile' | 'safeguarding';

type Item = { key: NavKey; href: string; label: string };

/** Built here so the desktop rail and the phone bar cannot drift apart. */
export function accountNav(lang: Locale, dict: Dictionary): {
  groups: Array<{ title: string; items: Item[] }>;
  primary: Item[];
} {
  /*
   * The labels live in the nav's own dictionary section rather than being
   * borrowed from each page's title. A page title and a navigation label are
   * different jobs — «بيانات لازمة قبل النشاط الأول» is a good page heading
   * and a terrible thing to fit in a bottom bar — and borrowing meant every
   * page heading was also silently a navigation constraint.
   */
  const n = dict.account.nav;
  const at = (path: string) => `/${lang}/account${path}`;

  const dashboard: Item = { key: 'dashboard', href: at(''), label: n.dashboard };
  const journey: Item = { key: 'journey', href: at('/journey'), label: n.journey };
  const activities: Item = { key: 'activities', href: at('/activities'), label: n.activities };
  const notifications: Item = { key: 'notifications', href: at('/notifications'), label: n.notifications };
  const profile: Item = { key: 'profile', href: at('/profile'), label: n.profile };

  return {
    groups: [
      {
        /*
         * Roles belong here and not under what somebody has earned.
         *
         * A certificate is a thing you were given; a role is a thing you are
         * being trusted with, and "where I stand" is the question it answers.
         * It shipped reachable only from a panel on the dashboard, which meant
         * the one page telling a volunteer what the association has asked of
         * them could not be found from anywhere else.
         */
        title: n.groupWhereIStand,
        items: [
          dashboard,
          journey,
          { key: 'roles', href: at('/roles'), label: volunteerRoleStrings(lang).mine.navLabel },
        ],
      },
      {
        title: n.groupWhatIDo,
        items: [
          { key: 'learning', href: at('/learning'), label: n.learning },
          activities,
          { key: 'hours', href: at('/hours'), label: n.hours },
        ],
      },
      {
        title: n.groupWhatIEarned,
        items: [
          { key: 'achievements', href: at('/achievements'), label: n.achievements },
          /*
           * Next to the badges, not with the activities.
           *
           * It was reachable only from a link at the foot of the achievements
           * page, which is the same as not existing: nobody hunts for a page
           * they have never been told about. It sits under "what I have earned"
           * because that is the question the boards answer — the reader's own
           * standing — and not under "what I do", which is where somebody would
           * put it if they thought of it as a scoreboard.
           */
          { key: 'leaderboard', href: at('/leaderboard'), label: n.leaderboard },
          { key: 'certificates', href: at('/certificates'), label: n.certificates },
          { key: 'card', href: at('/card'), label: n.card },
          /*
           * With the card and the certificates, and last of the four.
           *
           * It belongs beside them because all three are things a volunteer
           * takes away with them onto paper, and somebody looking for "the
           * thing I attach to an application" looks where the card already is.
           * It comes after them rather than before because it is a summary OF
           * the other two — a reader who has not yet found their certificates
           * should meet those first, so that the passport's own line about not
           * being one of them has something to point at.
           */
          { key: 'passport', href: at('/passport'), label: passportStrings(lang).navLabel },
        ],
      },
      {
        title: n.groupMe,
        items: [
          profile,
          { key: 'safeguarding', href: at('/safeguarding'), label: n.safeguarding },
          notifications,
        ],
      },
    ],
    // The five a volunteer reaches for. Anything else is a tap further away,
    // which is the correct cost for something looked up occasionally.
    primary: [dashboard, journey, activities, notifications, profile],
  };
}

const linkBase =
  'flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-[0.94rem] transition-colors ' +
  'hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40';

/** The desktop rail. Hidden on phones, where the bottom bar takes over. */
export function AccountRail({
  lang, dict, current,
}: { lang: Locale; dict: Dictionary; current: NavKey }) {
  const { groups } = accountNav(lang, dict);
  return (
    <nav aria-label={dict.account.nav.label} className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-1.5 px-3.5 text-[0.74rem] font-extrabold tracking-[0.14em] text-ink-3">
              {group.title}
            </h2>
            <ul>
              {group.items.map((item) => {
                const active = item.key === current;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href as Parameters<typeof Link>[0]['href']}
                      aria-current={active ? 'page' : undefined}
                      className={`${linkBase} ${
                        active
                          ? 'bg-brand-orange/12 font-extrabold text-brand-orange-text dark:text-brand-orange'
                          : 'font-semibold text-ink-2'
                      }`}
                    >
                      {/* A bar rather than colour alone, so the current page is
                          still obvious without colour vision. */}
                      <span
                        aria-hidden
                        className={`me-2.5 h-4 w-1 rounded-full ${active ? 'bg-brand-orange' : 'bg-transparent'}`}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * The same groups laid out in the flow of a page, for the dashboard.
 *
 * The dashboard has no rail — it is the widest thing in the account and a
 * sidebar beside it would push the one card that matters off to the side — so
 * the groups appear inline at the foot of it instead. Same source of truth as
 * the rail, so a page added to one appears in the other.
 */
export function AccountGroups({
  lang, dict, unread = 0,
}: { lang: Locale; dict: Dictionary; unread?: number }) {
  const { groups } = accountNav(lang, dict);
  return (
    <nav aria-label={dict.account.nav.label} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 text-[0.74rem] font-extrabold tracking-[0.14em] text-ink-3">
            {group.title}
          </h2>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href as Parameters<typeof Link>[0]['href']}
                  className={`${linkBase} font-semibold text-ink-2`}
                >
                  {item.label}
                  {item.key === 'notifications' && unread > 0 && (
                    <span className="ms-2 rounded-full bg-brand-orange px-2 py-0.5 text-[0.72rem] font-extrabold text-[#241503]">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * The phone bar. Five destinations, fixed to the bottom, sitting above the
 * home indicator via env(safe-area-inset-bottom) — without that it is covered
 * on every iPhone made since 2017.
 */
export function AccountBottomBar({
  lang, dict, current, unread = 0,
}: { lang: Locale; dict: Dictionary; current: NavKey; unread?: number }) {
  const { primary } = accountNav(lang, dict);
  return (
    <nav
      aria-label={dict.account.nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-lg">
        {primary.map((item) => {
          const active = item.key === current;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href as Parameters<typeof Link>[0]['href']}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.7rem] font-bold leading-tight ${
                  active ? 'text-brand-orange-text dark:text-brand-orange' : 'text-ink-2'
                }`}
              >
                <span className="relative">
                  <span
                    aria-hidden
                    className={`block h-1 w-6 rounded-full ${active ? 'bg-brand-orange' : 'bg-transparent'}`}
                  />
                  {item.key === 'notifications' && unread > 0 && (
                    <span className="absolute -end-2 -top-1 min-w-4 rounded-full bg-brand-orange px-1 text-[0.62rem] font-extrabold text-[#241503]">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </span>
                <span className="text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
