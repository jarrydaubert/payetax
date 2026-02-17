// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { generateMetadata as metadataGenerator, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { inter, spaceGrotesk } from '@/app/fonts';
import { AhrefsAnalytics } from '@/components/organisms/AhrefsAnalytics';
import Analytics from '@/components/organisms/Analytics';
import { StructuredData } from '@/components/organisms/StructuredData';
import Layout from '@/components/templates/Layout';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';

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
        <StructuredData type='organization' />
        {analyticsEnabled ? (
          /* Ahrefs Web Analytics - Only loads after user accepts cookies */
          <AhrefsAnalytics />
        ) : null}

        <ThemeProvider>
          <Suspense fallback={null}>{analyticsEnabled ? <Analytics /> : null}</Suspense>
          <Layout>{children}</Layout>
          <Toaster position='top-right' richColors expand={true} closeButton />
          {analyticsEnabled ? (
            <>
              {/* Vercel Analytics & Speed Insights - Privacy-first Web Vitals tracking */}
              <VercelAnalytics />
              <SpeedInsights />
            </>
          ) : null}
        </ThemeProvider>

        {/* Service Worker Registration - lazyOnload to avoid competing with initial hydration */}
        <Script src='/register-sw.js' strategy='lazyOnload' />
      </body>
    </html>
  );
}
