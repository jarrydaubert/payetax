/**
 * PageHero Molecule
 *
 * Reusable Ledger page hero section with badge, title, and subtitle.
 * Used across all major pages (about, privacy, compliance, blog).
 *
 * Part of PAYTAX-109: Proper Page Architecture Refactor
 *
 * @module components/molecules/PageHero
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Badge configuration for PageHero
 */
export interface PageHeroBadge {
  /** Icon to display in badge */
  icon?: LucideIcon;
  /** Badge text content */
  text: string;
  /** Badge variant styling */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

/**
 * Props for PageHero component
 */
export interface PageHeroProps {
  /** Optional badge above title */
  badge?: PageHeroBadge;
  /** Main heading */
  title: React.ReactNode;
  /** Subtitle text - can be string or array of strings for multiple paragraphs */
  subtitle?: string | string[];
  /** Text alignment */
  align?: 'left' | 'center';
  /** Optional custom className */
  className?: string;
  /** Background variant */
  variant?: 'default' | 'gradient' | 'simple';
}

/**
 * PageHero Component
 *
 * Displays a Ledger hero section with optional badge, title, and subtitle.
 * Supports multiple subtitle paragraphs and customizable alignment.
 *
 * @example
 * ```tsx
 * <PageHero
 *   badge={{ icon: Sparkles, text: 'About PayeTax' }}
 *   title={
 *     <>
 *       Tax Calculations Built for Privacy
 *     </>
 *   }
 *   subtitle="The UK tax calculator that respects your privacy..."
 * />
 * ```
 *
 * @example Multiple subtitles
 * ```tsx
 * <PageHero
 *   title="Privacy Policy"
 *   subtitle={[
 *     "Your tax calculations are your business.",
 *     "They never leave your browser."
 *   ]}
 *   align="center"
 * />
 * ```
 */
export function PageHero({
  badge,
  title,
  subtitle,
  align = 'center',
  variant = 'default',
  className,
}: PageHeroProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  const backgroundClass =
    variant === 'simple' ? '' : 'border-border/70 border-b bg-background bg-ledger-grid';

  const subtitles = Array.isArray(subtitle) ? subtitle : subtitle ? [subtitle] : [];

  return (
    <section
      className={cn(
        'relative overflow-hidden pt-20 pb-10 md:pt-32 md:pb-20',
        backgroundClass,
        className,
      )}
    >
      <div className={cn('container mx-auto max-w-7xl', SPACING.PX_4)}>
        <div className={alignClass}>
          {/* Badge */}
          {badge && (
            <Badge
              variant={badge.variant || 'outline'}
              className={cn(
                'mb-6 rounded-sm border-primary/35 bg-background px-5 py-2.5 text-primary uppercase tracking-[0.24em]',
                SPACING.GAP_2,
              )}
            >
              {badge.icon && <badge.icon className={ICON_SIZES.SIZE_5} aria-hidden='true' />}
              <span>{badge.text}</span>
            </Badge>
          )}

          {/* Title */}
          <h1
            className={cn(
              'font-display font-semibold text-foreground leading-[0.98]',
              SPACING.MB_6,
              TYPOGRAPHY.TEXT_6XL,
            )}
          >
            {title}
          </h1>

          {/* Subtitle(s) */}
          {subtitles.length > 0 && (
            <div className={cn('mx-auto max-w-3xl', SPACING.SPACE_Y_4)}>
              {subtitles.map((text) => (
                <p
                  key={text}
                  className={cn('text-muted-foreground leading-relaxed', TYPOGRAPHY.TEXT_LG)}
                >
                  {text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

PageHero.displayName = 'PageHero';
