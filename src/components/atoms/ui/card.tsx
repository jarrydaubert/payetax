import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Card container component
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 * ```
 */
const Card = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-sm border border-border bg-card text-card-foreground shadow-none',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

/**
 * Card header section - contains title and description
 */
const CardHeader = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/**
 * Card title - renders as h3 for proper document structure
 *
 * Note: If you need a different heading level, use the `asChild` pattern
 * or render your own heading inside CardHeader.
 */
const CardTitle = forwardRef<ElementRef<'h3'>, ComponentPropsWithoutRef<'h3'>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

/**
 * Card description - renders as paragraph for proper semantics
 */
const CardDescription = forwardRef<ElementRef<'p'>, ComponentPropsWithoutRef<'p'>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

/**
 * Card content section - main body of the card
 *
 * Has horizontal and bottom padding, but no top padding to flow
 * seamlessly from CardHeader.
 */
const CardContent = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

/**
 * Card footer section - typically for actions
 *
 * Has horizontal and bottom padding, but no top padding to flow
 * seamlessly from CardContent.
 */
const CardFooter = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
