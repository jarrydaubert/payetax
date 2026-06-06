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
// `font-sans` / `font-display` / `font-mono` keep working even when we don't
// use next/font.
const systemFont: FontLike = { className: '', variable: '' };

export const newsreader: FontLike = systemFont;
export const publicSans: FontLike = systemFont;
export const ibmPlexMono: FontLike = systemFont;
