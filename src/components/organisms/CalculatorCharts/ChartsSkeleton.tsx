/**
 * Charts Loading Skeleton
 *
 * Displays placeholder UI while charts are being lazy-loaded.
 * Maintains layout to prevent CLS (Cumulative Layout Shift).
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChartsSkeleton() {
  return (
    <div className='mt-6 grid gap-6 md:grid-cols-2'>
      {/* Chart Skeleton 1 */}
      <Card className='border-primary/20'>
        <CardHeader className='pb-3'>
          <CardTitle>
            <Skeleton className='h-6 w-48' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-64' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[250px] w-full' />
          <div className='mt-2 space-y-2'>
            <Skeleton className='h-4 w-full' />
          </div>
        </CardContent>
      </Card>

      {/* Chart Skeleton 2 */}
      <Card className='border-primary/20'>
        <CardHeader className='pb-3'>
          <CardTitle>
            <Skeleton className='h-6 w-40' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-56' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[250px] w-full' />
          <div className='mt-2 space-y-2'>
            <Skeleton className='h-4 w-full' />
          </div>
        </CardContent>
      </Card>

      {/* Chart Skeleton 3 */}
      <Card className='border-primary/20'>
        <CardHeader className='pb-3'>
          <CardTitle>
            <Skeleton className='h-6 w-44' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-60' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[250px] w-full' />
          <div className='mt-2 flex justify-between'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-32' />
          </div>
        </CardContent>
      </Card>

      {/* Chart Skeleton 4 */}
      <Card className='border-primary/20'>
        <CardHeader className='pb-3'>
          <CardTitle>
            <Skeleton className='h-6 w-52' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-64' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[200px] w-full' />
          <div className='mt-2 flex justify-between'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-28' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
