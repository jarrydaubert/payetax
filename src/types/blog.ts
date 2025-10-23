// src/types/blog.ts
/**
 * Types for the custom blog system
 * Replaces the Strapi-based types with local MDX-based blog types
 */

import type { MDX } from 'contentlayer2/core';

/**
 * Frontmatter structure for MDX blog posts
 * This defines all the metadata that can be included at the top of each .mdx file
 */
export interface BlogPostFrontmatter {
  // Required fields
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string; // ISO date string
  category: string; // category slug

  // Optional fields
  updatedAt?: string; // ISO date string
  featured?: boolean;
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
  body?: MDX; // Contentlayer MDX body with code for rendering
  categoryData?: BlogCategory; // populated category info
  published?: boolean; // publication status
}

/**
 * Category structure for blog organization
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
  tag?: string;
  featured?: boolean;
  searchQuery?: string;
  sortBy?: BlogSortOption;
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
 * Structure for related posts
 */
export interface RelatedPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readTime?: string;
  category: string;
}

/**
 * Blog configuration that will be stored in a config file
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
 * Error types for blog operations
 */
export class BlogError extends Error {
  constructor(
    message: string,
    public code: 'POST_NOT_FOUND' | 'INVALID_FRONTMATTER' | 'FILE_READ_ERROR' | 'PARSE_ERROR'
  ) {
    super(message);
    this.name = 'BlogError';
  }
}
