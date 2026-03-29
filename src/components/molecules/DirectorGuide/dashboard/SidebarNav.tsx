/**
 * Sidebar navigation with collapse/expand and dashboard jump links.
 *
 * - Expanded: workflow labels + quick actions
 * - Collapsed: compact icon rail
 * - Includes contextual jump menu for Director Intelligence sections
 */
'use client';

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  HelpCircle,
  Mail,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onEmailResults?: () => void;
  onReset?: () => void;
  dashboardVariant?: 'normal' | 'survival';
}

// Shared styles for nav items
const baseItemClass =
  'group flex min-h-9 w-full items-center rounded-lg border border-transparent py-2 text-muted-foreground transition-[color,background-color,border-color] duration-150 hover:border-border/60 hover:bg-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background 2xl:min-h-10 2xl:py-2.5';

const getItemClass = (collapsed: boolean, isActive = false) =>
  cn(
    baseItemClass,
    collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 2xl:gap-3 2xl:px-3',
    isActive && 'border-primary/30 bg-primary/10 text-primary',
  );

const getLabelClass = (collapsed: boolean) =>
  cn(
    'block max-w-44 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm tracking-tight transition-all duration-200 2xl:max-w-52',
    collapsed ? 'max-w-0 opacity-0' : 'opacity-100',
  );

const navIconClass = 'size-4 shrink-0 2xl:size-5';
const sectionHeaderClass =
  'mb-1.5 px-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest transition-opacity duration-200 2xl:mb-2 2xl:px-3';

const NORMAL_WORKFLOW_ITEMS = [
  { id: 'director-summary', label: 'Summary', icon: BarChart3 },
  { id: 'director-slider', label: 'Salary Slider', icon: Calculator },
  { id: 'director-strategy', label: 'Strategy Table', icon: FileSearch },
  { id: 'director-details', label: 'Breakdowns', icon: BookOpen },
  { id: 'director-key-dates', label: 'Money Flow', icon: MapPin },
] as const;

const SURVIVAL_WORKFLOW_ITEMS = [
  { id: 'director-survival', label: 'Survival Plan', icon: AlertTriangle },
  { id: 'director-key-dates', label: 'Key Dates', icon: MapPin },
] as const;

const TOOL_LINKS = [
  { href: '/' as const, icon: Calculator, label: 'PAYE Calculator' },
  { href: '/tools/tax-code-decoder' as const, icon: FileSearch, label: 'Tax Code Decoder' },
  {
    href: '/tools/scottish-tax-calculator' as const,
    icon: MapPin,
    label: 'Scottish Calculator',
  },
  { href: '/blog' as const, icon: BookOpen, label: 'Tax Guides' },
] as const;

const MAIN_SCROLL_ROOT_SELECTOR = '[data-director-scroll-root="true"]';

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
      className={cn(getItemClass(collapsed, isActive), 'mb-0.5')}
      aria-label={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className={navIconClass} aria-hidden='true' />
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
      title={collapsed ? label : undefined}
    >
      <Icon className={navIconClass} aria-hidden='true' />
      <span className={getLabelClass(collapsed)}>{label}</span>
    </button>
  );
}

function JumpButton({
  icon: Icon,
  label,
  collapsed,
  isActive,
  onClick,
}: {
  icon: typeof Calculator;
  label: string;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(getItemClass(collapsed, isActive), 'mb-0.5')}
      aria-label={collapsed ? label : undefined}
      aria-current={isActive ? 'step' : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className={navIconClass} aria-hidden='true' />
      <span className={getLabelClass(collapsed)}>{label}</span>
    </button>
  );
}

export function SidebarNav({
  collapsed = false,
  onToggle,
  onEmailResults,
  onReset,
  dashboardVariant,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const workflowItems = useMemo(() => {
    if (dashboardVariant === 'normal') {
      return NORMAL_WORKFLOW_ITEMS;
    }
    if (dashboardVariant === 'survival') {
      return SURVIVAL_WORKFLOW_ITEMS;
    }
    return [];
  }, [dashboardVariant]);

  // Determine active state for each link
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const scrollToSection = useCallback((sectionId: string) => {
    const root = document.querySelector<HTMLElement>(MAIN_SCROLL_ROOT_SELECTOR);
    const section = document.querySelector<HTMLElement>(`[data-director-section="${sectionId}"]`);
    if (!(root && section)) return;

    const rootRect = root.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const targetTop = sectionRect.top - rootRect.top + root.scrollTop - 16;

    root.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
    setActiveSectionId(sectionId);
  }, []);

  useEffect(() => {
    if (workflowItems.length === 0) {
      setActiveSectionId(null);
      return;
    }

    setActiveSectionId(workflowItems[0].id);
  }, [workflowItems]);

  useEffect(() => {
    if (workflowItems.length === 0 || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const root = document.querySelector<HTMLElement>(MAIN_SCROLL_ROOT_SELECTOR);
    if (!root) return;

    const targets = workflowItems
      .map((item) => document.querySelector<HTMLElement>(`[data-director-section="${item.id}"]`))
      .filter((section): section is HTMLElement => Boolean(section));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const firstVisible = visible[0];
        if (firstVisible) {
          setActiveSectionId(firstVisible.target.id);
        }
      },
      {
        root,
        rootMargin: '-18% 0px -58% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    );

    for (const target of targets) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [workflowItems]);

  return (
    <nav
      className={cn(
        'relative flex h-full flex-col border-border/40 border-r bg-background py-3 transition-[width,padding] duration-200 ease-out 2xl:py-4',
        collapsed ? 'w-14 px-2' : 'w-56 px-2.5 xl:w-64 2xl:w-72 2xl:px-3.5',
      )}
      aria-label='Sidebar navigation'
    >
      {/* Logo */}
      <Link
        href='/'
        className={cn(
          'mb-4 flex items-center rounded-xl border border-border/50 bg-card text-foreground transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          collapsed
            ? 'size-10 justify-center p-0'
            : 'mb-3 min-h-11 w-full gap-2.5 px-2.5 py-2 xl:mb-4 xl:min-h-12 xl:gap-3 xl:px-3 xl:py-2.5',
        )}
        aria-label='PayeTax Home'
      >
        <span className='flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-surface-brand'>
          P
        </span>
        <span
          className={cn(
            'brand-wordmark block max-w-44 overflow-hidden whitespace-nowrap text-foreground text-sm transition-all duration-200 2xl:text-base',
            collapsed ? 'max-w-0 opacity-0' : 'opacity-100',
          )}
        >
          paye
          <span className='text-gradient-brand'>tax</span>
        </span>
      </Link>

      {!collapsed && (
        <div className='mb-3 rounded-xl border border-primary/25 bg-primary/10 p-2.5 2xl:mb-4 2xl:p-3'>
          <div className='font-semibold text-primary text-xs uppercase tracking-widest'>Guide</div>
          <p className='mt-1 text-muted-foreground text-xs leading-relaxed'>
            {dashboardVariant
              ? 'Use Workflow to jump between sections instantly.'
              : 'Enter figures in the inputs panel to unlock scenario navigation.'}
          </p>
        </div>
      )}

      {/* Section: Actions */}
      <section aria-label='Actions'>
        <div className={cn(sectionHeaderClass, collapsed && 'opacity-0')}>Actions</div>

        {/* Email Results - disabled when no handler */}
        <NavButton
          icon={Mail}
          label='Email Results'
          collapsed={collapsed}
          onClick={onEmailResults}
          disabled={!onEmailResults}
          className='mb-0.5'
        />
        <NavButton
          icon={RotateCcw}
          label='Reset Guide'
          collapsed={collapsed}
          onClick={onReset}
          disabled={!onReset}
          className='mb-0.5'
        />
      </section>

      {workflowItems.length > 0 && (
        <>
          <div className='my-2.5 h-px bg-border/60 2xl:my-3' aria-hidden='true' />
          <section aria-label='Workflow'>
            <div className={cn(sectionHeaderClass, collapsed && 'opacity-0')}>Workflow</div>
            {workflowItems.map((item) => (
              <JumpButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
                isActive={activeSectionId === item.id}
                onClick={() => scrollToSection(item.id)}
              />
            ))}
          </section>
        </>
      )}

      <div className='my-2.5 h-px bg-border/60 2xl:my-3' aria-hidden='true' />

      {/* Section: Tools */}
      <section aria-label='Tools'>
        <div className={cn(sectionHeaderClass, collapsed && 'opacity-0')}>Tools</div>

        {TOOL_LINKS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            isActive={isActive(item.href)}
          />
        ))}
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
            <ChevronRight className={navIconClass} aria-hidden='true' />
          ) : (
            <ChevronLeft className={navIconClass} aria-hidden='true' />
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
