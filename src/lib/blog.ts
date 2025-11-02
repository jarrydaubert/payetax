// src/lib/blog.ts
/**
 * Blog library for managing local MDX blog posts
 * Native Next.js 16 implementation with direct file-system access
 * OPTIMIZED: Server-side caching with unstable_cache
 */

import { unstable_cache } from 'next/cache';
import { BLOG_CATEGORIES, BLOG_CONFIG, getCategoryBySlug } from '@/config/blog.config';
import { getPostBySlug as getMDXPostBySlug, getAllPosts as getMDXPosts } from '@/lib/mdx';
import type {
  BlogCategory,
  BlogPaginationOptions,
  BlogPost,
  BlogSortOption,
  RelatedPost,
} from '@/types/blog';

// Re-export the BlogError class from types
export { BlogError } from '@/types/blog';

/**
 * Convert MDX post to BlogPost type
 */
function convertMDXPost(post: ReturnType<typeof getMDXPosts>[0]): BlogPost {
  const categoryData = getCategoryBySlug(post.category);

  return {
    id: post.slug,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    category: post.category,
    content: '', // Will be loaded separately if needed
    categoryData,

    // Optional fields
    updatedAt: post.updatedAt || post.publishedAt,
    featured: post.featured,
    published: true, // All posts in /content/blog are published
    author: post.author || 'PayeTax Team',
    readTime: `${post.readingTime} min read`,
    tags: post.tags || post.seoKeywords || [],
    image: post.image,
    imageAlt: post.imageAlt,
    readingTime: post.readingTime,
    wordCount: post.wordCount,

    // SEO fields
    seoTitle: post.seoTitle || post.title,
    seoDescription: post.seoDescription || post.excerpt,
    seoKeywords: post.seoKeywords || post.tags || [],
  };
}

/**
 * Get all published posts (cached)
 */
const getAllCachedPosts = unstable_cache(
  (): Promise<BlogPost[]> => {
    const posts = getMDXPosts();
    // All posts in /content/blog are published
    return Promise.resolve(posts.map(convertMDXPost));
  },
  ['blog-all-posts'],
  { revalidate: 3600, tags: ['blog'] }
);

/**
 * Sort posts based on the specified criteria
 */
function sortPosts(posts: BlogPost[], sortBy: BlogSortOption = 'date-desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'date-asc':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
}

/**
 * Filter posts based on provided options
 */
function filterPosts(posts: BlogPost[], options: BlogPaginationOptions): BlogPost[] {
  let filtered = [...posts];

  // Filter by category
  if (options.category) {
    filtered = filtered.filter((post) => post.category === options.category);
  }

  // Filter by tag
  if (options.tag) {
    const tag = options.tag;
    filtered = filtered.filter((post) => post.tags?.includes(tag));
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    filtered = filtered.filter((post) => post.featured === options.featured);
  }

  // Filter by search query (title or excerpt)
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) || post.excerpt.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Paginate an array of posts
 */
function paginatePosts(posts: BlogPost[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return posts.slice(start, end);
}

/**
 * Get blog posts with optional filtering, sorting, and pagination
 * Can return either paginated response or simple array based on usage
 */
export async function getBlogPosts(options?: BlogPaginationOptions): Promise<BlogPost[]>;
export async function getBlogPosts(options: BlogPaginationOptions & { paginated: true }): Promise<{
  posts: BlogPost[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}>;
export async function getBlogPosts(options: BlogPaginationOptions = {}): Promise<
  | BlogPost[]
  | {
      posts: BlogPost[];
      pagination: { page: number; pageSize: number; total: number; pageCount: number };
    }
> {
  const {
    page = 1,
    pageSize = BLOG_CONFIG.postsPerPage,
    sortBy = 'date-desc',
    ...filterOptions
  } = options;

  // Get all posts
  const allPosts = await getAllCachedPosts();

  // Filter posts
  let posts = filterPosts(allPosts, filterOptions);

  // Sort posts
  posts = sortPosts(posts, sortBy);

  // Calculate pagination
  const total = posts.length;
  const pageCount = Math.ceil(total / pageSize);

  // Paginate posts
  const paginatedPosts = paginatePosts(posts, page, pageSize);

  // Return simple array if not explicitly requesting pagination
  if (!('paginated' in options)) {
    return paginatedPosts;
  }

  return {
    posts: paginatedPosts,
    pagination: {
      page,
      pageSize,
      total,
      pageCount,
    },
  };
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const post = getMDXPostBySlug(slug);

  if (!post) {
    return null;
  }

  const categoryData = getCategoryBySlug(post.category);

  return {
    id: post.slug,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    category: post.category,
    content: post.content,
    categoryData,
    updatedAt: post.updatedAt || post.publishedAt,
    featured: post.featured,
    published: true, // All posts in /content/blog are published
    author: post.author || 'PayeTax Team',
    readTime: `${post.readingTime} min read`,
    tags: post.tags || post.seoKeywords || [],
    image: post.image,
    imageAlt: post.imageAlt,
    readingTime: post.readingTime,
    wordCount: post.wordCount,
    seoTitle: post.seoTitle || post.title,
    seoDescription: post.seoDescription || post.excerpt,
    seoKeywords: post.seoKeywords || post.tags || [],
  };
}

/**
 * Get all categories from config with post counts
 * Returns ALL categories from BLOG_CATEGORIES, even if they have 0 posts
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const allPosts = await getAllCachedPosts();
  const categoryMap = new Map<string, number>();

  // Count posts per category
  for (const post of allPosts) {
    categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
  }

  // Return ALL categories from config (not just ones with posts)
  return BLOG_CATEGORIES.map((category) => ({
    ...category,
    count: categoryMap.get(category.slug) || 0,
  }));
}

/**
 * Get posts count for a category
 */
export async function getBlogPostsCount(category?: string): Promise<number> {
  const allPosts = await getAllCachedPosts();

  if (!category) {
    return allPosts.length;
  }

  return allPosts.filter((post) => post.category === category).length;
}

/**
 * Get featured blog posts (array)
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllCachedPosts();
  const featuredPosts = allPosts.filter((post) => post.featured === true);

  if (featuredPosts.length === 0) {
    return allPosts.slice(0, BLOG_CONFIG.featuredPostsCount);
  }

  return featuredPosts.slice(0, BLOG_CONFIG.featuredPostsCount);
}

/**
 * Get featured blog post (single)
 */
export async function getFeaturedPost(): Promise<BlogPost | null> {
  const featuredPosts = await getFeaturedPosts();
  return featuredPosts[0] || null;
}

/**
 * Get related posts based on category and tags
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = BLOG_CONFIG.relatedPostsCount
): Promise<RelatedPost[]> {
  const allPosts = await getAllCachedPosts();

  // Score posts by relevance
  const scoredPosts = allPosts
    .filter((post) => post.slug !== currentPost.slug) // Exclude current post
    .map((post) => {
      let score = 0;

      // Same category: +10 points
      if (post.category === currentPost.category) {
        score += 10;
      }

      // Shared tags: +1 point per tag
      const sharedTags = post.tags?.filter((tag) => currentPost.tags?.includes(tag)) || [];
      score += sharedTags.length;

      return { post, score };
    })
    .filter((item) => item.score > 0) // Only include posts with some relevance
    .sort((a, b) => b.score - a.score) // Sort by score
    .slice(0, limit);

  // Convert to RelatedPost format
  return scoredPosts.map(({ post }) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
    category: post.category,
  }));
}
