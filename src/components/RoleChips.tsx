import type { ReactNode } from 'react';

/**
 * What somebody IS, beside what they have EARNED.
 *
 * ── WHY THIS IS A ROW OF CHIPS AND NOT A TABLE ─────────────────────────────
 *
 * The client's own words: an administrator wants to add a position a member
 * held and have it show on their profile and on the public pages «next to the
 * badges». A second table further down the page is not next to anything — it is
 * a separate feature that happens to be about the same person, and reading it
 * means deciding first that it is worth scrolling to.
 *
 * So a role is rendered in the badge's own shape: the same pill, the same
 * radius, the same 0.78rem bold text, the same ring, the same 1.5 gap in a
 * wrapping row. It is lifted straight off the badge list on /continuity rather
 * than approximated, so that the two cannot drift into looking like two
 * features. What differs is the tint — the association's orange rather than the
 * neutral surface — because a badge and a role are not the same claim and a
 * reader should be able to tell them apart without reading them. Colour is
 * never the only carrier: the heading above the row says which is which, and
 * the chips are a labelled list to a screen reader.
 *
 * ── IT TAKES STRINGS, AND THAT IS A PRIVACY DECISION ───────────────────────
 *
 * `titles: string[]`, never `VolunteerRole[]`. A role row carries a
 * description, a list of achievements, an entity id, a start date and its own
 * `visibility` column, and none of that has any business in a component that
 * renders on the open web — the same allowlist discipline as ContinuityPerson
 * in lib/continuity.ts, and for the same reason: "the template does not print
 * it" and "it never left the server" are different guarantees, and only the
 * second survives somebody adding a line here in a hurry.
 *
 * NOTHING HERE DECIDES WHO MAY BE SHOWN. By the time a string reaches this
 * file the two public rules have already been applied by the caller — see the
 * head of lib/continuity-roles.ts. There is no viewer parameter, no visibility
 * comparison and no age anywhere below, deliberately: a component that could
 * make the decision is a component that could make it differently from the one
 * place that is supposed to.
 *
 * ── NOTHING IS COUNTED ─────────────────────────────────────────────────────
 *
 * No number, no "and N more", no ordering by anything. The list arrives in the
 * order the caller was given and is rendered in that order. «من جمع أكبر عدد
 * من المناصب» is not a question this platform answers.
 *
 * Mobile first: a wrapping flex row at 375px with no min-width, so a long
 * free-text title a member of staff typed wraps inside its own chip rather than
 * pushing the card sideways. Logical properties only — there is no ms-/me- here
 * at all, because a wrapping row needs neither.
 */

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-2.5 py-1 ' +
  'text-[0.78rem] font-bold text-brand-orange-text ring-1 ring-brand-orange/40 ' +
  'break-words dark:text-brand-orange';

export function RoleChips({
  titles,
  heading,
  className = '',
}: {
  /**
   * Already resolved into the page's language, already filtered, already in the
   * order they should be read. Empty renders nothing at all.
   */
  titles: readonly string[];
  /** «ما أشغله الآن» / «مناصب ومهام». Named above the row, never a bare tint. */
  heading: string;
  className?: string;
}): ReactNode {
  /*
   * No empty state, on purpose.
   *
   * Most volunteers hold no role, and «لا مناصب» beside a wall of badges reads
   * as a shortfall on a page whose whole subject is what somebody has done. The
   * volunteer's own «مهامي ومناصبي» panel is where the three states are told
   * apart in words — see MyRolesPanel — and this row simply is not there when
   * there is nothing to put in it.
   */
  if (titles.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-[0.78rem] font-extrabold tracking-[0.08em] text-ink-3">{heading}</p>
      <ul aria-label={heading} className="mt-2 flex list-none flex-wrap gap-1.5">
        {titles.map((title, i) => (
          /* Keyed by index and by the title together: the titles are free text
             an administrator typed, so two roles may legitimately carry the same
             wording — «متطوّع» twice, in two different years — and the string
             alone is not unique. The list is read-only and never reordered, so
             the index is stable. */
          <li key={`${i}-${title}`} className={CHIP} dir="auto">
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
