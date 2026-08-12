/**
 * Runs once when a Next.js server instance starts.
 *
 * Next.js awaits this before the server accepts a single request, so nothing
 * here may fail or hang in a way that reaches the caller. On 5 August 2026 an
 * unbounded database connection in the migration runner did exactly that and
 * took the whole site down. Everything below is bounded and swallowed.
 */
export async function register() {
  // The Edge runtime has no filesystem and no mysql driver.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // A build is not a server start; there is nothing to migrate yet.
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  try {
    // Before anything else, and cheap: says out loud which variables are
    // missing and what stops working without each. A missing one used to
    // produce a quiet wrong answer at runtime instead of a line in the log.
    const { reportEnvironment } = await import('./lib/env');
    reportEnvironment();
  } catch {
    // A reporting step must never be the reason a server fails to start.
  }

  try {
    const { runMigrations } = await import('./lib/migrate');
    await runMigrations();
  } catch (error) {
    // runMigrations already bounds and handles its own failures. This is the
    // last resort — a bad import, a missing module — and it must not throw.
    console.error('[instrumentation] Migration step failed to run:', error);
  }
}
