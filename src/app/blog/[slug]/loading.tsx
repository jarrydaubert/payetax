// src/app/blog/[slug]/loading.tsx

export default function Loading() {
  return (
    <div className='pt-16 md:pt-20'>
      <div className='container mx-auto max-w-4xl px-4'>
        {/* Back button skeleton */}
        <div className='mb-6 h-6 w-32 animate-pulse rounded bg-muted md:mb-8' />

        {/* Article header skeleton */}
        <div className='mb-6 md:mb-8'>
          {/* Category badge */}
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-7 w-24 animate-pulse rounded-full bg-muted' />
            <div className='h-7 w-20 animate-pulse rounded-full bg-muted' />
          </div>

          {/* Title */}
          <div className='mb-6 space-y-3'>
            <div className='h-10 w-full animate-pulse rounded bg-muted' />
            <div className='h-10 w-5/6 animate-pulse rounded bg-muted' />
          </div>

          {/* Excerpt */}
          <div className='mb-6 space-y-2'>
            <div className='h-6 w-full animate-pulse rounded bg-muted' />
            <div className='h-6 w-full animate-pulse rounded bg-muted' />
            <div className='h-6 w-4/5 animate-pulse rounded bg-muted' />
          </div>

          {/* Meta */}
          <div className='mb-8 flex items-center gap-6'>
            <div className='h-5 w-32 animate-pulse rounded bg-muted' />
            <div className='h-5 w-24 animate-pulse rounded bg-muted' />
            <div className='h-5 w-28 animate-pulse rounded bg-muted' />
          </div>

          {/* Featured image */}
          <div className='mb-6 h-64 w-full animate-pulse rounded-xl bg-muted md:mb-8 md:h-96' />
        </div>

        {/* Article content skeleton */}
        <div className='glass-card mb-6 rounded-xl p-8 md:mb-8'>
          <div className='space-y-4'>
            {/* biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loader */}
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-content-${i}`} className='space-y-2'>
                <div className='h-4 w-full animate-pulse rounded bg-muted/50' />
                <div className='h-4 w-full animate-pulse rounded bg-muted/50' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted/50' />
              </div>
            ))}
          </div>
        </div>

        {/* CTA skeleton */}
        <div className='glass-card mb-8 h-32 animate-pulse rounded-xl' />
      </div>
    </div>
  );
}
