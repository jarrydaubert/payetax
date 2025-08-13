// src/app/not-found.tsx
import { Suspense } from 'react';
import NotFoundContent from '@/components/pages/NotFoundContent';

// Fixed 404 page - no double layout wrapping
export default function NotFound() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
