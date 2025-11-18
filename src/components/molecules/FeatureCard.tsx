/**
 * FeatureCard Component
 *
 * Displays a single feature card with icon, title, description, and optional metadata.
 * Used across about, privacy pages to showcase features and capabilities.
 *
 * @module components/molecules/FeatureCard
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/atoms/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import type { FeatureData } from '@/lib/validation/pageDataValidation';

/**
 * Feature interface extending validated FeatureData
 */
export interface Feature extends Omit<FeatureData, 'icon'> {
  icon: LucideIcon;
}

/**
 * FeatureCard component props
 */
export interface FeatureCardProps {
  /** Feature data to display */
  feature: Feature;
  /** Visual variant */
  variant?: 'default' | 'showcase' | 'simple';
  /** Optional custom className */
  className?: string;
}

/**
 * FeatureCard Component
 *
 * Displays a feature with icon, title, description, and optional metric/link.
 *
 * @example Basic usage
 * ```tsx
 * <FeatureCard
 *   feature={{
 *     icon: Rocket,
 *     title: 'Blazing Fast',
 *     description: 'Sub-second page loads with optimized rendering'
 *   }}
 * />
 * ```
 *
 * @example With metric and gradient
 * ```tsx
 * <FeatureCard
 *   feature={{
 *     icon: Zap,
 *     title: 'Performance',
 *     description: 'Lightning fast calculations',
 *     metric: '<1.5s',
 *     gradient: {
 *       bg: 'from-yellow-500/10 to-orange-500/10',
 *       icon: 'text-yellow-500',
 *       border: 'border-yellow-500/20'
 *     }
 *   }}
 *   variant="showcase"
 * />
 * ```
 */
export function FeatureCard({ feature, variant = 'default', className }: FeatureCardProps) {
  const { icon: Icon, title, description, metric, link, gradient } = feature;

  const cardClasses = cn(
    'h-full transition-all duration-300',
    {
      'hover:border-primary/50 hover:shadow-lg': variant === 'showcase',
      'bg-card/50 backdrop-blur-sm': variant === 'default',
      'border-none shadow-none': variant === 'simple',
    },
    gradient?.bg,
    gradient?.border,
    className
  );

  const iconContainerClasses = cn(
    'mb-4 flex h-12 w-12 items-center justify-center rounded-lg',
    gradient?.icon || 'text-primary',
    variant === 'showcase' && !gradient?.bg && 'bg-primary/10'
  );

  return (
    <Card className={cardClasses}>
      <CardHeader>
        {/* Icon */}
        <div className={iconContainerClasses} aria-hidden='true'>
          <Icon className={cn(ICON_SIZES.SIZE_6)} />
        </div>

        {/* Title with optional metric */}
        <div className={cn('flex items-start justify-between', SPACING.GAP_4)}>
          <h3 className={cn('font-bold text-foreground', TYPOGRAPHY.TEXT_2XL)}>{title}</h3>
          {metric && (
            <Badge variant="secondary" className="shrink-0 font-mono font-semibold">
              {metric}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Description */}
        <p
          className={cn(
            'text-muted-foreground leading-relaxed',
            SPACING.MB_4,
            TYPOGRAPHY.TEXT_BASE
          )}
        >
          {description}
        </p>

        {/* Optional Link */}
        {link && (
          <Link
            href={link.href as Route}
            className={cn(
              'group inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80',
              TYPOGRAPHY.TEXT_SM
            )}
          >
            {link.text}
            <ArrowRight
              className={cn(ICON_SIZES.SIZE_4, 'transition-transform group-hover:translate-x-1')}
            />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

FeatureCard.displayName = 'FeatureCard';
