import * as LabelPrimitive from '@radix-ui/react-label';
import type * as React from 'react';

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot='label'
      className={cn(
        'flex select-none items-center gap-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        TYPOGRAPHY.TEXT_SM,
        className
      )}
      {...props}
    />
  );
}

export { Label };
