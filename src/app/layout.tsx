// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type React from 'react';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import '@/styles/table-drag-scroll.css';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { AhrefsAnalytics } from '@/components/organisms/AhrefsAnalytics';
import Analytics from '@/components/organisms/Analytics';
import ErrorBoundary from '@/components/organisms/ErrorBoundary';
import Layout from '@/components/templates/Layout';
import { ThemeProvider } from '@/lib/theme';
import { inter, spaceGrotesk } from './fonts';

export const metadata: Metadata = metadataGenerator({
  title: 'PayeTax - Free UK PAYE Tax Calculator 2025 | Salary & Take-Home Pay',
  description:
    'Free UK PAYE tax calculator with official HMRC rates 2025-2026. Calculate income tax, National Insurance, student loans, and take-home pay from your salary instantly. No registration required.',
  pathname: '/',
  keywords:
    'UK tax calculator, PAYE calculator, salary calculator, HMRC rates 2025, take-home pay calculator, National Insurance calculator, UK income tax, tax code calculator',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // WCAG 2.2 AA - Allow 500% zoom
  userScalable: true,
  themeColor: '#252525', // Dark mode only
  colorScheme: 'dark',
  viewportFit: 'cover', // For notched devices
  interactiveWidget: 'resizes-visual', // Better keyboard handling on iOS PWAs
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en-GB'
      suppressHydrationWarning
      data-scroll-behavior='smooth'
      data-view-transition='enabled'
    >
      <head>
        {/* PWA Manifest */}
        <link rel='manifest' href='/manifest.json' />

        {/* Apple Touch Icons for iOS Home Screen */}
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />

        {/* Font loaded via Next.js Font Optimization - see fonts.ts */}

        {/* DNS Prefetch and Preconnect for Performance */}
        <link rel='dns-prefetch' href='https://vercel.live' />
        <link rel='preconnect' href='https://vercel.live' crossOrigin='anonymous' />

        {/* Dark Mode Script - No visibility blocking for better FCP */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for dark mode initialization
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';document.documentElement.setAttribute('data-theme','dark');})();`,
          }}
        />

        {/* PWA Meta Tags */}
        <meta name='application-name' content='PayeTax' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='PayeTax' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#1f2937' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='format-detection' content='telephone=no' />

        {/* Service Worker Registration */}
        <script src='/register-sw.js' async />

        {/* Buy Me Coffee Widget - moved to body for better timing */}

        {/* Structured Data handled by StructuredData component in page.tsx */}
      </head>
      <body
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          'font-sans antialiased',
          'min-h-screen bg-background text-foreground'
        )}
      >
        {/* Ahrefs Web Analytics - Only loads after user accepts cookies */}
        <AhrefsAnalytics />

        <ThemeProvider>
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <ErrorBoundary>
            <Layout>{children}</Layout>
          </ErrorBoundary>
          <ErrorBoundary>
            <Toaster position='top-right' richColors expand={true} closeButton />
          </ErrorBoundary>
          {/* Vercel Analytics & Speed Insights - Privacy-first Web Vitals tracking */}
          <VercelAnalytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
