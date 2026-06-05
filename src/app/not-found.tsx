import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='grid min-h-dvh place-items-center bg-background bg-ledger-grid px-6'>
      <div className='text-center'>
        <h1 className='font-display font-semibold text-xl tracking-tight'>
          <span className='text-primary'>404</span>
          <span className='mx-3 text-muted-foreground'>|</span>
          <span className='text-foreground'>Page not found</span>
        </h1>

        <p className='mt-3 text-muted-foreground text-sm'>
          The page you're looking for doesn't exist or has moved.
        </p>

        <div className='mt-6 flex items-center justify-center gap-3'>
          <Link
            href='/'
            className='rounded-sm border border-border bg-card px-4 py-2 text-foreground text-sm hover:border-primary/55'
          >
            Go home
          </Link>
          <Link
            href='/blog'
            className='rounded-sm px-4 py-2 text-muted-foreground text-sm hover:text-foreground'
          >
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  );
}
