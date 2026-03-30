'use client';

import Link from 'next/link';
import { type ComponentPropsWithoutRef, forwardRef, type MouseEvent, type ReactNode } from 'react';
import { trackSEOAction } from '@/lib/analytics';

type NextLinkProps = ComponentPropsWithoutRef<typeof Link>;

interface TrackedNavigationLinkProps extends Omit<NextLinkProps, 'href' | 'onClick'> {
  children: ReactNode;
  href: NextLinkProps['href'] | string;
  source: string;
  target: string;
  destination?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Small client wrapper for internal navigation links that should emit one
 * privacy-safe analytics event before navigation continues.
 */
export const TrackedNavigationLink = forwardRef<HTMLAnchorElement, TrackedNavigationLinkProps>(
  function TrackedNavigationLink(
    { children, href, source, target, destination, onClick, ...props },
    ref,
  ) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      trackSEOAction('navigation', {
        source,
        target,
        destination,
      });
      onClick?.(event);
    };

    return (
      <Link ref={ref} {...props} href={href as NextLinkProps['href']} onClick={handleClick}>
        {children}
      </Link>
    );
  },
);
