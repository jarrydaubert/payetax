/**
 * SectionHeading Component
 *
 * Reusable section heading with optional badge, title, and subtitle.
 * Simpler than ContentSection (no body content), focused on headings only.
 *
 * Used across all pages for consistent section headers.
 *
 * @module components/molecules/SectionHeading
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SectionBadgeData } from '@/lib/validation/pageDataValidation';

/**
 * Badge configuration for SectionHeading
 * Extends validated SectionBadgeData with icon
 */
export interface SectionHeadingBadge extends SectionBadgeData {
  /** Optional icon to display in badge */
  icon?: LucideIcon;
}

/**
 * Props for SectionHeading component
 */
export interface SectionHeadingProps {
  /** Optional badge above title */
  badge?: SectionHeadingBadge;
  /** Main heading text or React node */
  title: React.ReactNode;
  /** Optional subtitle text */
  subtitle?: string;
  /** Text alignment */
  align?: 'left' | 'center';
  /** Optional custom className */
  className?: string;
  /** Heading level (h2 or h3) */
  level?: 'h2' | 'h3';
  /** Optional ID for anchor links */
  id?: string;
}

/**
 * SectionHeading Component
 *
 * Displays a section heading with optional badge and subtitle.
 * Lighter weight than ContentSection - just the header, no body content.
 *
 * @example Basic usage
 * ```tsx
 * <SectionHeading
 *   title="Our Mission"
 *   subtitle="Building the best tax calculator for the UK"
 * />
 * ```
 *
 * @example With badge and icon
 * ```tsx
 * <SectionHeading
 *   badge={{ icon: Sparkles, text: 'New', variant: 'default' }}
 *   title="Latest Features"
 *   align="center"
 * />
 * ```
 *
 * @example As h3 with ID
 * ```tsx
 * <SectionHeading
 *   id="privacy-principles"
 *   level="h3"
 *   title="Privacy Principles"
 *   subtitle="How we protect your data"
 * />
 * ```
 */
export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'left',
  level = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const HeadingTag = level;

  const titleClasses = cn(
    'mb-4 font-display font-semibold text-foreground leading-tight',
    level === 'h2' ? 'text-4xl' : 'text-3xl',
    alignClass,
  );

  const subtitleClasses = cn('text-muted-foreground leading-relaxed', 'text-lg', alignClass);

  return (
    <div className={cn('mb-8', className)} id={id}>
      {/* Badge */}
      {badge && (
        <div className={cn('mb-4', align === 'center' ? 'flex justify-center' : '')}>
          <Badge
            variant={badge.variant || 'outline'}
            className={cn(
              'rounded-sm px-4 py-1.5 uppercase tracking-[0.18em]',
              'gap-2',
              badge.icon && 'gap-2',
            )}
          >
            {badge.icon && <badge.icon className={'size-4'} aria-hidden='true' />}
            <span>{badge.text}</span>
          </Badge>
        </div>
      )}

      {/* Title */}
      <HeadingTag className={titleClasses}>{title}</HeadingTag>

      {/* Subtitle */}
      {subtitle && (
        <p className={cn('max-w-3xl', 'mt-4', align === 'center' && 'mx-auto', subtitleClasses)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

SectionHeading.displayName = 'SectionHeading';
