// src/components/molecules/mdx-components.tsx
/**
 * MDX components for blog post rendering
 * Server-side components for Next.js 16 native MDX
 */

import { ExternalLink, Hash } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const mdxComponents = {
  // Enhanced headings with anchor links
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => {
    const text = typeof children === 'string' ? children : '';
    const id = generateId(text);
    return (
      <h1
        className={cn(
          'group flex scroll-mt-20 items-center font-bold text-foreground',
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
        <a
          href={`#${id}`}
          className='text-primary opacity-0 transition-opacity hover:text-primary/80 group-hover:opacity-100'
          aria-label='Link to this heading'
        >
          <Hash className='size-6' aria-hidden='true' />
        </a>
      </h1>
    );
  },
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    const text = typeof children === 'string' ? children : '';
    const id = generateId(text);
    return (
      <h2
        className={cn(
          'group flex scroll-mt-20 items-center font-bold text-foreground',
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
        <a
          href={`#${id}`}
          className='text-primary opacity-0 transition-opacity hover:text-primary/80 group-hover:opacity-100'
          aria-label='Link to this heading'
        >
          <Hash className='size-5' aria-hidden='true' />
        </a>
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    const text = typeof children === 'string' ? children : '';
    const id = generateId(text);
    return (
      <h3
        className={cn(
          'group flex scroll-mt-20 items-center font-bold text-foreground',
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
        <a
          href={`#${id}`}
          className='text-primary opacity-0 transition-opacity hover:text-primary/80 group-hover:opacity-100'
          aria-label='Link to this heading'
        >
          <Hash className='size-4' aria-hidden='true' />
        </a>
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
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => {
    const isExternal = href?.startsWith('http');
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
    // Inline code only (code blocks are handled by rehype-pretty-code)
    return (
      <code
        className='rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 font-mono text-foreground'
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
        'glass-card-inner rounded-lg border-primary/50 border-l-4 px-6',
        'my-8 flex items-center [&_p]:mb-0',
        SPACING.PY_4,
      )}
      {...props}
    >
      <div className={cn('text-foreground/90 italic', TYPOGRAPHY.TEXT_LG)}>{children}</div>
    </blockquote>
  ),

  // Enhanced tables
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className='my-8 overflow-x-auto rounded-lg border border-foreground/20'>
      <table className='glass-card-inner min-w-full backdrop-blur-sm' {...props}>
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

  // Enhanced images
  img: ({ src, alt }: React.ComponentPropsWithoutRef<'img'>) => (
    <div className='my-8'>
      <Image
        src={typeof src === 'string' ? src : ''}
        alt={alt || ''}
        width={800}
        height={400}
        className='w-full rounded-lg border border-foreground/20 shadow-lg'
      />
      {alt && (
        <p
          className={cn(
            'text-center text-muted-foreground italic',
            SPACING.MT_2,
            TYPOGRAPHY.TEXT_SM,
          )}
        >
          {alt}
        </p>
      )}
    </div>
  ),
};
