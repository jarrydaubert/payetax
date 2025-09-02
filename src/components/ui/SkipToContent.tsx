/**
 * src/components/ui/SkipToContent.tsx
 *
 * An accessibility component that allows keyboard users to skip
 * navigation elements and go directly to the main content of the page.
 * The link is visually hidden but becomes visible on focus.
 */

import Link from 'next/link';
import type React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipToContent component provides an accessibility feature that allows
 * keyboard users to skip navigation and go directly to the main content.
 * The link is visually hidden until it receives focus.
 *
 * This component should be placed at the very beginning of the page,
 * before any navigation or header components.
 *
 * @returns Skip to content link component
 */
export const SkipToContent: React.FC = (): React.ReactElement => {
  return (
    <Link
      href='#calculator'
      className={cn(
        // Completely hidden by default
        '-top-96 -left-96 absolute opacity-0',
        // Becomes visible and positioned when focused
        'z-50 focus:top-4 focus:left-4 focus:opacity-100',
        // Professional styling when focused with brand colors
        'focus:bg-gradient-to-r focus:from-purple-600 focus:to-cyan-600',
        'focus:rounded-lg focus:px-4 focus:py-2 focus:font-medium focus:text-sm focus:text-white',
        'focus:shadow-lg focus:shadow-purple-500/25',
        // Remove default outline and add custom focus ring
        'focus:outline-none focus:ring-2 focus:ring-white/20',
        // Smooth transitions
        'transition-all duration-200 ease-out'
      )}
      aria-label='Skip to calculator section'
    >
      Skip to Calculator
    </Link>
  );
};

export default SkipToContent;
