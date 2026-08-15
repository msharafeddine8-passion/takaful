import Image from 'next/image';

/**
 * The official Takaful logo, served as a static SVG.
 * `mark` is the symbol alone (figures + arcs); `full` includes the wordmark.
 */

export function LogoMark({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.svg"
      alt=""
      width={575}
      height={278}
      className={className}
      priority
      aria-hidden="true"
    />
  );
}

export function LogoFull({
  siteName,
  className = 'h-16 w-auto',
}: {
  siteName: string;
  className?: string;
}) {
  return (
    <Image
      src="/logo-full.svg"
      alt={siteName}
      width={575}
      height={566}
      className={className}
      priority
    />
  );
}

/** Header and footer lockup: the official logo as-is — symbol with the wordmark beneath it. */
export function Logo({ siteName }: { siteName: string }) {
  return <LogoFull siteName={siteName} className="h-[62px] w-auto shrink-0" />;
}
