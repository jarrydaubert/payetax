// src/components/molecules/NavbarLinks.tsx
'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface NavLink {
  readonly href: Route | (string & {});
  readonly label: string;
}

interface NavbarLinksProps {
  links: readonly NavLink[];
  pathname: string;
  onCalculatorClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

/**
 * Desktop navigation links molecule
 *
 * Displays horizontal navigation links with active state indicator.
 * Uses CSS transitions for smooth indicator animation (no framer-motion for better LCP).
 *
 * @param links - Array of navigation links
 * @param pathname - Current pathname for active state
 * @param onCalculatorClick - Optional handler for calculator link
 * @param className - Additional CSS classes
 */
export function NavbarLinks({ links, pathname, onCalculatorClick, className }: NavbarLinksProps) {
  return (
    <div className={cn('hidden items-center md:flex', SPACING.GAP_8, className)}>
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.label === 'Calculator' && pathname === '/') ||
          (link.label === 'TaxInsights' && pathname.startsWith('/blog'));

        return (
          <Link
            key={link.href as string}
            href={link.href as Route}
            onClick={link.label === 'Calculator' ? onCalculatorClick : undefined}
            className={cn(
              'relative flex min-h-[44px] items-center px-4 py-2.5 font-medium transition-colors',
              TYPOGRAPHY.TEXT_SM,
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            data-testid={link.label === 'TaxInsights' ? 'nav-blog' : undefined}
          >
            {link.label}
            {/* Active indicator - CSS instead of framer-motion for better LCP */}
            <div
              className={cn(
                'absolute right-0 bottom-0 left-0 h-0.5 bg-primary transition-transform duration-200',
                isActive ? 'scale-x-100' : 'scale-x-0'
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
