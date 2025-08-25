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
        // Visually hidden by default
        'sr-only',
        // Becomes visible and positioned when focused
        'z-50 focus:not-sr-only focus:absolute focus:top-0 focus:left-0',
        // Styling when focused
        'focus:bg-white focus:p-3 focus:text-blue-600 dark:focus:bg-gray-800 dark:focus:text-blue-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        // Transition for smooth appearance
        'transition-colors duration-200'
      )}
      aria-label='Skip to main content'
    >
      Skip to main content
    </Link>
  );
};

export default SkipToContent;
