// src/app/fonts.ts
/**
 * Font configuration for the application
 * Professional typography system optimized for performance and Core Web Vitals
 */

import { Inter } from 'next/font/google';

/**
 * Inter font with optimized loading and subset configuration
 * Professional, highly readable font that works excellent across all devices
 * Improves CLS (Cumulative Layout Shift) and LCP (Largest Contentful Paint)
 */
export const inter = Inter({
  // Only load the Latin subset for better performance
  subsets: ['latin'],

  // Variable font support for optimal weight flexibility
  variable: '--font-inter',

  // Swap display strategy improves perceived performance
  display: 'swap',

  // Optimize with system fonts as fallbacks
  fallback: [
    'Helvetica Neue',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'system-ui',
    'sans-serif',
  ],

  // Optimize font weights for better performance
  weight: ['300', '400', '500', '600', '700'],
});

/**
 * Legacy Roboto Flex export for backwards compatibility
 * @deprecated Use `inter` instead
 */
export const robotoFlex = inter;
