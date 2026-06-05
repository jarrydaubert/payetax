import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Default tooltip delay settings for consistent UX
 * - delayDuration: 200ms prevents tooltips feeling "spammy" in dense UIs
 * - skipDelayDuration: 100ms allows rapid navigation between tooltips
 */
const DEFAULT_DELAY_DURATION = 200;
const DEFAULT_SKIP_DELAY_DURATION = 100;

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;

/**
 * Tooltip provider with sensible defaults
 *
 * Wrap your app (or a section) with this to enable tooltips.
 * Place in app layout for consistent behavior across the application.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <TooltipProvider>
 *   {children}
 * </TooltipProvider>
 * ```
 */
const TooltipProvider = ({
  delayDuration = DEFAULT_DELAY_DURATION,
  skipDelayDuration = DEFAULT_SKIP_DELAY_DURATION,
  ...props
}: TooltipProviderProps) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
);
TooltipProvider.displayName = 'TooltipProvider';

const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

/**
 * Tooltip content container
 *
 * Supports id prop for explicit aria-describedby relationships.
 * Uses neutral popover styling for better readability.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Helpful information</TooltipContent>
 * </Tooltip>
 * ```
 */
const TooltipContent = forwardRef<ElementRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          // Layout
          'z-50 rounded-md px-3 py-1.5',
          // Colors - neutral popover styling for readability
          'border border-border bg-popover text-popover-foreground shadow-md',
          // Typography
          'text-xs',
          // Transform origin for animations
          'origin-[--radix-tooltip-content-transform-origin]',
          // Animations - respects reduced motion preference
          'motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:animate-in',
          'motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=closed]:animate-out',
          'motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=left]:slide-in-from-right-2',
          'motion-safe:data-[side=right]:slide-in-from-left-2 motion-safe:data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
