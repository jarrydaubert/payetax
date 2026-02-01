// src/app/offline/BackButton.tsx
'use client';

import { Button } from '@/components/ui/button';

export function BackButton() {
  return (
    <Button onClick={() => window.history.back()} variant='default' size='lg'>
      Go Back
    </Button>
  );
}
