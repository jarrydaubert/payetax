// src/lib/constants/ui.ts

/**
 * UI-related constants for consistent behavior across the application
 */

/**
 * Scroll threshold values for showing/hiding UI elements
 */
export const SCROLL_THRESHOLDS = {
  /** Show scroll-to-top button when scrolled this many pixels down */
  TOP_BUTTON: 300,
  /** Show scroll indicator when near top of page (within this many pixels) */
  INDICATOR: 100,
  /** Buffer percentage of viewport height for proactive indicator display */
  INDICATOR_BUFFER: 0.2, // 20% of viewport
} as const;

/**
 * Responsive breakpoint values matching Tailwind's default breakpoints
 */
export const BREAKPOINTS = {
  /** Small tablets and large phones */
  SM: 640,
  /** Tablets */
  MD: 768,
  /** Laptops and small desktops */
  LG: 1024,
  /** Desktops */
  XL: 1280,
  /** Large desktops */
  XXL: 1536,
} as const;

/**
 * Animation and interaction timing delays
 */
export const TIMERS = {
  /** Delay before scrolling to results after calculation (allows loading state + render) */
  CALC_SCROLL: 600,
  /** Delay before scrolling to results after what-if calculation */
  WHAT_IF_SCROLL: 100,
  /** Toast notification duration for success messages */
  TOAST_SUCCESS: 3000,
  /** Toast notification duration for error messages */
  TOAST_ERROR: 5000,
} as const;

/**
 * Scroll indicator tolerance values
 */
export const SCROLL_INDICATOR = {
  /** Pixels of tolerance for detecting horizontal overflow */
  HORIZONTAL_TOLERANCE: 10,
  /** Minimum scroll amount to hide left indicator */
  MIN_SCROLL_LEFT: 10,
} as const;
