'use client';

/**
 * The one live region.
 *
 * There are six hand-rolled `role="status"` / `role="alert"` elements in this
 * codebase already, and one of them is wrong in a way that is easy to repeat:
 * ShareCredential puts `aria-live` on the copy button *and* changes that
 * button's own label, so the same element is both the focused control and the
 * announcement — a screen reader reads the change twice, once as a live update
 * and once as the newly-focused control's name.
 *
 * The rule this component exists to enforce:
 *
 *   Announce through <Announcer />. Never put aria-live on an interactive
 *   control, and never on the element whose own text is what changed.
 *
 * Two details that look like fussiness and are not:
 *
 *  - The region is rendered from the very first paint, empty. A live region
 *    that is inserted into the DOM at the same moment as its text is not
 *    reliably announced, because assistive technology watches existing regions
 *    for changes rather than re-scanning the whole document. Mount it empty,
 *    then fill it.
 *
 *  - `aria-atomic="true"` so the message is read as one sentence rather than
 *    only the words that happened to differ from the previous message.
 *
 * It is visually hidden with Tailwind's own `sr-only` (v4 ships it), not a
 * hand-written clip rectangle — a bespoke one is how text ends up either
 * visible for a frame or clipped out of the accessibility tree too.
 */

import type { Politeness } from './a11y';

export function Announcer({
  message,
  politeness = 'polite',
}: {
  /** `null` between announcements. The region stays mounted either way. */
  message: string | null;
  /**
   * `polite` waits for a pause in speech — right for progress and success.
   * `assertive` interrupts, and maps to role="alert"; keep it for the rare
   * case where continuing without hearing it would lose the reader's work.
   */
  politeness?: Politeness;
}) {
  return (
    <div
      className="sr-only"
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
    >
      {message ?? ''}
    </div>
  );
}
