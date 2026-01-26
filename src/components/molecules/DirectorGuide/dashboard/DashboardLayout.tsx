// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  inputs: ReactNode;
  main: ReactNode;
  education: ReactNode;
  inputsCollapsed?: boolean;
  educationCollapsed?: boolean;
  onToggleInputs?: () => void;
  onToggleEducation?: () => void;
  className?: string;
}

/**
 * 4-column dashboard layout matching the mockup design
 * sidebar (60px) | inputs (280px) | main (flex) | education (320px)
 *
 * Panels can be collapsed to give more space to the main content.
 */
export function DashboardLayout({
  sidebar,
  inputs,
  main,
  education,
  inputsCollapsed = false,
  educationCollapsed = false,
  onToggleInputs,
  onToggleEducation,
  className,
}: DashboardLayoutProps) {
  // Build grid columns based on collapsed state
  const getGridCols = () => {
    const inputsWidth = inputsCollapsed ? '0px' : '280px';
    const educationWidth = educationCollapsed ? '0px' : '320px';
    return `60px ${inputsWidth} 1fr ${educationWidth}`;
  };

  return (
    <div
      className={cn(
        'grid h-screen overflow-hidden bg-slate-950 transition-all duration-300',
        'max-lg:grid-cols-[60px_1fr]',
        'max-md:grid-cols-1',
        className
      )}
      style={{ gridTemplateColumns: getGridCols() }}
    >
      {/* Icon sidebar - hidden on mobile */}
      <div className='max-md:hidden'>{sidebar}</div>

      {/* Inputs panel - collapsible */}
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-300 max-lg:hidden',
          inputsCollapsed && 'w-0'
        )}
      >
        {!inputsCollapsed && inputs}
        {/* Collapse button */}
        {onToggleInputs && (
          <button
            type='button'
            onClick={onToggleInputs}
            className='absolute top-1/2 -right-0 z-10 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/10 bg-slate-800 p-1.5 text-slate-400 shadow-lg transition-colors hover:bg-slate-700 hover:text-slate-200'
            title={inputsCollapsed ? 'Show inputs' : 'Hide inputs'}
          >
            {inputsCollapsed ? <ChevronRight className='size-4' /> : <ChevronLeft className='size-4' />}
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className='relative overflow-y-auto'>
        {/* Show inputs toggle when collapsed */}
        {inputsCollapsed && onToggleInputs && (
          <button
            type='button'
            onClick={onToggleInputs}
            className='absolute top-4 left-4 z-10 rounded-full border border-white/10 bg-slate-800 p-2 text-slate-400 shadow-lg transition-colors hover:bg-slate-700 hover:text-slate-200 max-lg:hidden'
            title='Show inputs'
          >
            <ChevronRight className='size-4' />
          </button>
        )}
        {main}
        {/* Show education toggle when collapsed */}
        {educationCollapsed && onToggleEducation && (
          <button
            type='button'
            onClick={onToggleEducation}
            className='absolute top-4 right-4 z-10 rounded-full border border-white/10 bg-slate-800 p-2 text-slate-400 shadow-lg transition-colors hover:bg-slate-700 hover:text-slate-200 max-lg:hidden'
            title='Show learn panel'
          >
            <ChevronLeft className='size-4' />
          </button>
        )}
      </div>

      {/* Education panel - collapsible */}
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-300 max-lg:hidden',
          educationCollapsed && 'w-0'
        )}
      >
        {!educationCollapsed && education}
        {/* Collapse button */}
        {onToggleEducation && !educationCollapsed && (
          <button
            type='button'
            onClick={onToggleEducation}
            className='absolute top-1/2 -left-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-800 p-1.5 text-slate-400 shadow-lg transition-colors hover:bg-slate-700 hover:text-slate-200'
            title='Hide learn panel'
          >
            <ChevronRight className='size-4' />
          </button>
        )}
      </div>
    </div>
  );
}
