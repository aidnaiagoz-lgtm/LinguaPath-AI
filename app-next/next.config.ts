import path from 'node:path';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Microphone is used only on /speaking for local, unsaved practice recordings.
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' }
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    // The repo root has its own package-lock.json (prototype tests); this app is self-contained.
    root: path.join(__dirname),
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      }
    }
  },
  async redirects() {
    return [
      { source: '/', destination: '/dashboard', permanent: false },
      // Route names from the v0.2 prototype.
      { source: '/games', destination: '/vocabulary', permanent: true }
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

export default nextConfig;
