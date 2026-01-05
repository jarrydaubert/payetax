// src/components/molecules/FooterMainLinks.tsx

import { Twitter } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Footer main navigation links molecule
 *
 * Displays primary footer links including internal pages and
 * external links (support, social). Responsive horizontal layout.
 */
export function FooterMainLinks() {
  return (
    <div className={cn('flex flex-wrap items-center justify-center', SPACING.GAP_6)}>
      <Link
        href={'/about' as Route}
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
      >
        About
      </Link>
      <Link
        href={'/blog' as Route}
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
      >
        Blog
      </Link>
      <Link
        href={'/compliance' as Route}
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
      >
        Compliance
      </Link>
      <Link
        href={'/privacy' as Route}
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
      >
        Privacy
      </Link>
      <a
        href='mailto:support@payetax.co.uk'
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
      >
        Contact
      </a>
      <a
        href='https://www.buymeacoffee.com/payetax'
        target='_blank'
        rel='noopener noreferrer'
        className={cn(
          '-mx-3 px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          TYPOGRAPHY.TEXT_SM
        )}
        aria-label='Support PayeTax'
      >
        Support Us ☕
      </a>
      <a
        href='https://x.com/PayeTaxUK'
        target='_blank'
        rel='noopener noreferrer'
        className={cn(
          '-mx-3 flex items-center px-3 py-2 text-muted-foreground transition-colors hover:text-primary',
          SPACING.GAP_1_5,
          TYPOGRAPHY.TEXT_SM
        )}
        aria-label='X: @PayeTaxUK'
      >
        <Twitter className={ICON_SIZES.SIZE_4} />
        @PayeTaxUK
      </a>
    </div>
  );
}
