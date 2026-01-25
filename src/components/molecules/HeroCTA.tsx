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
  const handleClick = (e: React.MouseEvent) => {
    trackEvent({
      action: 'cta_clicked',
      category: 'engagement',
      label: trackingLabel,
    });

    // Handle anchor links with smooth scroll
    if (typeof href === 'string' && href.startsWith('#')) {
      e.preventDefault();
      const elementId = href.slice(1);

      const scrollToElement = () => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      // Try immediately
      if (!scrollToElement()) {
        // Element not in DOM yet (lazy-loaded) - scroll down to trigger load, then retry
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

        // Retry after content loads
        const retryInterval = setInterval(() => {
          if (scrollToElement()) {
            clearInterval(retryInterval);
          }
        }, 100);

        // Stop trying after 2 seconds
        setTimeout(() => clearInterval(retryInterval), 2000);
      }
    }
  };

  return (
    <TrackedCTA href={href} className={className} icon={icon} onClick={handleClick}>
      {children}
    </TrackedCTA>
  );
}
