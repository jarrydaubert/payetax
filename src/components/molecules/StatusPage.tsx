/**
 * StatusPage Molecule
 *
 * Shared Ledger-styled layout for full-screen status routes (404, offline, and
 * the visual shell of error boundaries). Centres a single card on the ledger
 * grid so every "something is off" page shares one calm, on-brand layout.
 *
 * Server Component - no hooks or handlers. For interactive error boundaries,
 * see {@link ErrorState} which reuses this visual language on the client.
 *
 * @module components/molecules/StatusPage
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

/** Icon colour tone, mapped to semantic Ledger tokens. */
export type StatusTone = 'primary' | 'warning' | 'destructive';

export interface StatusPageProps {
  /** Icon shown in the badge above the title */
  icon: LucideIcon;
  /** Tone for the icon badge (defaults to primary) */
  tone?: StatusTone;
  /** Small eyebrow above the title (e.g. "404") */
  eyebrow?: string;
  /** Main heading */
  title: string;
  /** Supporting copy under the title */
  description: React.ReactNode;
  /** Primary/secondary actions (links or buttons) */
  actions?: React.ReactNode;
  /** Optional extra content rendered inside the card, below the description */
  children?: React.ReactNode;
  /** Optional footer note rendered below the card */
  footer?: React.ReactNode;
}

const TONE_CLASSES: Record<StatusTone, { border: string; text: string }> = {
  primary: { border: 'border-primary/40', text: 'text-primary' },
  warning: { border: 'border-warning/40', text: 'text-warning' },
  destructive: { border: 'border-destructive/40', text: 'text-destructive' },
};

/**
 * StatusPage Component
 *
 * @example
 * ```tsx
 * <StatusPage
 *   icon={Compass}
 *   eyebrow="404"
 *   title="Page not found"
 *   description="The page you're looking for doesn't exist or has moved."
 *   actions={<Button asChild><Link href="/">Go home</Link></Button>}
 * />
 * ```
 */
export function StatusPage({
  icon: Icon,
  tone = 'primary',
  eyebrow,
  title,
  description,
  actions,
  children,
  footer,
}: StatusPageProps) {
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div className='grid min-h-dvh place-items-center bg-background bg-ledger-grid px-4 py-20'>
      <div className='w-full max-w-2xl text-center'>
        <div className='rounded-sm border border-border bg-card p-8 md:p-12'>
          {/* Icon badge */}
          <div
            className={cn(
              'mx-auto mb-6 flex size-16 items-center justify-center rounded-sm border bg-background',
              toneClasses.border,
            )}
            aria-hidden='true'
          >
            <Icon className={cn('size-8', toneClasses.text)} />
          </div>

          {/* Eyebrow */}
          {eyebrow && (
            <p className='mb-2 font-mono text-muted-foreground text-sm uppercase tracking-[0.24em]'>
              {eyebrow}
            </p>
          )}

          {/* Title */}
          <h1 className='font-display font-semibold text-3xl text-foreground tracking-tight md:text-4xl'>
            {title}
          </h1>

          {/* Description */}
          <div className='mt-3 text-muted-foreground leading-relaxed'>{description}</div>

          {/* Extra content */}
          {children && <div className='mt-8 text-left'>{children}</div>}

          {/* Actions */}
          {actions && (
            <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>{actions}</div>
          )}
        </div>

        {/* Footer note */}
        {footer && <div className='mt-6 text-muted-foreground text-sm'>{footer}</div>}
      </div>
    </div>
  );
}

StatusPage.displayName = 'StatusPage';
