// src/app/fonts.ts
/**
 * Font configuration.
 *
 * Default: system fonts (no network dependency).
 * On Vercel (or when explicitly enabled), use `next/font/google`.
 *
 * This file intentionally owns font gating to avoid relying on bundler-specific
 * alias behavior (webpack vs Turbopack).
 */

import { Inter, Space_Grotesk } from 'next/font/google';

export type FontLike = {
  className: string;
  variable: string;
  style?: { fontFamily: string };
};

// The CSS custom properties are defined in `src/app/globals.css` so Tailwind's
// `font-sans` / `font-display` keep working even when we don't use next/font.
const systemFont: FontLike = { className: '', variable: '' };

const isTruthy = (value: string | undefined) => value === '1' || value === 'true';

const isVercelBuild =
  isTruthy(process.env.VERCEL) ||
  Boolean(process.env.VERCEL_ENV) ||
  Boolean(process.env.VERCEL_URL);

const useGoogleFonts =
  !isTruthy(process.env.PAYETAX_DISABLE_GOOGLE_FONTS) &&
  (isVercelBuild || isTruthy(process.env.PAYETAX_ENABLE_GOOGLE_FONTS));

/** Space Grotesk for headings and display text */
export const spaceGrotesk: FontLike = useGoogleFonts
  ? Space_Grotesk({
      subsets: ['latin'],
      variable: '--font-space-grotesk',
      fallback: ['system-ui', 'sans-serif'],
      // weight omitted = variable font (single file, all weights 400-700)
    })
  : systemFont;

/** Inter for body text and UI elements */
export const inter: FontLike = useGoogleFonts
  ? Inter({
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
    })
  : systemFont;
