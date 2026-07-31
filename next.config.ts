import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Hostinger runs the app as a Node process. `standalone` emits a
   * self-contained server bundle, so the host does not need the full
   * node_modules tree at runtime.
   */
  output: 'standalone',
};

export default nextConfig;
