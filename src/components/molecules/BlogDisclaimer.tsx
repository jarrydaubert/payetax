import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/** Official HMRC organization page - stable GOV.UK URL */
const HMRC_URL = 'https://www.gov.uk/government/organisations/hm-revenue-customs';

interface BlogDisclaimerProps {
  className?: string;
}

/**
 * Financial disclaimer component for blog posts
 *
 * Risk control: Include on all tax-related content per our editorial policy.
 * This is an internal requirement, not an HMRC mandate.
 */
export function BlogDisclaimer({ className }: BlogDisclaimerProps) {
  const headingId = useId();

  return (
    <aside
      className={cn(
        'rounded-lg border border-amber-200/50 bg-amber-50/50 p-4',
        'dark:border-amber-900/30 dark:bg-amber-950/20',
        className,
      )}
      role='note'
      aria-labelledby={headingId}
    >
      <div className='flex gap-3'>
        <AlertTriangle
          className={cn(ICON_SIZES.SIZE_5, 'shrink-0 text-amber-600 dark:text-amber-400')}
          aria-hidden='true'
        />
        <div className={cn('space-y-2', TYPOGRAPHY.TEXT_SM)}>
          <p id={headingId} className='font-medium text-amber-800 dark:text-amber-200'>
            Important: This is for informational purposes only
          </p>
          <p className='text-amber-700 dark:text-amber-300/90'>
            This content provides general guidance and is not tax or legal advice. Tax rules change
            frequently and individual circumstances vary. Always verify calculations against{' '}
            <a
              href={HMRC_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium underline decoration-amber-600/50 underline-offset-2 transition-colors hover:text-amber-900 hover:decoration-amber-600 dark:decoration-amber-400/50 dark:hover:text-amber-100 dark:hover:decoration-amber-400'
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
