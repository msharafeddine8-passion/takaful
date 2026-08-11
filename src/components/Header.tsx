'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { switchLocalePath, type Locale } from '@/lib/i18n';
import type { Dictionary } from '@/lib/dictionaries';

type Props = { lang: Locale; dict: Dictionary };

export function Header({ lang, dict }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other: Locale = lang === 'ar' ? 'en' : 'ar';

  const links = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/areas`, label: dict.nav.areas },
    { href: `/${lang}/academy`, label: dict.nav.academy },
    { href: `/${lang}/opportunities`, label: dict.account.activities.kicker },
    { href: `/${lang}/journey`, label: dict.nav.journey },
    { href: `/${lang}/projects`, label: dict.nav.projects },
    { href: `/${lang}/gallery`, label: dict.nav.gallery },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    href === `/${lang}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-6 px-5">
        <Link href={`/${lang}`} aria-label={dict.meta.siteName}>
          <Logo siteName={dict.meta.siteName} />
        </Link>

        <nav className="ms-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-[0.92rem] font-bold transition-colors ${
                isActive(l.href)
                  ? 'bg-brand-blue/10 text-brand-blue dark:text-sky-300'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            className="rounded-full border border-line px-3 py-2 text-[0.82rem] font-bold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {dict.common.switchTo}
          </Link>
          {/* The header stays static, so it cannot know who is signed in.
              /join redirects an already-signed-in visitor to their dashboard. */}
          <Link
            href={`/${lang}/account`}
            className="hidden rounded-lg px-3 py-2 text-[0.9rem] font-bold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:inline-flex"
          >
            {dict.account.dashboard.kicker}
          </Link>
          <Link
            href={`/${lang}/join`}
            className="hidden rounded-full bg-brand-orange px-5 py-2.5 text-[0.92rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark sm:inline-flex"
          >
            {dict.nav.volunteer}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={dict.nav.menu}
            className="rounded-lg border border-line px-3 py-2 text-ink lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-ground lg:hidden">
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
            {dict.account.dashboard.kicker}
          </Link>
        </nav>
      )}
    </header>
  );
}
