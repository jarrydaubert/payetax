// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
'use client';

import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  inputs: ReactNode;
  main: ReactNode;
  education: ReactNode;
  sidebarExpanded?: boolean;
  inputsCollapsed?: boolean;
  educationCollapsed?: boolean;
  onToggleInputs?: () => void;
  onToggleEducation?: () => void;
  className?: string;
}

/**
 * Dashboard layout - sidebar expands and pushes content right
 */
export function DashboardLayout({
  sidebar,
  inputs,
  main,
  education,
  sidebarExpanded = false,
  inputsCollapsed = false,
  educationCollapsed = false,
  onToggleInputs,
  onToggleEducation,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-slate-950', className)}>
      {/* Sidebar - expands from 60px to 192px, pushes content */}
      <div
        className='shrink-0 overflow-hidden transition-[width] duration-200 ease-out max-md:hidden'
        style={{ width: sidebarExpanded ? 192 : 60 }}
      >
        <div className='h-full w-48'>{sidebar}</div>
      </div>

      {/* Inputs panel - collapsible */}
      <div
        className='relative shrink-0 overflow-hidden transition-[width] duration-200 ease-out max-lg:hidden'
        style={{ width: inputsCollapsed ? 0 : 280 }}
      >
        <div className='h-full w-[280px]'>{inputs}</div>
        {/* Collapse button - top right corner */}
        {onToggleInputs && !inputsCollapsed && (
          <button
            type='button'
            onClick={onToggleInputs}
            className='absolute top-4 right-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
            title='Hide inputs'
          >
            <PanelLeftClose className='size-4' />
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className='relative min-w-0 flex-1 overflow-y-auto'>
        {/* Toggle buttons when panels are collapsed */}
        <div className='absolute top-16 left-4 right-4 z-10 flex justify-between pointer-events-none max-lg:hidden'>
          {/* Left: Show inputs button */}
          {inputsCollapsed && onToggleInputs ? (
            <button
              type='button'
              onClick={onToggleInputs}
              className='pointer-events-auto rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
              title='Show inputs'
            >
              <PanelLeftOpen className='size-4' />
            </button>
          ) : (
            <div />
          )}

          {/* Right: Show education button */}
          {educationCollapsed && onToggleEducation ? (
            <button
              type='button'
              onClick={onToggleEducation}
              className='pointer-events-auto rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
              title='Show learn panel'
            >
              <PanelRightOpen className='size-4' />
            </button>
          ) : (
            <div />
          )}
        </div>
        {main}
      </div>

      {/* Education panel - collapsible */}
      <div
        className='relative shrink-0 overflow-hidden transition-[width] duration-200 ease-out max-lg:hidden'
        style={{ width: educationCollapsed ? 0 : 320 }}
      >
        <div className='h-full w-[320px]'>{education}</div>
        {/* Collapse button - top left corner */}
        {onToggleEducation && !educationCollapsed && (
          <button
            type='button'
            onClick={onToggleEducation}
            className='absolute top-4 left-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
            title='Hide learn panel'
          >
            <PanelRightClose className='size-4' />
          </button>
        )}
      </div>
    </div>
  );
}
