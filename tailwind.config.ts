import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
