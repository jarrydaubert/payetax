import * as LabelPrimitive from '@radix-ui/react-label';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

/**
 * Label component for form fields
 *
 * Uses Radix UI Label for proper htmlFor association with inputs.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Label htmlFor="email">Email address</Label>
 * <Input id="email" type="email" />
 *
 * // With peer disabled styling (input must have className="peer")
 * <Input id="name" className="peer" disabled />
 * <Label htmlFor="name">Name</Label>
 *
 * // With group disabled styling (parent must have data-disabled)
 * <div className="group" data-disabled={isDisabled}>
 *   <Label htmlFor="phone">Phone</Label>
 *   <Input id="phone" disabled={isDisabled} />
 * </div>
 * ```
 */
const Label = forwardRef<ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      data-slot='label'
      className={cn(
        // Layout - supports inline icons/badges
        'flex items-center gap-2',
        // Typography
        'font-medium text-foreground leading-none',
        TYPOGRAPHY.TEXT_SM,
        // Disabled styling hooks
        // peer-disabled: works when label follows an input with .peer class
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        // group-data-[disabled]: works when parent has data-disabled="true"
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
