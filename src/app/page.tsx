// src/app/page.tsx

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StructuredData } from '@/components/ui/StructuredData';
import { Spinner } from '@/components/ui/spinner';
import { TYPOGRAPHY } from '@/constants/designTokens';
import { generateMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';

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
  title: 'UK PAYE Tax Calculator 2025 | HMRC Rates',
  description:
    'Calculate UK take-home pay with our free PAYE calculator using official HMRC rates for 2025-26. Scottish rates, student loans, and pensions included.',
  keywords:
    'UK tax calculator 2025, PAYE calculator, income tax calculator, income tax rates, income tax bands, take home pay calculator, salary calculator, Scottish tax rates 2025, student loan calculator UK, pension tax relief calculator, marriage allowance calculator, national insurance, capital gains tax, inheritance tax, effective tax rates, higher rate taxpayers, tax free allowance, tax band, tax reliefs, tax return, HMRC, revenue and customs',
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
      <Suspense
        fallback={
          <div className='flex min-h-[400px] items-center justify-center p-8'>
            <div className='flex flex-col items-center gap-3'>
              <Spinner className='size-8' />
              <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                Loading calculator...
              </p>
            </div>
          </div>
        }
      >
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
