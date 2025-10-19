// src/components/ui/alert.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning:
          'border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950/30 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
        success:
          'border-green-500/50 bg-green-50 text-green-900 dark:border-green-500/50 dark:bg-green-950/30 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
        info: 'border-blue-500/50 bg-blue-50 text-blue-900 dark:border-blue-500/50 dark:bg-blue-950/30 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = ({
  ref,
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    ref?: React.Ref<HTMLDivElement>;
  }) => (
  <div
    ref={ref}
    role='alert'
    aria-live='polite'
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
);
Alert.displayName = 'Alert';

const AlertTitle = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.Ref<HTMLParagraphElement>;
}) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = ({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>;
}) => <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
