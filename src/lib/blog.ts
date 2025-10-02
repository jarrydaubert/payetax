// src/lib/blog.ts
/**
 * Blog library for managing local MDX blog posts
 * Replaces Strapi API integration with file-based blog system
 * FIXED: js-yaml v4 compatibility
 * OPTIMIZED: Added Next.js caching for better build performance
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { unstable_cache } from 'next/cache';
import {
  BLOG_CONFIG,
  BLOG_CONTENT_DIR,
  DEFAULT_BLOG_METADATA,
  getCategoryBySlug,
} from '@/config/blog.config';
import type {
  BlogCategory,
  BlogPaginationOptions,
  BlogPost,
  BlogPostFrontmatter,
  BlogSortOption,
  PaginatedBlogResponse,
  RelatedPost,
} from '@/types/blog';

// Re-export the BlogError class from types
export { BlogError } from '@/types/blog';

/**
 * Get the absolute path to the blog content directory
 */
function getBlogContentPath(): string {
  return path.join(process.cwd(), BLOG_CONTENT_DIR);
}

/**
 * Check if the blog content directory exists, create it if it doesn't
 */
async function ensureBlogContentDir(): Promise<void> {
  const contentPath = getBlogContentPath();
  try {
    await fs.promises.access(contentPath);
  } catch {
    await fs.promises.mkdir(contentPath, { recursive: true });
  }
}

/**
 * Get all MDX files from the blog content directory (cached)
 * Cache revalidates every hour to reduce filesystem I/O
 */
const getAllMDXFiles = unstable_cache(
  async (): Promise<string[]> => {
    try {
      await ensureBlogContentDir();
      const files = await fs.promises.readdir(getBlogContentPath());
      return files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));
    } catch (_error) {
      console.warn('No blog content directory found, returning empty array');
      return [];
    }
  },
  ['blog-mdx-files'],
  { revalidate: 3600, tags: ['blog'] }
);

/**
 * Read and parse a single MDX file with improved error handling
 */
async function readMDXFile(filename: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(getBlogContentPath(), filename);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // Parse frontmatter and content with js-yaml v4 compatibility
    const { data, content } = matter(fileContent, {
      // Configure gray-matter to use js-yaml v4 safely
      engines: {
        yaml: {
          parse: (str: string) => {
            try {
              // Use yaml.load instead of yaml.safeLoad for js-yaml v4
              const yaml = require('js-yaml');
              return yaml.load(str);
            } catch (error) {
              console.error(`YAML parse error in ${filename}:`, error);
              return {};
            }
          },
        },
      },
    });

    // Validate frontmatter - must have required fields
    if (!data || typeof data !== 'object') {
      console.warn(`Invalid frontmatter in ${filename}: not an object`);
      return null;
    }

    const frontmatter = data as Partial<BlogPostFrontmatter>;

    // Check for required fields
    if (
      !frontmatter.title ||
      !frontmatter.slug ||
      !frontmatter.excerpt ||
      !frontmatter.publishedAt ||
      !frontmatter.category
    ) {
      console.warn(`Invalid frontmatter in ${filename}: missing required fields`, {
        title: !!frontmatter.title,
        slug: !!frontmatter.slug,
        excerpt: !!frontmatter.excerpt,
        publishedAt: !!frontmatter.publishedAt,
        category: !!frontmatter.category,
      });
      return null;
    }

    // Generate ID from filename
    const id = filename.replace(/\.mdx?$/, '');

    // Get category data
    const categoryData = getCategoryBySlug(frontmatter.category);

    // Apply defaults for optional fields
    const post: BlogPost = {
      id,
      title: frontmatter.title,
      slug: frontmatter.slug,
      excerpt: frontmatter.excerpt,
      publishedAt: frontmatter.publishedAt,
      category: frontmatter.category,
      content,
      categoryData,

      // Optional fields with defaults
      updatedAt: frontmatter.updatedAt || frontmatter.publishedAt,
      featured: frontmatter.featured || false,
      author: frontmatter.author || DEFAULT_BLOG_METADATA.author,
      readTime: frontmatter.readTime || DEFAULT_BLOG_METADATA.readTime,
      tags: frontmatter.tags || [],
      image: frontmatter.image || DEFAULT_BLOG_METADATA.image,
      imageAlt: frontmatter.imageAlt || DEFAULT_BLOG_METADATA.imageAlt,

      // SEO fields
      seoTitle: frontmatter.seoTitle || frontmatter.title,
      seoDescription: frontmatter.seoDescription || frontmatter.excerpt,
      seoKeywords: frontmatter.seoKeywords || [],
    };

    return post;
  } catch (error) {
    console.error(`Error reading MDX file ${filename}:`, error);
    return null;
  }
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
    const files = await getAllMDXFiles();
    const posts = await Promise.all(files.map((file) => readMDXFile(file)));
    const validPosts = posts.filter((post): post is BlogPost => post !== null);

    // Apply filters
    const filteredPosts = filterPosts(validPosts, options);

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
      const files = await getAllMDXFiles();
      const posts = await Promise.all(files.map((file) => readMDXFile(file)));
      const validPosts = posts.filter((post): post is BlogPost => post !== null);

      if (category) {
        return validPosts.filter((post) => post.category === category).length;
      }

      return validPosts.length;
    } catch {
      return 0;
    }
  },
  ['blog-posts-count'],
  { revalidate: 3600, tags: ['blog'] }
);

/**
 * Get paginated blog response with metadata
 */
export async function getPaginatedBlogPosts(
  options: BlogPaginationOptions = {}
): Promise<PaginatedBlogResponse> {
  const { page = 1, pageSize = BLOG_CONFIG.postsPerPage } = options;

  const posts = await getBlogPosts(options);
  const total = await getBlogPostsCount(options.category);

  return {
    posts,
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get a blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const files = await getAllMDXFiles();

    // Try to find file by slug
    for (const file of files) {
      const post = await readMDXFile(file);
      if (post && post.slug === slug) {
        return post;
      }
    }

    return null;
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
 * Get related posts for a given post
 */
export async function getRelatedPosts(
  postId: string,
  categorySlug?: string,
  count: number = BLOG_CONFIG.relatedPostsCount
): Promise<RelatedPost[]> {
  try {
    const allPosts = await getBlogPosts();

    // Filter out the current post
    const otherPosts = allPosts.filter((post) => post.id !== postId);

    // Prefer posts from the same category
    let relatedPosts = categorySlug
      ? otherPosts.filter((post) => post.category === categorySlug)
      : otherPosts;

    // If not enough posts in the same category, add posts from other categories
    if (relatedPosts.length < count) {
      const remainingPosts = otherPosts.filter((post) => post.category !== categorySlug);
      relatedPosts = [...relatedPosts, ...remainingPosts];
    }

    // Take only the required count and map to RelatedPost format
    return relatedPosts.slice(0, count).map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      category: post.category,
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
      const allPosts = await getBlogPosts();

      // Count posts per category
      const categoryCounts = allPosts.reduce(
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
