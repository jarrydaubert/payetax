// src/components/molecules/DirectorGuide/dashboard/SidebarNav.tsx
'use client';

import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Calculator, label: 'Calculator', href: '/paye-calculator' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

interface SidebarNavProps {
  expanded?: boolean;
  onToggle?: () => void;
}

/**
 * Icon-based sidebar navigation with expand/collapse functionality
 */
export function SidebarNav({ expanded = false, onToggle }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        'flex h-full flex-col border-r border-white/5 bg-slate-950 py-4 transition-all duration-300',
        expanded ? 'w-48 items-stretch px-3' : 'w-[60px] items-center px-2'
      )}
    >
      {/* Logo */}
      <a
        href='/'
        className={cn(
          'mb-4 flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-emerald-500 font-bold text-slate-950',
          expanded && 'self-start'
        )}
      >
        P
      </a>

      {/* Nav items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const content = (
          <div
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-[10px] transition-all',
              expanded ? 'px-3 py-2.5' : 'size-10 justify-center',
              item.active
                ? 'bg-cyan-500/15 text-cyan-500'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-400'
            )}
            title={expanded ? undefined : item.label}
          >
            <Icon className='size-5 shrink-0' />
            {expanded && <span className='text-sm font-medium truncate'>{item.label}</span>}
          </div>
        );

        if (item.href) {
          return (
            <a key={item.label} href={item.href} className='mb-1'>
              {content}
            </a>
          );
        }

        return (
          <div key={item.label} className='mb-1'>
            {content}
          </div>
        );
      })}

      {/* Spacer */}
      <div className='flex-1' />

      {/* Help */}
      <div
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
          expanded ? 'px-3 py-2.5' : 'size-10 justify-center'
        )}
        title={expanded ? undefined : 'Help'}
      >
        <HelpCircle className='size-5 shrink-0' />
        {expanded && <span className='text-sm font-medium'>Help</span>}
      </div>

      {/* Expand/Collapse toggle */}
      {onToggle && (
        <button
          type='button'
          onClick={onToggle}
          className={cn(
            'mt-2 flex cursor-pointer items-center gap-3 rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400',
            expanded ? 'px-3 py-2.5' : 'size-10 justify-center'
          )}
          title={expanded ? 'Collapse menu' : 'Expand menu'}
        >
          {expanded ? (
            <>
              <ChevronLeft className='size-5 shrink-0' />
              <span className='text-sm font-medium'>Collapse</span>
            </>
          ) : (
            <ChevronRight className='size-5 shrink-0' />
          )}
        </button>
      )}
    </nav>
  );
}
