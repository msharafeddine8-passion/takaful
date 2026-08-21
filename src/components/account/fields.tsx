'use client';

import type { ReactNode } from 'react';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[0.98rem] text-ink outline-none transition-colors placeholder:text-ink-2/60 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/25';

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.92rem] font-bold text-ink">
        {label}
        {optional && <span className="ms-1.5 font-normal text-ink-2">({optional})</span>}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="mb-2 text-[0.85rem] leading-relaxed text-ink-2">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-[0.85rem] font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = 'text',
  hint,
  error,
  optional,
  required,
  autoComplete,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  error?: string;
  optional?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} error={error} optional={optional}>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined
        }
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextArea({
  name,
  label,
  hint,
  error,
  optional,
  rows = 4,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  rows?: number;
}) {
  return (
    <FieldShell label={label} htmlFor={name} hint={hint} error={error} optional={optional}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined
        }
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function CheckField({
  name,
  label,
  error,
  defaultChecked,
}: {
  name: string;
  label: string;
  error?: string;
  /** So a form that refuses a submission can hand the ticks back, rather than
   *  making somebody agree to three things all over again. */
  defaultChecked?: boolean;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 text-[0.93rem] leading-relaxed text-ink">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="mt-1 size-[1.05rem] shrink-0 accent-brand-orange"
          aria-invalid={error ? true : undefined}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1 ms-8 text-[0.85rem] font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[0.92rem] font-semibold text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
    >
      {children}
    </p>
  );
}

export function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand-orange px-6 py-3.5 text-[0.98rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? '…' : label}
    </button>
  );
}
