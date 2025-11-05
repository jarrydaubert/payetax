import type * as React from 'react';

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ ref, className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-border/20 bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        TYPOGRAPHY.TEXT_SM,
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
Input.displayName = 'Input';

export { Input };
