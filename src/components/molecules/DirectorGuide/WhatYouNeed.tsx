// src/components/molecules/DirectorGuide/WhatYouNeed.tsx
'use client';

import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';

interface WhatYouNeedProps {
  className?: string;
}

/**
 * Info card showing what users need before starting the guide
 *
 * Sets expectations and reduces drop-off by being transparent.
 */
export function WhatYouNeed({ className }: WhatYouNeedProps) {
  const items = [
    'Where you live (Scotland or rest of UK)',
    'Rough annual revenue',
    'Business expenses',
    "Any money you've already taken",
  ];

  return (
    <Card className={cn('border-primary/20 bg-card/50', className)}>
      <CardContent className='pt-6'>
        <div className='flex items-start gap-3'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <ClipboardList className='size-5 text-primary' aria-hidden='true' />
          </div>
          <div className='flex-1'>
            <h2 className='font-semibold text-foreground'>What you&apos;ll need</h2>
            <ul className='mt-2 space-y-1 text-muted-foreground text-sm'>
              {items.map((item) => (
                <li key={item} className='flex items-center gap-2'>
                  <span className='text-primary' aria-hidden='true'>
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className='mt-3 text-muted-foreground text-xs'>Takes about 2 minutes.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
