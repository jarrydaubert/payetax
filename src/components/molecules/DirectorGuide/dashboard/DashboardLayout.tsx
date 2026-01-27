// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
'use client';

import {
  Calculator,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Panel width constants
const INPUTS_PANEL_WIDTH = 280;
const EDUCATION_PANEL_WIDTH = 320;

interface DashboardLayoutProps {
  sidebar: ReactNode;
  inputs: ReactNode;
  main: ReactNode;
  education: ReactNode;
  inputsCollapsed?: boolean;
  educationCollapsed?: boolean;
  onToggleInputs?: () => void;
  onToggleEducation?: () => void;
  // Mobile drawer state
  mobileInputsOpen?: boolean;
  onToggleMobileInputs?: () => void;
  className?: string;
}

/**
 * Dashboard layout with responsive mobile support
 * - Desktop: Multi-panel layout with collapsible inputs/education
 * - Mobile: Single column with drawer for inputs
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
  mobileInputsOpen = false,
  onToggleMobileInputs,
  className,
}: DashboardLayoutProps) {
  return (
    <>
      <div className={cn('flex h-dvh overflow-hidden bg-slate-950', className)}>
        {/* Sidebar - hidden on mobile */}
        <div className='shrink-0 max-md:hidden'>{sidebar}</div>

        {/* Inputs panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: inputsCollapsed ? 0 : INPUTS_PANEL_WIDTH }}
          aria-hidden={inputsCollapsed}
          inert={inputsCollapsed ? true : undefined}
        >
          <div className='h-full' style={{ width: INPUTS_PANEL_WIDTH }}>
            {inputs}
          </div>
          {/* Collapse button - top right corner */}
          {onToggleInputs && !inputsCollapsed && (
            <button
              type='button'
              onClick={onToggleInputs}
              className='absolute top-4 right-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
              aria-label='Hide inputs panel'
              title='Hide inputs'
            >
              <PanelLeftClose className='size-4' aria-hidden='true' />
            </button>
          )}
        </div>

        {/* Main content area */}
        <div className='relative min-w-0 flex-1 overflow-y-auto'>
          {/* Toggle buttons when panels are collapsed - desktop only */}
          <div className='absolute top-16 left-4 right-4 z-10 flex justify-between pointer-events-none max-lg:hidden'>
            {/* Left: Show inputs button */}
            {inputsCollapsed && onToggleInputs ? (
              <button
                type='button'
                onClick={onToggleInputs}
                className='pointer-events-auto rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
                aria-label='Show inputs panel'
                title='Show inputs'
              >
                <PanelLeftOpen className='size-4' aria-hidden='true' />
              </button>
            ) : (
              <div />
            )}

            {/* Right: Show education button */}
            {educationCollapsed && onToggleEducation ? (
              <button
                type='button'
                onClick={onToggleEducation}
                className='pointer-events-auto rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
                aria-label='Show learn panel'
                title='Show learn panel'
              >
                <PanelRightOpen className='size-4' aria-hidden='true' />
              </button>
            ) : (
              <div />
            )}
          </div>
          {main}
        </div>

        {/* Education panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: educationCollapsed ? 0 : EDUCATION_PANEL_WIDTH }}
          aria-hidden={educationCollapsed}
          inert={educationCollapsed ? true : undefined}
        >
          <div className='h-full' style={{ width: EDUCATION_PANEL_WIDTH }}>
            {education}
          </div>
          {/* Collapse button - top left corner */}
          {onToggleEducation && !educationCollapsed && (
            <button
              type='button'
              onClick={onToggleEducation}
              className='absolute top-4 left-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
              aria-label='Hide learn panel'
              title='Hide learn panel'
            >
              <PanelRightClose className='size-4' aria-hidden='true' />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: Floating action button to open inputs */}
      {onToggleMobileInputs && (
        <button
          type='button'
          onClick={onToggleMobileInputs}
          className='fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:hidden'
          aria-label='Open calculator inputs'
        >
          <Calculator className='size-6 text-slate-950' aria-hidden='true' />
        </button>
      )}

      {/* Mobile: Full-screen inputs drawer */}
      {mobileInputsOpen && (
        <div className='fixed inset-0 z-50 flex flex-col bg-slate-950 lg:hidden'>
          {/* Drawer header */}
          <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
            <h2 className='font-semibold text-lg text-slate-100'>Your Numbers</h2>
            <button
              type='button'
              onClick={onToggleMobileInputs}
              className='rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
              aria-label='Close inputs panel'
            >
              <X className='size-5' aria-hidden='true' />
            </button>
          </div>
          {/* Drawer content */}
          <div className='flex-1 overflow-y-auto'>{inputs}</div>
        </div>
      )}
    </>
  );
}
