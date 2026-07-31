import Link from 'next/link';
import { Logo } from './Logo';
import type { Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const org = [
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/areas`, label: dict.nav.areas },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/gallery`, label: dict.nav.gallery },
  ];
  const vol = [
    { href: `/${lang}/academy`, label: dict.nav.academy },
    { href: `/${lang}/journey`, label: dict.nav.journey },
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
            <h4 className="mb-3 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.footer.orgTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {org.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[0.94rem] text-ink-2 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[0.78rem] font-bold tracking-[0.13em] text-ink-3">
              {dict.footer.volunteersTitle}
            </h4>
            <ul className="flex flex-col gap-2">
              {vol.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[0.94rem] text-ink-2 hover:text-ink">
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
