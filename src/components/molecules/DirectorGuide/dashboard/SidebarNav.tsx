// src/components/molecules/DirectorGuide/dashboard/SidebarNav.tsx
/**
 * Sidebar navigation with collapse/expand
 *
 * Shows icons + labels when expanded (192px), icons only when collapsed (48px).
 * Contains quick actions (email, print, reset) and links to related tools.
 */
'use client';

import {
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  HelpCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onEmailResults?: () => void;
}

export function SidebarNav({ collapsed = false, onToggle, onEmailResults }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        'relative flex h-full flex-col border-white/[0.04] border-r bg-[#020617] py-4 transition-[width,padding] duration-200 ease-out',
        collapsed ? 'w-14 items-center px-2' : 'w-48 px-3',
      )}
    >
      {/* Logo */}
      <Link
        href='/'
        className='mb-4 flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-emerald-500 font-bold text-[#020617]'
      >
        P
      </Link>

      {/* Section: Actions */}
      {!collapsed && (
        <div className='mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider'>
          Actions
        </div>
      )}

      {/* Email Results */}
      <button
        type='button'
        onClick={onEmailResults}
        className={cn(
          'mb-1 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='Email Results'
      >
        <Mail className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>Email Results</span>}
      </button>

      {/* Divider */}
      <div className='my-3 h-px bg-white/[0.06]' />

      {/* Section: Tools */}
      {!collapsed && (
        <div className='mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider'>
          Tools
        </div>
      )}

      {/* PAYE Calculator */}
      <Link
        href='/'
        className={cn(
          'mb-1 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='PAYE Calculator'
      >
        <Calculator className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>PAYE Calculator</span>}
      </Link>

      {/* Tax Code Decoder */}
      <Link
        href='/tools/tax-code-decoder'
        className={cn(
          'mb-1 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='Tax Code Decoder'
      >
        <FileSearch className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>Tax Code Decoder</span>}
      </Link>

      {/* Scottish Calculator */}
      <Link
        href='/tools/scottish-tax-calculator'
        className={cn(
          'mb-1 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='Scottish Calculator'
      >
        <MapPin className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>Scottish Calculator</span>}
      </Link>

      {/* Blog */}
      <Link
        href='/blog'
        className={cn(
          'mb-1 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='Tax Guides'
      >
        <BookOpen className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>Tax Guides</span>}
      </Link>

      {/* Collapse/Expand toggle - positioned after Tax Guides */}
      {onToggle && (
        <button
          type='button'
          onClick={onToggle}
          className={cn(
            'mt-2 flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
          )}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? (
            <ChevronRight className='size-5 shrink-0' />
          ) : (
            <ChevronLeft className='size-5 shrink-0' />
          )}
          {!collapsed && <span className='font-medium text-sm'>Collapse</span>}
        </button>
      )}

      {/* Spacer */}
      <div className='flex-1' />

      {/* Help */}
      <Link
        href='/about'
        className={cn(
          'flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
        )}
        title='Help & About'
      >
        <HelpCircle className='size-5 shrink-0' />
        {!collapsed && <span className='font-medium text-sm'>Help</span>}
      </Link>
    </nav>
  );
}
