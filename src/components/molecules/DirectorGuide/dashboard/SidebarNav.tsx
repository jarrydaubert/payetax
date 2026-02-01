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
  'flex items-center rounded-[10px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

const getItemClass = (collapsed: boolean, isActive = false) =>
  cn(
    baseItemClass,
    collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
    isActive && 'bg-slate-800/50 text-cyan-400',
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
      {!collapsed && <span className='font-medium text-sm'>{label}</span>}
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
      {!collapsed && <span className='font-medium text-sm'>{label}</span>}
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
        collapsed ? 'w-14 items-center px-2' : 'w-48 px-3',
      )}
      aria-label='Sidebar navigation'
    >
      {/* Logo */}
      <Link
        href='/'
        className='mb-4 flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-emerald-500 font-bold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
        aria-label='PayeTax Home'
      >
        P
      </Link>

      {/* Section: Actions */}
      <section aria-label='Actions'>
        {!collapsed && (
          <div className='mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider'>
            Actions
          </div>
        )}

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
        {!collapsed && (
          <div className='mb-2 px-3 font-medium text-slate-600 text-xs uppercase tracking-wider'>
            Tools
          </div>
        )}

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
          {!collapsed && <span className='font-medium text-sm'>Collapse</span>}
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
