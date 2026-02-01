'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TrackedCTAProps {
  /**
   * Destination URL - internal route or external URL
   */
  href: Route | string;
  /**
   * CTA label content
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: CSSProperties;
  /**
   * Whether to show the arrow icon (default: true)
   */
  icon?: boolean;
  /**
   * Custom icon to display instead of default arrow
   */
  iconElement?: ReactNode;
  /**
   * Additional classes for the icon
   */
  iconClassName?: string;
  /**
   * Click handler for analytics or custom behavior
   */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /**
   * Whether to prefetch the linked page (Next.js Link prop)
   */
  prefetch?: boolean;
}

/**
 * Tracked CTA link component
 *
 * A styled link for call-to-action buttons with optional arrow icon.
 * Analytics tracking should be handled by the parent via onClick prop.
 *
 * @example
 * ```tsx
 * <TrackedCTA
 *   href="/calculator"
 *   className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
 *   onClick={() => trackEvent('cta_click', { label: 'Calculate' })}
 * >
 *   Calculate Your Tax
 * </TrackedCTA>
 * ```
 */
export function TrackedCTA({
  href,
  children,
  className,
  style,
  icon = true,
  iconElement,
  iconClassName,
  onClick,
  prefetch,
}: TrackedCTAProps) {
  const defaultIcon = (
    <ArrowRight
      className={cn('size-[18px] transition-transform group-hover:translate-x-1', iconClassName)}
      aria-hidden='true'
    />
  );

  return (
    <Link
      // Cast required for Next.js typedRoutes - accepts both internal routes and external URLs
      href={href as Route}
      // Add 'group' class for group-hover to work on icon
      className={cn('group', className)}
      style={style}
      onClick={onClick}
      prefetch={prefetch}
    >
      {children}
      {icon && (iconElement ?? defaultIcon)}
    </Link>
  );
}
