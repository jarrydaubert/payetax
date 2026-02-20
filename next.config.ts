// next.config.ts

import path from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
// FIXED: Import webpack directly for plugins
import webpack from 'webpack';
import packageJson from './package.json';

// Bundle analyzer setup
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

const fontAlias: Record<string, string> = useGoogleFonts
  ? { '@/app/fonts': path.resolve('./src/app/fonts.google.ts') }
  : {};

const nextConfig: NextConfig = {
  // Expose app version to client
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },

  // Enhanced React 19 dev warnings and best practices
  reactStrictMode: true,

  // Enable React 19 features and optimizations
  // Enable typed routes for better type safety (Next.js 15.5+)
  typedRoutes: true,

  experimental: {
    // Note: PPR (Partial Prerendering) requires Next.js canary
    // ppr: 'incremental', // Disabled - requires canary version

    // Optimize specific package imports for better tree-shaking
    // Note: lucide-react, lodash-es, date-fns are optimized by default in Next.js 16
    // Only include packages not in the default list
    optimizePackageImports: [
      '@headlessui/react',
      'react-hook-form',
      'framer-motion',
      'react-markdown',
      '@mdx-js/react',
      '@mdx-js/loader',
      'next-mdx-remote',
      'recharts',
      'rehype-pretty-code',
      'rehype-slug',
      'remark-gfm',
    ],

    // Stale times for client-side router cache (experimental - monitor for issues)
    // Can be disabled if caching causes stale data problems
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Turbopack configuration (used for dev, webpack used for prod builds via --webpack flag)
  turbopack: {
    resolveAlias: {
      ...fontAlias,
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log and console.warn in production (keep error for critical issues)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Image optimization for modern formats and responsive design
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance and security optimizations
  compress: true,
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: '/blog/category/tax-tools',
        destination: '/blog/category/tax-basics',
        permanent: true,
      },
    ];
  },

  // Enable source maps for Sentry error tracking (deleted after upload via Sentry config)
  productionBrowserSourceMaps: true,

  // Advanced webpack optimizations for production
  webpack: (config, { dev, isServer }) => {
    // Production-only optimizations
    if (!(dev || isServer)) {
      // Enhanced chunk splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...(config.optimization.splitChunks || {}),
          cacheGroups: {
            ...(config.optimization.splitChunks?.cacheGroups || {}),
            // Separate vendor chunk for better caching
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              minSize: 5000, // Lower threshold to encourage splitting
            },
            // Separate chunk for UI components (expanded regex for atomic design)
            ui: {
              test: /[\\/]src[\\/]components[\\/](ui|organisms|molecules)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              minSize: 5000,
            },
            // Common chunk for shared utilities
            common: {
              test: /[\\/]src[\\/](lib|utils|hooks)[\\/]/,
              name: 'common',
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              minSize: 5000,
            },
          },
        },
        // Enable proper tree-shaking
        usedExports: true,
        sideEffects: true, // FIXED: Enable proper tree-shaking for packages that declare sideEffects: false
      };

      // FIXED: Proper IgnorePlugin usage to exclude esprima from bundle
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^esprima$/,
        }),
      );
    }

    // Optimize imports with path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./src'),
      ...fontAlias,
    };

    return config;
  },

  // Security and performance headers
  async headers() {
    return [
      {
        // Security headers for all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Content-Security-Policy',
            // Note: 'unsafe-eval' only in dev for React source maps, removed in production for security
            // Added: object-src, base-uri, form-action, frame-ancestors; avoid deprecated child-src
            value:
              process.env.NODE_ENV === 'development'
                ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.sentry-cdn.com https://va.vercel-scripts.com https://analytics.ahrefs.com https://giscus.app https://payetax.kit.com https://app.kit.com https://f.convertkit.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.ingest.sentry.io https://analytics.ahrefs.com https://vercel.live https://giscus.app https://payetax.kit.com https://app.kit.com https://api.kit.com https://f.convertkit.com https://app.convertkit.com; frame-src 'self' https://giscus.app https://payetax.kit.com https://app.kit.com https://f.convertkit.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://payetax.kit.com https://app.kit.com https://f.convertkit.com; frame-ancestors 'none';"
                : "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.sentry-cdn.com https://va.vercel-scripts.com https://analytics.ahrefs.com https://giscus.app https://payetax.kit.com https://app.kit.com https://f.convertkit.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.ingest.sentry.io https://analytics.ahrefs.com https://vercel.live https://giscus.app https://payetax.kit.com https://app.kit.com https://api.kit.com https://f.convertkit.com https://app.convertkit.com; frame-src 'self' https://giscus.app https://payetax.kit.com https://app.kit.com https://f.convertkit.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://payetax.kit.com https://app.kit.com https://f.convertkit.com; frame-ancestors 'none';",
          },
        ],
      },
      {
        // Edge cache policy for blog pages
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Long-term caching for generated content assets
        source: '/content/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Long-term caching for static images
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Long-term caching for static videos
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

// Wrap config with Sentry for error monitoring
const configWithSentry = withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Sentry configuration options
  org: 'payetax',
  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements (replaces deprecated disableLogger)
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayShadowDom: true,
    excludeReplayIframe: true,
  },

  // Delete source maps after upload to Sentry (don't expose in production)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});

export default configWithSentry;
