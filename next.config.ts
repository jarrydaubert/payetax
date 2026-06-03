import path from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import packageJson from './package.json';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const isTruthy = (value: string | undefined) => value === '1' || value === 'true';

const isVercelBuild =
  isTruthy(process.env.VERCEL) ||
  Boolean(process.env.VERCEL_ENV) ||
  Boolean(process.env.VERCEL_URL);

const useGoogleFonts =
  !isTruthy(process.env.PAYETAX_DISABLE_GOOGLE_FONTS) &&
  (isVercelBuild || isTruthy(process.env.PAYETAX_ENABLE_GOOGLE_FONTS));

// Keep the font alias explicit so local/dev builds can stay privacy-first
// while production can still opt into hosted Google fonts on Vercel.
const fontAlias: Record<string, string> = useGoogleFonts
  ? { '@/app/fonts': path.resolve('./src/app/fonts.google.ts') }
  : {};

const scriptSrcHosts = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://js.sentry-cdn.com',
  'https://giscus.app',
];

const connectSrcHosts = [
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://www.googletagmanager.com',
  'https://*.ingest.sentry.io',
  'https://vercel.live',
  'https://giscus.app',
];

const frameSrcHosts = ['https://giscus.app'];

const formActionHosts: string[] = [];

function buildCsp(isDevelopment: boolean): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"];

  if (isDevelopment) {
    scriptSrc.push("'unsafe-eval'");
  }

  scriptSrc.push(...scriptSrcHosts);

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data: https:`,
    `connect-src 'self' ${connectSrcHosts.join(' ')}`,
    `frame-src 'self' ${frameSrcHosts.join(' ')}`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' ${formActionHosts.join(' ')}`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },

  reactStrictMode: true,
  typedRoutes: true,

  experimental: {
    // The repo uses `use cache`, cacheLife, and cacheTag in blog/MDX data loading.
    useCache: true,

    // Keep this list tight: only packages we actually ship and that are not already
    // covered by Next.js defaults.
    optimizePackageImports: [
      'framer-motion',
      'next-mdx-remote',
      'rehype-pretty-code',
      'rehype-slug',
      'remark-gfm',
    ],
  },

  turbopack: {
    resolveAlias: {
      ...fontAlias,
    },
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: '/calculator',
        destination: '/#tax-calculator',
        permanent: true,
      },
      {
        source: '/blog/category/tax-tools',
        destination: '/blog/category/tax-basics',
        permanent: true,
      },
      {
        source: '/blog/category/self-assessment',
        destination: '/blog/category/tax-deadlines',
        permanent: true,
      },
    ];
  },

  // Needed for Sentry source map upload during production builds.
  productionBrowserSourceMaps: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
      ...fontAlias,
    };

    return config;
  },

  async headers() {
    const csp = buildCsp(process.env.NODE_ENV === 'development');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/videos/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const configWithSentry = withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: 'jgf-projects',
  project: 'payetax',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayShadowDom: true,
    excludeReplayIframe: true,
  },
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});

export default configWithSentry;
