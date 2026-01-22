import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      /**
       * Background gradient utilities - PAYTAX-96
       * Standardized gradient patterns extracted from 33+ unique instances
       * Use these instead of inline gradient classes for consistency
       */
      backgroundImage: {
        // Brand gradients (24 uses across components)
        'brand-text':
          'linear-gradient(to right, var(--color-brand-gradient-start), var(--color-brand-gradient-end))',
        'brand-emphasis':
          'linear-gradient(to right, var(--color-brand-gradient-start), var(--color-brand-accent), var(--color-brand-gradient-end))',
        'brand-surface':
          'linear-gradient(to bottom right, var(--color-brand-gradient-start), var(--color-brand-gradient-end))',

        // Accent backgrounds (18 uses - subtle tinted sections)
        'accent-subtle':
          'linear-gradient(to bottom right, hsl(var(--color-primary) / 0.05), hsl(var(--color-accent) / 0.05))',
        'accent-subtle-reverse':
          'linear-gradient(to bottom right, hsl(var(--color-accent) / 0.05), hsl(var(--color-primary) / 0.05))',
        'accent-hero':
          'linear-gradient(to bottom right, hsl(var(--color-primary) / 0.1), hsl(var(--color-accent) / 0.05), transparent)',

        // Action gradients (used in CategoryFilter glow effect)
        'action-primary':
          'linear-gradient(to right, var(--color-purple-600), var(--color-cyan-500))',
        'action-primary-hover':
          'linear-gradient(to right, var(--color-purple-700), var(--color-cyan-600))',

        // Special purpose gradients (21 uses total)
        'marriage-alert':
          'linear-gradient(to right, var(--color-pink-600), var(--color-purple-600))',
        'marriage-alert-bg':
          'linear-gradient(to right, rgb(251 207 232 / 0.5), rgb(243 232 255 / 0.5))',
        'marriage-alert-dark':
          'linear-gradient(to right, rgb(157 23 77 / 0.2), rgb(107 33 168 / 0.2))',
        'tax-trap-alert':
          'linear-gradient(to right, var(--color-amber-600), var(--color-orange-600))',
        'tax-trap-alert-hover':
          'linear-gradient(to right, var(--color-amber-700), var(--color-orange-700))',
        'success-bar': 'linear-gradient(to right, var(--color-green-500), var(--color-green-600))',

        // What-If comparison (4 uses)
        'whatif-border':
          'linear-gradient(to bottom right, rgb(168 85 247 / 0.05), rgb(236 72 153 / 0.05))',
        'whatif-border-dark':
          'linear-gradient(to bottom right, rgb(192 132 252 / 0.1), rgb(244 114 182 / 0.1))',
        'whatif-button':
          'linear-gradient(to right, var(--color-purple-400), var(--color-pink-500))',
        'whatif-button-hover':
          'linear-gradient(to right, var(--color-purple-600), var(--color-pink-600))',

        // Separators (2 uses - subtle divider lines)
        'separator-horizontal':
          'linear-gradient(to right, transparent, hsl(var(--color-border)), transparent)',
        'separator-foreground':
          'linear-gradient(to right, transparent, hsl(var(--color-foreground) / 0.3), transparent)',
      },
      colors: {
        // Brand colors - maintain identity across themes
        brand: {
          DEFAULT: 'var(--color-brand)',
          accent: 'var(--color-brand-accent)',
          'gradient-start': 'var(--color-brand-gradient-start)',
          'gradient-end': 'var(--color-brand-gradient-end)',
        },
        // Semantic colors
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--color-popover)',
          foreground: 'var(--color-popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Fluid typography using clamp() - mobile to desktop
        xs: [
          'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
          { lineHeight: '1.5', letterSpacing: '0.01em' },
        ],
        sm: [
          'clamp(0.875rem, 0.825rem + 0.25vw, 1rem)',
          { lineHeight: '1.5', letterSpacing: '0.005em' },
        ],
        base: [
          'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
          { lineHeight: '1.6', letterSpacing: '0' },
        ],
        lg: [
          'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
          { lineHeight: '1.5', letterSpacing: '-0.01em' },
        ],
        xl: [
          'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
          { lineHeight: '1.4', letterSpacing: '-0.015em' },
        ],
        '2xl': [
          'clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)',
          { lineHeight: '1.3', letterSpacing: '-0.02em' },
        ],
        '3xl': [
          'clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)',
          { lineHeight: '1.25', letterSpacing: '-0.025em' },
        ],
        '4xl': [
          'clamp(2.25rem, 1.95rem + 1.5vw, 3rem)',
          { lineHeight: '1.2', letterSpacing: '-0.03em' },
        ],
        '5xl': [
          'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',
          { lineHeight: '1.1', letterSpacing: '-0.035em' },
        ],
        '6xl': [
          'clamp(3.75rem, 3rem + 3.75vw, 4.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.04em' },
        ],
        '7xl': [
          'clamp(4.5rem, 3.5rem + 5vw, 6rem)',
          { lineHeight: '1', letterSpacing: '-0.045em' },
        ],
      },
      borderRadius: {
        none: '0',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'var(--radius-xl, 0.75rem)', // For larger components like modals
        '2xl': 'var(--radius-2xl, 1rem)', // For hero sections and large cards
        '3xl': 'var(--radius-3xl, 1.5rem)', // For feature cards
        full: '9999px', // For pills and circular avatars
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-from-top': 'slideInFromTop 0.3s ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromTop: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-8px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInFromBottom: {
          '0%': {
            opacity: '0',
            transform: 'translateY(32px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95) translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      spacing: {
        0.5: '0.125rem', // 2px - micro-adjustments for pixel-perfect layouts
        18: '4.5rem', // 72px
        88: '22rem', // 352px
        128: '32rem', // 512px
      },
    },
  },
  plugins: [
    // Typography plugin for prose styling in MDX blog posts
    // Provides beautiful default styles for headings, paragraphs, lists, code blocks, etc.
    require('@tailwindcss/typography'),
  ],
};

export default config;
