// src/lib/typography.ts

/**
 * Typography System for PayeTax
 *
 * Standardized text sizing and styling classes
 * Based on Tailwind CSS utilities
 *
 * Usage:
 * ```tsx
 * import { typography } from '@/lib/typography';
 *
 * <h1 className={typography.h1}>Page Title</h1>
 * <p className={typography.body.base}>Regular text</p>
 * <label className={typography.label}>Form Label</label>
 * ```
 */

export const typography = {
  /**
   * Page-level main heading (H1)
   * Responsive: 4xl → 5xl → 6xl
   */
  h1: 'font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight',

  /**
   * Section heading (H2)
   * Responsive: 3xl → 4xl → 5xl
   */
  h2: 'font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight',

  /**
   * Subsection heading (H3)
   * Responsive: 2xl → 3xl → 4xl
   */
  h3: 'font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight',

  /**
   * Card/Component heading (H4)
   * Responsive: xl → 2xl
   */
  h4: 'font-semibold text-xl sm:text-2xl',

  /**
   * Small section heading (H5)
   * Used for input sections, small cards
   */
  h5: 'font-semibold text-lg',

  /**
   * Micro heading (H6)
   * For very small sections
   */
  h6: 'font-semibold text-base',

  /**
   * Section heading for calculator inputs
   * Used in BasicInputs, WhatIfInputs, etc.
   */
  sectionHeading: 'font-semibold text-lg text-foreground',

  /**
   * Body text variants
   */
  body: {
    /** Large body text (18px) */
    large: 'text-lg',
    /** Regular body text (16px) - default */
    base: 'text-base',
    /** Small body text (14px) */
    small: 'text-sm',
    /** Extra small text (12px) */
    xs: 'text-xs',
  },

  /**
   * Muted text (with reduced opacity)
   */
  muted: {
    /** Large muted text */
    large: 'text-lg text-muted-foreground',
    /** Regular muted text */
    base: 'text-base text-muted-foreground',
    /** Small muted text */
    small: 'text-sm text-muted-foreground',
    /** Extra small muted text */
    xs: 'text-xs text-muted-foreground',
  },

  /**
   * Form labels
   * Small, no-wrap for compact layouts
   */
  label: 'text-sm whitespace-nowrap',

  /**
   * Form labels with wrapping allowed
   */
  labelWrap: 'text-sm',

  /**
   * Caption/helper text
   * Used for descriptions, hints
   */
  caption: 'text-xs text-muted-foreground',

  /**
   * Monospace text
   * For code, numbers, tax codes
   */
  mono: 'font-mono text-sm',

  /**
   * Link text
   */
  link: 'text-primary underline underline-offset-4 hover:text-primary/80',

  /**
   * Error text
   */
  error: 'text-sm text-destructive',

  /**
   * Success text
   */
  success: 'text-sm text-green-600 dark:text-green-400',

  /**
   * Table headers
   */
  tableHeader: {
    /** Default table header */
    default: 'font-medium text-sm',
    /** Small table header (for responsive tables) */
    small: 'font-medium text-xs sm:text-sm',
    /** Large table header */
    large: 'font-medium text-base',
  },

  /**
   * Table cells
   */
  tableCell: {
    /** Default table cell */
    default: 'text-sm',
    /** Small table cell */
    small: 'text-xs sm:text-sm',
    /** Large table cell */
    large: 'text-base',
  },

  /**
   * Gradient text (requires bg-gradient-to-r classes)
   * Use with GradientHeading component instead
   * @deprecated Use <GradientHeading> component instead
   */
  gradient:
    'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent',

  /**
   * Gradient text with accent
   * @deprecated Use <GradientHeading gradient="accent"> instead
   */
  gradientAccent:
    'bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text text-transparent',
} as const;

/**
 * Responsive text size utilities
 * For when you need just the size without other styling
 */
export const textSize = {
  responsive: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
    '5xl': 'text-5xl sm:text-6xl',
  },
  static: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  },
} as const;

/**
 * Font weight utilities
 */
export const fontWeight = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * Line height utilities
 */
export const lineHeight = {
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;
