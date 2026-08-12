'use client';

/**
 * A submit button that asks first.
 *
 * Used for suspension, which is the one action in the staff area that takes
 * effect against a person the instant it is clicked: their sessions are
 * deleted on every device they are signed in on. It is reversible, but the
 * volunteer on the other end has already been thrown out of whatever they
 * were doing.
 *
 * A native confirm() rather than a modal: it cannot be missed, it cannot be
 * dismissed by a stray click outside it, it is announced by screen readers
 * without any ARIA of ours, and it works with the keyboard by default. A
 * hand-built dialog would need all of that written and tested to arrive at
 * the same place.
 */
export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
