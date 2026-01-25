export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <h1 className='text-xl font-medium tracking-tight'>
        <span className='text-gradient-new'>404</span>
        <span className='mx-3 text-muted-foreground'>|</span>
        <span className='text-foreground'>Page not found</span>
      </h1>
    </div>
  );
}
