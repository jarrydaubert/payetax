import type * as React from 'react';

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ ref, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-primary/20 bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        TYPOGRAPHY.TEXT_SM,
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
Textarea.displayName = 'Textarea';

export { Textarea };
