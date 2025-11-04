/**
 * LabelTooltip Component
 *
 * Tooltip icon that appears next to labels (not wrapping inputs).
 * Shows HMRC-style guidance on hover.
 *
 * @module components/atoms/LabelTooltip
 */

import { HelpCircle } from 'lucide-react';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent, type TooltipContent as TooltipData } from '@/config/inputTooltips';
import { COMPONENT_GUIDELINES } from '@/constants/designTokens';
import { formatTooltipText } from '@/lib/tooltipUtils';

interface LabelTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: string;
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
}

/**
 * LabelTooltip - Shows help icon next to label
 *
 * Performance: Memoized with React 19 - static content, no need to re-render
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
    console.warn(`[LabelTooltip] No tooltip content found for field: ${fieldName}`);
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            className='inline-flex flex-shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
            aria-label={`Help for ${tooltipContent.title}`}
            data-testid={`tooltip-trigger-${fieldName}`}
          >
            <HelpCircle className={COMPONENT_GUIDELINES.TOOLTIPS.iconCompact} />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side='top'
          align='center'
          className='max-w-xs'
          sideOffset={8}
          data-testid={`tooltip-content-${fieldName}`}
        >
          {formatTooltipText(tooltipContent)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
