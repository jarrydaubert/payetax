// src/app/layout.tsx

import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { generateMetadata as metadataGenerator, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import Script from 'next/script';
import { Suspense } from 'react';
import { ibmPlexMono, newsreader, publicSans } from '@/app/fonts';
import GoogleAnalytics from '@/components/organisms/Analytics';
import { StructuredData } from '@/components/organisms/StructuredData';
import Layout from '@/components/templates/Layout';
import { APP_VERSION } from '@/constants/version';
import { isAnalyticsFlagEnabled } from '@/lib/analyticsConfig';
import { ThemeProvider } from '@/lib/theme';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...metadataGenerator({
    title: 'UK PAYE Tax Calculator',
    description: `Free UK PAYE tax calculator with official HMRC rates ${CURRENT_TAX_YEAR}. Calculate income tax, National Insurance, student loans, and take-home pay from your salary instantly. No registration required.`,
    pathname: '/',
  }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // WCAG 2.2 AA - Allow 500% zoom
  userScalable: true,
  themeColor: '#f8f5ed',
  colorScheme: 'light dark',
  viewportFit: 'cover', // For notched devices
  interactiveWidget: 'resizes-visual', // Better keyboard handling on iOS PWAs
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const analyticsEnabled = isAnalyticsFlagEnabled();

  return (
    <html
      lang='en-GB'
      translate='no'
      className='notranslate'
      data-theme='light'
      data-scroll-behavior='smooth'
      data-view-transition='enabled'
    >
      <head>
        <meta name='google' content='notranslate' />

        {/* PWA Manifest */}
        <link rel='manifest' href='/manifest.json' />

        {/* Apple Touch Icons for iOS Home Screen */}
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />

        {/* PWA Meta Tags */}
        <meta name='application-name' content='PayeTax' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='PayeTax' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#f8f5ed' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='format-detection' content='telephone=no' />
      </head>
      <body
        className={cn(
          publicSans.variable,
          newsreader.variable,
          ibmPlexMono.variable,
          'font-sans antialiased',
          'min-h-screen bg-background text-foreground',
        )}
      >
        <StructuredData type='organization' />

        <ThemeProvider>
          {analyticsEnabled ? (
            <>
              <VercelAnalytics />
              <SpeedInsights />
            </>
          ) : null}
          {/* Keep the consent controller mounted even when analytics is disabled so
              stale GA cookies and expired consent are still cleaned up. Its central
              gate prevents any Google bootstrap or event queue in that state. */}
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <Layout appVersion={APP_VERSION}>{children}</Layout>
        </ThemeProvider>

        {/* Service Worker Registration - lazyOnload to avoid competing with initial hydration */}
        <Script src='/register-sw.js' strategy='lazyOnload' />
      </body>
    </html>
  );
}
