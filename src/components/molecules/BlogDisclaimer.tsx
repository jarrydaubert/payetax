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
        'rounded-lg border border-amber-200/70 bg-amber-50 p-4',
        'dark:border-amber-400/30 dark:bg-amber-950/40',
        TYPOGRAPHY.TEXT_BASE,
        'md:text-lg',
        className,
      )}
      role='note'
      aria-labelledby={headingId}
    >
      <div className='flex gap-3'>
        <AlertTriangle
          className={cn(ICON_SIZES.SIZE_5, 'shrink-0 text-amber-700 dark:text-amber-300')}
          aria-hidden='true'
        />
        <div className='space-y-2'>
          <p id={headingId} className='font-medium text-amber-950 dark:text-amber-100'>
            Important: This is for informational purposes only
          </p>
          <p className='text-amber-900 dark:text-amber-200/90'>
            This content provides general guidance and is not tax or legal advice. Tax rules change
            frequently and individual circumstances vary. Always verify calculations against{' '}
            <a
              href={HMRC_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium underline decoration-amber-700/70 underline-offset-2 transition-colors hover:text-amber-950 hover:decoration-amber-700 dark:decoration-amber-300/70 dark:hover:text-amber-50 dark:hover:decoration-amber-300'
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
