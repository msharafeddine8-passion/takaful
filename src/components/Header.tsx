'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { switchLocalePath, type Locale } from '@/lib/i18n';
import type { HeaderStrings } from './header-strings';

/**
 * Takes only the strings it shows. It used to take the whole Dictionary, and
 * because this is a client component on every page, that put the entire
 * dictionary in every response — see header-strings.ts for why that mattered.
 */
type Props = { lang: Locale; strings: HeaderStrings };

export function Header({ lang, strings }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other: Locale = lang === 'ar' ? 'en' : 'ar';

  const links = [
    { href: `/${lang}`, label: strings.home },
    { href: `/${lang}/about`, label: strings.about },
    { href: `/${lang}/areas`, label: strings.areas },
    { href: `/${lang}/academy`, label: strings.academy },
    { href: `/${lang}/opportunities`, label: strings.opportunities },
    { href: `/${lang}/journey`, label: strings.journey },
    { href: `/${lang}/projects`, label: strings.projects },
    { href: `/${lang}/gallery`, label: strings.gallery },
    { href: `/${lang}/contact`, label: strings.contact },
  ];

  const isActive = (href: string) =>
    href === `/${lang}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-5">
        <Link
          href={`/${lang}`}
          aria-label={strings.siteName}
          className="inline-flex min-h-11 shrink-0 items-center"
        >
          <Logo siteName={strings.siteName} />
        </Link>

        {/* The full nav only fits from xl up — nine links plus the actions are
            wider than a lg viewport, and squeezed flex items wrap into
            multi-line pills that collide with the logo. Below xl, the burger. */}
        <nav className="ms-auto hidden items-center xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={`whitespace-nowrap rounded-lg px-2 py-2 text-[0.9rem] font-bold transition-colors ${
                isActive(l.href)
                  ? 'bg-brand-blue/10 text-brand-blue dark:text-sky-300'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 xl:ms-0">
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-3.5 text-[0.85rem] font-bold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {strings.switchTo}
          </Link>
          {/* The header stays static, so it cannot know who is signed in.
              /join redirects an already-signed-in visitor to their dashboard. */}
          <Link
            href={`/${lang}/account`}
            className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-[0.9rem] font-bold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:inline-flex"
          >
            {strings.account}
          </Link>
          <Link
            href={`/${lang}/join`}
            className="hidden whitespace-nowrap rounded-full bg-brand-orange px-5 py-2.5 text-[0.92rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark sm:inline-flex"
          >
            {strings.volunteer}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={strings.menu}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line text-[1.05rem] text-ink xl:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-ground xl:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line px-5 py-3.5 font-bold text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/${lang}/account`}
            onClick={() => setOpen(false)}
            className="block border-b border-line px-5 py-3.5 font-bold text-brand-blue dark:text-brand-orange"
          >
            {strings.account}
          </Link>
        </nav>
      )}
    </header>
  );
}

