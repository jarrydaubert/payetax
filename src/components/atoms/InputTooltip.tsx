/**
 * InputTooltip Component
 *
 * Reusable wrapper that adds HMRC-style tooltips to any input field.
 * Displays helpful guidance on hover (desktop) or tap (mobile).
 *
 * Features:
 * - Automatic content loading from central config
 * - Accessible (aria-describedby, keyboard navigation)
 * - Responsive (hover on desktop, tap on mobile)
 * - Consistent styling across all inputs
 *
 * @module components/atoms/InputTooltip
 */

import { HelpCircle } from 'lucide-react';
import type * as React from 'react';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent, type TooltipContent as TooltipData } from '@/config/inputTooltips';
import { COMPONENT_GUIDELINES, SURFACES } from '@/constants/designTokens';
import { formatTooltipText } from '@/lib/tooltipUtils';
import { cn } from '@/lib/utils';

interface InputTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: string;
  /** The input element to wrap */
  children: React.ReactNode;
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
  /** Optional className for wrapper */
  className?: string;
}

/**
 * InputTooltip - Wraps input fields with helpful HMRC-style tooltips
 *
 * Performance: Memoized with React 19 to prevent re-renders during form updates
 *
 * @example
 * ```tsx
 * <InputTooltip fieldName="salary">
 *   <NumberInput
 *     value={salary}
 *     onChange={setSalary}
 *     aria-describedby="tooltip-salary"
 *   />
 * </InputTooltip>
 * ```
 */
export const InputTooltip = memo(function InputTooltip({
  fieldName,
  children,
  customContent,
  className,
}: InputTooltipProps) {
  // Get tooltip content from config or use custom
  const tooltipContent = customContent || getTooltipContent(fieldName);

  // If no tooltip content found, just render children without tooltip
  if (!tooltipContent) {
    console.warn(`[InputTooltip] No tooltip content found for field: ${fieldName}`);
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <div
          className={cn('flex items-center', COMPONENT_GUIDELINES.TOOLTIPS.gapStandard, className)}
        >
          {/* Input element */}
          <div className='flex-1'>{children}</div>

          {/* Help icon trigger */}
          <TooltipTrigger asChild>
            <button
              type='button'
              className={cn(
                'flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                SURFACES.SHAPE_CIRCLE,
              )}
              aria-label={`Help for ${tooltipContent.title}`}
              data-testid={`tooltip-trigger-${fieldName}`}
            >
              <HelpCircle className={COMPONENT_GUIDELINES.TOOLTIPS.iconStandard} />
            </button>
          </TooltipTrigger>
        </div>

        {/* Tooltip content */}
        <TooltipContent
          side='right'
          align='start'
          className='max-w-xs'
          data-testid={`tooltip-content-${fieldName}`}
        >
          {formatTooltipText(tooltipContent)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
