import type { Dictionary } from '@/lib/dictionaries';

/** Error keys the forms can display. Kept in sync with the `errors` dictionary block. */
export type ErrorKey = keyof Dictionary['account']['errors'];

export type FormState = {
  error?: ErrorKey;
  /** Field name → error key, for errors that belong to one input. */
  fields?: Record<string, ErrorKey>;
  /**
   * What the person typed, echoed back so a rejected submission does not erase
   * their work. React resets an uncontrolled form after an action runs, so the
   * inputs are re-mounted with these as defaults. Never contains passwords.
   */
  values?: Record<string, string>;
  /** Increments on every run; used as a remount key so `values` actually apply. */
  attempt?: number;
  /** Set when the action succeeded and the form should say so rather than reset. */
  done?: boolean;
};

export const emptyState: FormState = { attempt: 0 };
