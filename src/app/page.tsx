// src/app/page.tsx

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ServerHero from '@/components/molecules/ServerHero';
import LandingPageSections, { faqs } from '@/components/organisms/LandingPageSections';
import { StructuredData } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { generateMetadata } from '@/lib/metadata';

// Keep the hero server-rendered for LCP, but render the calculator shell immediately
// so /#tax-calculator works natively on cold loads.
const HomePageContent = dynamic(() => import('@/components/pages/HomePageContent'), {
  loading: () => (
    <output className='flex min-h-96 items-center justify-center p-8' aria-live='polite'>
      <div className='flex flex-col items-center gap-3'>
        <div className='size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
        <p className='text-muted-foreground text-sm'>Loading calculator...</p>
      </div>
    </output>
  ),
});

/**
 * Enhanced metadata for the homepage with tax calculator
 */
export const metadata: Metadata = generateMetadata({
  title: `UK PAYE Tax Calculator ${CURRENT_TAX_YEAR_DISPLAY_SHORT} | HMRC Rates`,
  description: `Calculate UK take-home pay with our free PAYE calculator using official HMRC rates for ${CURRENT_TAX_YEAR_DISPLAY_SHORT}. Scottish rates, student loans, and pensions included.`,
  pathname: '/',
});

/**
 * Home page component with enhanced SEO
 * Hero stays server-rendered for LCP while the calculator anchor shell is present
 * in the initial HTML for simpler navigation and discoverability.
 */
export default function HomePage() {
  return (
    <>
      {/* Structured data for SEO and AEO (rendered server-side) */}
      <StructuredData type='website' />
      <StructuredData type='financialservice' />
      <StructuredData type='calculator' />
      <StructuredData type='dataset' />
      <StructuredData type='faq' faqs={faqs} />

      {/* Server-rendered hero for instant LCP - H1 appears immediately */}
      <ServerHero />

      {/* Calculator shell is always in the document so hash navigation works on first load */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for homepage anchor navigation */}
      <section
        id='tax-calculator'
        data-testid='homepage-calculator'
        className='relative z-[1] scroll-mt-20 bg-background sm:scroll-mt-24'
      >
        <HomePageContent />
      </section>

      {/* Landing page sections below the calculator */}
      <LandingPageSections />
    </>
  );
}
