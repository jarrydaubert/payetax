// src/components/molecules/BlogPagination.tsx
/**
 * Blog Pagination - Server Component
 *
 * Standard pagination with prev/next and page numbers.
 * Uses <a> tags for SEO-friendly crawlable URLs.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import Link from 'next/link';

import { cn } from '@/lib/utils';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = '/blog',
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display (show max 5 pages with ellipsis)
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath as '/blog';
    return `${basePath}?page=${page}` as `/blog?page=${number}`;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label='Blog pagination' className='flex items-center justify-center gap-2'>
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          scroll={false}
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-medium',
            'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
            'border border-slate-700/50 transition-colors'
          )}
          rel='prev'
        >
          <span aria-hidden='true'>«</span> Prev
        </Link>
      ) : (
        <span
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-medium',
            'bg-slate-800/30 text-slate-500 cursor-not-allowed',
            'border border-slate-700/30'
          )}
          aria-disabled='true'
        >
          <span aria-hidden='true'>«</span> Prev
        </span>
      )}

      {/* Page numbers */}
      <div className='hidden items-center gap-1 sm:flex'>
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className='flex h-10 w-10 items-center justify-center text-slate-500'
              aria-hidden='true'
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              scroll={false}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
              )}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Mobile page indicator */}
      <span className='flex h-10 items-center px-3 text-sm text-slate-400 sm:hidden'>
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          scroll={false}
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-medium',
            'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
            'border border-slate-700/50 transition-colors'
          )}
          rel='next'
        >
          Next <span aria-hidden='true'>»</span>
        </Link>
      ) : (
        <span
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 text-sm font-medium',
            'bg-slate-800/30 text-slate-500 cursor-not-allowed',
            'border border-slate-700/30'
          )}
          aria-disabled='true'
        >
          Next <span aria-hidden='true'>»</span>
        </span>
      )}
    </nav>
  );
}

export default BlogPagination;
