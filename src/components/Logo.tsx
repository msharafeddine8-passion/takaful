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
    <Image src="/logo-full.svg" alt={siteName} width={575} height={566} className={className} />
  );
}

/** Header lockup: official symbol + live text, so the name stays crisp at small sizes. */
export function Logo({ siteName }: { siteName: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-9 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.22rem] font-black tracking-tight text-brand-orange">تكافل</span>
        <span className="text-[0.58rem] font-bold tracking-[0.2em] text-brand-blue dark:text-sky-300">
          TAKAFUL
        </span>
      </span>
      <span className="sr-only">{siteName}</span>
    </span>
  );
}
