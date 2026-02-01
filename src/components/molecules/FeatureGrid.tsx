/**
 * FeatureGrid Component
 *
 * Displays a responsive grid of feature cards with optional heading.
 * Composes SectionHeading and FeatureCard for consistent page sections.
 *
 * @module components/molecules/FeatureGrid
 */

import { cn } from '@/lib/utils';
import { type Feature, FeatureCard } from './FeatureCard';
import { SectionHeading, type SectionHeadingProps } from './SectionHeading';

/**
 * FeatureGrid component props
 */
export interface FeatureGridProps {
  /** Optional section heading */
  heading?: SectionHeadingProps;
  /** Array of features to display */
  features: Feature[];
  /** Number of columns in grid (responsive) */
  columns?: 2 | 3;
  /** Card variant to apply to all features */
  variant?: 'default' | 'showcase' | 'simple';
  /** Optional custom className */
  className?: string;
}

/**
 * FeatureGrid Component
 *
 * Displays a grid of feature cards with optional section heading.
 * Fully composable - can be used with or without heading.
 *
 * @example With heading
 * ```tsx
 * <FeatureGrid
 *   heading={{
 *     badge: { text: 'Features', icon: Sparkles },
 *     title: 'What Makes Us Different',
 *     subtitle: 'Built with privacy and performance in mind'
 *   }}
 *   features={[
 *     { icon: Rocket, title: 'Fast', description: '...' },
 *     { icon: Shield, title: 'Secure', description: '...' },
 *   ]}
 *   columns={3}
 * />
 * ```
 *
 * @example Without heading
 * ```tsx
 * <FeatureGrid
 *   features={features}
 *   columns={2}
 *   variant="showcase"
 * />
 * ```
 */
export function FeatureGrid({
  heading,
  features,
  columns = 3,
  variant = 'default',
  className,
}: FeatureGridProps) {
  const gridClasses = cn(
    'grid gap-6',
    {
      'grid-cols-1 md:grid-cols-2': columns === 2,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
    },
    className,
  );

  return (
    <section>
      {/* Optional Section Heading */}
      {heading && <SectionHeading {...heading} />}

      {/* Features Grid */}
      <div className={gridClasses}>
        {features.map((feature, index) => (
          <FeatureCard
            key={`feature-${index}-${feature.title}`}
            feature={feature}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

FeatureGrid.displayName = 'FeatureGrid';
