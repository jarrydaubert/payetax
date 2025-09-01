// next.config.ts
import type { NextConfig } from 'next';
// FIXED: Import webpack directly for plugins
import webpack from 'webpack';

// Sentry removed as requested

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Enhanced React 19 dev warnings and best practices
  reactStrictMode: true,

  // Enable React 19 features and optimizations
  // Enable typed routes for better type safety (Next.js 15.5+)
  typedRoutes: true,

  experimental: {
    // Optimize specific package imports for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      '@headlessui/react',
      'zustand',
      'react-hook-form',
      'zod',
      'react-markdown',
      '@mdx-js/react',
    ],
    // Enable for memory-intensive builds (recommended for large apps)
    webpackMemoryOptimizations: true,
    // Enable instrumentation hook for monitoring (Next.js experimental)
    // instrumentationHook: true, // Temporarily disabled - may not be available in current Next.js version
  },

  // Turbopack configuration (stable for dev, alpha for prod)
  // Note: Custom webpack plugins may not apply in Turbopack prod (alpha)
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production (keep error/warn for debugging)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
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

  // Advanced webpack optimizations for production
  webpack: (config, { dev, isServer }) => {
    // Production-only optimizations
    if (!dev && !isServer) {
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
        })
      );
    }

    // Optimize imports with path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('node:path').resolve('./src'),
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
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
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
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.buymeacoffee.com; style-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://bmac-cdn.nyc3.digitaloceanspaces.com https://cdnjs.buymeacoffee.com; frame-src https://www.buymeacoffee.com https://buymeacoffee.com https://cdnjs.buymeacoffee.com; worker-src 'self'; child-src 'self' https://buymeacoffee.com https://www.buymeacoffee.com;",
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

// Export with bundle analyzer only (Sentry removed)
export default withBundleAnalyzer(nextConfig);
