// src/components/atoms/TrackedCTA.tsx
'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

interface TrackedCTAProps {
  href: Route | (string & {});
  children: ReactNode;
  trackingLabel: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: boolean;
}

/**
 * Client-side CTA button with analytics tracking
 * Used to wrap hero CTAs while keeping the parent server-rendered
 */
export function TrackedCTA({
  href,
  children,
  trackingLabel,
  className,
  style,
  icon = true,
}: TrackedCTAProps) {
  const handleClick = () => {
    trackEvent({
      action: 'cta_clicked',
      category: 'engagement',
      label: trackingLabel,
    });
  };

  return (
    <Link href={href as Route} className={className} style={style} onClick={handleClick}>
      {children}
      {icon && (
        <ArrowRight className='h-[18px] w-[18px] transition-transform group-hover:translate-x-1' />
      )}
    </Link>
  );
}
