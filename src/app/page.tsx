// src/app/page.tsx

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { DeferredContent } from '@/components/molecules/DeferredContent';
import ServerHero from '@/components/molecules/ServerHero';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Spinner } from '@/components/ui/spinner';
import { TYPOGRAPHY } from '@/constants/designTokens';
import { generateMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';

// Dynamic import for interactive content - hero is server-rendered for fast LCP
const HomePageContent = dynamic(() => import('@/components/pages/HomePageContent'));

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
 * Hero is server-rendered for instant LCP (<2.5s target)
 * Calculator and interactive content loaded via dynamic import
 */
export default function HomePage() {
  return (
    <>
      {/* Structured data for SEO and AEO (rendered server-side) */}
      <StructuredData type='organization' />
      <StructuredData type='website' />
      <StructuredData type='financialservice' />
      <StructuredData type='calculator' />
      <StructuredData type='howto' />
      <StructuredData type='dataset' />

      {/* Server-rendered hero for instant LCP - H1 appears immediately */}
      <ServerHero />

      {/* Interactive content - deferred until near viewport or 3s timeout for better mobile LCP */}
      {/* Minimal fallback to keep H1 as LCP element */}
      <DeferredContent
        timeout={3000}
        rootMargin='400px'
        fallback={<div className='min-h-[200px]' aria-hidden='true' />}
      >
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
          <HomePageContent />
        </Suspense>
      </DeferredContent>
    </>
  );
}
