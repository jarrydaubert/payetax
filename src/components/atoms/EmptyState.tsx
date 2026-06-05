import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

export type EmptyProps = ComponentPropsWithoutRef<'div'>;

/**
 * Empty state container with dashed border
 *
 * @example
 * ```tsx
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyMedia variant="icon">
 *       <SearchIcon />
 *     </EmptyMedia>
 *     <EmptyTitle>No results found</EmptyTitle>
 *     <EmptyDescription>Try adjusting your search terms</EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Clear filters</Button>
 *   </EmptyContent>
 * </Empty>
 * ```
 */
function Empty({ className, ...props }: EmptyProps) {
  return (
    <div
      data-slot='empty'
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg p-6 text-center md:p-12',
        // Dashed border - requires both border width and style
        'border border-border border-dashed',
        className,
      )}
      {...props}
    />
  );
}

export type EmptyHeaderProps = ComponentPropsWithoutRef<'div'>;

function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return (
    <div
      data-slot='empty-header'
      className={cn('flex max-w-sm flex-col items-center gap-2 text-center', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          // Muted background with muted-foreground for proper contrast
          'bg-muted text-muted-foreground',
          // Auto-size SVGs unless explicitly sized
          "[&_svg:not([class*='size-'])]:size-6",
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type EmptyMediaProps = ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof emptyMediaVariants>;

function EmptyMedia({ className, variant = 'default', ...props }: EmptyMediaProps) {
  return (
    <div
      data-slot='empty-media'
      data-variant={variant}
      // CVA: merge className separately, not as a variant option
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

export type EmptyTitleProps = ComponentPropsWithoutRef<'h3'>;

/**
 * Empty state title - renders as h3 for semantic structure
 * Override with different heading level via asChild pattern if needed
 */
function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return (
    <h3
      data-slot='empty-title'
      className={cn('font-medium text-lg tracking-tight', className)}
      {...props}
    />
  );
}

export type EmptyDescriptionProps = ComponentPropsWithoutRef<'p'>;

/**
 * Empty state description - renders as p for semantic correctness
 */
function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return (
    <p
      data-slot='empty-description'
      className={cn(
        'text-muted-foreground',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        'text-sm',
        className,
      )}
      {...props}
    />
  );
}

export type EmptyContentProps = ComponentPropsWithoutRef<'div'>;

function EmptyContent({ className, ...props }: EmptyContentProps) {
  return (
    <div
      data-slot='empty-content'
      className={cn(
        'flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
