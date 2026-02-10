// src/app/fonts.ts
/**
 * Font configuration.
 *
 * Default: system fonts (no network dependency).
 * Production (Vercel) swaps this module to `fonts.google.ts` via `next.config.ts`
 * so we get the real Google font files when outbound network is available.
 */

export type FontLike = {
  className: string;
  variable: string;
  style?: { fontFamily: string };
};

// The CSS custom properties are defined in `src/app/globals.css` so Tailwind's
// `font-sans` / `font-display` keep working even when we don't use next/font.
const systemFont: FontLike = { className: '', variable: '' };

export const spaceGrotesk: FontLike = systemFont;
export const inter: FontLike = systemFont;
