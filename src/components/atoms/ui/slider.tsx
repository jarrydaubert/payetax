import * as SliderPrimitive from '@radix-ui/react-slider';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root>;

/**
 * Slider component for selecting numeric values
 *
 * Important: Always provide an accessible label via aria-label or aria-labelledby.
 *
 * @example
 * ```tsx
 * // With aria-label
 * <Slider
 *   aria-label="Salary amount"
 *   min={0}
 *   max={100000}
 *   step={1000}
 *   value={[salary]}
 *   onValueChange={([val]) => setSalary(val)}
 * />
 *
 * // With Label component
 * <Label id="salary-label">Salary</Label>
 * <Slider
 *   aria-labelledby="salary-label"
 *   min={0}
 *   max={100000}
 *   value={[salary]}
 *   onValueChange={([val]) => setSalary(val)}
 * />
 * ```
 */
const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, disabled, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      disabled={disabled}
      className={cn(
        'relative flex w-full select-none items-center',
        // Touch behavior: allow vertical scrolling while capturing horizontal drag
        'touch-pan-y',
        // Disabled state on root (Radix adds data-disabled)
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative h-2 w-full grow overflow-hidden rounded-full',
          'bg-secondary',
          // Disabled styling
          'data-[disabled]:bg-secondary/50',
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute h-full',
            'bg-primary',
            // Disabled styling
            'data-[disabled]:bg-primary/50',
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          // Size - visible thumb
          'block size-5 rounded-full',
          // Larger touch target via pseudo-element
          'before:absolute before:-inset-2 before:content-[""]',
          // Styling
          'border-2 border-primary bg-background',
          // Transitions
          'transition-colors',
          // Focus ring
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Disabled
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      />
    </SliderPrimitive.Root>
  ),
);
Slider.displayName = 'Slider';

export { Slider };
