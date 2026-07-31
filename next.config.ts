import type { NextConfig } from 'next';

/**
 * Deliberately minimal.
 *
 * Hostinger auto-detects Next.js and runs the framework defaults
 * (`next build` then `next start`). An `output: 'standalone'` build
 * is NOT compatible with that: it emits `.next/standalone/server.js`
 * and requires `.next/static` and `public/` to be copied in manually.
 * Setting it here started the server but left the app unreachable.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
