/**
 * Design Tokens for Consistent UI/UX
 *
 * Centralizes typography, spacing, and sizing values across components
 * to maintain visual consistency and make design updates easier.
 *
 * @module constants/designTokens
 */

/**
 * Typography scales for text elements
 */
export const TYPOGRAPHY = {
  /** Small text for labels, form controls, and secondary info (0.875rem / 14px) */
  TEXT_SM: 'text-sm',
  /** Extra small text for descriptions, helper text, tooltips (0.75rem / 12px) */
  TEXT_XS: 'text-xs',
} as const;

/**
 * Spacing scales for gaps, padding, and margins
 */
export const SPACING = {
  /** Standard gap for form controls and interactive elements (0.5rem / 8px) */
  GAP_2: 'gap-2',
  /** Compact gap for tightly grouped elements (0.375rem / 6px) */
  GAP_1_5: 'gap-1.5',
  /** Smaller gap for inline elements (0.25rem / 4px) */
  GAP_1: 'gap-1',
} as const;

/**
 * Icon sizes for consistent visual hierarchy
 */
export const ICON_SIZES = {
  /** Standard icon size for most UI elements (1rem / 16px) */
  SIZE_4: 'size-4',
  /** Smaller icon for compact spaces or secondary actions (0.875rem / 14px) */
  SIZE_3_5: 'size-3.5',
  /** Large icon for primary actions or scroll indicators (1.25rem / 20px) */
  SIZE_5: 'size-5',
  /** Desktop size for enhanced icons (1.5rem / 24px) */
  SIZE_6: 'md:size-6',
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
