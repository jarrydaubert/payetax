/**
 * src/components/templates/PageContainer.tsx
 *
 * A standardized page container with consistent styling and layout.
 * Used for content pages (about, privacy, etc.) to maintain design consistency.
 *
 * Spacing architecture:
 * - SimpleNavbar includes a spacer div (h-16 sm:h-20) for fixed navbar clearance
 * - This container adds content padding (py-8 sm:py-12) below that spacer
 * - Set includeNavbarSpacing=true only for pages WITHOUT the navbar spacer
 */

import type React from 'react';
import { cn } from '@/lib/utils';

/** Supported max-width variants */
type MaxWidthVariant = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl';

/** Maps maxWidth prop to Tailwind class (defined outside component for performance) */
const MAX_WIDTH_CLASS: Record<MaxWidthVariant, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

interface PageContainerProps {
  /** Page content */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Maximum width variant for the container */
  maxWidth?: MaxWidthVariant;
  /** Whether to wrap content in the standard bordered surface (default: true) */
  surface?: boolean;
  /** ID for targeting with CSS or accessibility */
  id?: string;
  /**
   * Whether to add extra top padding for navbar clearance.
   * Default: false (assumes SimpleNavbar spacer handles this)
   * Set to true only for pages that don't use SimpleNavbar's spacer
   */
  includeNavbarSpacing?: boolean;
}

/**
 * Standard page container with consistent styling
 * Server Component - no client-side hooks needed
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = '5xl',
  surface = true,
  id,
  includeNavbarSpacing = false,
}) => {
  return (
    <div
      id={id}
      className={cn(
        // Use explicit max-width instead of `container` class for clarity
        'mx-auto w-full px-2 sm:px-4 md:px-6',
        // Padding: extra top only when navbar spacer is absent
        includeNavbarSpacing ? 'pt-24 pb-8 sm:pt-28 sm:pb-12' : 'py-8 sm:py-12',
        MAX_WIDTH_CLASS[maxWidth],
        className,
      )}
    >
      {surface ? (
        <section className='relative overflow-hidden rounded-sm border border-border bg-card'>
          <div className='p-6 md:p-8'>{children}</div>
        </section>
      ) : (
        children
      )}
    </div>
  );
};

export default PageContainer;
