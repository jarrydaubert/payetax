// src/components/molecules/DirectorGuide/dashboard/SidebarNav.tsx
'use client';

import { Calculator, FileText, HelpCircle, LayoutDashboard, Settings } from 'lucide-react';
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

/**
 * Icon-based sidebar navigation matching the mockup
 */
export function SidebarNav() {
  return (
    <nav className='flex h-full flex-col items-center gap-2 border-r border-white/5 bg-slate-950 px-2 py-4'>
      {/* Logo */}
      <a
        href='/'
        className='mb-4 flex size-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-emerald-500 font-bold text-slate-950'
      >
        P
      </a>

      {/* Nav items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const content = (
          <div
            className={cn(
              'flex size-10 cursor-pointer items-center justify-center rounded-[10px] transition-all',
              item.active
                ? 'bg-cyan-500/15 text-cyan-500'
                : 'text-slate-500 hover:bg-slate-800 hover:text-slate-400'
            )}
            title={item.label}
          >
            <Icon className='size-5' />
          </div>
        );

        if (item.href) {
          return (
            <a key={item.label} href={item.href}>
              {content}
            </a>
          );
        }

        return <div key={item.label}>{content}</div>;
      })}

      {/* Spacer */}
      <div className='flex-1' />

      {/* Help */}
      <div
        className='flex size-10 cursor-pointer items-center justify-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-400'
        title='Help'
      >
        <HelpCircle className='size-5' />
      </div>
    </nav>
  );
}
