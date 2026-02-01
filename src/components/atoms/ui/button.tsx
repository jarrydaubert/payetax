import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    // aria-disabled support for asChild (links don't support disabled attribute)
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    TYPOGRAPHY.TEXT_SM,
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: cn('h-8 rounded-md px-3', TYPOGRAPHY.TEXT_XS),
        lg: 'h-10 rounded-md px-8',
        icon: 'size-9',
        // 44px min for WCAG 2.2 touch targets
        touch: 'h-11 px-4 py-2',
        // Icon variant that meets touch target guidelines (44px)
        'icon-touch': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Props for Button component
// Note: When asChild is true, the actual element may not be a button,
// so ref type and some props (disabled, type) may not apply to the child.
export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the child element instead of a button.
   * Useful for rendering as Link, anchor, etc.
   *
   * Note: For disabled state on non-button elements (like links),
   * use aria-disabled="true" instead of the disabled attribute.
   */
  asChild?: boolean;
}

/**
 * Button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * // Standard button
 * <Button variant="default" size="default">Click me</Button>
 *
 * // As a link (using Next.js Link)
 * <Button asChild variant="outline">
 *   <Link href="/about">About</Link>
 * </Button>
 *
 * // Disabled link (use aria-disabled, not disabled)
 * <Button asChild variant="outline" aria-disabled="true" tabIndex={-1}>
 *   <Link href="/about" onClick={(e) => e.preventDefault()}>Disabled Link</Link>
 * </Button>
 * ```
 */
const Button = forwardRef<ElementRef<'button'>, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
