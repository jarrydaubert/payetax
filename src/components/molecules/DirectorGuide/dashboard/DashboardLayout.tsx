// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  inputs: ReactNode;
  main: ReactNode;
  education: ReactNode;
  className?: string;
}

/**
 * 4-column dashboard layout matching the mockup design
 * sidebar (60px) | inputs (280px) | main (flex) | education (320px)
 */
export function DashboardLayout({
  sidebar,
  inputs,
  main,
  education,
  className,
}: DashboardLayoutProps) {
  return (
    <div
      className={cn(
        'grid h-screen overflow-hidden bg-slate-950',
        'grid-cols-[60px_280px_1fr_320px]',
        'max-lg:grid-cols-[60px_1fr]',
        'max-md:grid-cols-1',
        className
      )}
    >
      {/* Icon sidebar - hidden on mobile */}
      <div className='max-md:hidden'>{sidebar}</div>

      {/* Inputs panel - hidden on tablet/mobile */}
      <div className='max-lg:hidden'>{inputs}</div>

      {/* Main content area */}
      <div className='overflow-y-auto'>{main}</div>

      {/* Education panel - hidden on tablet/mobile */}
      <div className='max-lg:hidden'>{education}</div>
    </div>
  );
}
