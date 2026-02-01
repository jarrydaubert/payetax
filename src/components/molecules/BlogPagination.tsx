// src/components/molecules/BlogPagination.tsx
/**
 * Blog Pagination - Server Component
 *
 * Standard pagination with prev/next and page numbers.
 * Uses Next.js Link for SEO-friendly crawlable URLs.
 *
 * Page window logic:
 * - Always shows first and last page
 * - Shows up to 3 pages around current
 * - Total max: 5 numeric pages + 2 ellipses = 7 items
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import type { Route } from 'next';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  /** ID of element to scroll to after pagination (e.g., 'all-posts-heading') */
  scrollToId?: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = '/blog',
  scrollToId,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  // Guard against invalid page numbers from query params
  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);

  /**
   * Generate page numbers to display
   * - Max 5 numeric pages (first, last, up to 3 middle)
   * - Ellipses added where gaps exist
   */
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    // Show all if 5 or fewer
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate middle window (up to 3 pages around current)
    const start = Math.max(2, safeCurrent - 1);
    const end = Math.min(totalPages - 1, safeCurrent + 1);

    // Add start ellipsis if gap > 1
    if (start > 2) {
      pages.push('ellipsis-start');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add end ellipsis if gap > 1
    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  /**
   * Generate URL for a page number
   * Page 1 uses clean URL, others use query param
   * Optionally includes hash for scroll target
   *
   * Note: Cast to Route is required because basePath is dynamic.
   * This is safe as long as basePath is a valid route (caller's responsibility).
   */
  const getPageUrl = (page: number): Route => {
    const hash = scrollToId ? `#${scrollToId}` : '';
    if (page === 1) return `${basePath}${hash}` as Route;
    return `${basePath}?page=${page}${hash}` as Route;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav aria-label='Blog pagination' className='flex items-center justify-center gap-2'>
      {/* Previous button */}
      {safeCurrent > 1 ? (
        <Link
          href={getPageUrl(safeCurrent - 1)}
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 font-medium text-sm',
            'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
            'border border-slate-700/50 transition-colors',
          )}
          rel='prev'
        >
          <span aria-hidden='true'>«</span> Prev
        </Link>
      ) : (
        <span
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 font-medium text-sm',
            'cursor-not-allowed bg-slate-800/30 text-slate-500',
            'border border-slate-700/30',
          )}
          aria-disabled='true'
        >
          <span aria-hidden='true'>«</span> Prev
        </span>
      )}

      {/* Page numbers */}
      <div className='hidden items-center gap-1 sm:flex'>
        {pageNumbers.map((page) =>
          typeof page === 'string' ? (
            <span
              key={page}
              className='flex h-10 w-10 items-center justify-center text-slate-500'
              aria-hidden='true'
              role='presentation'
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg font-medium text-sm transition-colors',
                page === safeCurrent
                  ? 'bg-cyan-500 text-white'
                  : 'border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
              )}
              aria-current={page === safeCurrent ? 'page' : undefined}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {/* Mobile page indicator */}
      <span className='flex h-10 items-center px-3 text-slate-400 text-sm sm:hidden'>
        Page {safeCurrent} of {totalPages}
      </span>

      {/* Next button */}
      {safeCurrent < totalPages ? (
        <Link
          href={getPageUrl(safeCurrent + 1)}
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 font-medium text-sm',
            'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white',
            'border border-slate-700/50 transition-colors',
          )}
          rel='next'
        >
          Next <span aria-hidden='true'>»</span>
        </Link>
      ) : (
        <span
          className={cn(
            'flex h-10 items-center gap-1 rounded-lg px-4 font-medium text-sm',
            'cursor-not-allowed bg-slate-800/30 text-slate-500',
            'border border-slate-700/30',
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
