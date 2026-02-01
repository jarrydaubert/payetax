// src/types/blog.ts
/**
 * Types for the custom blog system
 * Uses next-mdx-remote for MDX compilation and rendering
 */

import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

/**
 * ISO 8601 date string (e.g., "2025-01-15")
 * Used for publishedAt, updatedAt fields
 */
export type ISODateString = string;

/**
 * Frontmatter structure for MDX blog posts
 * This defines all the metadata that can be included at the top of each .mdx file
 */
export interface BlogPostFrontmatter {
  // Required fields
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: ISODateString;
  category: string; // category slug

  // Optional fields
  updatedAt?: ISODateString;
  featured?: boolean;
  editorsPick?: boolean; // Show in Editor's Picks sidebar
  deepDive?: boolean; // Show in Deep Dives section
  author?: string;
  readTime?: string; // e.g., "5 min read"
  tags?: string[];
  image?: string; // relative path to image in /public/images/blog/
  imageAlt?: string;

  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

/**
 * Complete blog post including content
 * This is what gets returned when reading and processing MDX files
 */
export interface BlogPost extends BlogPostFrontmatter {
  id: string; // generated from filename
  content: string; // MDX content (raw)
  mdxContent?: MDXRemoteSerializeResult; // Compiled MDX for rendering
  categoryData?: BlogCategory; // populated category info
  published?: boolean; // publication status
  readingTime?: number; // calculated reading time in minutes
  wordCount?: number; // word count
}

/**
 * Category structure for blog organization
 *
 * Note: Also exported from blog.config.ts (inferred from Zod schema).
 * The `count` field is populated at runtime when querying posts.
 */
export interface BlogCategory {
  name: string;
  slug: string;
  description?: string;
  count?: number; // number of posts in this category
}

/**
 * Pagination options for blog queries
 */
export interface BlogPaginationOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  categories?: string[]; // Filter by multiple categories (for nav groups)
  tag?: string;
  featured?: boolean;
  searchQuery?: string;
  sortBy?: BlogSortOption;
  /** When true, returns { posts, pagination } object instead of just posts array */
  paginated?: boolean;
}

/**
 * Response structure for paginated blog queries
 */
export interface PaginatedBlogResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

/**
 * Structure for related posts - derived from BlogPostFrontmatter to avoid drift
 */
export type RelatedPost = Pick<
  BlogPostFrontmatter,
  'title' | 'slug' | 'excerpt' | 'publishedAt' | 'readTime' | 'category'
>;

/**
 * Blog configuration that will be stored in a config file
 *
 * Note: Also exported from blog.config.ts (inferred from Zod schema).
 * Keep in sync with BlogConfigSchema for consistency.
 */
export interface BlogConfig {
  postsPerPage: number;
  categories: BlogCategory[];
  featuredPostsCount: number;
  relatedPostsCount: number;
}

/**
 * Type guard to check if a post has all required frontmatter fields
 */
export function isValidBlogPost(data: unknown): data is BlogPostFrontmatter {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    'slug' in data &&
    'excerpt' in data &&
    'publishedAt' in data &&
    'category' in data &&
    typeof (data as BlogPostFrontmatter).title === 'string' &&
    typeof (data as BlogPostFrontmatter).slug === 'string' &&
    typeof (data as BlogPostFrontmatter).excerpt === 'string' &&
    typeof (data as BlogPostFrontmatter).publishedAt === 'string' &&
    typeof (data as BlogPostFrontmatter).category === 'string'
  );
}

/**
 * Sort options for blog posts
 */
export type BlogSortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

/**
 * Error codes for blog operations
 */
export type BlogErrorCode =
  | 'POST_NOT_FOUND'
  | 'INVALID_FRONTMATTER'
  | 'FILE_READ_ERROR'
  | 'PARSE_ERROR';

/**
 * Error class for blog operations with typed error codes
 */
export class BlogError extends Error {
  constructor(
    message: string,
    public code: BlogErrorCode,
    public details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'BlogError';
    // Fix prototype chain for instanceof reliability across transpilation
    Object.setPrototypeOf(this, BlogError.prototype);
  }
}
