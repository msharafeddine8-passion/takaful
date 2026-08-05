/**
 * Runs once when a Next.js server instance starts, before it serves requests.
 * Used to bring the database schema up to date — see src/lib/migrate.ts for why
 * migrations are applied by the server rather than by hand.
 */
export async function register() {
  // The Edge runtime has no filesystem and no mysql driver.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // A build is not a server start; there is nothing to migrate yet.
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { runMigrations } = await import('./lib/migrate');
  await runMigrations();
}
