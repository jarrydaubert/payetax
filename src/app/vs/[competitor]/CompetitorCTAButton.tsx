'use client';

import { TrackedAffiliateLink } from '@/components/atoms/TrackedAffiliateLink';
import { Button } from '@/components/ui/button';
import type { Competitor } from '@/data/competitors';

interface CompetitorCTAButtonProps {
  competitor: Competitor;
}

export function CompetitorCTAButton({ competitor }: CompetitorCTAButtonProps) {
  return (
    <>
      <Button asChild variant='outline' className='w-full'>
        <TrackedAffiliateLink competitor={competitor} pageType='vs'>
          Visit {competitor.shortName}
        </TrackedAffiliateLink>
      </Button>
      <p className='mt-2 text-center text-muted-foreground text-xs'>
        External link. May be an affiliate link.
      </p>
    </>
  );
}
