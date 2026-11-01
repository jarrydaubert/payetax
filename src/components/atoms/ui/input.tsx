import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type InputProps = ComponentPropsWithoutRef<'input'>;

/**
 * Input component with consistent styling
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Input type="email" placeholder="you@example.com" />
 *
 * // With error state
 * <Input aria-invalid="true" aria-describedby="error-msg" />
 * <span id="error-msg">Invalid email</span>
 * ```
 */
const Input = forwardRef<ElementRef<'input'>, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      // Base layout
      'flex h-9 w-full rounded-sm px-3 py-1 shadow-none',
      // Border - neutral by default, ring for focus
      'border border-border',
      // Background - slight surface for visibility on dark backgrounds
      'bg-background',
      // Typography
      'text-sm',
      // Placeholder
      'placeholder:text-muted-foreground',
      // Focus - ring with offset for visibility
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      // Disabled
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Invalid state (when aria-invalid="true")
      'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive',
      // Transitions
      'transition-colors',
      // File input styling
      'file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
