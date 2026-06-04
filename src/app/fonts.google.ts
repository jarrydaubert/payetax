// src/app/fonts.google.ts
/**
 * Google font configuration (next/font).
 *
 * Legacy reference module.
 * Active font gating now lives in `src/app/fonts.ts` so behavior is consistent
 * across webpack and Turbopack builds.
 */

import { IBM_Plex_Mono, Newsreader, Public_Sans } from 'next/font/google';
import type { FontLike } from './fonts';

/** Newsreader for display and editorial headings */
export const newsreader: FontLike = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  weight: ['400', '500', '600', '700'],
});

/** Public Sans for body text and interface labels */
export const publicSans: FontLike = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'system-ui',
    'sans-serif',
  ],
  weight: ['400', '500', '600', '700'],
});

/** IBM Plex Mono for figures, money, and code */
export const ibmPlexMono: FontLike = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  fallback: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
  weight: ['400', '500', '600', '700'],
});
