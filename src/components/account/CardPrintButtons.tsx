'use client';

/**
 * Two ways out of the card page, because they want different paper.
 *
 * "Save as PDF" produces a file whose *page* is the card — 85.6 × 54mm, no
 * margin, nothing else on it. That is what somebody means when they ask for
 * the card as a PDF: a thing they can send to a printer, keep on a phone, or
 * hand to a print shop. The page used to be A4 with the card sitting small in
 * the middle of it, which is a photograph of a card rather than a card.
 *
 * "Print on A4" keeps the sheet, because a volunteer with an ordinary printer
 * at home has A4 in it and will cut the card out. A card-sized page sent to
 * such a printer either scales up to fill the sheet — destroying the one
 * property the whole design is built on — or stops with a paper-size error.
 *
 * @page cannot be switched with a class, so the rule is written into a style
 * element the moment before printing. Restored afterwards, so a reader who
 * saves a PDF and then prints does not silently get the wrong one.
 */

/*
 * visibility rather than display, and a fixed card on top.
 *
 * Hiding the rest with `display: none` collapses the page and takes the card
 * with it in some engines. Hiding it with `visibility` leaves the boxes where
 * they are — invisible — and the card is then lifted out with `position:
 * fixed` and pinned to the page origin, which is the one placement every
 * browser agrees on. Clamping html and body to the card's own size is what
 * stops the invisible layout underneath from spilling into a second, blank
 * page.
 */
const CARD_PAGE = `@media print {
@page { size: 85.6mm 54mm; margin: 0; }
html, body {
  width: 85.6mm !important; height: 54mm !important;
  margin: 0 !important; padding: 0 !important; overflow: hidden !important;
}
body * { visibility: hidden !important; }
.member-card, .member-card * { visibility: visible !important; }
.member-card {
  position: fixed !important;
  /* Physical top-left, stated in four properties rather than \`inset: 0\`.
     With an explicit width, \`left: 0; right: 0\` is over-constrained, and the
     rule for resolving that is direction-dependent: in an RTL document the
     browser drops \`left\` and pins the card to the right-hand edge instead of
     the corner. Arabic is the default language here, so \`inset\` would have
     put every Arabic card in the wrong place and every English one in the
     right one. */
  top: 0 !important;
  left: 0 !important;
  right: auto !important;
  bottom: auto !important;
  width: 85.6mm !important;
  height: 54mm !important;
  max-width: none !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
}`;

const SHEET_PAGE = '@media print { @page { size: A4; margin: 18mm; } }';

function printWith(rule: string) {
  const el = document.getElementById('card-page-rule');
  if (!el) {
    window.print();
    return;
  }
  const previous = el.textContent ?? '';
  el.textContent = rule;
  /*
   * The browser has to lay out against the new rule before the dialog opens.
   * Chrome does this synchronously on print(), but Safari has been known not
   * to, and a frame costs nothing.
   */
  requestAnimationFrame(() => {
    window.print();
    el.textContent = previous;
  });
}

export function CardPrintButtons({ pdfLabel, sheetLabel }: { pdfLabel: string; sheetLabel: string }) {
  return (
    <>
      <button
        type="button"
        onClick={() => printWith(CARD_PAGE)}
        className="min-h-12 rounded-full bg-brand-orange px-6 text-[0.95rem] font-extrabold text-[#241503] transition-colors hover:bg-brand-orange-dark"
      >
        {pdfLabel}
      </button>
      <button
        type="button"
        onClick={() => printWith(SHEET_PAGE)}
        className="min-h-12 rounded-full border border-line px-6 text-[0.95rem] font-bold transition-colors hover:bg-surface-2"
      >
        {sheetLabel}
      </button>
    </>
  );
}
