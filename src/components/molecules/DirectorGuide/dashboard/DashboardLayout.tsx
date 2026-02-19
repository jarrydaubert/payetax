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
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const INPUTS_PANEL_WIDTH = 280;
const EDUCATION_PANEL_WIDTH = 320;

interface DashboardLayoutProps {
  sidebar: ReactNode;
  inputs: ReactNode;
  main: ReactNode;
  education?: ReactNode;
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

/**
 * Mobile drawer component with proper dialog semantics
 */
function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default',
}: {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
  variant?: 'default' | 'education';
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button on open
    closeButtonRef.current?.focus();

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgColor = variant === 'education' ? 'bg-slate-900' : 'bg-slate-950';

  return (
    <div
      ref={drawerRef}
      role='dialog'
      aria-modal='true'
      aria-labelledby={`drawer-title-${variant}`}
      className={cn('fixed inset-0 z-50 flex flex-col lg:hidden', bgColor)}
    >
      <div className='relative border-white/[0.04] border-b px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3'>
        <h2
          id={`drawer-title-${variant}`}
          className='pointer-events-none text-center font-semibold text-lg text-slate-100'
        >
          {title}
        </h2>
        {onClose && (
          <button
            ref={closeButtonRef}
            type='button'
            onClick={onClose}
            className='absolute top-1/2 right-2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/60'
            aria-label={`Close ${title.toLowerCase()} panel`}
          >
            <X className='size-5' />
          </button>
        )}
      </div>
      <div className='flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]'>
        {children}
      </div>
    </div>
  );
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
  // Memoize toggle handlers for stable references
  const handleToggleMobileInputs = useCallback(() => {
    onToggleMobileInputs?.();
  }, [onToggleMobileInputs]);

  const handleToggleMobileEducation = useCallback(() => {
    onToggleMobileEducation?.();
  }, [onToggleMobileEducation]);

  return (
    <>
      <div
        className={cn('flex h-dvh overflow-hidden bg-slate-950', className)}
        // Prevent interaction with background when drawer is open
        aria-hidden={mobileInputsOpen || mobileEducationOpen}
        inert={mobileInputsOpen || mobileEducationOpen ? true : undefined}
      >
        {/* Sidebar - hidden on mobile */}
        <div className='shrink-0 max-md:hidden'>{sidebar}</div>

        {/* Inputs panel - collapsible, desktop only */}
        <div
          className='relative shrink-0 overflow-hidden border-white/[0.04] border-r bg-slate-950 transition-[width] duration-200 ease-out max-lg:hidden'
          style={{ width: inputsCollapsed ? 0 : INPUTS_PANEL_WIDTH }}
          aria-hidden={inputsCollapsed}
          inert={inputsCollapsed ? true : undefined}
        >
          <div className='pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center'>
            <h2 className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
              Your Numbers
            </h2>
          </div>
          <div
            className='h-full overflow-y-auto bg-slate-950 pt-12'
            style={{ width: INPUTS_PANEL_WIDTH }}
          >
            {inputs}
          </div>
          {onToggleInputs && !inputsCollapsed && (
            <button
              type='button'
              onClick={onToggleInputs}
              className='absolute top-3 right-4 z-20 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
              aria-label='Hide inputs panel'
            >
              <PanelLeftClose className='size-4' />
            </button>
          )}
        </div>

        {/* Main content area */}
        <div
          data-director-scroll-root='true'
          className='relative min-w-0 flex-1 overflow-y-auto bg-slate-950'
        >
          {/* Mobile header with logo */}
          <div className='sticky top-0 z-30 flex items-center justify-between border-white/[0.04] border-b bg-slate-950/95 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 backdrop-blur-sm lg:hidden'>
            <Link href='/' className='group' aria-label='PayeTax Home'>
              <span className='brand-wordmark text-[1.2rem] text-slate-100'>
                paye
                <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
                  tax
                </span>
              </span>
            </Link>
            <span className='text-slate-500 text-sm'>Director Intelligence</span>
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
          {education && educationCollapsed && onToggleEducation && (
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

        {/* Education panel - optional, collapsible, desktop only */}
        {education && (
          <div
            className='relative shrink-0 overflow-hidden border-white/[0.04] border-l bg-slate-900 transition-[width] duration-200 ease-out max-lg:hidden'
            style={{ width: educationCollapsed ? 0 : EDUCATION_PANEL_WIDTH }}
            aria-hidden={educationCollapsed}
            inert={educationCollapsed ? true : undefined}
          >
            <div className='pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center'>
              <h2 className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
                Learn
              </h2>
            </div>
            <div className='h-full overflow-y-auto pt-12' style={{ width: EDUCATION_PANEL_WIDTH }}>
              {education}
            </div>
            {onToggleEducation && !educationCollapsed && (
              <button
                type='button'
                onClick={onToggleEducation}
                className='absolute top-3 left-4 z-20 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300'
                aria-label='Hide learn panel'
              >
                <PanelRightClose className='size-4' />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile: FAB to open inputs */}
      {onToggleMobileInputs && !mobileInputsOpen && !mobileEducationOpen && (
        <button
          type='button'
          onClick={handleToggleMobileInputs}
          className='fixed right-6 bottom-6 z-40 rounded-full border border-transparent bg-[linear-gradient(rgba(2,6,23,0.95),rgba(2,6,23,0.95))_padding-box,linear-gradient(90deg,#06b6d4,#10b981)_border-box] p-4 shadow-lg transition-transform hover:scale-105 lg:hidden'
          aria-label='Open calculator inputs'
        >
          <Calculator className='size-6 text-slate-200' />
        </button>
      )}

      {/* Mobile: Full-screen inputs drawer */}
      <MobileDrawer
        isOpen={mobileInputsOpen}
        onClose={handleToggleMobileInputs}
        title='Your Numbers'
        variant='default'
      >
        {inputs}
      </MobileDrawer>

      {/* Mobile: FAB to show education */}
      {education && onToggleMobileEducation && !mobileInputsOpen && !mobileEducationOpen && (
        <button
          type='button'
          onClick={handleToggleMobileEducation}
          className='fixed bottom-6 left-6 z-40 rounded-full border border-white/10 bg-slate-800 p-3 shadow-lg transition-transform hover:scale-105 lg:hidden'
          aria-label='Show learn panel'
        >
          <BookOpen className='size-5 text-cyan-500' />
        </button>
      )}

      {/* Mobile: Education drawer */}
      {education && (
        <MobileDrawer
          isOpen={mobileEducationOpen}
          onClose={handleToggleMobileEducation}
          title='Learn'
          variant='education'
        >
          {education}
        </MobileDrawer>
      )}
    </>
  );
}
