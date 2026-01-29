// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
/**
 * Dashboard Layout - 4-panel layout matching the original mockup
 *
 * - Sidebar nav (60px) - icon navigation
 * - Inputs panel (280px) - form fields
 * - Main content (flex) - summary cards, slider, detail cards, chart
 * - Education panel (320px) - learn panel
 */
'use client';

import {
  BookOpen,
  Calculator,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
  mobileInputsOpen?: boolean;
  onToggleMobileInputs?: () => void;
  mobileEducationOpen?: boolean;
  onToggleMobileEducation?: () => void;
  className?: string;
}

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
  mobileEducationOpen = false,
  onToggleMobileEducation,
  className,
}: DashboardLayoutProps) {
  return (
    <>
      <div className={cn('flex h-dvh overflow-hidden bg-[#020617]', className)}>
        {/* Sidebar - hidden on mobile */}
        <div className='shrink-0 max-md:hidden'>{sidebar}</div>

        {/* Inputs panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden border-white/[0.04] border-r transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: inputsCollapsed ? 0 : INPUTS_PANEL_WIDTH }}
          aria-hidden={inputsCollapsed}
          inert={inputsCollapsed ? true : undefined}
        >
          <div className='h-full overflow-y-auto' style={{ width: INPUTS_PANEL_WIDTH }}>
            {inputs}
          </div>
          {onToggleInputs && !inputsCollapsed && (
            <button
              type='button'
              onClick={onToggleInputs}
              className='absolute top-4 right-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
              aria-label='Hide inputs panel'
            >
              <PanelLeftClose className='size-4' />
            </button>
          )}
        </div>

        {/* Main content area */}
        <div className='relative min-w-0 flex-1 overflow-y-auto bg-[#020617]'>
          {/* Mobile header with logo */}
          <div className='sticky top-0 z-30 flex items-center justify-between border-white/[0.04] border-b bg-[#020617]/95 px-4 py-3 backdrop-blur-sm lg:hidden'>
            <Link href='/' className='group'>
              <span className='font-semibold text-[1.2rem] text-slate-100 tracking-[-0.03em]'>
                paye
                <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
                  tax
                </span>
              </span>
            </Link>
            <span className='text-slate-500 text-sm'>Director Guide</span>
          </div>

          {/* Toggle buttons when panels are collapsed */}
          {inputsCollapsed && onToggleInputs && (
            <button
              type='button'
              onClick={onToggleInputs}
              className='absolute top-6 left-4 z-20 rounded-lg border border-white/10 bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200 max-lg:hidden'
              aria-label='Show inputs panel'
            >
              <PanelLeftOpen className='size-4' />
            </button>
          )}
          {educationCollapsed && onToggleEducation && (
            <button
              type='button'
              onClick={onToggleEducation}
              className='absolute top-6 right-4 z-20 rounded-lg border border-white/10 bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200 max-lg:hidden'
              aria-label='Show learn panel'
            >
              <PanelRightOpen className='size-4' />
            </button>
          )}
          {main}
        </div>

        {/* Education panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden border-white/[0.04] border-l bg-[#0f172a] transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: educationCollapsed ? 0 : EDUCATION_PANEL_WIDTH }}
          aria-hidden={educationCollapsed}
          inert={educationCollapsed ? true : undefined}
        >
          <div className='h-full overflow-y-auto' style={{ width: EDUCATION_PANEL_WIDTH }}>
            {education}
          </div>
          {onToggleEducation && !educationCollapsed && (
            <button
              type='button'
              onClick={onToggleEducation}
              className='absolute top-4 left-4 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
              aria-label='Hide learn panel'
            >
              <PanelRightClose className='size-4' />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: FAB to open inputs */}
      {onToggleMobileInputs && (
        <button
          type='button'
          onClick={onToggleMobileInputs}
          className='fixed right-6 bottom-6 z-50 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 p-4 shadow-lg transition-transform hover:scale-105 lg:hidden'
          aria-label='Open calculator inputs'
        >
          <Calculator className='size-6 text-[#020617]' />
        </button>
      )}

      {/* Mobile: Full-screen inputs drawer */}
      {mobileInputsOpen && (
        <div className='fixed inset-0 z-50 flex flex-col bg-[#020617] lg:hidden'>
          <div className='flex items-center justify-between border-white/[0.04] border-b px-4 py-3'>
            <h2 className='font-semibold text-lg text-slate-100'>Your Numbers</h2>
            <button
              type='button'
              onClick={onToggleMobileInputs}
              className='rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200'
              aria-label='Close inputs panel'
            >
              <X className='size-5' />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto'>{inputs}</div>
        </div>
      )}

      {/* Mobile: FAB to show education */}
      {onToggleMobileEducation && !mobileInputsOpen && (
        <button
          type='button'
          onClick={onToggleMobileEducation}
          className='fixed bottom-6 left-6 z-50 rounded-full border border-white/10 bg-slate-800 p-3 shadow-lg transition-transform hover:scale-105 lg:hidden'
          aria-label='Show learn panel'
        >
          <BookOpen className='size-5 text-cyan-500' />
        </button>
      )}

      {/* Mobile: Education drawer */}
      {mobileEducationOpen && (
        <div className='fixed inset-0 z-50 flex flex-col bg-[#0f172a] lg:hidden'>
          <div className='flex items-center justify-between border-white/[0.04] border-b px-4 py-3'>
            <h2 className='font-semibold text-lg text-slate-100'>Learn</h2>
            <button
              type='button'
              onClick={onToggleMobileEducation}
              className='rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200'
              aria-label='Close learn panel'
            >
              <X className='size-5' />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto'>{education}</div>
        </div>
      )}
    </>
  );
}
