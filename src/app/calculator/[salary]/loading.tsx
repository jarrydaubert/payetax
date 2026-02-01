// src/app/calculator/[salary]/loading.tsx

export default function Loading() {
  return (
    <output className='block pt-16 md:pt-20' aria-busy='true' aria-live='polite'>
      <span className='sr-only'>Loading calculator results...</span>
      <div aria-hidden='true' className='container mx-auto max-w-7xl px-4'>
        {/* Page header skeleton */}
        <div className='mb-8 text-center md:mb-12'>
          <div className='mx-auto mb-4 h-12 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none md:h-16' />
          <div className='mx-auto mb-6 h-6 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none' />
          <div className='mx-auto h-10 w-64 animate-pulse rounded-lg bg-muted motion-reduce:animate-none' />
        </div>

        {/* Calculator skeleton */}
        <div className='glass-card mb-8 rounded-2xl p-8'>
          <div className='grid gap-8 md:grid-cols-2'>
            {/* Input section */}
            <div className='space-y-6'>
              <div className='h-8 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none' />
              {Array.from({ length: 5 }, (_, i) => `input-field-${i}`).map((key) => (
                <div key={key} className='space-y-2'>
                  <div className='h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-12 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none' />
                </div>
              ))}
            </div>

            {/* Results section */}
            <div className='space-y-6'>
              <div className='h-8 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none' />
              {Array.from({ length: 4 }, (_, i) => `result-card-${i}`).map((key) => (
                <div key={key} className='glass-card rounded-xl p-6'>
                  <div className='mb-2 h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  <div className='h-10 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown tables skeleton */}
        <div className='grid gap-8 md:grid-cols-2'>
          {Array.from({ length: 2 }, (_, i) => `breakdown-table-${i}`).map((tableKey) => (
            <div key={tableKey} className='glass-card rounded-2xl p-8'>
              <div className='mb-6 h-7 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none' />
              <div className='space-y-4'>
                {Array.from({ length: 4 }, (_, j) => `${tableKey}-row-${j}`).map((rowKey) => (
                  <div key={rowKey} className='flex justify-between'>
                    <div className='h-5 w-32 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                    <div className='h-5 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </output>
  );
}
