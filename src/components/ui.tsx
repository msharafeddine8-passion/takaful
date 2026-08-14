import Link from 'next/link';
import type { ReactNode } from 'react';
import { localeConfig, type Locale } from '@/lib/i18n';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-5 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.82rem] font-extrabold tracking-[0.14em] text-brand-orange-text dark:text-brand-orange">
      {children}
    </p>
  );
}

export function SectionHead({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-9 max-w-[64ch]">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className="mt-2.5 text-[clamp(1.6rem,1.2rem+1.6vw,2.5rem)] font-extrabold tracking-tight">
        {title}
      </h2>
      {lede && <p className="mt-3.5 text-[1.06rem] leading-relaxed text-ink-2">{lede}</p>}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'orange' | 'blue' | 'ghost' | 'onDark';
};

export function Button({ href, children, variant = 'orange' }: ButtonProps) {
  const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
    orange: 'bg-brand-orange text-[#241503] hover:bg-brand-orange-dark',
    blue: 'bg-brand-blue text-white hover:bg-brand-blue-dark',
    ghost: 'border border-line text-ink hover:bg-surface-2',
    onDark: 'border border-white/35 bg-white/15 text-white hover:bg-white/25',
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-extrabold transition-colors ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

/**
 * The "go on" arrow, pointing the way the reader is actually travelling.
 *
 * U+2192 RIGHTWARDS ARROW has Bidi_Mirrored=No. The bidi algorithm therefore
 * leaves it alone: under dir="rtl" a logical `ms-2` puts it on the visual left
 * of the label, where it correctly sits — still pointing right, back the way
 * the Arabic reader came from. A forward action marked with a backward arrow.
 *
 * Two ways to fix that, and this is the quieter one. `rtl:-scale-x-100` needs
 * `inline-block` to take a transform, which changes how the glyph sits on the
 * baseline, and mirrors a shape rather than choosing a character. Picking the
 * character the locale actually uses — U+2190 for Arabic — needs no transform,
 * no layout mode and no stylesheet, and prints correctly too.
 *
 * Always aria-hidden: it is punctuation for the eye. The link's own text is
 * what a screen reader reads, which is why this takes no label.
 */
export function Arrow({ lang, className = 'ms-2' }: { lang: Locale; className?: string }) {
  // Read from localeConfig rather than from `lang === 'ar'`, so a third locale
  // added there arrives here already pointing the right way.
  return (
    <span aria-hidden className={className}>
      {localeConfig[lang].dir === 'rtl' ? '←' : '→'}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line bg-surface transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {children}
    </article>
  );
}
