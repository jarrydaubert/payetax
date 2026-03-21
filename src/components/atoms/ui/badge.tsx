import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  cn(
    'inline-flex items-center border px-2.5 py-0.5 font-semibold transition-colors',
    SURFACES.SHAPE_CIRCLE,
    TYPOGRAPHY.TEXT_XS,
  ),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type BadgeProps = React.ComponentPropsWithoutRef<'span'> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type { BadgeProps };
export { Badge, badgeVariants };
