/**
 * LabelTooltip Component
 *
 * Tooltip icon that appears next to labels (not wrapping inputs).
 * Shows HMRC-style guidance on hover.
 *
 * Note: Parent component should wrap with TooltipProvider for optimal performance.
 *
 * @module components/atoms/LabelTooltip
 */

import { HelpCircle } from 'lucide-react';
import { memo, useId } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  getTooltipContent,
  type TooltipContent as TooltipData,
  type TooltipFieldName,
} from '@/config/inputTooltips';
import { COMPONENT_GUIDELINES } from '@/constants/designTokens';
import { formatTooltipText } from '@/lib/tooltipUtils';

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
  const reactId = useId();
  const tooltipId = `label-tooltip-${fieldName}-${reactId}`;

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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex min-h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
          aria-label={`Help for ${tooltipContent.title}`}
          aria-describedby={tooltipId}
          data-testid={`tooltip-trigger-${fieldName}`}
        >
          <HelpCircle className={COMPONENT_GUIDELINES.TOOLTIPS.iconCompact} aria-hidden='true' />
        </button>
      </TooltipTrigger>

      <TooltipContent
        id={tooltipId}
        side='top'
        align='center'
        className='max-w-xs'
        sideOffset={8}
        data-testid={`tooltip-content-${fieldName}`}
      >
        {formatTooltipText(tooltipContent)}
      </TooltipContent>
    </Tooltip>
  );
});
