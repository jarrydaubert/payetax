import type * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ ref, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-16 w-full rounded-sm border border-border bg-background px-3 py-2 shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        'text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
Textarea.displayName = 'Textarea';

export { Textarea };
