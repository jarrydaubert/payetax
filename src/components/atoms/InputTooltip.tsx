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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent, type TooltipContent as TooltipData } from '@/config/inputTooltips';

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
 * InputTooltip - Wraps input fields with helpful HMRC-style tooltips
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
export function InputTooltip({ fieldName, children, customContent, className }: InputTooltipProps) {
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
        <div className={`flex items-center gap-2 ${className || ''}`}>
          {/* Input element */}
          <div className='flex-1'>{children}</div>

          {/* Help icon trigger */}
          <TooltipTrigger asChild>
            <button
              type='button'
              className='flex-shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
              aria-label={`Help for ${tooltipContent.title}`}
              data-testid={`tooltip-trigger-${fieldName}`}
            >
              <HelpCircle className='size-4' />
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
}
