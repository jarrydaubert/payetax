// src/app/fonts.google.ts
/**
 * Google font configuration (next/font).
 *
 * Legacy reference module.
 * Active font gating now lives in `src/app/fonts.ts` so behavior is consistent
 * across webpack and Turbopack builds.
 */

import { Inter, Space_Grotesk } from 'next/font/google';
import type { FontLike } from './fonts';

/** Space Grotesk for headings and display text */
export const spaceGrotesk: FontLike = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  fallback: ['system-ui', 'sans-serif'],
  // weight omitted = variable font (single file, all weights 400-700)
});

/** Inter for body text and UI elements */
export const inter: FontLike = Inter({
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
