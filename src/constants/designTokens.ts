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
 * Complete scale from 4px to 64px for all layout needs
 * EXTENDED IN PAYTAX-64 for organism components (major page sections, hero spacing)
 */
export const SPACING = {
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
