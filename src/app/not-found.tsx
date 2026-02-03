import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='grid min-h-dvh place-items-center bg-background px-6'>
      <div className='text-center'>
        <h1 className='font-medium text-xl tracking-tight'>
          <span className='text-gradient-new'>404</span>
          <span className='mx-3 text-muted-foreground'>|</span>
          <span className='text-foreground'>Page not found</span>
        </h1>

        <p className='mt-3 text-muted-foreground text-sm'>
          The page you're looking for doesn't exist or has moved.
        </p>

        <div className='mt-6 flex items-center justify-center gap-3'>
          <Link
            href='/'
            className='rounded-md border border-border px-4 py-2 text-foreground text-sm hover:bg-muted'
          >
            Go home
          </Link>
          <Link
            href='/blog'
            className='rounded-md px-4 py-2 text-muted-foreground text-sm hover:text-foreground'
          >
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  );
}
