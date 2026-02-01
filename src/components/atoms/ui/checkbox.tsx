import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/**
 * Checkbox component built on Radix UI
 *
 * Supports checked, unchecked, and indeterminate states.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Checkbox id="terms" />
 * <label htmlFor="terms">Accept terms</label>
 *
 * // Controlled with indeterminate
 * <Checkbox
 *   checked={allSelected ? true : someSelected ? 'indeterminate' : false}
 *   onCheckedChange={handleChange}
 * />
 * ```
 */
const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      className={cn(
        // Base styles - size-4 visual, but wrapped in label for larger touch target
        'peer size-4 shrink-0 rounded-sm border shadow',
        // Border: Use border-border for optimal visibility in both light/dark themes
        // (border-primary too bright, border-input too dim on dark backgrounds)
        'border-border',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Checked state
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        // Indeterminate state (same visual as checked)
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className='flex items-center justify-center text-current'>
        {/* Icon slightly smaller than box for visual balance */}
        {checked === 'indeterminate' ? (
          <Minus className='size-3.5' strokeWidth={3} />
        ) : (
          <Check className='size-3.5' strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
