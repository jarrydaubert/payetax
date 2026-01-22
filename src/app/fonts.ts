// src/app/fonts.ts
/**
 * Font configuration for the application
 * Professional typography system optimized for performance and Core Web Vitals
 *
 * Design System:
 * - Space Grotesk: Headings, logo, display text (600-700 weight)
 * - Inter: Body text, UI elements (300-600 weight)
 */

import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Space Grotesk for headings and display text
 * Modern geometric sans-serif with personality
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Inter font with optimized loading and subset configuration
 * Professional, highly readable font that works excellent across all devices
 * Improves CLS (Cumulative Layout Shift) and LCP (Largest Contentful Paint)
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    'Helvetica Neue',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'system-ui',
    'sans-serif',
  ],
  weight: ['300', '400', '500', '600', '700'],
});

/**
 * Legacy Roboto Flex export for backwards compatibility
 * @deprecated Use `inter` instead
 */
export const robotoFlex = inter;
