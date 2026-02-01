/**
 * InputTooltip Component
 *
 * Reusable wrapper that adds HMRC-style tooltips to any input field.
 * Displays helpful guidance on hover (desktop) or tap (mobile).
 *
 * Features:
 * - Automatic content loading from central config
 * - Accessible (aria-describedby injected into child, keyboard navigation)
 * - Responsive (hover on desktop, tap on mobile)
 * - Consistent styling across all inputs
 *
 * Note: Parent component should wrap with TooltipProvider for optimal performance.
 * This component will work standalone but creates provider overhead per instance.
 *
 * @module components/atoms/InputTooltip
 */

import { HelpCircle } from 'lucide-react';
import {
  Children,
  cloneElement,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  getTooltipContent,
  type TooltipContent as TooltipData,
  type TooltipFieldName,
} from '@/config/inputTooltips';
import { COMPONENT_GUIDELINES, SURFACES } from '@/constants/designTokens';
import { formatTooltipText } from '@/lib/tooltipUtils';
import { cn } from '@/lib/utils';

interface InputTooltipProps {
  /** The field name (matches key in INPUT_TOOLTIPS config) */
  fieldName: TooltipFieldName | (string & {});
  /** The input element to wrap (single element preferred for aria-describedby injection) */
  children: ReactNode;
  /** Optional custom tooltip content (overrides config) */
  customContent?: TooltipData;
  /** Optional className for wrapper */
  className?: string;
}

/**
 * InputTooltip - Wraps input fields with helpful HMRC-style tooltips
 *
 * Accessibility: Automatically injects aria-describedby into single child elements.
 * For multiple children, caller should manually wire aria-describedby.
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
  const reactId = useId();
  const tooltipId = `tooltip-${fieldName}-${reactId}`;

  // Get tooltip content from config or use custom
  const tooltipContent = customContent || getTooltipContent(fieldName);

  // If no tooltip content found, just render children without tooltip
  if (!tooltipContent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[InputTooltip] No tooltip content found for field: ${fieldName}`);
    }
    return <>{children}</>;
  }

  // Inject aria-describedby into single child element when possible
  let wrappedChildren = children;
  const childArray = Children.toArray(children);

  if (childArray.length === 1 && isValidElement(childArray[0])) {
    const child = childArray[0] as ReactElement<{ 'aria-describedby'?: string }>;
    const existing = child.props['aria-describedby'];
    const describedBy = existing ? `${existing} ${tooltipId}` : tooltipId;

    wrappedChildren = cloneElement(child, {
      'aria-describedby': describedBy,
    });
  }

  return (
    <Tooltip>
      <div
        className={cn('flex items-center', COMPONENT_GUIDELINES.TOOLTIPS.gapStandard, className)}
      >
        {/* Input element with injected aria-describedby */}
        <div className='flex-1'>{wrappedChildren}</div>

        {/* Help icon trigger */}
        <TooltipTrigger asChild>
          <button
            type='button'
            className={cn(
              'flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              SURFACES.SHAPE_CIRCLE,
            )}
            aria-label={`Help for ${tooltipContent.title}`}
            data-testid={`tooltip-trigger-${fieldName}`}
          >
            <HelpCircle className={COMPONENT_GUIDELINES.TOOLTIPS.iconStandard} aria-hidden='true' />
          </button>
        </TooltipTrigger>
      </div>

      {/* Tooltip content with id for aria-describedby */}
      <TooltipContent
        id={tooltipId}
        side='right'
        align='start'
        className='max-w-xs'
        data-testid={`tooltip-content-${fieldName}`}
      >
        {formatTooltipText(tooltipContent)}
      </TooltipContent>
    </Tooltip>
  );
});
