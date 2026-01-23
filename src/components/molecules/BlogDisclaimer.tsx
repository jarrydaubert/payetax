// src/components/molecules/BlogDisclaimer.tsx
import { AlertTriangle } from 'lucide-react';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface BlogDisclaimerProps {
  className?: string;
}

/**
 * Financial disclaimer component for blog posts
 * Required for HMRC compliance - must appear on all tax-related content
 */
export function BlogDisclaimer({ className }: BlogDisclaimerProps) {
  return (
    <aside
      className={cn(
        'rounded-lg border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20',
        className
      )}
      aria-label='Important disclaimer'
    >
      <div className='flex gap-3'>
        <AlertTriangle
          className={cn(ICON_SIZES.SIZE_5, 'shrink-0 text-amber-600 dark:text-amber-400')}
          aria-hidden='true'
        />
        <div className={cn('space-y-2', TYPOGRAPHY.TEXT_SM)}>
          <p className='font-medium text-amber-800 dark:text-amber-200'>
            Important: This is for informational purposes only
          </p>
          <p className='text-amber-700/90 dark:text-amber-300/80'>
            This content provides general guidance and is not financial, tax, or legal advice. Tax
            rules change frequently and individual circumstances vary. Always verify calculations
            against{' '}
            <a
              href='https://www.gov.uk/government/organisations/hm-revenue-customs'
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium underline hover:no-underline'
            >
              official HMRC sources
            </a>{' '}
            and consult a qualified professional for advice on your specific situation.
          </p>
        </div>
      </div>
    </aside>
  );
}
