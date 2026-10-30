/** Input and on-demand help; existing validation descriptions are left intact. */

import { HelpCircle } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import {
  getTooltipContent,
  type TooltipContent as TooltipData,
  type TooltipFieldName,
} from '@/config/inputTooltips';
import { formatTooltipText } from '@/lib/tooltipUtils';
import { cn } from '@/lib/utils';
import { HelpPopover } from './HelpPopover';

interface InputTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: TooltipFieldName | (string & {});
  /** The input element to wrap */
  children: ReactNode;
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
  /** Optional className for wrapper */
  className?: string;
}

/**
 * InputTooltip - Wraps input fields with helpful field tooltips
 *
 * Existing input descriptions, including validation errors, are left intact.
 *
 * @example
 * ```tsx
 * <InputTooltip fieldName="salary">
 *   <NumberInput value={salary} onChange={setSalary} />
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
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[InputTooltip] No tooltip content found for field: ${fieldName}`);
    }
    return <>{children}</>;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='flex-1'>{children}</div>
      <HelpPopover
        label={`Help for ${tooltipContent.title}`}
        side='right'
        align='start'
        testId={`tooltip-content-${fieldName}`}
        trigger={
          <button
            type='button'
            className='flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
            aria-label={`Help for ${tooltipContent.title}`}
            data-testid={`tooltip-trigger-${fieldName}`}
          >
            <HelpCircle className='size-4' aria-hidden='true' />
          </button>
        }
      >
        {formatTooltipText(tooltipContent)}
      </HelpPopover>
    </div>
  );
});
