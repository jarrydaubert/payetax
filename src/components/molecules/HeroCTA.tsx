// src/components/molecules/HeroCTA.tsx
'use client';

import type { Route } from 'next';
import type { ReactNode } from 'react';
import { TrackedCTA } from '@/components/atoms/TrackedCTA';
import { trackEvent } from '@/lib/analytics';

interface HeroCTAProps {
  href: Route | (string & {});
  children: ReactNode;
  trackingLabel: string;
  className?: string;
  icon?: boolean;
}

/**
 * Hero CTA molecule - wraps TrackedCTA atom with analytics tracking
 * Keeps atom pure while handling business logic at molecule level
 */
export function HeroCTA({ href, children, trackingLabel, className, icon = true }: HeroCTAProps) {
  const handleClick = () => {
    trackEvent({
      action: 'cta_clicked',
      category: 'engagement',
      label: trackingLabel,
    });
  };

  return (
    <TrackedCTA href={href} className={className} icon={icon} onClick={handleClick}>
      {children}
    </TrackedCTA>
  );
}
