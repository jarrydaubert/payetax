// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type React from 'react';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import Analytics from '@/components/analytics/Analytics';
import Layout from '@/components/templates/Layout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ThemeProvider } from '@/lib/theme';
import { inter } from './fonts';

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
  maximumScale: 2,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#252525' },
  ],
  colorScheme: 'dark light',
  viewportFit: 'cover', // For notched devices
  interactiveWidget: 'resizes-visual', // Better keyboard handling on iOS PWAs
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning data-scroll-behavior='smooth'>
      <head>
        {/* Flash Prevention Script - Loads theme before paint */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for flash prevention
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const stored = localStorage.getItem('theme');
                  if (stored) return stored;
                  return 'system';
                }

                function applyTheme(theme) {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                  const resolved = theme === 'system' ? systemTheme : theme;

                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolved);
                  document.documentElement.style.colorScheme = resolved;
                  document.documentElement.setAttribute('data-theme', resolved);
                }

                try {
                  const theme = getTheme();
                  applyTheme(theme);
                } catch (e) {
                  // Fallback to dark if error
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
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

        {/* Structured Data for SEO */}
        <script
          type='application/ld+json'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static structured data for SEO schema
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'PayeTax UK Tax Calculator',
              description:
                'Free UK tax calculator with official HMRC rates 2025-2026. Calculate PAYE, self-employment tax, National Insurance, and take-home pay instantly.',
              url: 'https://payetax.co.uk',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP',
              },
              author: {
                '@type': 'Organization',
                name: 'PayeTax',
                url: 'https://payetax.co.uk',
              },
              featureList: [
                'UK PAYE Tax Calculator',
                'Salary to Take-Home Pay Calculator',
                'National Insurance Calculator',
                'Tax Code Analysis & Validation',
                'Student Loan Repayment Calculator',
                'Pension Contribution Calculator',
                'Weekly/Monthly/Annual Breakdowns',
              ],
              screenshot: 'https://payetax.co.uk/images/calculator-screenshot.jpg',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }}
        />
      </head>
      <body className={cn(inter.variable, 'font-sans antialiased', 'min-h-screen text-foreground')}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <ErrorBoundary>
            <Layout>{children}</Layout>
          </ErrorBoundary>
          <Toaster position='top-right' richColors expand={true} closeButton />
          {/* Vercel Analytics & Speed Insights - Privacy-first Web Vitals tracking */}
          <VercelAnalytics />
          <SpeedInsights />
        </ThemeProvider>

        {/* Buy Me Coffee Widget - Official BMC code */}
        <script
          data-name='BMC-Widget'
          data-cfasync='false'
          src='https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
          data-id='payetax'
          data-description='Support PayeTax development!'
          data-message='Thank you for using our free UK tax calculator! Your support helps keep this tool free for everyone. 💚'
          data-color='#FF813F'
          data-position='Right'
          data-x_margin='18'
          data-y_margin='18'
          defer
        />

        {/* BMC Cleanup - Fix ghost overlay bug */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Minimal cleanup for BMC widget bug
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;

                // Watch for BMC iframe visibility changes
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                      const iframe = mutation.target;
                      if (iframe.tagName === 'IFRAME' && iframe.src && iframe.src.includes('buymeacoffee')) {
                        // If iframe is hidden, remove any stray overlays
                        if (iframe.style.display === 'none' || iframe.style.visibility === 'hidden') {
                          // Remove any BMC overlay elements
                          const overlays = document.querySelectorAll('[class*="bmc"], [id*="bmc"], [class*="BMC"], [id*="BMC"]');
                          overlays.forEach(function(el) {
                            if (el !== iframe && el.tagName !== 'SCRIPT' && el.style.position === 'fixed') {
                              el.remove();
                            }
                          });
                        }
                      }
                    }
                  });
                });

                // Start observing after a delay to let BMC initialize
                setTimeout(function() {
                  const container = document.body;
                  if (container) {
                    observer.observe(container, {
                      attributes: true,
                      attributeFilter: ['style'],
                      subtree: true
                    });
                  }
                }, 2000);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
