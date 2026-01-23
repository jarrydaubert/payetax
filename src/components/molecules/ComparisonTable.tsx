/**
 * ComparisonTable Component
 *
 * Displays a feature comparison table for tax calculators.
 * Used on /best-uk-tax-calculators and competitor pages.
 *
 * @module components/molecules/ComparisonTable
 */

import { Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/ui/table';
import { ICON_SIZES, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import type { Competitor, CompetitorFeatures } from '@/data/competitors';
import { FEATURE_LABELS, PAYETAX_FEATURES, PAYETAX_INFO } from '@/data/competitors';
import { cn } from '@/lib/utils';

export interface ComparisonTableProps {
  /** Competitors to compare (PayeTax is always included first) */
  competitors: Competitor[];
  /** Which features to show (defaults to all) */
  features?: (keyof CompetitorFeatures)[];
  /** Highlight PayeTax column */
  highlightPayeTax?: boolean;
  /** Optional custom className */
  className?: string;
}

/**
 * Feature check/cross icon
 */
function FeatureIcon({ available }: { available: boolean }) {
  if (available) {
    return (
      <Check
        className={cn(ICON_SIZES.SIZE_5, 'text-green-600 dark:text-green-400')}
        aria-label='Available'
      />
    );
  }
  return (
    <X className={cn(ICON_SIZES.SIZE_5, 'text-muted-foreground/50')} aria-label='Not available' />
  );
}

/**
 * ComparisonTable Component
 *
 * Displays a responsive feature comparison table.
 *
 * @example
 * ```tsx
 * <ComparisonTable
 *   competitors={[govUk, mse, salaryCalc]}
 *   highlightPayeTax
 * />
 * ```
 */
export function ComparisonTable({
  competitors,
  features,
  highlightPayeTax = true,
  className,
}: ComparisonTableProps) {
  const featureKeys = features || (Object.keys(FEATURE_LABELS) as (keyof CompetitorFeatures)[]);

  return (
    <div className={cn('overflow-x-auto', SURFACES.SHAPE_ROUNDED_LG, className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={cn(TYPOGRAPHY.TEXT_SM, 'w-[200px]')}>Feature</TableHead>
            <TableHead
              className={cn(
                TYPOGRAPHY.TEXT_SM,
                'text-center',
                highlightPayeTax && 'bg-primary/5 font-semibold text-primary'
              )}
            >
              {PAYETAX_INFO.shortName}
            </TableHead>
            {competitors.map((competitor) => (
              <TableHead key={competitor.slug} className={cn(TYPOGRAPHY.TEXT_SM, 'text-center')}>
                {competitor.shortName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {featureKeys.map((featureKey) => (
            <TableRow key={featureKey}>
              <TableCell className={cn(TYPOGRAPHY.TEXT_SM, 'font-medium')}>
                {FEATURE_LABELS[featureKey]}
              </TableCell>
              <TableCell className={cn('text-center', highlightPayeTax && 'bg-primary/5')}>
                <div className='flex justify-center'>
                  <FeatureIcon available={PAYETAX_FEATURES[featureKey]} />
                </div>
              </TableCell>
              {competitors.map((competitor) => (
                <TableCell key={competitor.slug} className='text-center'>
                  <div className='flex justify-center'>
                    <FeatureIcon available={competitor.features[featureKey]} />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Simplified two-column comparison for alternative pages
 */
export interface TwoColumnComparisonProps {
  competitor: Competitor;
  className?: string;
}

export function TwoColumnComparison({ competitor, className }: TwoColumnComparisonProps) {
  const featureKeys = Object.keys(FEATURE_LABELS) as (keyof CompetitorFeatures)[];

  return (
    <div className={cn('overflow-x-auto', SURFACES.SHAPE_ROUNDED_LG, className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={cn(TYPOGRAPHY.TEXT_SM, 'w-[200px]')}>Feature</TableHead>
            <TableHead
              className={cn(
                TYPOGRAPHY.TEXT_SM,
                'bg-primary/5 text-center font-semibold text-primary'
              )}
            >
              PayeTax
            </TableHead>
            <TableHead className={cn(TYPOGRAPHY.TEXT_SM, 'text-center')}>
              {competitor.shortName}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {featureKeys.map((featureKey) => (
            <TableRow key={featureKey}>
              <TableCell className={cn(TYPOGRAPHY.TEXT_SM, 'font-medium')}>
                {FEATURE_LABELS[featureKey]}
              </TableCell>
              <TableCell className='bg-primary/5 text-center'>
                <div className='flex justify-center'>
                  <FeatureIcon available={PAYETAX_FEATURES[featureKey]} />
                </div>
              </TableCell>
              <TableCell className='text-center'>
                <div className='flex justify-center'>
                  <FeatureIcon available={competitor.features[featureKey]} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

ComparisonTable.displayName = 'ComparisonTable';
TwoColumnComparison.displayName = 'TwoColumnComparison';
