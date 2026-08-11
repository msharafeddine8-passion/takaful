'use client';

/**
 * Printing is the only thing on the certificate page that needs the client,
 * so it is the only thing that is one.
 */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-brand-orange px-6 py-3 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark"
    >
      {label}
    </button>
  );
}
