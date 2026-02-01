// src/app/fonts.ts
/**
 * Font configuration using variable fonts for optimal performance
 *
 * Design System:
 * - Space Grotesk: Headings, logo, display text
 * - Inter: Body text, UI elements
 *
 * Variable fonts = single file per subset (fewer requests, better caching)
 * Fallbacks help reduce CLS during font load
 */

import { Inter, Space_Grotesk } from 'next/font/google';

/** Space Grotesk for headings and display text */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  fallback: ['system-ui', 'sans-serif'],
  // weight omitted = variable font (single file, all weights 400-700)
});

/** Inter for body text and UI elements */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  fallback: [
    'Helvetica Neue',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'system-ui',
    'sans-serif',
  ],
  // weight omitted = variable font (single file, all weights 100-900)
});
