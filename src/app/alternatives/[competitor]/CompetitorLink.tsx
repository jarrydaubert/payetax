'use client';

import { TrackedAffiliateLink } from '@/components/atoms/TrackedAffiliateLink';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor } from '@/data/competitors';
import { cn } from '@/lib/utils';

interface CompetitorLinkProps {
  competitor: Competitor;
}

export function CompetitorLink({ competitor }: CompetitorLinkProps) {
  return (
    <div className={SPACING.MT_6}>
      <TrackedAffiliateLink
        competitor={competitor}
        pageType='alternative'
        className={cn(
          'inline-flex items-center text-muted-foreground transition-colors hover:text-foreground',
          TYPOGRAPHY.TEXT_SM,
          SPACING.GAP_1,
        )}
      >
        Visit {competitor.shortName}
      </TrackedAffiliateLink>
      <p className='mt-1 text-muted-foreground text-xs'>External link. May be an affiliate link.</p>
    </div>
  );
}
