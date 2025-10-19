/**
 * LabelTooltip Component
 *
 * Tooltip icon that appears next to labels (not wrapping inputs).
 * Shows HMRC-style guidance on hover.
 *
 * @module components/atoms/LabelTooltip
 */

import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent, type TooltipContent as TooltipData } from '@/config/inputTooltips';

interface LabelTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: string;
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
}

/**
 * Formats tooltip content into readable text
 * @internal
 */
function formatTooltipText(content: TooltipData): React.ReactNode {
  return (
    <div className='space-y-1'>
      <div className='font-semibold'>{content.title}</div>
      <div className='text-xs'>{content.description}</div>
      {content.hmrc && (
        <div className='border-primary-foreground/20 border-t pt-1 text-xs opacity-90'>
          {content.hmrc.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
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
export function LabelTooltip({ fieldName, customContent }: LabelTooltipProps) {
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
            <HelpCircle className='size-3.5' />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side='left'
          align='center'
          className='max-w-xs'
          data-testid={`tooltip-content-${fieldName}`}
        >
          {formatTooltipText(tooltipContent)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
