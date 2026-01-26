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
  onToggleSidebar?: () => void;
  onToggleInputs?: () => void;
  onToggleEducation?: () => void;
  className?: string;
}

/**
 * Dashboard layout with overlay sidebar pattern
 * Sidebar expands OVER the content (like Slack/Discord) instead of pushing it
 */
export function DashboardLayout({
  sidebar,
  inputs,
  main,
  education,
  sidebarExpanded = false,
  inputsCollapsed = false,
  educationCollapsed = false,
  onToggleSidebar,
  onToggleInputs,
  onToggleEducation,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn('relative flex h-screen overflow-hidden bg-slate-950', className)}>
      {/* Icon sidebar - always 60px, content overlays when expanded */}
      <div className='relative z-20 shrink-0 max-md:hidden' style={{ width: 60 }}>
        {/* Collapsed sidebar (icons only) - always visible */}
        <div className='h-full w-[60px]'>{sidebar}</div>

        {/* Expanded overlay - slides out from the sidebar */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full w-48 shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out',
            sidebarExpanded ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebar}
        </div>
      </div>

      {/* Backdrop when sidebar expanded */}
      {sidebarExpanded && onToggleSidebar && (
        <div
          className='absolute inset-0 z-10 bg-black/20 max-md:hidden'
          onClick={onToggleSidebar}
          onKeyDown={(e) => e.key === 'Escape' && onToggleSidebar()}
        />
      )}

      {/* Inputs panel - collapsible */}
      <div
        className='relative shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out max-lg:hidden'
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
        className='relative shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out max-lg:hidden'
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
