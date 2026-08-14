import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

/**
 * A circular progress indicator.
 *
 * The one genuinely new primitive the map needs: nothing circular exists
 * anywhere in the codebase, and the linear ProgressBar in academy/parts.tsx
 * cannot sit inside a station node on a rail. Pure SVG — no library, no
 * client JavaScript, and no animation, so it is identical under
 * prefers-reduced-motion.
 *
 * It takes a required `label`, exactly as ProgressBar does. Unlabelled
 * progress bars are the most common accessibility fault already in this repo
 * and this must not add another.
 *
 * Direction: the arc is rotated to start at twelve o'clock and, in Arabic,
 * mirrored so it grows anticlockwise — the reading direction. That is done in
 * the SVG transform attribute rather than with a Tailwind physical class,
 * because the coordinate system is the thing being mirrored, not the box.
 */

const R = 44;
const C = 2 * Math.PI * R;

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-32 w-32',
};

const TEXT: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[0.72rem]',
  md: 'text-[clamp(0.9rem,0.8rem+0.4vw,1.05rem)]',
  lg: 'text-[clamp(1.3rem,1.1rem+1vw,1.8rem)]',
};

const STROKE: Record<'orange' | 'ok' | 'muted', string> = {
  orange: 'stroke-brand-orange',
  ok: 'stroke-ok',
  muted: 'stroke-line',
};

export function ProgressRing({
  percent,
  label,
  valueText,
  size = 'md',
  tone = 'orange',
  lang,
  children,
}: {
  percent: number;
  /** Required. What this ring is measuring, in the reader's language. */
  label: string;
  /** The figure said in words — never leave the value to the colour alone. */
  valueText?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'orange' | 'ok' | 'muted';
  lang: Locale;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number.isFinite(percent) ? percent : 0)));

  // Start at 12 o'clock. In Arabic, mirror about the vertical centre line so
  // the arc travels right-to-left like the text around it.
  const transform =
    lang === 'ar' ? `translate(100 0) scale(-1 1) rotate(-90 50 50)` : `rotate(-90 50 50)`;

  return (
    <div
      className={`relative inline-grid place-items-center ${SIZE[size]}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      {...(valueText ? { 'aria-valuetext': valueText } : {})}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          strokeWidth={8}
          className="stroke-line"
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - clamped / 100)}
          transform={transform}
          className={STROKE[tone]}
        />
      </svg>

      {children !== undefined && children !== null && (
        <span className={`relative z-10 font-extrabold leading-none ${TEXT[size]}`}>{children}</span>
      )}
    </div>
  );
}
