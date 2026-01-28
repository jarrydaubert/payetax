// src/components/molecules/DirectorGuide/dashboard/DashboardLayout.tsx
/**
 * Dashboard Layout - 2-panel layout (main + education)
 *
 * Simplified from 4-panel to 2-panel after Calculator merge.
 * Main panel contains inputs + results (scrollable).
 * Education panel is collapsible sidebar.
 */
'use client';

import { BookOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const EDUCATION_PANEL_WIDTH = 340;

interface DashboardLayoutProps {
  main: ReactNode;
  education: ReactNode;
  educationCollapsed?: boolean;
  onToggleEducation?: () => void;
  className?: string;
}

/**
 * 2-panel dashboard layout
 * - Desktop: Main content + collapsible education panel
 * - Mobile: Full-width main with FAB to show education
 */
export function DashboardLayout({
  main,
  education,
  educationCollapsed = false,
  onToggleEducation,
  className,
}: DashboardLayoutProps) {
  return (
    <>
      <div className={cn('flex h-dvh overflow-hidden bg-background', className)}>
        {/* Main content area */}
        <div className='relative min-w-0 flex-1 overflow-y-auto'>
          {/* Toggle button when education panel is collapsed - desktop only */}
          {educationCollapsed && onToggleEducation && (
            <button
              type='button'
              onClick={onToggleEducation}
              className='absolute top-4 right-4 z-10 rounded-lg border bg-background p-2 shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:hidden'
              aria-label='Show learn panel'
              title='Show learn panel'
            >
              <PanelRightOpen className='size-4' aria-hidden='true' />
            </button>
          )}
          {main}
        </div>

        {/* Education panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden border-l transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: educationCollapsed ? 0 : EDUCATION_PANEL_WIDTH }}
          aria-hidden={educationCollapsed}
          inert={educationCollapsed ? true : undefined}
        >
          <div className='h-full overflow-y-auto' style={{ width: EDUCATION_PANEL_WIDTH }}>
            {education}
          </div>
          {/* Collapse button - top left corner */}
          {onToggleEducation && !educationCollapsed && (
            <button
              type='button'
              onClick={onToggleEducation}
              className='absolute top-4 left-4 z-10 rounded-lg border bg-background p-2 shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label='Hide learn panel'
              title='Hide learn panel'
            >
              <PanelRightClose className='size-4' aria-hidden='true' />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: FAB to show education panel */}
      {onToggleEducation && (
        <button
          type='button'
          onClick={onToggleEducation}
          className='fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden'
          aria-label='Show learn panel'
        >
          <BookOpen className='size-6' aria-hidden='true' />
        </button>
      )}

      {/* Mobile: Education drawer (full screen overlay) */}
      {!educationCollapsed && (
        <div className='fixed inset-0 z-50 flex flex-col bg-background lg:hidden'>
          {/* Drawer header */}
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='font-semibold text-lg'>Learn</h2>
            <button
              type='button'
              onClick={onToggleEducation}
              className='rounded-lg p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label='Close learn panel'
            >
              <PanelRightClose className='size-5' aria-hidden='true' />
            </button>
          </div>
          {/* Drawer content */}
          <div className='flex-1 overflow-y-auto'>{education}</div>
        </div>
      )}
    </>
  );
}
