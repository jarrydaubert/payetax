import Link from 'next/link';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Button } from '@/components/ui/button';
import { generateMetadata, SITE_URL } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Install PayeTax App | Offline UK Tax Calculator',
  description:
    'Install PayeTax as an app on iPhone, Android, and desktop. Use the UK tax calculator faster with offline support and home-screen access.',
  pathname: '/install',
});

export default function InstallPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Install', url: `${SITE_URL}/install` },
  ];

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />

      <section className='container mx-auto max-w-6xl px-4 py-24 md:py-28'>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='mb-3 font-semibold text-cyan-400 text-xs uppercase tracking-widest'>
            Install PayeTax
          </p>
          <h1 className='font-bold text-4xl text-foreground tracking-tight md:text-5xl'>
            Add PayeTax to your home screen
          </h1>
          <p className='mt-4 text-lg text-muted-foreground'>
            Use PayeTax like an app with faster launch, cleaner full-screen mode, and offline
            support.
          </p>
        </div>

        <div className='mt-12 grid gap-6 md:grid-cols-2'>
          <article className='rounded-2xl border border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-sm'>
            <h2 className='font-semibold text-foreground text-xl'>iPhone / iPad (Safari)</h2>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-muted-foreground'>
              <li>Open PayeTax in Safari.</li>
              <li>Tap the Share icon.</li>
              <li>Select &quot;Add to Home Screen&quot; and confirm.</li>
            </ol>
          </article>

          <article className='rounded-2xl border border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-sm'>
            <h2 className='font-semibold text-foreground text-xl'>Android (Chrome)</h2>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-muted-foreground'>
              <li>Open PayeTax in Chrome.</li>
              <li>Tap the menu (three dots).</li>
              <li>Select &quot;Install app&quot; or &quot;Add to Home screen&quot;.</li>
            </ol>
          </article>

          <article className='rounded-2xl border border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-sm'>
            <h2 className='font-semibold text-foreground text-xl'>Desktop (Chrome/Edge)</h2>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-muted-foreground'>
              <li>Visit PayeTax in your browser.</li>
              <li>Click the install icon in the address bar.</li>
              <li>Confirm installation.</li>
            </ol>
          </article>

          <article className='rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-xl backdrop-blur-sm'>
            <h2 className='font-semibold text-emerald-200 text-xl'>What you get</h2>
            <ul className='mt-3 list-disc space-y-2 pl-5 text-emerald-100/90'>
              <li>Faster launch from your home screen.</li>
              <li>Standalone app-style experience.</li>
              <li>Offline fallback when your connection drops.</li>
            </ul>
          </article>
        </div>

        <div className='mt-12 flex flex-col items-center gap-3 text-center'>
          <Button asChild size='touch' variant='brandOutline' className='rounded-xl px-6'>
            <Link href='/'>Open Calculator</Link>
          </Button>
          <p className='text-muted-foreground text-sm'>
            If install is unavailable, your browser or device might not support PWA installation.
          </p>
        </div>
      </section>
    </>
  );
}
