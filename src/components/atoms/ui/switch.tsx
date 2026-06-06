import * as SwitchPrimitive from '@radix-ui/react-switch';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SwitchProps = ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

/**
 * Switch component for binary toggle states
 *
 * Important: Always provide an accessible label via htmlFor/id or aria-label.
 *
 * @example
 * ```tsx
 * // With Label component (recommended)
 * <div className="flex items-center gap-2">
 *   <Switch id="airplane-mode" />
 *   <Label htmlFor="airplane-mode">Airplane Mode</Label>
 * </div>
 *
 * // With aria-label (standalone)
 * <Switch aria-label="Enable notifications" />
 *
 * // Controlled
 * <Switch
 *   id="dark-mode"
 *   checked={isDarkMode}
 *   onCheckedChange={setIsDarkMode}
 * />
 * ```
 */
const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        // Layout
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full',
        // Size - default (20×36px)
        'h-5 w-9',
        // Border - subtle outline for unchecked contrast
        'border-2 border-transparent data-[state=unchecked]:border-border',
        // Transitions
        'transition-colors',
        // Focus ring
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
        // State colors
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          // Layout
          'pointer-events-none block rounded-full',
          // Size - default (16×16px)
          'size-4',
          // Styling
          'bg-background ring-0',
          // Transitions
          'transition-transform',
          // Transform - tied to root w-9 / thumb w-4 / border-2
          // (9 - 4 - 0.5 border) = 4 = translate-x-4
          'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = 'Switch';

export { Switch };
