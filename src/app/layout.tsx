// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import '@/styles/table-drag-scroll.css';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { AhrefsAnalytics } from '@/components/organisms/AhrefsAnalytics';
import Analytics from '@/components/organisms/Analytics';
import Layout from '@/components/templates/Layout';
import { ThemeProvider } from '@/lib/theme';
import { inter, spaceGrotesk } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL('https://payetax.co.uk'),
  ...metadataGenerator({
    title: 'PayeTax - Free UK PAYE Tax Calculator 2025 | Salary & Take-Home Pay',
    description:
      'Free UK PAYE tax calculator with official HMRC rates 2025-2026. Calculate income tax, National Insurance, student loans, and take-home pay from your salary instantly. No registration required.',
    pathname: '/',
    keywords:
      'UK tax calculator, PAYE calculator, salary calculator, HMRC rates 2025, take-home pay calculator, National Insurance calculator, UK income tax, tax code calculator',
  }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // WCAG 2.2 AA - Allow 500% zoom
  userScalable: true,
  themeColor: '#1f2937', // Dark mode - matches msapplication-TileColor
  colorScheme: 'dark',
  viewportFit: 'cover', // For notched devices
  interactiveWidget: 'resizes-visual', // Better keyboard handling on iOS PWAs
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en-GB'
      className='dark'
      data-theme='dark'
      style={{ colorScheme: 'dark' }}
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

        {/* PWA Meta Tags */}
        <meta name='application-name' content='PayeTax' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
        <meta name='apple-mobile-web-app-title' content='PayeTax' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#1f2937' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='format-detection' content='telephone=no' />
      </head>
      <body
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          'font-sans antialiased',
          'min-h-screen bg-background text-foreground',
        )}
      >
        {/* Ahrefs Web Analytics - Only loads after user accepts cookies */}
        <AhrefsAnalytics />

        <ThemeProvider>
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <Layout>{children}</Layout>
          <Toaster position='top-right' richColors expand={true} closeButton />
          {/* Vercel Analytics & Speed Insights - Privacy-first Web Vitals tracking */}
          <VercelAnalytics />
          <SpeedInsights />
        </ThemeProvider>

        {/* Service Worker Registration - afterInteractive for non-blocking load */}
        <Script src='/register-sw.js' strategy='afterInteractive' />
      </body>
    </html>
  );
}
