'use client';

/**
 * The one interactive thing on the passport, and the only reason any of it
 * ships to the browser.
 *
 * 'use client' is here rather than on the page because `window.print()` is the
 * whole export mechanism: there is no PDF library in this codebase and none is
 * being added, so "download" means handing the reader their own browser's
 * print dialogue, from which they choose "Save as PDF" or a printer. That call
 * cannot be made from a server component, and a server action cannot make it
 * either — it is a browser API acting on the document the reader is looking at.
 *
 * Everything else on the sheet — the record, the disclaimer, the print rules —
 * stays on the server, so this component is a button and a single line of
 * behaviour. The label arrives as a prop rather than being read from the
 * dictionary here, so no dictionary is bundled for the browser to render one
 * word.
 *
 * The page's @media print block owns the paper: A4, margins, what is hidden.
 * Nothing is rewritten here before printing — unlike CardPrintButtons, which
 * has to swap the @page rule because that page offers two paper sizes. This
 * offers one, so there is nothing to switch and nothing to put back.
 */
export function PassportPrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-12 rounded-full bg-brand-orange px-6 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark"
    >
      {label}
    </button>
  );
}
