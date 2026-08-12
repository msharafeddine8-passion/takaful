import Link from 'next/link';
import type { ReactNode } from 'react';

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
    <p className="text-[0.78rem] font-extrabold tracking-[0.14em] text-brand-orange-text dark:text-brand-orange">
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line bg-surface transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {children}
    </article>
  );
}
