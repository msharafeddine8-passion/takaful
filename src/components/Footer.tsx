import Link from 'next/link';
import { Logo } from './Logo';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';
import { awardDictionaries } from '@/lib/dictionaries/awards';
import { continuityStrings } from '@/lib/dictionaries/continuity';

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  /*
   * The honours board and the continuity page go here.
   *
   * Both were reachable only by typing the URL — the honours board was linked
   * from nowhere at all, and the continuity page only from itself. A page that
   * thanks people by name and cannot be found is worse than no page: the
   * association believes it has said thank you and nobody has read it.
   *
   * The footer rather than the header because the header already carries nine
   * items and these are things somebody goes looking for once, not on the way
   * to something else. Their own titles are used as the labels — both are
   * already short enough to be one, which is the only reason a page title may
   * double as a navigation label here.
   */
  const org = [
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/areas`, label: dict.nav.areas },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/gallery`, label: dict.nav.gallery },
    { href: `/${lang}/honours`, label: awardDictionaries[lang].title },
    { href: `/${lang}/continuity`, label: continuityStrings(lang).title },
  ];
  const vol = [
    { href: `/${lang}/academy`, label: dict.nav.academy },
    { href: `/${lang}/journey`, label: dict.nav.journey },
    /* The forms go here rather than in the header. Somebody looks for an
       attendance sheet when they are about to run something, not while
       browsing — and the header already carries eight items. */
    { href: `/${lang}/resources`, label: dict.resources.kicker },
    { href: `/${lang}/contact`, label: dict.contact.ctaVolunteer },
    { href: `/${lang}/contact`, label: dict.contact.ctaPartner },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 pb-8 pt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo siteName={dict.meta.siteName} />
            <p className="mt-4 max-w-[40ch] text-[0.94rem] text-ink-2">{dict.meta.description}</p>
          </div>

          <div>
            {/* h2: the footer's groups are top-level sections of the page, not
                children of whatever heading happened to come last above them.
                As h4 they left a gap on every page in the site. */}
            <h2 className="mb-3 text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.footer.orgTitle}
            </h2>
            {/* No gap between the items: the spacing lives inside the link as
                min-h-11, so the whole 44px row is tappable rather than 20px of
                text with dead space around it. */}
            <ul className="flex flex-col">
              {org.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-[0.95rem] text-ink-2 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {/* h2: the footer's groups are top-level sections of the page, not
                children of whatever heading happened to come last above them.
                As h4 they left a gap on every page in the site. */}
            <h2 className="mb-3 text-[0.82rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.footer.volunteersTitle}
            </h2>
            <ul className="flex flex-col">
              {vol.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-[0.95rem] text-ink-2 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-line pt-5 text-[0.83rem] text-ink-3">
          <span>{dict.footer.rights}</span>
          <span>{dict.meta.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
