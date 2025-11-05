// src/components/molecules/mdx-components.tsx
/**
 * MDX components for blog post rendering
 * Server-side components for Next.js 16 native MDX
 */

import { ExternalLink, Hash } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';

const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const mdxComponents = {
  // Enhanced headings with anchor links
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => {
    const text = children?.toString() || '';
    const id = generateId(text);
    return (
      <h1
        className='group mt-8 mb-4 flex scroll-mt-20 items-center gap-3 font-bold text-foreground md:mt-12 md:mb-6'
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
          <Hash className='size-6' />
        </a>
      </h1>
    );
  },
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    const text = children?.toString() || '';
    const id = generateId(text);
    return (
      <h2
        className='group mt-6 mb-3 flex scroll-mt-20 items-center gap-3 font-bold text-foreground md:mt-10 md:mb-5'
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
          <Hash className='size-5' />
        </a>
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    const text = children?.toString() || '';
    const id = generateId(text);
    return (
      <h3
        className='group mt-5 mb-2 flex scroll-mt-20 items-center gap-2 font-bold text-foreground md:mt-8 md:mb-4'
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
          <Hash className='size-4' />
        </a>
      </h3>
    );
  },
  h4: ({ children, ...props }: React.ComponentPropsWithoutRef<'h4'>) => (
    <h4
      className='mt-4 mb-2 font-semibold text-foreground md:mt-6 md:mb-3'
      style={{ fontSize: 'var(--blog-font-size-xl)' }}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: React.ComponentPropsWithoutRef<'h5'>) => (
    <h5
      className='mt-5 mb-2 font-semibold text-foreground'
      style={{ fontSize: 'var(--blog-font-size-lg)' }}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: React.ComponentPropsWithoutRef<'h6'>) => (
    <h6
      className='mt-4 mb-2 font-semibold text-foreground'
      style={{ fontSize: 'var(--blog-font-size-base)' }}
      {...props}
    >
      {children}
    </h6>
  ),

  // Enhanced paragraphs
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p
      className='mb-6 text-foreground/90 leading-relaxed'
      style={{ fontSize: 'var(--blog-font-size-base)' }}
      {...props}
    >
      {children}
    </p>
  ),

  // Enhanced lists
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className='mb-6 list-disc space-y-2 pl-6 text-foreground/90' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className='mb-6 list-decimal space-y-2 pl-6 text-foreground/90' {...props}>
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
        className='inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80'
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink className='size-3' />}
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
      className='glass-card-inner my-8 rounded-r-lg border-primary/50 border-l-4 py-4 pl-6'
      {...props}
    >
      <div className='text-foreground/90 text-lg italic'>{children}</div>
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
      className='px-6 py-3 text-left font-semibold text-foreground uppercase tracking-wider'
      style={{ fontSize: 'var(--blog-font-size-sm)' }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td
      className='px-6 py-4 text-foreground/90'
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
      {alt && <p className='mt-2 text-center text-muted-foreground text-sm italic'>{alt}</p>}
    </div>
  ),
};
