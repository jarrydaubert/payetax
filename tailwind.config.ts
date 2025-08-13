/**
 * Tailwind CSS v4 Configuration - MINIMAL SETUP
 * In v4, most configuration goes in @theme blocks in CSS files, not here
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class', // Enables .dark class for manual theme switching
  // Everything else is now in globals.css @theme blocks
};

export default config;
