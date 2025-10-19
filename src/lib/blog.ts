// src/lib/blog.ts
/**
 * Blog library for managing local MDX blog posts using Contentlayer
 * Uses Contentlayer2 for MDX compilation and type-safe blog posts
 * OPTIMIZED: Direct Contentlayer integration instead of manual parsing
 */

import { allPosts, type Post } from 'contentlayer/generated';
import { unstable_cache } from 'next/cache';
import { BLOG_CONFIG, getCategoryBySlug } from '@/config/blog.config';
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
 * Convert Contentlayer Post to BlogPost type
 */
function convertContentlayerPost(post: Post): BlogPost {
  const categoryData = getCategoryBySlug(post.category);

  return {
    id: post._id,
    title: post.title,
    slug: post.slugAsParams, // Use slugAsParams which strips the "blog/" prefix
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    category: post.category,
    content: post.body.raw, // Keep for compatibility
    body: post.body, // Add the MDX body for rendering
    categoryData,

    // Optional fields
    updatedAt: post.updatedAt || post.publishedAt,
    featured: post.featured,
    published: post.published !== false, // Default to true if not specified
    author: post.author,
    readTime: `${post.readingTime} min read`,
    tags: post.keywords || [],
    image: post.image,
    imageAlt: post.imageAlt,

    // SEO fields
    seoTitle: post.seoTitle || post.title,
    seoDescription: post.seoDescription || post.excerpt,
    seoKeywords: post.keywords || [],
  };
}

/**
 * Get all published posts from Contentlayer (cached)
 */
const getAllContentlayerPosts = unstable_cache(
  (): Promise<BlogPost[]> => {
    return Promise.resolve(
      allPosts.filter((post) => post.published !== false).map(convertContentlayerPost)
    );
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
    filtered = filtered.filter((post) =>
      post.tags?.some((tag) => tag.toLowerCase() === options.tag?.toLowerCase())
    );
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    filtered = filtered.filter((post) => post.featured === options.featured);
  }

  // Filter by search query
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        post.content.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Get paginated posts
 */
function paginatePosts(posts: BlogPost[], page: number, pageSize: number): BlogPost[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return posts.slice(start, end);
}

/**
 * Get blog posts with optional filtering and pagination
 */
export async function getBlogPosts(options: BlogPaginationOptions = {}): Promise<BlogPost[]> {
  const { page = 1, pageSize = BLOG_CONFIG.postsPerPage } = options;

  try {
    // Get all posts from Contentlayer
    const allContentPosts = await getAllContentlayerPosts();

    // Apply filters
    const filteredPosts = filterPosts(allContentPosts, options);

    // Sort posts (default: newest first)
    const sortedPosts = sortPosts(filteredPosts, 'date-desc');

    // Apply pagination
    const paginatedPosts = paginatePosts(sortedPosts, page, pageSize);

    return paginatedPosts;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

/**
 * Get total count of posts (with optional category filter, cached)
 * Cache revalidates every hour for performance
 */
export const getBlogPostsCount = unstable_cache(
  async (category?: string): Promise<number> => {
    try {
      const allContentPosts = await getAllContentlayerPosts();

      if (category) {
        return allContentPosts.filter((post) => post.category === category).length;
      }

      return allContentPosts.length;
    } catch {
      return 0;
    }
  },
  ['blog-posts-count'],
  { revalidate: 3600, tags: ['blog'] }
);

/**
 * Get a blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const allContentPosts = await getAllContentlayerPosts();
    const post = allContentPosts.find((p) => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error(`Error getting blog post by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const posts = await getBlogPosts({
    featured: true,
    pageSize: BLOG_CONFIG.featuredPostsCount,
  });

  // If no featured posts, return the latest posts
  if (posts.length === 0) {
    return getBlogPosts({
      pageSize: BLOG_CONFIG.featuredPostsCount,
    });
  }

  return posts;
}

/**
 * Get the featured blog post (single)
 */
export async function getFeaturedPost(): Promise<BlogPost | null> {
  const featuredPosts = await getFeaturedPosts();
  return featuredPosts[0] || null;
}

/**
 * Get related posts for a given post with intelligent scoring
 * Algorithm:
 * - Same category = +10 points
 * - Matching tags = +5 points per tag
 * - Featured post = +2 points
 * - Recent post (< 30 days) = +1 point
 */
export async function getRelatedPosts(
  postId: string,
  categorySlug?: string,
  count: number = BLOG_CONFIG.relatedPostsCount
): Promise<RelatedPost[]> {
  try {
    const allPosts = await getBlogPosts();

    // Find current post to get its tags
    const currentPost = allPosts.find((post) => post.id === postId);

    // Filter out the current post
    const otherPosts = allPosts.filter((post) => post.id !== postId);

    // Calculate relevance score for each post
    const scoredPosts = otherPosts.map((post) => {
      let score = 0;

      // Same category = +10 points
      if (categorySlug && post.category === categorySlug) {
        score += 10;
      }

      // Matching tags = +5 points per match
      if (currentPost?.tags && post.tags) {
        const matchingTags = post.tags.filter((tag) => currentPost.tags?.includes(tag));
        score += matchingTags.length * 5;
      }

      // Featured post = +2 points
      if (post.featured) {
        score += 2;
      }

      // Recency bonus (newer posts < 30 days old)
      const daysSincePublish = Math.floor(
        (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePublish < 30) {
        score += 1;
      }

      return { post, score };
    });

    // Sort by score desc, then by date desc
    const sortedPosts = scoredPosts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    });

    // Return top N posts in RelatedPost format
    return sortedPosts.slice(0, count).map((item) => ({
      title: item.post.title,
      slug: item.post.slug,
      excerpt: item.post.excerpt,
      publishedAt: item.post.publishedAt,
      readTime: item.post.readTime,
      category: item.post.category,
    }));
  } catch (error) {
    console.error(`Error getting related posts for ${postId}:`, error);
    return [];
  }
}

/**
 * Get all available blog categories with post counts (cached)
 * Cache revalidates every hour to improve build performance
 */
export const getBlogCategories = unstable_cache(
  async (): Promise<BlogCategory[]> => {
    try {
      const allContentPosts = await getAllContentlayerPosts();

      // Count posts per category
      const categoryCounts = allContentPosts.reduce(
        (counts, post) => {
          counts[post.category] = (counts[post.category] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>
      );

      // Return categories with counts
      return BLOG_CONFIG.categories.map((category) => ({
        ...category,
        count: categoryCounts[category.slug] || 0,
      }));
    } catch (error) {
      console.error('Error getting blog categories:', error);
      return BLOG_CONFIG.categories;
    }
  },
  ['blog-categories'],
  { revalidate: 3600, tags: ['blog'] }
);
