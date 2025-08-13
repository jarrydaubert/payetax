// src/app/fonts.ts
/**
 * Font configuration for the application
 * Optimized for performance and Core Web Vitals
 */

import { Roboto_Flex } from 'next/font/google';

/**
 * Roboto Flex with optimized loading and subset configuration
 * Improves CLS (Cumulative Layout Shift) and LCP (Largest Contentful Paint)
 */
export const robotoFlex = Roboto_Flex({
  // Only load the Latin subset for better performance
  subsets: ['latin'],

  // Variable font support
  variable: '--font-roboto-flex',

  // Swap display strategy improves perceived performance
  display: 'swap',

  // Optimize with system fonts as fallbacks
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});
