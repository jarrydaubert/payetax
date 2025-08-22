// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type React from 'react';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import './globals.css';
import Layout from '@/components/templates/Layout';
import { inter } from './fonts';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = metadataGenerator({
  title: 'ToolHubX - Free UK PAYE Tax Calculator 2025 | Salary & Take-Home Pay',
  description:
    'Free UK PAYE tax calculator with official HMRC rates 2025-2026. Calculate income tax, National Insurance, student loans, and take-home pay from your salary instantly. No registration required.',
  pathname: '/',
  keywords: 'UK tax calculator, PAYE calculator, salary calculator, HMRC rates 2025, take-home pay calculator, National Insurance calculator, UK income tax, tax code calculator',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 2,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
  colorScheme: 'dark light',
  viewportFit: 'cover', // For notched devices
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="ToolHubX" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ToolHubX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Service Worker Registration */}
        <script src="/register-sw.js" async />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ToolHubX UK Tax Calculator",
              "description": "Free UK tax calculator with official HMRC rates 2025-2026. Calculate PAYE, self-employment tax, National Insurance, and take-home pay instantly.",
              "url": "https://toolhubx.uk",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "GBP"
              },
              "author": {
                "@type": "Organization",
                "name": "ToolHubX",
                "url": "https://toolhubx.uk"
              },
              "featureList": [
                "UK PAYE Tax Calculator",
                "Salary to Take-Home Pay Calculator", 
                "National Insurance Calculator",
                "Tax Code Analysis & Validation",
                "Student Loan Repayment Calculator",
                "Pension Contribution Calculator",
                "Weekly/Monthly/Annual Breakdowns"
              ],
              "screenshot": "https://toolhubx.uk/images/calculator-screenshot.jpg",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
      </head>
      <body
        className={cn(
          inter.variable,
          'font-sans antialiased',
          'min-h-screen text-[hsl(var(--foreground-primary))]'
        )}
      >
        <ErrorBoundary>
          <Layout>{children}</Layout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
