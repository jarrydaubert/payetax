// src/app/layout.tsx
/**
 * Root layout component for the ToolHubX application
 * Provides global styles, fonts, theme support, and SEO metadata
 * @module app/layout
 */

import type { Metadata, Viewport } from 'next';
import type React from 'react';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import Layout from '@/components/templates/Layout';
import { robotoFlex } from './fonts';

/**
 * Generate metadata for the root layout
 * Uses centralized metadata generation for consistency
 */
export const metadata: Metadata = metadataGenerator({
  title: 'ToolHubX - UK Tax Calculator & Financial Tools',
  description:
    'Free UK tax calculator and financial tools. Calculate your take-home pay, understand tax codes, and plan your finances.',
  pathname: '/',
});

/**
 * Viewport configuration for mobile responsiveness
 * Ensures proper scaling and theming on mobile devices
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

/**
 * Root layout component that wraps all pages
 * Provides theme context, fonts, and base styling
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon set */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          robotoFlex.variable,
          'font-sans antialiased',
          'min-h-screen bg-background text-foreground'
        )}
      >
        {/* Theme provider for dark/light mode support */}
        <ThemeProvider>
          {/* Direct layout usage - ClientWrapper eliminated */}
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
