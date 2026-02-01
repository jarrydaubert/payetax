// src/app/blog/category/[slug]/loading.tsx

import { SURFACES } from '@/constants/designTokens';

export default function Loading() {
  return (
    <output className='container mx-auto block px-4 py-12' aria-busy='true' aria-live='polite'>
      <span className='sr-only'>Loading category articles...</span>
      <div aria-hidden='true'>
        {/* Breadcrumbs skeleton */}
        <div className='mb-8 flex items-center space-x-2'>
          <div className='h-4 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='h-4 w-4 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='h-4 w-12 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='h-4 w-4 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='h-4 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
        </div>

        {/* Header skeleton */}
        <div className='mb-12'>
          <div className='mx-auto mb-4 h-12 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='mx-auto mb-6 h-6 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='flex justify-center gap-2'>
            {Array.from({ length: 4 }, (_, i) => `header-badge-${i}`).map((key) => (
              <div
                key={key}
                className={`h-8 w-24 animate-pulse bg-muted motion-reduce:animate-none ${SURFACES.SHAPE_CIRCLE}`}
              />
            ))}
          </div>
        </div>

        {/* Categories filter skeleton */}
        <div className='mb-12'>
          <div className='mb-6 flex justify-center'>
            <div className='h-6 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          </div>
          <div className='flex flex-wrap justify-center gap-3'>
            {Array.from({ length: 6 }, (_, i) => `category-filter-${i}`).map((key) => (
              <div
                key={key}
                className={`h-10 w-32 animate-pulse bg-muted motion-reduce:animate-none ${SURFACES.SHAPE_CIRCLE}`}
              />
            ))}
          </div>
        </div>

        {/* Posts grid skeleton */}
        <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }, (_, i) => `post-card-${i}`).map((key) => (
            <div key={key} className='overflow-hidden rounded-lg border border-border bg-card'>
              <div className='h-48 w-full animate-pulse bg-muted motion-reduce:animate-none' />
              <div className='p-6'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-4 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                </div>
                <div className='mb-3 space-y-2'>
                  <div className='h-6 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-6 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                </div>
                <div className='mb-4 space-y-2'>
                  <div className='h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='h-4 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </output>
  );
}
