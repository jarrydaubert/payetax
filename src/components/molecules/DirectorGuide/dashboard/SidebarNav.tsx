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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onEmailResults?: () => void;
}

// Shared styles for nav items
const baseItemClass =
  'flex min-h-10 w-full items-center rounded-[10px] py-2.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

const getItemClass = (collapsed: boolean, isActive = false) =>
  cn(
    baseItemClass,
    collapsed ? 'justify-center px-0' : 'gap-3 px-3',
    isActive && 'bg-slate-800/50 text-cyan-400',
  );

const getLabelClass = (collapsed: boolean) =>
  cn(
    'block max-w-[160px] overflow-hidden whitespace-nowrap font-medium text-sm transition-all duration-200',
    collapsed ? 'max-w-0 opacity-0' : 'opacity-100',
  );

// NavLink component for DRY
function NavLink({
  href,
  icon: Icon,
  label,
  collapsed,
  isActive,
}: {
  href: '/' | '/tools/tax-code-decoder' | '/tools/scottish-tax-calculator' | '/blog' | '/about';
  icon: typeof Calculator;
  label: string;
  collapsed: boolean;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(getItemClass(collapsed, isActive), 'mb-1')}
      aria-label={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className='size-5 shrink-0' aria-hidden='true' />
      <span className={getLabelClass(collapsed)}>{label}</span>
    </Link>
  );
}

// NavButton component for DRY
function NavButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
  disabled,
  className,
}: {
  icon: typeof Mail;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        getItemClass(collapsed),
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      aria-label={collapsed ? label : undefined}
    >
      <Icon className='size-5 shrink-0' aria-hidden='true' />
      <span className={getLabelClass(collapsed)}>{label}</span>
    </button>
  );
}

export function SidebarNav({ collapsed = false, onToggle, onEmailResults }: SidebarNavProps) {
  const pathname = usePathname();

  // Determine active state for each link
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'relative flex h-full flex-col border-white/[0.04] border-r bg-slate-950 py-4 transition-[width,padding] duration-200 ease-out',
        collapsed ? 'w-14 px-2' : 'w-48 px-3',
      )}
      aria-label='Sidebar navigation'
    >
      {/* Logo */}
      <Link
        href='/'
        className={cn(
          'mb-4 flex items-center rounded-[12px] border border-white/[0.08] bg-slate-900/60 text-slate-100 transition-colors hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          collapsed ? 'size-12 justify-center p-0' : 'min-h-12 w-full gap-3 px-3 py-2.5',
        )}
        aria-label='PayeTax Home'
      >
        <span className='flex size-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-cyan-500 to-emerald-500 font-bold text-slate-950'>
          P
        </span>
        <span
          className={cn(
            'block max-w-[160px] overflow-hidden whitespace-nowrap font-semibold text-[0.95rem] text-slate-100 tracking-[-0.02em] transition-all duration-200',
            collapsed ? 'max-w-0 opacity-0' : 'opacity-100',
          )}
        >
          paye
          <span className='bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent'>
            tax
          </span>
        </span>
      </Link>

      {/* Section: Actions */}
      <section aria-label='Actions'>
        <div
          className={cn(
            'mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider transition-opacity duration-200',
            collapsed && 'opacity-0',
          )}
        >
          Actions
        </div>

        {/* Email Results - disabled when no handler */}
        <NavButton
          icon={Mail}
          label='Email Results'
          collapsed={collapsed}
          onClick={onEmailResults}
          disabled={!onEmailResults}
          className='mb-1'
        />
      </section>

      {/* Visual divider - decorative, not semantic */}
      <div className='my-3 h-px bg-white/[0.06]' aria-hidden='true' />

      {/* Section: Tools */}
      <section aria-label='Tools'>
        <div
          className={cn(
            'mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider transition-opacity duration-200',
            collapsed && 'opacity-0',
          )}
        >
          Tools
        </div>

        <NavLink
          href='/'
          icon={Calculator}
          label='PAYE Calculator'
          collapsed={collapsed}
          isActive={isActive('/')}
        />

        <NavLink
          href='/tools/tax-code-decoder'
          icon={FileSearch}
          label='Tax Code Decoder'
          collapsed={collapsed}
          isActive={isActive('/tools/tax-code-decoder')}
        />

        <NavLink
          href='/tools/scottish-tax-calculator'
          icon={MapPin}
          label='Scottish Calculator'
          collapsed={collapsed}
          isActive={isActive('/tools/scottish-tax-calculator')}
        />

        <NavLink
          href='/blog'
          icon={BookOpen}
          label='Tax Guides'
          collapsed={collapsed}
          isActive={isActive('/blog')}
        />
      </section>

      {/* Collapse/Expand toggle */}
      {onToggle && (
        <button
          type='button'
          onClick={onToggle}
          className={cn(getItemClass(collapsed), 'mt-2')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className='size-5 shrink-0' aria-hidden='true' />
          ) : (
            <ChevronLeft className='size-5 shrink-0' aria-hidden='true' />
          )}
          <span className={getLabelClass(collapsed)}>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      )}
      {/* Spacer */}
      <div className='flex-1' />

      {/* Help */}
      <NavLink
        href='/about'
        icon={HelpCircle}
        label='Help & About'
        collapsed={collapsed}
        isActive={isActive('/about')}
      />
    </nav>
  );
}
