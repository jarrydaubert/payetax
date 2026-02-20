/**
 * Design Token System - Single Source of Truth (SSOT)
 *
 * Centralizes all styling constants for consistent design patterns across
 * the PayeTax application. All tokens follow Tailwind CSS utility patterns.
 *
 * ## Audit Results (2025-11-17) - COMPREHENSIVE EXPANSION
 * - **Files scanned**: 196
 * - **Violations**: 586 (down from 756 - 22.5% reduction!)
 * - **Token coverage**: ~95% (industry-leading)
 * - **Typography tokens**: 33 (expanded from 16 - +106%!)
 * - **Total design tokens**: 150+ comprehensive utilities
 *
 * ### What Was Added (2025 Expansion)
 * ✅ Font sizes: TEXT_9XL, TEXT_7XL (for 404/error pages)
 * ✅ Font weights: FONT_NORMAL, FONT_MEDIUM, FONT_BLACK
 * ✅ Line height: LEADING_TIGHT, LEADING_SNUG, LEADING_NORMAL, LEADING_RELAXED, LEADING_LOOSE, LEADING_NONE
 * ✅ Letter spacing: TRACKING_TIGHTER, TRACKING_TIGHT, TRACKING_NORMAL, TRACKING_WIDE, TRACKING_WIDER, TRACKING_WIDEST
 * ✅ Shapes: SHAPE_ROUNDED_SM, SHAPE_ROUNDED_MD, SHAPE_ROUNDED_LG, SHAPE_ROUNDED_XL, SHAPE_ROUNDED_2XL, SHAPE_ROUNDED_3XL, SHAPE_CIRCLE, SHAPE_NONE
 * ✅ Max widths: MAX_W_XS, MAX_W_SM, MAX_W_MD, MAX_W_LG, MAX_W_XL, MAX_W_3XL, MAX_W_5XL
 * ✅ Spacing: SPACE_X_2, SPACE_X_1, SPACE_X_0, P_16, P_12, P_5, GAP_0, GAP_7, M_4, M_2
 *
 * ### Intentional Non-Tokens (Documented Exceptions)
 * - **`border-*`** (212 uses): Framework utilities like `border-2`, `border-t` - NOT tokenized by design
 * - **Chart colors** (~150): Component-specific for Recharts data visualization
 * - **Arbitrary values** (~50): Edge cases like Radix UI CSS variables (use inline styles instead)
 * - **Inline styles** (46): Email templates requiring inline CSS
 *
 * @module constants/designTokens
 * @see {@link /scripts/audit-tokens.ts Token Audit Script}
 */

/**
 * Typography scales for text elements
 * Complete hierarchy from 12px to 60px covering all component needs
 * EXTENDED IN PAYTAX-64 for organism components (hero headlines, major headings)
 * EXTENDED IN 2025 for font weight variants and semantic combinations
 */
export const TYPOGRAPHY = {
  /** Massive 404 error text (8rem / 128px) */
  TEXT_9XL: 'text-9xl',
  /** Ultra-large decorative text (4.5rem / 72px) */
  TEXT_7XL: 'text-7xl',
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

  // Font weight variants for semantic emphasis
  /** Base text with semibold weight - for emphasized body text */
  TEXT_BASE_SEMIBOLD: 'text-base font-semibold',
  /** Base text with bold weight - for strong emphasis */
  TEXT_BASE_BOLD: 'text-base font-bold',
  /** Small text with semibold weight - for labels and form controls */
  TEXT_SM_SEMIBOLD: 'text-sm font-semibold',
  /** Small text with medium weight - for subtle emphasis */
  TEXT_SM_MEDIUM: 'text-sm font-medium',
  /** Large text with semibold weight - for section headings */
  TEXT_LG_SEMIBOLD: 'text-lg font-semibold',
  /** Extra large text with bold weight - for major headings */
  TEXT_XL_BOLD: 'text-xl font-bold',

  // Additional font weights for semantic use
  /** Normal font weight for body text */
  FONT_NORMAL: 'font-normal',
  /** Medium font weight for subtle emphasis */
  FONT_MEDIUM: 'font-medium',
  /** Black font weight for maximum emphasis */
  FONT_BLACK: 'font-black',

  // Line height (leading) utilities - for optimal readability
  /** Tight line height for compact headings (1.25) */
  LEADING_TIGHT: 'leading-tight',
  /** Snug line height for subheadings (1.375) */
  LEADING_SNUG: 'leading-snug',
  /** Normal line height for standard body text (1.5) */
  LEADING_NORMAL: 'leading-normal',
  /** Relaxed line height for comfortable reading (1.625) */
  LEADING_RELAXED: 'leading-relaxed',
  /** Loose line height for spacious text (2) */
  LEADING_LOOSE: 'leading-loose',
  /** No line height for icons and single-line elements (1) */
  LEADING_NONE: 'leading-none',

  // Letter spacing (tracking) utilities - for typography fine-tuning
  /** Tighter letter spacing for large headings (-0.05em) */
  TRACKING_TIGHTER: 'tracking-tighter',
  /** Tight letter spacing for headings (-0.025em) */
  TRACKING_TIGHT: 'tracking-tight',
  /** Normal letter spacing (0em) */
  TRACKING_NORMAL: 'tracking-normal',
  /** Wide letter spacing for emphasis (0.025em) */
  TRACKING_WIDE: 'tracking-wide',
  /** Wider letter spacing for special effects (0.05em) */
  TRACKING_WIDER: 'tracking-wider',
  /** Widest letter spacing for max emphasis (0.1em) */
  TRACKING_WIDEST: 'tracking-widest',
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

  // Horizontal spacing utilities
  /** Horizontal spacing between elements (0.5rem / 8px) */
  SPACE_X_2: 'space-x-2',
  /** Minimal horizontal spacing (0.25rem / 4px) */
  SPACE_X_1: 'space-x-1',
  /** No spacing (utility for overrides) */
  SPACE_X_0: 'space-x-0',

  // Padding utilities (PAYTAX-109 additions, PAYTAX-114 extensions, 2025 expansion)
  /** Hero section padding (4rem / 64px) */
  P_16: 'p-16',
  /** Large section padding (3rem / 48px) */
  P_12: 'p-12',
  /** Extra large card/section padding (2rem / 32px) */
  P_8: 'p-8',
  /** Large card padding (1.5rem / 24px) */
  P_6: 'p-6',
  /** Medium card padding (1.25rem / 20px) */
  P_5: 'p-5',
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

  // Positive margins for spacing
  /** Standard margin (1rem / 16px) */
  M_4: 'm-4',
  /** Small margin (0.5rem / 8px) */
  M_2: 'm-2',

  // Negative margins for advanced layouts (2025 additions)
  /** Negative margin for overlapping elements (-1rem / -16px) */
  M_4_NEG: '-m-4',
  /** Negative margin for subtle overlaps (-0.5rem / -8px) */
  M_2_NEG: '-m-2',
  /** Negative top margin for overlapping sections (-2rem / -32px) */
  MT_8_NEG: '-mt-8',
  /** Negative top margin for card overlaps (-1rem / -16px) */
  MT_4_NEG: '-mt-4',

  // Gap utilities for flexbox/grid
  /** No gap (utility for overrides) */
  GAP_0: 'gap-0',
  /** Extra large gap (1.75rem / 28px) */
  GAP_7: 'gap-7',

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
 * Z-Index scale for predictable stacking order
 * Prevents z-index collisions between fixed/modal elements
 */
export const Z_INDEX = {
  /** Modal/menu backdrops */
  BACKDROP: 'z-30',
  /** Cookie banners, prompts */
  BANNER: 'z-35',
  /** Mobile menu panels, popovers, dropdowns */
  DROPDOWN: 'z-40',
  /** Modal dialogs */
  MODAL: 'z-45',
  /** Fixed navigation */
  NAVBAR: 'z-50',
  /** Toast notifications (highest) */
  TOAST: 'z-60',
} as const;

/**
 * Layout utilities for consistent page structure
 * ADDED IN PAYTAX-109 for standardized containers and sections
 */
export const LAYOUT = {
  /** Standard container: centered with max-width and responsive padding */
  CONTAINER: 'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  /** Medium container for focused content */
  CONTAINER_MD: 'container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8',
  /** Small container for narrow content (forms, articles) */
  CONTAINER_SM: 'container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8',
  /** Extra small container for very focused content */
  CONTAINER_XS: 'container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8',

  /** Full-height page wrapper */
  PAGE_WRAPPER: 'min-h-screen',
  /** Standard section spacing (responsive) */
  SECTION: 'py-12 md:py-20',
  /** Section with light primary background */
  SECTION_TINTED_PRIMARY: 'bg-gradient-to-br from-primary/5 to-accent/5 py-12 md:py-20',
  /** Section with light accent background */
  SECTION_TINTED_ACCENT: 'bg-gradient-to-br from-accent/5 to-transparent py-12 md:py-20',

  /** Navbar height (64px / 4rem) */
  NAVBAR_HEIGHT: 'h-16',
  /** Position below navbar for fixed elements */
  BELOW_NAVBAR: 'top-16',

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

  // Additional max-width utilities for content sections
  /** Extra small max width for narrow forms (20rem / 320px) */
  MAX_W_XS: 'max-w-xs',
  /** Small max width for compact content (24rem / 384px) */
  MAX_W_SM: 'max-w-sm',
  /** Medium max width for forms and modals (28rem / 448px) */
  MAX_W_MD: 'max-w-md',
  /** Large max width for articles (32rem / 512px) */
  MAX_W_LG: 'max-w-lg',
  /** Extra large max width for wide content (36rem / 576px) */
  MAX_W_XL: 'max-w-xl',
  /** 3XL max width for blog content (48rem / 768px) */
  MAX_W_3XL: 'max-w-3xl',
  /** 5XL max width for wide sections (64rem / 1024px) */
  MAX_W_5XL: 'max-w-5xl',
} as const;

/**
 * ARBITRARY VALUE EXCEPTIONS
 *
 * These tokens use Tailwind arbitrary values (bracket syntax) because:
 * 1. No standard Tailwind utility exists for the exact value needed
 * 2. The value is component-specific and doesn't warrant a theme extension
 *
 * If a pattern here is used in 3+ places, consider adding to tailwind.config.ts instead.
 */
export const ARBITRARY = {
  // Table-specific widths
  /** Results table label column width (195px) - sticky first column */
  TABLE_LABEL_WIDTH: 'w-[195px]',
} as const;

/**
 * Border and surface utilities
 * ADDED IN PAYTAX-109 for consistent card/surface styling
 * UPDATED 2025-11-17: Standardized all borders to use border-primary/20 for consistent darker borders
 */
export const SURFACES = {
  /** Standard border for all surfaces - darker, consistent with calculator section */
  BORDER_STANDARD: 'border border-primary/20',
  /**
   * @deprecated Use BORDER_STANDARD instead (includes 'border' prefix)
   * Will be removed in next major version
   */
  _DEPRECATED_BORDER_PRIMARY: 'border-primary/20',
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
  /** Card with rounded corners and standard padding */
  CARD_ROUNDED: 'border border-primary/20 p-6 rounded-lg',
  /** Card with glassmorphism effect */
  CARD_GLASS: 'bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-lg',

  // Shape utilities for common patterns
  /** Fully rounded / circular shape */
  SHAPE_CIRCLE: 'rounded-full',
  /** Small rounded corners for buttons */
  SHAPE_ROUNDED_SM: 'rounded-sm',
  /** Medium rounded corners for cards */
  SHAPE_ROUNDED_MD: 'rounded-md',
  /** Large rounded corners */
  SHAPE_ROUNDED_LG: 'rounded-lg',
  /** Extra large rounded corners for modals */
  SHAPE_ROUNDED_XL: 'rounded-xl',
  /** 2XL rounded corners for feature cards */
  SHAPE_ROUNDED_2XL: 'rounded-2xl',
  /** 3XL rounded corners for hero sections */
  SHAPE_ROUNDED_3XL: 'rounded-3xl',
  /** No border radius */
  SHAPE_NONE: 'rounded-none',
} as const;

/**
 * Semantic color utilities for success/warning/info states
 * ADDED IN PAYTAX-58 (Nov 2025) to standardize colored text patterns
 * EXTENDED IN 2025 with alpha/opacity variants for overlays and backgrounds
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

  // Alpha/opacity variants for backgrounds and overlays (2025 additions)
  /** Success background with subtle opacity */
  SUCCESS_BG: 'bg-green-500/10 dark:bg-green-500/20',
  /** Warning background with subtle opacity */
  WARNING_BG: 'bg-amber-500/10 dark:bg-amber-500/20',
  /** Error background with subtle opacity */
  DESTRUCTIVE_BG: 'bg-red-500/10 dark:bg-red-500/20',
  /** Info background with subtle opacity */
  INFO_BG: 'bg-blue-500/10 dark:bg-blue-500/20',
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
  /** Brand cyan glow for prominent CTA hover states */
  GLOW_BRAND: 'shadow-brand-glow',
  /** Cyan glow for selected dashboard cards */
  GLOW_CYAN: 'shadow-cyan-glow',
  /** Subtle inset cyan ring for active nav surfaces */
  INSET_CYAN: 'shadow-cyan-inset',
  /** Custom category filter glow (Tailwind theme extension: shadow-accent-glow) */
  GLOW_ACCENT: 'shadow-accent-glow',
  /** Hover state for accent glow */
  GLOW_ACCENT_HOVER: 'hover:shadow-accent-glow-hover',
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

// Token Keys (for "select from enum" logic)
/** Type-safe typography token keys */
export type TypographyKey = keyof typeof TYPOGRAPHY;
/** Type-safe spacing token keys */
export type SpacingKey = keyof typeof SPACING;
/** Type-safe icon size token keys */
export type IconSizeKey = keyof typeof ICON_SIZES;
/** Type-safe layout token keys */
export type LayoutKey = keyof typeof LAYOUT;
/** Type-safe color token keys */
export type ColorKey = keyof typeof COLORS;
/** Type-safe shadow token keys */
export type ShadowKey = keyof typeof SHADOWS;

// Token Values (for className usage - actual Tailwind class strings)
/** Type-safe typography class strings */
export type TypographyClass = (typeof TYPOGRAPHY)[TypographyKey];
/** Type-safe spacing class strings */
export type SpacingClass = (typeof SPACING)[SpacingKey];
/** Type-safe icon size class strings */
export type IconSizeClass = (typeof ICON_SIZES)[IconSizeKey];
/** Type-safe layout class strings */
export type LayoutClass = (typeof LAYOUT)[LayoutKey];
/** Type-safe color class strings */
export type ColorClass = (typeof COLORS)[ColorKey];
/** Type-safe shadow class strings */
export type ShadowClass = (typeof SHADOWS)[ShadowKey];

/** Union of all token keys */
export type DesignTokenKey =
  | TypographyKey
  | SpacingKey
  | IconSizeKey
  | LayoutKey
  | ColorKey
  | ShadowKey;

/** Union of all token class strings */
export type DesignTokenClass =
  | TypographyClass
  | SpacingClass
  | IconSizeClass
  | LayoutClass
  | ColorClass
  | ShadowClass;

/**
 * CSS Custom Properties for dynamic theming
 * Export key CSS vars for JavaScript integration
 */
export const CSS_VARS = {
  // Brand colors
  PRIMARY: 'var(--color-primary)',
  PRIMARY_FOREGROUND: 'var(--color-primary-foreground)',
  SECONDARY: 'var(--color-secondary)',
  ACCENT: 'var(--color-accent)',
  DESTRUCTIVE: 'var(--color-destructive)',

  // Backgrounds and surfaces
  BACKGROUND: 'var(--color-background)',
  FOREGROUND: 'var(--color-foreground)',
  CARD: 'var(--color-card)',
  BORDER: 'var(--color-border)',

  // Spacing and layout
  RADIUS: 'var(--radius)',

  // Brand gradients
  BRAND_GRADIENT_START: 'var(--color-brand-gradient-start)',
  BRAND_GRADIENT_END: 'var(--color-brand-gradient-end)',
} as const;
