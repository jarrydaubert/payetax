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
  sidebarExpanded = false,
  inputsCollapsed = false,
  educationCollapsed = false,
  onToggleInputs,
  onToggleEducation,
  className,
}: DashboardLayoutProps) {
  // Build grid columns based on collapsed/expanded state
  const getGridCols = () => {
    const sidebarWidth = sidebarExpanded ? '192px' : '60px'; // 192px = w-48
    const inputsWidth = inputsCollapsed ? '0px' : '280px';
    const educationWidth = educationCollapsed ? '0px' : '320px';
    return `${sidebarWidth} ${inputsWidth} 1fr ${educationWidth}`;
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
      {/* Icon sidebar - expandable (toggle handled inside SidebarNav) */}
      <div className='overflow-hidden transition-all duration-300 max-md:hidden'>
        {sidebar}
      </div>

      {/* Inputs panel - collapsible */}
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-300 max-lg:hidden',
          inputsCollapsed && 'w-0'
        )}
      >
        {!inputsCollapsed && (
          <>
            {inputs}
            {/* Collapse button - top right corner */}
            {onToggleInputs && (
              <button
                type='button'
                onClick={onToggleInputs}
                className='absolute top-4 right-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
                title='Hide inputs'
              >
                <PanelLeftClose className='size-4' />
              </button>
            )}
          </>
        )}
      </div>

      {/* Main content area */}
      <div className='relative overflow-y-auto'>
        {/* Toggle buttons when panels are collapsed - positioned below header */}
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
        className={cn(
          'relative overflow-hidden transition-all duration-300 max-lg:hidden',
          educationCollapsed && 'w-0'
        )}
      >
        {!educationCollapsed && (
          <>
            {/* Collapse button - top left corner */}
            {onToggleEducation && (
              <button
                type='button'
                onClick={onToggleEducation}
                className='absolute top-4 left-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
                title='Hide learn panel'
              >
                <PanelRightClose className='size-4' />
              </button>
            )}
            {education}
          </>
        )}
      </div>
    </div>
  );
}
