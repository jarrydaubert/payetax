/**
 * LabelTooltip Component
 *
 * Tooltip icon that appears next to labels (not wrapping inputs).
 * Shows field guidance on click, tap or keyboard activation.
 *
 * @module components/atoms/LabelTooltip
 */

import { HelpCircle } from 'lucide-react';
import { memo } from 'react';
import {
  getTooltipContent,
  type TooltipContent as TooltipData,
  type TooltipFieldName,
} from '@/config/inputTooltips';
import { formatTooltipText } from '@/lib/tooltipUtils';
import { HelpPopover } from './HelpPopover';

interface LabelTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: TooltipFieldName | (string & {});
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
}

/**
 * LabelTooltip - Shows help icon next to label
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-1.5">
 *   <Label htmlFor="salary">Salary</Label>
 *   <LabelTooltip fieldName="salary" />
 * </div>
 * ```
 */
export const LabelTooltip = memo(function LabelTooltip({
  fieldName,
  customContent,
}: LabelTooltipProps) {
  // Get tooltip content from config or use custom
  const tooltipContent = customContent || getTooltipContent(fieldName);

  // If no tooltip content found, don't render anything
  if (!tooltipContent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[LabelTooltip] No tooltip content found for field: ${fieldName}`);
    }
    return null;
  }

  return (
    <HelpPopover
      label={`Help for ${tooltipContent.title}`}
      testId={`tooltip-content-${fieldName}`}
      trigger={
        <button
          type='button'
          className='inline-flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
          aria-label={`Help for ${tooltipContent.title}`}
          data-testid={`tooltip-trigger-${fieldName}`}
        >
          <HelpCircle className='size-3.5' aria-hidden='true' />
        </button>
      }
    >
      {formatTooltipText(tooltipContent)}
    </HelpPopover>
  );
});
