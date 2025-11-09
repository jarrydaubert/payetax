// src/components/molecules/FooterResourceLinks.tsx
'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Footer helpful resources links molecule
 *
 * Displays external resources (HMRC, Gov.UK) and internal guides.
 * Mix of internal Next.js Links and external anchor tags.
 */
export function FooterResourceLinks() {
  return (
    <div className={SPACING.SPACE_Y_2}>
      <p
        className={cn(
          'font-medium text-muted-foreground uppercase tracking-wide',
          TYPOGRAPHY.TEXT_XS
        )}
      >
        Helpful Resources
      </p>
      <div
        className={cn('flex flex-wrap items-center justify-center md:justify-end', SPACING.GAP_4)}
      >
        <a
          href='https://www.gov.uk/topic/personal-tax/income-tax'
          target='_blank'
          rel='noopener noreferrer'
          className={cn(
            'text-muted-foreground transition-colors hover:text-primary',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          HMRC / Gov.UK
        </a>
        <Link
          href={'/blog/uk-tax-calculator-2025-complete-guide' as Route}
          className={cn(
            'text-muted-foreground transition-colors hover:text-primary',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          Calculator Guide
        </Link>
        <Link
          href={'/blog/how-much-tax-will-i-pay-uk-2025' as Route}
          className={cn(
            'text-muted-foreground transition-colors hover:text-primary',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          Tax Examples
        </Link>
        <a
          href='https://businessdebtline.org/'
          target='_blank'
          rel='noopener noreferrer'
          className={cn(
            'text-muted-foreground transition-colors hover:text-primary',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          Business Debtline
        </a>
        <a
          href='https://www.moneyhelper.org.uk'
          target='_blank'
          rel='noopener noreferrer'
          className={cn(
            'text-muted-foreground transition-colors hover:text-primary',
            TYPOGRAPHY.TEXT_SM
          )}
        >
          Money Helper
        </a>
      </div>
    </div>
  );
}
