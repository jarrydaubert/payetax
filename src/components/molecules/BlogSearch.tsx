// src/components/molecules/BlogSearch.tsx
'use client';

import Fuse from 'fuse.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/types/blog';

interface BlogSearchProps {
  posts: BlogPost[];
  className?: string;
}

export function BlogSearch({ posts, className }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'excerpt', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'category', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [posts]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 5);
  }, [fuse, query]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  return (
    <div className={cn('relative z-50 w-full max-w-md', className)}>
      <div className='relative'>
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground',
            ICON_SIZES.SIZE_4
          )}
          aria-hidden='true'
        />
        <Input
          type='search'
          placeholder='Search articles...'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className='pr-10 pl-10'
          aria-label='Search blog posts'
        />
        {query && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
            aria-label='Clear search'
          >
            <X className={ICON_SIZES.SIZE_4} />
          </button>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && query.trim() && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          aria-hidden='true'
        />
      )}

      {/* Results dropdown */}
      {isOpen && query.trim() && (
        <div className='absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-slate-900 light:bg-white shadow-2xl'>
          {results.length > 0 ? (
            <ul className='divide-y divide-border'>
              {results.map(({ item: post }) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    onClick={handleClear}
                    className='block p-4 transition-colors hover:bg-primary/5'
                  >
                    <div className='mb-1 flex items-center gap-2'>
                      <span
                        className={cn(
                          'rounded bg-primary/10 px-2 py-0.5 text-primary',
                          TYPOGRAPHY.TEXT_XS
                        )}
                      >
                        {post.category}
                      </span>
                      {post.readTime && (
                        <span
                          className={cn(
                            'flex items-center gap-1 text-muted-foreground',
                            TYPOGRAPHY.TEXT_XS
                          )}
                        >
                          <Clock className={ICON_SIZES.SIZE_3_5} aria-hidden='true' />
                          {post.readTime}
                        </span>
                      )}
                    </div>
                    <h4 className={cn('font-medium text-foreground', TYPOGRAPHY.TEXT_SM)}>
                      {post.title}
                    </h4>
                    <p className={cn('line-clamp-1 text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                      {post.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className='p-4 text-center text-muted-foreground'>
              <p className={TYPOGRAPHY.TEXT_SM}>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
