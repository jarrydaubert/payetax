// src/app/blog/category/[slug]/loading.tsx

export default function Loading() {
  return (
    <div className='container mx-auto px-4 py-12'>
      {/* Breadcrumbs skeleton */}
      <div className='mb-8 flex items-center space-x-2'>
        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
        <div className='h-4 w-4 animate-pulse rounded bg-muted' />
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
        <div className='h-4 w-4 animate-pulse rounded bg-muted' />
        <div className='h-4 w-32 animate-pulse rounded bg-muted' />
      </div>

      {/* Header skeleton */}
      <div className='mb-12'>
        <div className='mx-auto mb-4 h-12 w-2/3 animate-pulse rounded bg-muted' />
        <div className='mx-auto mb-6 h-6 w-1/2 animate-pulse rounded bg-muted' />
        <div className='flex justify-center gap-2'>
          {[...Array(4)].map((_, i) => (
            <div
              key={`header-badge-${i}`}
              className='h-8 w-24 animate-pulse rounded-full bg-muted'
            />
          ))}
        </div>
      </div>

      {/* Categories filter skeleton */}
      <div className='mb-12'>
        <div className='mb-6 flex justify-center'>
          <div className='h-6 w-32 animate-pulse rounded bg-muted' />
        </div>
        <div className='flex flex-wrap justify-center gap-3'>
          {[...Array(6)].map((_, i) => (
            <div
              key={`category-filter-${i}`}
              className='h-10 w-32 animate-pulse rounded-full bg-muted'
            />
          ))}
        </div>
      </div>

      {/* Posts grid skeleton */}
      <div className='mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <div
            key={`post-card-${i}`}
            className='overflow-hidden rounded-lg border border-border bg-card'
          >
            <div className='h-48 w-full animate-pulse bg-muted' />
            <div className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
                <div className='h-4 w-20 animate-pulse rounded bg-muted' />
              </div>
              <div className='mb-3 space-y-2'>
                <div className='h-6 w-full animate-pulse rounded bg-muted' />
                <div className='h-6 w-5/6 animate-pulse rounded bg-muted' />
              </div>
              <div className='mb-4 space-y-2'>
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-full animate-pulse rounded bg-muted' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
              </div>
              <div className='flex items-center justify-between'>
                <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                <div className='h-4 w-24 animate-pulse rounded bg-muted' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
