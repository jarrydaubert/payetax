// src/app/fonts.google.ts
/**
 * Google font configuration (next/font).
 *
 * This module must only be used when outbound network is available at build time
 * (e.g. Vercel). It is wired in via a webpack alias in `next.config.ts`.
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
