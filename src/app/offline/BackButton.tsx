// src/app/offline/BackButton.tsx
'use client';

import { Button } from '@/components/ui/button';

export function BackButton() {
  return (
    <Button onClick={() => window.history.back()} size='touch' className='rounded-sm px-6'>
      Go back
    </Button>
  );
}
