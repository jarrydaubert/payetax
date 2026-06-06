import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
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
        'rounded-lg border border-warning/30 bg-warning/10 p-4',
        'text-base',
        'md:text-lg',
        className,
      )}
      role='note'
      aria-labelledby={headingId}
    >
      <div className='flex gap-3'>
        <AlertTriangle className={cn('size-5', 'shrink-0 text-warning')} aria-hidden='true' />
        <div className='space-y-2'>
          <p id={headingId} className='font-medium text-foreground'>
            Important: This is for informational purposes only
          </p>
          <p className='text-muted-foreground'>
            This content provides general guidance and is not tax or legal advice. Tax rules change
            frequently and individual circumstances vary. Always verify calculations against{' '}
            <a
              href={HMRC_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-warning underline decoration-warning/70 underline-offset-2 transition-colors hover:text-warning/90 hover:decoration-warning'
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
