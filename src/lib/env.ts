import 'server-only';

/**
 * What the application needs from its environment, in one place.
 *
 * Every variable used to be read inline with a `??` fallback, which meant a
 * missing one produced a quiet wrong answer at runtime rather than a loud
 * complaint at start-up. That is exactly how the canonical URL ended up
 * pointing at the wrong host on every page for weeks: NEXT_PUBLIC_SITE_URL was
 * never set, the fallback was a guess, and nothing said so.
 *
 * This does not throw. A site that refuses to boot because email is not
 * configured is worse than one that serves its pages and says email is off —
 * most of this application works without most of these. What it does is make
 * the state visible, once, at start-up, where somebody will see it.
 */

type Requirement = {
  name: string;
  required: boolean;
  /** What stops working without it. */
  effect: string;
};

const VARIABLES: Requirement[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    effect: 'Every page that needs an account, a course record or an hour degrades to a notice.',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    effect:
      'Canonical URLs, hreflang, the sitemap and certificate links fall back to a hard-coded host. If that host is not the one being served, search engines are told the wrong thing on every page.',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    effect: 'No email is sent: no password reset, no address confirmation, no notification by mail.',
  },
  {
    name: 'EMAIL_FROM',
    required: false,
    effect: 'Same as RESEND_API_KEY — both are needed before anything is sent.',
  },
  {
    name: 'AUTH_PEPPER',
    required: false,
    effect:
      'Sign-in attempt records are still hashed, but a copy of that table could be tested against a list of guessed addresses.',
  },
];

export type EnvReport = {
  missingRequired: string[];
  missingOptional: string[];
};

function isSet(name: string): boolean {
  // A variable set to whitespace is a variable somebody meant to set and did
  // not. Treating it as present is how a provider key of " " reaches an API.
  return (process.env[name] ?? '').trim().length > 0;
}

export function checkEnvironment(): EnvReport {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const v of VARIABLES) {
    if (isSet(v.name)) continue;
    (v.required ? missingRequired : missingOptional).push(v.name);
  }

  return { missingRequired, missingOptional };
}

/**
 * Prints the state once at start-up. Never throws.
 *
 * Iterates VARIABLES rather than looking each name back up, so the reporting
 * loop cannot assert that a lookup succeeded — there is no lookup. The two
 * `find(...)!` calls this replaced were the only non-null assertions in
 * `src/lib`, and the shape that needed them was the shape that made them
 * unavoidable.
 */
export function reportEnvironment(): void {
  const { missingRequired, missingOptional } = checkEnvironment();
  const missing = new Set([...missingRequired, ...missingOptional]);

  for (const v of VARIABLES) {
    if (!missing.has(v.name)) continue;
    if (v.required) {
      console.error(`[env] MISSING REQUIRED ${v.name} — ${v.effect}`);
    } else {
      console.warn(`[env] not set: ${v.name} — ${v.effect}`);
    }
  }

  if (missing.size === 0) {
    console.log('[env] every variable is set.');
  }
}
