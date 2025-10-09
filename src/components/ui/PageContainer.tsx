/**
 * src/components/ui/PageContainer.tsx
 *
 * A standardized page container with consistent styling and layout
 * Used across about, privacy, and feedback pages to maintain design consistency
 * FIXED: Now includes proper navbar spacing to prevent content overlap
 */

'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the PageContainer component
 */
interface PageContainerProps {
  /** Page content */
  children: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
  /** Maximum width variant for the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl';
  /** Whether to use glass styling (default: true) */
  glass?: boolean;
  /** ID for targeting with CSS or accessibility */
  id?: string;
  /** Whether to add extra top padding for pages with headers (default: true) */
  includeNavbarSpacing?: boolean;
}

/**
 * Standard page container with consistent styling
 * Used across about, privacy, and feedback pages to maintain design consistency
 * NOW INCLUDES: Proper navbar spacing to prevent content going behind fixed navbar
 *
 * @param props Component props
 * @returns Standardized page container component
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  maxWidth = '5xl',
  glass = true,
  id,
  includeNavbarSpacing = true,
}) => {
  /**
   * Maps the maxWidth prop to the corresponding Tailwind class
   * @returns Tailwind max-width class
   */
  const getMaxWidthClass = (): string => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case '4xl':
        return 'max-w-4xl';
      case '5xl':
        return 'max-w-5xl';
      case '6xl':
        return 'max-w-6xl';
      case '7xl':
        return 'max-w-7xl';
      default:
        return 'max-w-5xl';
    }
  };

  return (
    <div
      id={id}
      className={cn(
        'container mx-auto px-2 sm:px-4 md:px-6',
        // FIXED: Add proper navbar spacing to prevent overlap
        includeNavbarSpacing
          ? 'pt-24 pb-8 sm:pt-28 sm:pb-12' // Top padding for navbar clearance
          : 'py-8 sm:py-12', // Original padding for non-navbar pages
        getMaxWidthClass(),
        className
      )}
    >
      {glass ? (
        <section className='glass-card relative overflow-hidden'>
          <div className='glass-card-inner'>{children}</div>
        </section>
      ) : (
        children
      )}
    </div>
  );
};

export default PageContainer;
