// src/app/page.tsx

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { DeferredContent } from '@/components/molecules/DeferredContent';
import ServerHero from '@/components/molecules/ServerHero';
import LandingPageSections, { faqs } from '@/components/organisms/LandingPageSections';
import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata } from '@/lib/metadata';

// Dynamic import for interactive content - hero is server-rendered for fast LCP
// Using loading option for predictable fallback behavior (vs relying on outer Suspense)
const HomePageContent = dynamic(() => import('@/components/pages/HomePageContent'), {
  loading: () => (
    <div
      className='flex min-h-[400px] items-center justify-center p-8'
      role='status'
      aria-live='polite'
    >
      <div className='flex flex-col items-center gap-3'>
        <div className='size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
        <p className='text-muted-foreground text-sm'>Loading calculator...</p>
      </div>
    </div>
  ),
});

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
      <StructuredData type='faq' faqs={faqs} />

      {/* Server-rendered hero for instant LCP - H1 appears immediately */}
      <ServerHero />

      {/* Interactive content - deferred until user scrolls */}
      {/* No timeout, small margin = calculator loads only on scroll, H1 is LCP */}
      <DeferredContent
        timeout={0}
        rootMargin='100px'
        forceRenderOnHash='#tax-calculator'
        fallback={<div className='min-h-[100px]' aria-hidden='true' />}
      >
        <HomePageContent />
      </DeferredContent>

      {/* Landing page sections: Features, How It Works, FAQ, Final CTA */}
      <LandingPageSections />
    </>
  );
}
