/**
 * Design Tokens for Consistent UI/UX
 *
 * Centralizes typography, spacing, and sizing values across components
 * to maintain visual consistency and make design updates easier.
 *
 * EXTENDED IN PAYTAX-63 to support molecules layer:
 * - Added TEXT_3XL, TEXT_2XL, TEXT_XL, TEXT_LG, TEXT_BASE for headings and emphasis
 * - Added GAP_8, GAP_6, GAP_4, GAP_3 for larger spacing needs in navigation and sections
 * - Added SPACE_Y_* tokens for vertical spacing patterns in forms and content
 *
 * Usage: Import these tokens instead of hardcoding Tailwind classes.
 * This centralizes design decisions and makes global updates trivial.
 *
 * @module constants/designTokens
 */

/**
 * Typography scales for text elements
 * Complete hierarchy from 12px to 60px covering all component needs
 * EXTENDED IN PAYTAX-64 for organism components (hero headlines, major headings)
 */
export const TYPOGRAPHY = {
  /** Hero headlines, very large text (3.75rem / 60px) */
  TEXT_6XL: 'text-6xl',
  /** Extra large headlines (3rem / 48px) */
  TEXT_5XL: 'text-5xl',
  /** Large headlines for hero sections (2.25rem / 36px) */
  TEXT_4XL: 'text-4xl',
  /** Extra large text for navbar logo, hero headlines (1.875rem / 30px) */
  TEXT_3XL: 'text-3xl',
  /** Large text for prominent values, data display (1.5rem / 24px) */
  TEXT_2XL: 'text-2xl',
  /** Large headings for major sections (1.25rem / 20px) */
  TEXT_XL: 'text-xl',
  /** Section headings, card titles (1.125rem / 18px) */
  TEXT_LG: 'text-lg',
  /** Standard body text (1rem / 16px) */
  TEXT_BASE: 'text-base',
  /** Small text for labels, form controls, and secondary info (0.875rem / 14px) */
  TEXT_SM: 'text-sm',
  /** Extra small text for descriptions, helper text, tooltips (0.75rem / 12px) */
  TEXT_XS: 'text-xs',
} as const;

/**
 * Spacing scales for gaps, padding, and margins
 * Complete scale from 4px to 80px for all layout needs
 * EXTENDED IN PAYTAX-64 for organism components (major page sections, hero spacing)
 * EXTENDED IN PAYTAX-109 for page-level spacing patterns
 * EXTENDED IN PAYTAX-58 (Nov 2025) for missing responsive patterns
 */
export const SPACING = {
  // Gap utilities
  /** Major section spacing for navigation, large gaps (2rem / 32px) */
  GAP_8: 'gap-8',
  /** Large section spacing between major content areas (1.5rem / 24px) */
  GAP_6: 'gap-6',
  /** Content section spacing, form groups (1rem / 16px) */
  GAP_4: 'gap-4',
  /** Button groups, card element spacing (0.75rem / 12px) */
  GAP_3: 'gap-3',
  /** Standard gap for form controls and interactive elements (0.5rem / 8px) */
  GAP_2: 'gap-2',
  /** Compact gap for tightly grouped elements (0.375rem / 6px) */
  GAP_1_5: 'gap-1.5',
  /** Smaller gap for inline elements (0.25rem / 4px) */
  GAP_1: 'gap-1',
  /** Minimal gap for very tight spacing (0.125rem / 2px) */
  GAP_0_5: 'gap-0.5',

  // Vertical spacing utilities
  /** Extra large vertical spacing for major page sections (4rem / 64px) */
  SPACE_Y_16: 'space-y-16',
  /** Large vertical spacing for page sections (2rem / 32px) */
  SPACE_Y_8: 'space-y-8',
  /** Medium-large vertical spacing for content groups (1.5rem / 24px) */
  SPACE_Y_6: 'space-y-6',
  /** Vertical spacing for form sections and groups (1rem / 16px) */
  SPACE_Y_4: 'space-y-4',
  /** Vertical spacing for content elements (0.75rem / 12px) */
  SPACE_Y_3: 'space-y-3',
  /** Vertical spacing for compact lists and elements (0.5rem / 8px) */
  SPACE_Y_2: 'space-y-2',
  /** Vertical spacing for very compact lists (0.25rem / 4px) */
  SPACE_Y_1: 'space-y-1',

  // Padding utilities (PAYTAX-109 additions, PAYTAX-114 extensions)
  /** Extra large card/section padding (2rem / 32px) */
  P_8: 'p-8',
  /** Large card padding (1.5rem / 24px) */
  P_6: 'p-6',
  /** Standard card padding (1rem / 16px) */
  P_4: 'p-4',
  /** Compact padding (0.75rem / 12px) */
  P_3: 'p-3',
  /** Small padding (0.5rem / 8px) */
  P_2: 'p-2',
  /** Minimal padding (0.25rem / 4px) - ADDED IN PAYTAX-114 */
  P_1: 'p-1',
  /** No padding (utility for overrides) - ADDED IN PAYTAX-114 */
  P_0: 'p-0',

  /** Container horizontal padding (1rem / 16px) - standard for max-w containers */
  PX_4: 'px-4',
  /** Medium horizontal padding (1.5rem / 24px) */
  PX_6: 'px-6',
  /** Large horizontal padding (2rem / 32px) */
  PX_8: 'px-8',
  /** Small horizontal padding (0.5rem / 8px) */
  PX_2: 'px-2',
  /** Compact horizontal padding (0.75rem / 12px) - ADDED IN PAYTAX-114 */
  PX_3: 'px-3',
  /** Responsive horizontal padding - mobile to desktop (1rem → 1.5rem → 2rem) */
  PX_RESPONSIVE: 'px-4 sm:px-6 lg:px-8',

  /** Section vertical padding responsive (3rem on mobile, 5rem on desktop) */
  PY_SECTION: 'py-12 md:py-20',
  /** Large section vertical padding responsive (4rem → 5rem → 6rem) */
  PY_SECTION_LG: 'py-16 md:py-20 lg:py-24',
  /** Large section vertical padding (5rem / 80px) */
  PY_20: 'py-20',
  /** Medium-large vertical padding (4rem / 64px) - ADDED IN PAYTAX-58 */
  PY_16: 'py-16',
  /** Standard section vertical padding (3rem / 48px) */
  PY_12: 'py-12',
  /** Medium vertical padding (2rem / 32px) */
  PY_8: 'py-8',
  /** Small vertical padding (1.5rem / 24px) */
  PY_6: 'py-6',
  /** Compact vertical padding (1rem / 16px) */
  PY_4: 'py-4',
  /** Minimal vertical padding (0.5rem / 8px) */
  PY_2: 'py-2',

  // Margin utilities
  /** Extra large top margin for major sections (3rem / 48px) */
  MT_12: 'mt-12',
  /** Extra-extra large top margin (2.5rem / 40px) */
  MT_10: 'mt-10',
  /** Large top margin (2rem / 32px) */
  MT_8: 'mt-8',
  /** Medium top margin (1.5rem / 24px) */
  MT_6: 'mt-6',
  /** Standard top margin (1rem / 16px) */
  MT_4: 'mt-4',
  /** Small top margin (0.75rem / 12px) */
  MT_3: 'mt-3',
  /** Small top margin (0.5rem / 8px) */
  MT_2: 'mt-2',
  /** Minimal top margin (0.25rem / 4px) */
  MT_1: 'mt-1',

  /** Extra large bottom margin (3rem / 48px) */
  MB_12: 'mb-12',
  /** Extra-extra large bottom margin (2.5rem / 40px) - ADDED IN PAYTAX-114 */
  MB_10: 'mb-10',
  /** Large-medium bottom margin (2rem / 32px) */
  MB_8: 'mb-8',
  /** Large bottom margin (1.5rem / 24px) */
  MB_6: 'mb-6',
  /** Standard bottom margin (1rem / 16px) */
  MB_4: 'mb-4',
  /** Medium bottom margin (0.75rem / 12px) */
  MB_3: 'mb-3',
  /** Small bottom margin (0.5rem / 8px) */
  MB_2: 'mb-2',

  // Special spacing for borders/dividers
  /** Top padding for sections with borders (1rem / 16px) */
  PT_4: 'pt-4',
  /** Bottom padding for sections with borders (1rem / 16px) */
  PB_4: 'pb-4',
  /** Small top offset (0.125rem / 2px) */
  MT_0_5: 'mt-0.5',
} as const;

/**
 * Icon sizes for consistent visual hierarchy
 * EXTENDED IN PAYTAX-64 for organism components (large decorative icons, empty states)
 */
export const ICON_SIZES = {
  /** Extra large decorative icons for empty states (3rem / 48px) */
  SIZE_12: 'size-12',
  /** Large decorative icons (2.5rem / 40px) */
  SIZE_10: 'size-10',
  /** Medium-large icons (2rem / 32px) */
  SIZE_8: 'size-8',
  /** Desktop size for enhanced icons (1.5rem / 24px) */
  SIZE_6: 'size-6',
  /** Large icon for primary actions or scroll indicators (1.25rem / 20px) */
  SIZE_5: 'size-5',
  /** Standard icon size for most UI elements (1rem / 16px) */
  SIZE_4: 'size-4',
  /** Smaller icon for compact spaces or secondary actions (0.875rem / 14px) */
  SIZE_3_5: 'size-3.5',
  /** Responsive desktop icon size (1.5rem / 24px) */
  MD_SIZE_6: 'md:size-6',
} as const;

/**
 * Layout utilities for consistent page structure
 * ADDED IN PAYTAX-109 for standardized containers and sections
 */
export const LAYOUT = {
  /** Standard container: centered with max-width and horizontal padding */
  CONTAINER: 'container mx-auto max-w-7xl px-4',
  /** Medium container for focused content */
  CONTAINER_MD: 'container mx-auto max-w-6xl px-4',
  /** Small container for narrow content (forms, articles) */
  CONTAINER_SM: 'container mx-auto max-w-4xl px-4',
  /** Extra small container for very focused content */
  CONTAINER_XS: 'container mx-auto max-w-2xl px-4',

  /** Full-height page wrapper */
  PAGE_WRAPPER: 'min-h-screen',
  /** Standard section spacing (responsive) */
  SECTION: 'py-12 md:py-20',
  /** Section with light primary background */
  SECTION_TINTED_PRIMARY: 'bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20',
  /** Section with light accent background */
  SECTION_TINTED_ACCENT: 'bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20',

  /** 2-column grid with gap */
  GRID_2: 'grid gap-6 md:grid-cols-2',
  /** 3-column grid with gap */
  GRID_3: 'grid gap-6 md:grid-cols-3',
  /** 4-column grid with gap */
  GRID_4: 'grid gap-6 md:grid-cols-4',

  /** Centered text content */
  TEXT_CENTER: 'text-center',
  /** Centered content with max-width */
  CENTERED_CONTENT: 'mx-auto max-w-2xl',
} as const;

/**
 * Border and surface utilities
 * ADDED IN PAYTAX-109 for consistent card/surface styling
 * UPDATED 2025-11-17: Standardized all borders to use border-primary/20 for consistent darker borders
 */
export const SURFACES = {
  /** Standard border for all surfaces - darker, consistent with calculator section */
  BORDER_STANDARD: 'border border-primary/20',
  /** Standard card border with subtle primary tint (DEPRECATED: use BORDER_STANDARD) */
  BORDER_PRIMARY: 'border-primary/20',
  /** Border with top separator */
  BORDER_TOP_DIVIDER: 'border-t border-primary/10',

  /** Light primary gradient background */
  BG_GRADIENT_PRIMARY: 'bg-gradient-to-br from-primary/5 to-accent/5',
  /** Light accent gradient background */
  BG_GRADIENT_ACCENT: 'bg-gradient-to-br from-accent/5 to-transparent',

  /** Card with padding and border */
  CARD_STANDARD: 'border-primary/20 p-6',
  /** Large card with more padding */
  CARD_LARGE: 'border-primary/20 p-8',
} as const;

/**
 * Semantic color utilities for success/warning/info states
 * ADDED IN PAYTAX-58 (Nov 2025) to standardize colored text patterns
 * Ensures consistent colors in both light and dark modes
 */
export const COLORS = {
  /** Success state text - green with dark mode support */
  SUCCESS: 'text-green-600 dark:text-green-400',
  /** Warning state text - amber with dark mode support */
  WARNING: 'text-amber-600 dark:text-amber-400',
  /** Alternative warning - yellow with dark mode support */
  WARNING_ALT: 'text-yellow-600 dark:text-yellow-400',
  /** Error/destructive state text - uses theme destructive color */
  DESTRUCTIVE: 'text-destructive',
  /** Info state text - blue with dark mode support */
  INFO: 'text-blue-600 dark:text-blue-400',
  /** Special purpose - pink for marriage allowance alerts */
  ACCENT_PINK: 'text-pink-600 dark:text-pink-400',
  /** Special purpose - purple for categories/features */
  ACCENT_PURPLE: 'text-purple-600 dark:text-purple-400',
} as const;

/**
 * Shadow utilities for elevation and focus effects
 * ADDED IN PAYTAX-58 (Nov 2025) to standardize shadow patterns
 */
export const SHADOWS = {
  /** Subtle elevation - input hover states, small cards */
  SM: 'shadow-sm',
  /** Standard elevation - cards, dropdowns, default interactive elements */
  MD: 'shadow-md',
  /** High elevation - modals, popovers, emphasized content */
  LG: 'shadow-lg',
  /** Maximum elevation - hero sections, marketing elements */
  XL: 'shadow-xl',
  /** Extra large elevation - special hero sections */
  XXL: 'shadow-2xl',

  // Glow effects for special UI elements
  /** Primary brand glow - for featured CTAs */
  GLOW_PRIMARY: 'shadow-lg shadow-primary/30',
  /** Purple glow - for what-if comparisons and special features */
  GLOW_PURPLE: 'shadow-lg shadow-purple-500/50',
  /** Success glow - for positive actions */
  GLOW_SUCCESS: 'shadow-lg shadow-green-500/40',
  /** Custom category filter glow */
  GLOW_ACCENT: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  GLOW_ACCENT_HOVER: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]',
} as const;

/**
 * Component-specific design rules
 *
 * Use these guidelines when building or updating components:
 *
 * **Labels & Form Controls:**
 * - Use `TEXT_SM` for input labels, form controls, table text
 * - Use `GAP_2` for form field spacing
 *
 * **Tooltips:**
 * - Title: Use `TEXT_SM` (from parent label styling)
 * - Description: Use `TEXT_XS`
 * - Icon: Use `SIZE_4` for InputTooltip, `SIZE_3_5` for LabelTooltip
 * - Gap: Use `GAP_2` for InputTooltip, `GAP_1_5` for LabelTooltip
 *
 * **Icons:**
 * - Standard UI icons: `SIZE_4`
 * - Inline label icons: `SIZE_3_5`
 * - Scroll indicators: `SIZE_5` + `SIZE_6` for desktop
 */
export const COMPONENT_GUIDELINES = {
  FORM_CONTROLS: {
    typography: TYPOGRAPHY.TEXT_SM,
    gap: SPACING.GAP_2,
  },
  TOOLTIPS: {
    title: TYPOGRAPHY.TEXT_SM,
    description: TYPOGRAPHY.TEXT_XS,
    iconStandard: ICON_SIZES.SIZE_4,
    iconCompact: ICON_SIZES.SIZE_3_5,
    gapStandard: SPACING.GAP_2,
    gapCompact: SPACING.GAP_1_5,
  },
  ICONS: {
    standard: ICON_SIZES.SIZE_4,
    compact: ICON_SIZES.SIZE_3_5,
    large: ICON_SIZES.SIZE_5,
    responsive: `${ICON_SIZES.SIZE_5} ${ICON_SIZES.SIZE_6}`,
  },
} as const;

// ============================================================================
// TypeScript Types for Type-Safe Token Usage
// ============================================================================

/**
 * Type-safe typography token keys
 * @example type MyComponent = { size: TypographyToken } // Enforces valid tokens
 */
export type TypographyToken = keyof typeof TYPOGRAPHY;

/**
 * Type-safe spacing token keys
 */
export type SpacingToken = keyof typeof SPACING;

/**
 * Type-safe icon size token keys
 */
export type IconSizeToken = keyof typeof ICON_SIZES;

/**
 * Type-safe layout token keys
 */
export type LayoutToken = keyof typeof LAYOUT;

/**
 * Type-safe color token keys
 */
export type ColorToken = keyof typeof COLORS;

/**
 * Type-safe shadow token keys
 */
export type ShadowToken = keyof typeof SHADOWS;
