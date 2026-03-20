// src/lib/blog.ts
/**
 * Blog library for managing local MDX blog posts
 * Native Next.js 16 implementation with direct file-system access
 * OPTIMIZED: Server-side caching with Cache Components
 */

import { cacheLife, cacheTag } from 'next/cache';
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
    editorsPick: post.editorsPick,
    deepDive: post.deepDive,
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
 * Returns posts sorted by publishedAt desc (newest first) as the canonical order
 */
const BLOG_CACHE_PROFILE = { stale: 600, revalidate: 3600, expire: 86400 } as const;

// Keep Editor's Picks aligned with current traffic priorities rather than publish date.
const EDITORS_PICKS_ORDER = [
  'student-loan-repayment-changes-2025-26',
  '100k-tax-trap-avoid-60-percent-tax-2025',
  'salary-sacrifice-explained-2025-26',
  'spring-statement-2026-uk-what-to-expect',
  'scottish-vs-english-tax-rates-2026-comparison',
] as const;

// biome-ignore lint/suspicious/useAwait: `use cache` helpers stay async for Next.js cache components.
async function getAllCachedPosts(): Promise<BlogPost[]> {
  'use cache';
  cacheLife(BLOG_CACHE_PROFILE);
  cacheTag('blog');

  const posts = getMDXPosts();
  // All posts in /content/blog are published
  // Sort by publishedAt desc as canonical order
  return posts
    .map(convertMDXPost)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

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

  // Filter by multiple categories (for nav groups)
  if (options.categories && options.categories.length > 0) {
    const categorySet = new Set(options.categories);
    filtered = filtered.filter((post) => categorySet.has(post.category));
  }
  // Filter by single category
  else if (options.category) {
    filtered = filtered.filter((post) => post.category === options.category);
  }

  // Filter by tag (case-insensitive to handle frontmatter inconsistencies)
  if (options.tag) {
    const tagLower = options.tag.toLowerCase();
    filtered = filtered.filter((post) => post.tags?.some((t) => t.toLowerCase() === tagLower));
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    filtered = filtered.filter((post) => post.featured === options.featured);
  }

  // Filter by search query (title, excerpt, and tags)
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter((post) => {
      const inTitle = post.title.toLowerCase().includes(query);
      const inExcerpt = post.excerpt.toLowerCase().includes(query);
      const inTags = (post.tags ?? []).some((t) => t.toLowerCase().includes(query));
      return inTitle || inExcerpt || inTags;
    });
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

  // Return simple array if not explicitly requesting pagination object
  // Note: Check value, not just presence, to avoid surprising behavior with { paginated: false }
  if (options.paginated !== true) {
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
 * Get a single blog post by slug (cached)
 * PAYTAX-77: Added caching for individual post lookups
 */
// biome-ignore lint/suspicious/useAwait: `use cache` helpers stay async for Next.js cache components.
async function getCachedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  'use cache';
  cacheLife(BLOG_CACHE_PROFILE);
  cacheTag('blog', `blog-post:${slug}`);

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
    editorsPick: post.editorsPick,
    deepDive: post.deepDive,
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
 * Get a single blog post by slug
 * PAYTAX-77: Now uses cached implementation (async)
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return await getCachedBlogPostBySlug(slug);
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
 * Falls back to most recent posts if no featured posts exist
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  // getAllCachedPosts returns posts sorted by publishedAt desc
  const allPosts = await getAllCachedPosts();
  const featuredPosts = allPosts.filter((post) => post.featured === true);

  if (featuredPosts.length === 0) {
    // Fallback: most recent posts (already sorted)
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
 * Get editor's picks posts
 * Primary: Posts with editorsPick: true frontmatter
 * Fallback: Most recent posts if insufficient picks (allPosts is sorted by publishedAt desc)
 */
export async function getEditorsPicks(limit: number = 5): Promise<BlogPost[]> {
  // getAllCachedPosts returns posts sorted by publishedAt desc
  const allPosts = await getAllCachedPosts();

  // Filter for editor's picks
  const orderedSlugs = new Map<string, number>(
    EDITORS_PICKS_ORDER.map((slug, index) => [slug, index]),
  );
  const editorsPicks = allPosts
    .filter((post) => post.editorsPick === true)
    .sort((a, b) => {
      const aIndex = orderedSlugs.get(a.slug);
      const bIndex = orderedSlugs.get(b.slug);

      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  // If we have enough editor's picks, return them
  if (editorsPicks.length >= limit) {
    return editorsPicks.slice(0, limit);
  }

  // Backfill with most recent posts (excluding already picked)
  const pickedSlugs = new Set(editorsPicks.map((p) => p.slug));
  const recentPosts = allPosts
    .filter((p) => !pickedSlugs.has(p.slug))
    .slice(0, limit - editorsPicks.length);

  return [...editorsPicks, ...recentPosts].slice(0, limit);
}

/**
 * Get deep dive posts
 * Primary: Posts with deepDive: true frontmatter
 * Fallback: Curated slugs from constants
 */
export async function getDeepDives(limit: number = 6): Promise<BlogPost[]> {
  const allPosts = await getAllCachedPosts();

  // Filter for deep dives
  const deepDives = allPosts.filter((post) => post.deepDive === true);

  // If we have enough deep dives, return them
  if (deepDives.length >= 3) {
    return deepDives.slice(0, limit);
  }

  // Import fallback slugs dynamically to avoid circular dependency
  const { DEEP_DIVE_FALLBACK_SLUGS } = await import('@/constants/deepDives');

  // Backfill with curated slugs
  const deepDiveSlugs = new Set(deepDives.map((p) => p.slug));
  const fallbackPosts = DEEP_DIVE_FALLBACK_SLUGS.filter((slug) => !deepDiveSlugs.has(slug))
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter((post): post is BlogPost => post !== undefined);

  return [...deepDives, ...fallbackPosts].slice(0, limit);
}

/**
 * Get latest posts (excluding featured/carousel posts)
 * Posts are sorted by publishedAt desc (newest first)
 */
export async function getLatestPosts(
  limit: number = 5,
  excludeSlugs: string[] = [],
): Promise<BlogPost[]> {
  // getAllCachedPosts returns posts sorted by publishedAt desc
  const allPosts = await getAllCachedPosts();
  const excludeSet = new Set(excludeSlugs);

  return allPosts.filter((post) => !excludeSet.has(post.slug)).slice(0, limit);
}

/**
 * Get related posts based on category and tags
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = BLOG_CONFIG.relatedPostsCount,
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
    .sort((a, b) => {
      // Sort by score, then by recency as tie-breaker
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    })
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
