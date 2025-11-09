// src/components/molecules/Footer.tsx

'use client';

import { FooterBrand } from '@/components/molecules/FooterBrand';
import { FooterMainLinks } from '@/components/molecules/FooterMainLinks';
import { FooterResourceLinks } from '@/components/molecules/FooterResourceLinks';
import { SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Footer molecule component (Refactored to use sub-molecules)
 *
 * IMPORTANT: This is a MOLECULE - it does NOT own the <footer> semantic tag.
 * The parent TEMPLATE (Layout.tsx) must wrap this in <footer></footer>.
 *
 * Composition:
 * - FooterBrand: Brand name and copyright
 * - FooterResourceLinks: External resources (HMRC, guides)
 * - FooterMainLinks: Primary nav links, social, theme toggle
 *
 * This component orchestrates layout only.
 */
interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  // Fix hydration mismatch by using static year
  const currentYear = 2025;

  return (
    <div
      className={cn('mt-auto min-h-[140px] md:min-h-[120px]', className)}
      style={{ contain: 'layout' }}
    >
      {/* Subtle separator line */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

      {/* Main footer content */}
      <div className='glass py-8'>
        <div className='container mx-auto max-w-7xl px-2 sm:px-4'>
          <div className='flex flex-col items-center gap-6 text-center md:text-left'>
            {/* Top row: Brand and resources - Uses sub-molecules */}
            <div
              className={cn(
                'flex w-full flex-col items-center justify-between md:flex-row',
                SPACING.GAP_4
              )}
            >
              <FooterBrand currentYear={currentYear} />
              <FooterResourceLinks />
            </div>

            {/* Quick links and theme toggle - Uses sub-molecule */}
            <FooterMainLinks />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
