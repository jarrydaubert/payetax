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

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
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

    // Track newsletter subscribe intent from embedded Kit form submissions.
    // Kit handles submission externally, so this is the most reliable in-app hook.
    const handleSubmit = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      if (!mount.contains(target)) return;

      trackEvent({
        action: 'newsletter_subscribed',
        category: 'engagement',
        label: 'kit_embed_submit',
      });
    };

    mount.addEventListener('submit', handleSubmit, true);

    return () => {
      mount.removeEventListener('submit', handleSubmit, true);
      mount.innerHTML = '';
    };
  }, []);

  return (
    <section
      className={cn(
        'newsletter-cta relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-8 md:p-12',
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

        <style jsx global>{`
          /* Force inline layout - target ALL possible Kit containers */
          .newsletter-cta .formkit-fields,
          .newsletter-cta .seva-fields,
          .newsletter-cta ul.formkit-fields,
          .newsletter-cta [data-element='fields'],
          .newsletter-cta [class*='formkit-field'] {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            align-items: center !important;
            gap: 12px !important;
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Override data-stacked at all breakpoints for desktop */
          .newsletter-cta [data-stacked='true'],
          .newsletter-cta [data-stacked='false'] {
            flex-direction: row !important;
          }

          /* Email field container - takes available space */
          .newsletter-cta .formkit-field,
          .newsletter-cta .formkit-fields > li:first-child,
          .newsletter-cta .formkit-fields > *:first-child {
            flex: 1 1 0% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            list-style: none !important;
          }

          /* Button container - fixed width, no grow */
          .newsletter-cta .formkit-fields > li:last-child,
          .newsletter-cta .formkit-fields > *:last-child,
          .newsletter-cta .formkit-submit-wrapper {
            flex: 0 0 auto !important;
            margin: 0 !important;
            padding: 0 !important;
            list-style: none !important;
          }

          /* Email input */
          .newsletter-cta .formkit-input,
          .newsletter-cta .formkit-form input[type='email'],
          .newsletter-cta input[type='email'] {
            width: 100% !important;
            min-width: 0 !important;
            box-shadow: none !important;
            background-image: none !important;
          }

          /* Subscribe button - CRITICAL: override flex-basis:100% from Kit */
          .newsletter-cta .formkit-submit,
          .newsletter-cta .formkit-form button[type='submit'],
          .newsletter-cta button[type='submit'] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 0 0 auto !important;
            flex-basis: auto !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            width: auto !important;
            min-width: 140px !important;
            max-width: 180px !important;
            margin-bottom: 0 !important;
            white-space: nowrap !important;
          }

          /* Neutralize button pseudo-elements */
          .newsletter-cta .formkit-submit::before,
          .newsletter-cta .formkit-submit::after,
          .newsletter-cta button[type='submit']::before,
          .newsletter-cta button[type='submit']::after {
            content: none !important;
            display: none !important;
          }

          .newsletter-cta .formkit-submit > *,
          .newsletter-cta button[type='submit'] > * {
            border: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* Built with Kit - SVG logo uses dark fill, need filter to brighten */
          .newsletter-cta .formkit-powered-by-convertkit-container,
          .newsletter-cta .formkit-powered-by-convertkit,
          .newsletter-cta .formkit-powered-by,
          .newsletter-cta [class*='powered-by'],
          .newsletter-cta [class*='formkit-guarantee'],
          .newsletter-cta .formkit-form small,
          .newsletter-cta .formkit-form p:not(:first-child) {
            color: #cbd5e1 !important;
            opacity: 1 !important;
            filter: invert(1) brightness(0.7) !important;
            -webkit-text-fill-color: #cbd5e1 !important;
          }

          .newsletter-cta .formkit-powered-by-convertkit-container a,
          .newsletter-cta .formkit-powered-by-convertkit a,
          .newsletter-cta .formkit-powered-by a,
          .newsletter-cta [class*='powered-by'] a {
            color: #e2e8f0 !important;
            opacity: 1 !important;
            filter: invert(1) brightness(0.7) !important;
            -webkit-text-fill-color: #e2e8f0 !important;
          }

          /* Mobile: stack vertically */
          @media (max-width: 640px) {
            .newsletter-cta .formkit-fields,
            .newsletter-cta .seva-fields,
            .newsletter-cta ul.formkit-fields,
            .newsletter-cta [data-element='fields'],
            .newsletter-cta [data-stacked='true'],
            .newsletter-cta [data-stacked='false'] {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .newsletter-cta .formkit-submit,
            .newsletter-cta .formkit-form button[type='submit'],
            .newsletter-cta button[type='submit'] {
              width: 100% !important;
              min-width: 0 !important;
              max-width: none !important;
              flex-basis: 100% !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

export default NewsletterCTA;
