// src/components/atoms/TrackedAffiliateLink.tsx
'use client';

import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { ICON_SIZES } from '@/constants/designTokens';
import { type Competitor, getCompetitorUrl, hasAffiliateProgram } from '@/data/competitors';
import { trackAffiliateClick } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface TrackedAffiliateLinkProps {
  competitor: Competitor;
  pageType: 'alternative' | 'vs' | 'hub';
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

/**
 * Tracked link component for competitor/affiliate links.
 * Automatically uses affiliate URL if available and tracks clicks.
 */
export function TrackedAffiliateLink({
  competitor,
  pageType,
  children,
  className,
  showIcon = true,
}: TrackedAffiliateLinkProps) {
  const url = getCompetitorUrl(competitor);
  const isAffiliate = hasAffiliateProgram(competitor);

  const handleClick = () => {
    trackAffiliateClick(competitor.slug, competitor.name, competitor.affiliateProgram, pageType);
  };

  return (
    <a
      href={url}
      target='_blank'
      rel={isAffiliate ? 'noopener sponsored' : 'noopener noreferrer'}
      onClick={handleClick}
      className={className}
    >
      {children}
      {showIcon && <ExternalLink className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />}
    </a>
  );
}
