// src/components/blog/BlogContent.tsx

'use client';

import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, ExternalLink, Hash } from 'lucide-react';
import { useState } from 'react';

interface BlogContentProps {
  content: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced headings with anchor links
          h1: ({ children, ...props }) => {
            const text = children?.toString() || '';
            const id = generateId(text);
            return (
              <h1 
                className="text-4xl font-bold mt-12 mb-6 text-foreground group flex items-center gap-3 scroll-mt-20" 
                id={id} 
                {...props}
              >
                <span>{children}</span>
                <a 
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                  aria-label="Link to this heading"
                >
                  <Hash className="h-6 w-6" />
                </a>
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = children?.toString() || '';
            const id = generateId(text);
            return (
              <h2 
                className="text-3xl font-bold mt-10 mb-5 text-foreground group flex items-center gap-3 scroll-mt-20" 
                id={id} 
                {...props}
              >
                <span>{children}</span>
                <a 
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                  aria-label="Link to this heading"
                >
                  <Hash className="h-5 w-5" />
                </a>
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = children?.toString() || '';
            const id = generateId(text);
            return (
              <h3 
                className="text-2xl font-bold mt-8 mb-4 text-foreground group flex items-center gap-2 scroll-mt-20" 
                id={id} 
                {...props}
              >
                <span>{children}</span>
                <a 
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80"
                  aria-label="Link to this heading"
                >
                  <Hash className="h-4 w-4" />
                </a>
              </h3>
            );
          },
          h4: ({ children, ...props }) => (
            <h4 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-lg font-semibold mt-5 mb-2 text-foreground" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props}>
              {children}
            </h6>
          ),

          // Enhanced paragraphs  
          p: ({ children, ...props }) => (
            <p className="mb-6 text-foreground/80 leading-relaxed text-lg" {...props}>
              {children}
            </p>
          ),

          // Enhanced lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground/80" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-foreground/80" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),

          // Enhanced links with external indicator
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3" />}
              </a>
            );
          },

          // Enhanced emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-foreground/90" {...props}>
              {children}
            </em>
          ),

          // Enhanced code blocks
          code: ({ children, className, ...props }) => {
            const isCodeBlock = className?.includes('language-');
            
            if (isCodeBlock) {
              const language = className?.replace('language-', '') || 'text';
              const codeText = children?.toString() || '';
              const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
              
              return (
                <div className="relative group my-6">
                  <div className="flex items-center justify-between glass-card-inner px-4 py-2 rounded-t-lg border-b border-foreground/10">
                    <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                      {language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(codeText, codeId)}
                      className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground transition-colors"
                      aria-label="Copy code"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedCode === codeId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="glass-card-inner p-4 rounded-b-lg overflow-x-auto border border-foreground/10">
                    <code className="text-sm text-foreground font-mono" {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            // Inline code
            return (
              <code 
                className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono border border-foreground/20" 
                {...props}
              >
                {children}
              </code>
            );
          },

          // Enhanced blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/50 pl-6 my-8 glass-card-inner py-4 rounded-r-lg"
              {...props}
            >
              <div className="text-foreground/80 italic text-lg">
                {children}
              </div>
            </blockquote>
          ),

          // Enhanced tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-foreground/20">
              <table
                className="min-w-full glass-card-inner backdrop-blur-sm"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-foreground/10" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-foreground/10" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-foreground/5 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-6 py-3 text-left text-sm font-semibold text-foreground uppercase tracking-wider"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-6 py-4 text-sm text-foreground/80" {...props}>
              {children}
            </td>
          ),

          // Enhanced horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" {...props} />
          ),

          // Enhanced images
          img: ({ src, alt, ...props }) => (
            <div className="my-8">
              <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-lg w-full border border-foreground/20"
                {...props}
              />
              {alt && (
                <p className="text-center text-sm text-foreground/60 mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default BlogContent;
