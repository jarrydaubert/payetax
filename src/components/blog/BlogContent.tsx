// src/components/blog/BlogContent.tsx

'use client';

import type { MDX } from 'contentlayer2/core';
import { Copy, ExternalLink, Hash } from 'lucide-react';
import Image from 'next/image';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import type React from 'react';
import { useState } from 'react';

interface BlogContentProps {
  body: MDX;
}

const BlogContent: React.FC<BlogContentProps> = ({ body }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const MDXContent = useMDXComponent(body.code);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Custom MDX components for styling
  const components = {
    // Enhanced headings with anchor links
    h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => {
      const text = children?.toString() || '';
      const id = generateId(text);
      return (
        <h1
          className='group mt-8 md:mt-12 mb-4 md:mb-6 flex scroll-mt-20 items-center gap-3 font-bold text-foreground'
          style={{ fontSize: 'var(--font-size-4xl)' }}
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
          className='group mt-6 md:mt-10 mb-3 md:mb-5 flex scroll-mt-20 items-center gap-3 font-bold text-foreground'
          style={{ fontSize: 'var(--font-size-3xl)' }}
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
          className='group mt-5 md:mt-8 mb-2 md:mb-4 flex scroll-mt-20 items-center gap-2 font-bold text-foreground'
          style={{ fontSize: 'var(--font-size-2xl)' }}
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
        className='mt-4 md:mt-6 mb-2 md:mb-3 font-semibold text-foreground'
        style={{ fontSize: 'var(--font-size-xl)' }}
        {...props}
      >
        {children}
      </h4>
    ),
    h5: ({ children, ...props }: React.ComponentPropsWithoutRef<'h5'>) => (
      <h5
        className='mt-5 mb-2 font-semibold text-foreground'
        style={{ fontSize: 'var(--font-size-lg)' }}
        {...props}
      >
        {children}
      </h5>
    ),
    h6: ({ children, ...props }: React.ComponentPropsWithoutRef<'h6'>) => (
      <h6
        className='mt-4 mb-2 font-semibold text-foreground'
        style={{ fontSize: 'var(--font-size-base)' }}
        {...props}
      >
        {children}
      </h6>
    ),

    // Enhanced paragraphs
    p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
      <p
        className='mb-6 text-foreground/80 leading-relaxed'
        style={{ fontSize: 'var(--font-size-base)' }}
        {...props}
      >
        {children}
      </p>
    ),

    // Enhanced lists
    ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
      <ul className='mb-6 list-disc space-y-2 pl-6 text-foreground/80' {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
      <ol className='mb-6 list-decimal space-y-2 pl-6 text-foreground/80' {...props}>
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

    // Enhanced code blocks
    code: ({ children, className, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
      const isCodeBlock = className?.includes('language-');

      if (isCodeBlock) {
        const language = className?.replace('language-', '') || 'text';
        const codeText = children?.toString() || '';
        const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

        return (
          <div className='group relative my-6'>
            <div className='glass-card-inner flex items-center justify-between rounded-t-lg border-foreground/10 border-b px-4 py-2'>
              <span className='font-medium text-foreground/60 text-xs uppercase tracking-wide'>
                {language}
              </span>
              <button
                type='button'
                onClick={() => copyToClipboard(codeText, codeId)}
                className='flex items-center gap-1 text-foreground/60 text-xs transition-colors hover:text-foreground'
                aria-label='Copy code'
              >
                <Copy className='size-3' />
                {copiedCode === codeId ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className='glass-card-inner overflow-x-auto rounded-b-lg border border-foreground/10 p-4'>
              <code
                className='font-mono text-foreground'
                style={{ fontSize: 'var(--font-size-sm)' }}
                {...props}
              >
                {children}
              </code>
            </pre>
          </div>
        );
      }

      // Inline code
      return (
        <code
          className='rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 font-mono text-foreground'
          style={{ fontSize: 'var(--font-size-sm)' }}
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
        <div className='text-foreground/80 text-lg italic'>{children}</div>
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
        style={{ fontSize: 'var(--font-size-sm)' }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
      <td
        className='px-6 py-4 text-foreground/80'
        style={{ fontSize: 'var(--font-size-sm)' }}
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
        {alt && <p className='mt-2 text-center text-foreground/60 text-sm italic'>{alt}</p>}
      </div>
    ),
  };

  return (
    <div className='prose prose-lg max-w-none'>
      <MDXContent components={components} />
    </div>
  );
};

export default BlogContent;
