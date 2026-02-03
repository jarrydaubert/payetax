// src/components/molecules/mdx-components.tsx
/**
 * MDX components for blog post rendering
 * Server-side components for Next.js 16 native MDX
 */

import GithubSlugger from 'github-slugger';
import { ExternalLink, Hash } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { isValidElement, type ReactNode } from 'react';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

// Per-render slugger for unique IDs across a document
// Note: If rendering multiple MDX docs in one request, reset between docs
const slugger = new GithubSlugger();

/**
 * Recursively extract text content from React nodes
 * Handles strings, numbers, arrays, and React elements with children
 */
function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (isValidElement(node)) {
    // Props type is unknown, so we need to safely access children
    const props = node.props as { children?: ReactNode };
    if (props.children) {
      return getNodeText(props.children);
    }
  }
  return '';
}

/**
 * Generate a unique heading ID from children or explicit id prop
 * Returns undefined if no valid text content
 */
function makeHeadingId(children: ReactNode, explicitId?: string): string | undefined {
  if (explicitId) return explicitId;
  const text = getNodeText(children).trim();
  if (!text) return undefined;
  return slugger.slug(text);
}

/** Check if href is an external link (http://, https://, or protocol-relative) */
function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
}

/** Common styles for heading anchor links */
const ANCHOR_LINK_CLASSES = cn(
  'text-primary opacity-0 transition-opacity',
  'hover:text-primary/80 group-hover:opacity-100',
  'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'rounded-sm', // For focus ring
);

export const mdxComponents = {
  // Enhanced headings with anchor links
  h1: ({ children, id: explicitId, ...props }: React.ComponentPropsWithoutRef<'h1'>) => {
    const id = makeHeadingId(children, explicitId);
    return (
      <h1
        className={cn(
          'group flex scroll-mt-20 flex-wrap items-center font-bold text-foreground',
          SPACING.MT_8,
          SPACING.MB_4,
          SPACING.GAP_3,
          'md:mt-12 md:mb-6',
        )}
        style={{ fontSize: 'var(--blog-font-size-4xl)' }}
        id={id}
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className={ANCHOR_LINK_CLASSES} aria-label='Link to this heading'>
            <Hash className={ICON_SIZES.SIZE_6} aria-hidden='true' />
          </a>
        )}
      </h1>
    );
  },
  h2: ({ children, id: explicitId, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    const id = makeHeadingId(children, explicitId);
    return (
      <h2
        className={cn(
          'group flex scroll-mt-20 flex-wrap items-center font-bold text-foreground',
          SPACING.MT_6,
          SPACING.MB_3,
          SPACING.GAP_3,
          'md:mt-10 md:mb-5',
        )}
        style={{ fontSize: 'var(--blog-font-size-3xl)' }}
        id={id}
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className={ANCHOR_LINK_CLASSES} aria-label='Link to this heading'>
            <Hash className={ICON_SIZES.SIZE_5} aria-hidden='true' />
          </a>
        )}
      </h2>
    );
  },
  h3: ({ children, id: explicitId, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    const id = makeHeadingId(children, explicitId);
    return (
      <h3
        className={cn(
          'group flex scroll-mt-20 flex-wrap items-center font-bold text-foreground',
          'mt-5',
          SPACING.MB_2,
          SPACING.GAP_2,
          'md:mt-8 md:mb-4',
        )}
        style={{ fontSize: 'var(--blog-font-size-2xl)' }}
        id={id}
        {...props}
      >
        <span>{children}</span>
        {id && (
          <a href={`#${id}`} className={ANCHOR_LINK_CLASSES} aria-label='Link to this heading'>
            <Hash className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          </a>
        )}
      </h3>
    );
  },
  h4: ({ children, ...props }: React.ComponentPropsWithoutRef<'h4'>) => (
    <h4
      className={cn('font-semibold text-foreground', SPACING.MT_4, SPACING.MB_2, 'md:mt-6 md:mb-3')}
      style={{ fontSize: 'var(--blog-font-size-xl)' }}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: React.ComponentPropsWithoutRef<'h5'>) => (
    <h5
      className={cn('font-semibold text-foreground', 'mt-5', SPACING.MB_2)}
      style={{ fontSize: 'var(--blog-font-size-lg)' }}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: React.ComponentPropsWithoutRef<'h6'>) => (
    <h6
      className={cn('font-semibold text-foreground', SPACING.MT_4, SPACING.MB_2)}
      style={{ fontSize: 'var(--blog-font-size-base)' }}
      {...props}
    >
      {children}
    </h6>
  ),

  // Enhanced paragraphs
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p
      className={cn('text-foreground/90 leading-relaxed', SPACING.MB_6)}
      style={{ fontSize: 'var(--blog-font-size-base)' }}
      {...props}
    >
      {children}
    </p>
  ),

  // Enhanced lists
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className={cn('list-disc pl-6 text-foreground/90', SPACING.MB_6, SPACING.SPACE_Y_2)}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className={cn('list-decimal pl-6 text-foreground/90', SPACING.MB_6, SPACING.SPACE_Y_2)}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className='leading-relaxed' {...props}>
      {children}
    </li>
  ),

  // Enhanced links with external indicator
  // Handles http://, https://, protocol-relative (//)
  // Does NOT treat mailto: or tel: as external
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => {
    const isExternal = isExternalHref(href);
    return (
      <a
        href={href}
        className={cn(
          'inline-flex items-center font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80',
          SPACING.GAP_1,
        )}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className='size-3' aria-hidden='true' />}
      </a>
    );
  },

  // Enhanced emphasis
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong className='font-bold text-foreground' {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
    <em className='text-foreground/90 italic' {...props}>
      {children}
    </em>
  ),

  // Enhanced code (inline only - code blocks handled by rehype-pretty-code)
  code: ({ children, className, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
    // Preserve className for rehype-pretty-code or custom MDX classes
    return (
      <code
        className={cn(
          'rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 font-mono text-foreground',
          className,
        )}
        style={{ fontSize: 'var(--blog-font-size-sm)' }}
        {...props}
      >
        {children}
      </code>
    );
  },

  // Enhanced blockquotes
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className={cn(
        'rounded-lg border-l-4 border-primary/50 bg-card/80 backdrop-blur-sm',
        'my-8 px-6 [&_p:last-child]:mb-0',
        SPACING.PY_4,
      )}
      {...props}
    >
      <div className={cn('text-foreground/90 italic', TYPOGRAPHY.TEXT_LG)}>{children}</div>
    </blockquote>
  ),

  // Callout component for examples, warnings, tips
  Callout: ({
    children,
    type = 'info',
    ...props
  }: React.ComponentPropsWithoutRef<'div'> & {
    type?: 'info' | 'warning' | 'example' | 'tip';
  }) => {
    const styles = {
      info: 'border-primary/50 bg-primary/5',
      warning: 'border-amber-500/50 bg-amber-500/5',
      example: 'border-emerald-500/50 bg-emerald-500/5',
      tip: 'border-blue-500/50 bg-blue-500/5',
    };

    return (
      <div
        className={cn(
          'my-6 rounded-lg border-l-4 p-4',
          styles[type],
          '[&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
          '[&_ul]:mb-0 [&_ol]:mb-0',
        )}
        {...props}
      >
        {children}
      </div>
    );
  },

  // Enhanced tables
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className='my-8 overflow-x-auto rounded-lg border border-foreground/20'>
      <table className='glass-card-inner min-w-[640px] w-full backdrop-blur-sm' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className='bg-foreground/10' {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className='divide-y divide-foreground/10' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr className='transition-colors hover:bg-foreground/5' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th
      className={cn(
        'text-left font-semibold text-foreground uppercase tracking-wider',
        SPACING.PX_6,
        'py-3',
      )}
      style={{ fontSize: 'var(--blog-font-size-sm)' }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td
      className={cn('text-foreground/90', SPACING.PX_6, SPACING.PY_4)}
      style={{ fontSize: 'var(--blog-font-size-sm)' }}
      {...props}
    >
      {children}
    </td>
  ),

  // Enhanced horizontal rule
  hr: ({ ...props }: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr
      className='my-12 h-px border-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent'
      {...props}
    />
  ),

  // Enhanced images with figure/figcaption semantics
  img: ({ src, alt }: React.ComponentPropsWithoutRef<'img'>) => {
    // Guard against empty/invalid src (would throw in next/image)
    if (typeof src !== 'string' || !src) return null;

    return (
      <figure className='my-8'>
        <Image
          src={src}
          alt={alt || ''}
          width={1200}
          height={630}
          sizes='(max-width: 768px) 100vw, 768px'
          className='h-auto w-full rounded-lg border border-foreground/20 shadow-lg'
        />
        {alt && (
          <figcaption
            className={cn(
              'text-center text-muted-foreground italic',
              SPACING.MT_2,
              TYPOGRAPHY.TEXT_SM,
            )}
          >
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },

  // Table caption for accessibility
  caption: (props: React.ComponentPropsWithoutRef<'caption'>) => (
    <caption
      className={cn('text-left text-muted-foreground', SPACING.P_3, TYPOGRAPHY.TEXT_SM)}
      {...props}
    />
  ),
};
