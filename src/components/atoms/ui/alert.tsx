import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:-translate-y-[3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning: 'border-warning/30 bg-warning/10 text-warning [&>svg]:text-warning',
        success: 'border-success/30 bg-success/10 text-success [&>svg]:text-success',
        info: 'border-primary/30 bg-primary/10 text-primary [&>svg]:text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type AlertProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof alertVariants> & {
    role?: 'alert' | 'status';
  };

const Alert = React.forwardRef<React.ElementRef<'div'>, AlertProps>(
  ({ className, variant, role, ...props }, ref) => {
    // Sensible default: only destructive interrupts
    const computedRole = role ?? (variant === 'destructive' ? 'alert' : 'status');

    return (
      <div
        ref={ref}
        role={computedRole}
        aria-live={computedRole === 'status' ? 'polite' : undefined}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Alert.displayName = 'Alert';

type AlertTitleProps = React.ComponentPropsWithoutRef<'h5'>;

const AlertTitle = React.forwardRef<React.ElementRef<'h5'>, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

type AlertDescriptionProps = React.ComponentPropsWithoutRef<'div'>;

const AlertDescription = React.forwardRef<React.ElementRef<'div'>, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(TYPOGRAPHY.TEXT_SM, '[&_p]:leading-relaxed', className)}
      {...props}
    />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export type { AlertDescriptionProps, AlertProps, AlertTitleProps };
export { Alert, AlertDescription, AlertTitle, alertVariants };
