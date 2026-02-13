'use client';

// src/components/organisms/NewsletterCTA.tsx
/**
 * Newsletter CTA Component
 *
 * Kit embed wrapper with PayeTax styling.
 * The Kit script is injected client-side so it reliably initializes in App Router.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NewsletterCTAProps {
  className?: string;
  title?: string;
  description?: string;
}

const DEFAULT_TITLE = 'Stay Updated on UK Tax Changes';
const DEFAULT_DESCRIPTION =
  'HMRC rate updates, tax-saving strategies, and deadline reminders. No spam, ever.';
// Keep the embedded form UID configurable via env so non-code Kit form swaps are possible.
const KIT_EMBED_UID = process.env.NEXT_PUBLIC_KIT_EMBED_UID || '648a4b276a';
const KIT_EMBED_VERSION = process.env.NEXT_PUBLIC_KIT_EMBED_VERSION;
const KIT_EMBED_SRC = KIT_EMBED_VERSION
  ? `https://payetax.kit.com/${KIT_EMBED_UID}/index.js?v=${encodeURIComponent(KIT_EMBED_VERSION)}`
  : `https://payetax.kit.com/${KIT_EMBED_UID}/index.js`;

export function NewsletterCTA({
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: NewsletterCTAProps) {
  const embedMountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = embedMountRef.current;
    if (!mount) return;

    // Reset mount to avoid duplicate forms under Strict Mode/dev re-renders.
    mount.innerHTML = '';

    // Script is injected client-side so Kit can initialize reliably in App Router routes.
    const script = document.createElement('script');
    script.async = true;
    script.dataset.uid = KIT_EMBED_UID;
    script.src = KIT_EMBED_SRC;
    mount.appendChild(script);

    return () => {
      mount.innerHTML = '';
    };
  }, []);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-8 md:p-12',
        className,
      )}
      aria-label='Newsletter signup'
    >
      {/* Background decoration */}
      <div className='pointer-events-none absolute inset-0 opacity-80' aria-hidden='true'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(6,182,212,0.2),transparent_45%),radial-gradient(circle_at_88%_82%,rgba(16,185,129,0.16),transparent_42%)]' />
      </div>

      <div className='relative text-center'>
        <h2 className='mb-3 font-bold font-display text-2xl text-foreground md:text-3xl'>
          {title}
        </h2>
        <p className='mb-6 text-muted-foreground'>{description}</p>

        <div
          ref={embedMountRef}
          className='mx-auto w-full max-w-xl'
          // Diagnostic metadata only; form visual styling is maintained in docs/guides/KIT_EMBED_CSS.css
          data-kit-embed-uid={KIT_EMBED_UID}
          data-kit-embed-src={KIT_EMBED_SRC}
        />

        <p className='mt-4 text-muted-foreground text-xs'>
          We respect your privacy.{' '}
          <Link href='/privacy' className='underline hover:text-foreground'>
            Privacy Policy
          </Link>
          . Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

export default NewsletterCTA;
