// src/app/blog/[slug]/loading.tsx

export default function Loading() {
  return (
    <output className='block pt-16 md:pt-20' aria-busy='true' aria-live='polite'>
      <span className='sr-only'>Loading article...</span>
      <div
        aria-hidden='true'
        className='container mx-auto max-w-4xl px-4 lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl'
      >
        {/* Back button skeleton */}
        <div className='mb-6 h-6 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none md:mb-8' />

        {/* Article header skeleton */}
        <div className='mb-6 md:mb-8'>
          {/* Category badge */}
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-7 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none' />
            <div className='h-7 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none' />
          </div>

          {/* Title */}
          <div className='mb-6 space-y-3'>
            <div className='h-10 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
            <div className='h-10 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          </div>

          {/* Excerpt */}
          <div className='mb-6 space-y-2'>
            <div className='h-6 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
            <div className='h-6 w-full animate-pulse rounded bg-muted motion-reduce:animate-none' />
            <div className='h-6 w-4/5 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          </div>

          {/* Meta */}
          <div className='mb-8 flex items-center gap-6'>
            <div className='h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
            <div className='h-5 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none' />
            <div className='h-5 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          </div>

          {/* Featured image */}
          <div className='mb-6 h-64 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none md:mb-8 md:h-96' />
        </div>

        {/* Article content skeleton */}
        <div className='mb-6 rounded-sm border border-border bg-card p-8 md:mb-8'>
          <div className='space-y-4'>
            {Array.from({ length: 8 }, (_, i) => `skeleton-content-${i}`).map((key) => (
              <div key={key} className='space-y-2'>
                <div className='h-4 w-full animate-pulse rounded bg-muted/50 motion-reduce:animate-none' />
                <div className='h-4 w-full animate-pulse rounded bg-muted/50 motion-reduce:animate-none' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted/50 motion-reduce:animate-none' />
              </div>
            ))}
          </div>
        </div>

        {/* CTA skeleton */}
        <div className='mb-8 h-32 animate-pulse rounded-sm border border-border bg-card motion-reduce:animate-none' />
      </div>
    </output>
  );
}
