/**
 * PostCSS Configuration for Tailwind CSS v4
 * Uses ES modules format (.mjs) as recommended for v4
 *
 * CRITICAL: Must use @tailwindcss/postcss plugin, not tailwindcss directly
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {}, // Adds vendor prefixes for better browser support (logical properties, etc.)
  },
};
