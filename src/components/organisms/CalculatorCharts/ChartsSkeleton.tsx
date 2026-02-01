/**
 * Charts Loading Skeleton
 *
 * Displays placeholder UI while charts are being lazy-loaded.
 * Maintains layout to prevent CLS (Cumulative Layout Shift).
 *
 * Layout matches ChartsContainer full-width mode:
 * - 2 charts (default): lg:grid-cols-2
 * - 3 charts (with income breakdown): lg:grid-cols-3
 */

import { Skeleton } from '@/components/atoms/Skeleton';
import { Card, CardContent, CardHeader } from '@/components/atoms/ui/card';
import { SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface ChartsSkeletonProps {
  /**
   * Number of chart skeletons to show (2 or 3)
   * Should match the expected chart count in ChartsContainer
   */
  count?: 2 | 3;
  /**
   * Layout mode matching ChartsContainer
   */
  layout?: 'sidebar' | 'full-width';
  className?: string;
}

/** Chart skeleton configuration for consistent rendering */
interface SkeletonConfig {
  id: string;
  titleWidth: string;
  descWidth: string;
}

const SKELETON_CONFIGS: SkeletonConfig[] = [
  { id: 'chart-1', titleWidth: 'w-48', descWidth: 'w-64' },
  { id: 'chart-2', titleWidth: 'w-40', descWidth: 'w-56' },
  { id: 'chart-3', titleWidth: 'w-44', descWidth: 'w-60' },
];

/**
 * Single chart skeleton card
 * Uses plain divs instead of CardTitle/CardDescription for semantic correctness
 */
function ChartSkeletonCard({ config }: { config: SkeletonConfig }) {
  return (
    <Card aria-hidden='true'>
      <CardHeader className='pb-3'>
        {/* Plain divs - not semantic headings for placeholder content */}
        <div>
          <Skeleton className={cn('h-6', config.titleWidth)} />
        </div>
        <div className='pt-1'>
          <Skeleton className={cn('h-4', config.descWidth)} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart area - consistent 250px height matches actual charts */}
        <Skeleton className='h-[250px] w-full' />
        {/* Legend/footer area */}
        <div className={cn('flex justify-between', SPACING.MT_2)}>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-4 w-28' />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartsSkeleton({
  count = 2,
  layout = 'full-width',
  className,
}: ChartsSkeletonProps) {
  const configs = SKELETON_CONFIGS.slice(0, count);

  if (layout === 'sidebar') {
    return (
      <div
        role='status'
        aria-live='polite'
        className={cn(SPACING.SPACE_Y_4, 'landscape:space-y-6', className)}
      >
        <span className='sr-only'>Loading charts...</span>
        {configs.map((config) => (
          <ChartSkeletonCard key={config.id} config={config} />
        ))}
      </div>
    );
  }

  // Full-width layout - matches ChartsContainer grid
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'grid grid-cols-1',
        // Match ChartsContainer responsive columns
        count === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
        SPACING.GAP_4,
        'landscape:max-md:grid-cols-1 landscape:max-md:gap-6',
        className,
      )}
    >
      <span className='sr-only'>Loading charts...</span>
      {configs.map((config) => (
        <ChartSkeletonCard key={config.id} config={config} />
      ))}
    </div>
  );
}
