// src/app/page.tsx

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StructuredData } from '@/components/ui/StructuredData';
import { generateMetadata } from '@/lib/metadata';

// Import the client-side HomePageContent component
// We'll use Suspense to handle the loading state
const HomePageClientWrapper = () => {
  // Using an inline dynamic import with Suspense
  // This approach avoids SSR issues with client components
  const HomePageContent = require('@/components/pages/HomePageContent').default;
  return <HomePageContent />;
};

/**
 * Enhanced metadata for the homepage with tax calculator
 */
export const metadata: Metadata = generateMetadata({
  title: 'UK PAYE Tax Calculator 2025 | Free Take-Home Pay Calculator with HMRC Rates',
  description:
    'Calculate your exact UK take-home pay with our free PAYE calculator using official HMRC rates for 2025-2026. Includes Scottish tax rates, student loans, pension contributions and marriage allowance.',
  keywords:
    'UK tax calculator 2025, PAYE calculator, income tax calculator, take home pay calculator, salary calculator, Scottish tax rates 2025, student loan calculator UK, pension tax relief calculator, marriage allowance calculator',
  pathname: '/',
});

/**
 * Home page component with enhanced SEO
 * All structured data now consolidated in StructuredData component
 */
export default function HomePage() {
  return (
    <>
      {/* Enhanced structured data for Answer Engine Optimization (AEO) */}
      <StructuredData type='organization' />
      <StructuredData type='website' />
      <StructuredData type='financialservice' />

      {/* AEO-optimized schema markup for AI search engines */}
      <StructuredData type='calculator' />
      <StructuredData type='howto' />
      <StructuredData type='dataset' />

      {/* Main content with Suspense for client components */}
      <Suspense fallback={<div className='p-8 text-center'>Loading calculator...</div>}>
        <HomePageClientWrapper />
      </Suspense>

      {/* Breadcrumb structured data */}
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[{ name: 'Home', url: 'https://payetax.co.uk/' }]}
      />
    </>
  );
}
