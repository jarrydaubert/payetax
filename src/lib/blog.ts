// src/lib/blog.ts
/**
 * Blog library for managing local MDX blog posts
 * Replaces Strapi API integration with file-based blog system
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
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
 * Get all MDX files from the blog content directory
 */
async function getAllMDXFiles(): Promise<string[]> {
  try {
    await ensureBlogContentDir();
    const files = await fs.promises.readdir(getBlogContentPath());
    return files.filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));
  } catch (error) {
    console.warn('No blog content directory found, returning empty array');
    return [];
  }
}

/**
 * Read and parse a single MDX file
 */
async function readMDXFile(filename: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(getBlogContentPath(), filename);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);

    // Validate frontmatter
    const frontmatter = data as BlogPostFrontmatter;

    // Basic validation
    if (!frontmatter.title || !frontmatter.slug || !frontmatter.excerpt || !frontmatter.publishedAt || !frontmatter.category) {
      console.warn(`Invalid frontmatter in ${filename}:`, frontmatter);
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
 * Sort posts by various criteria
 */
function sortPosts(posts: BlogPost[], sortBy: BlogSortOption = 'date-desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'date-desc':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });
}

/**
 * Filter posts based on options
 */
function filterPosts(posts: BlogPost[], options: BlogPaginationOptions = {}): BlogPost[] {
  let filtered = [...posts];

  // Filter by category
  if (options.category) {
    filtered = filtered.filter((post) => post.category === options.category);
  }

  // Filter by tag
  if (options.tag) {
    filtered = filtered.filter((post) => post.tags?.includes(options.tag as string));
  }

  // Filter by featured
  if (options.featured) {
    filtered = filtered.filter((post) => post.featured);
  }

  // Filter by search query
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter((post) =>
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
 * Get total count of posts (with optional category filter)
 */
export async function getBlogPostsCount(category?: string): Promise<number> {
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
}

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
  categorySlug?: string
): Promise<RelatedPost[]> {
  try {
    const posts = await getBlogPosts({
      category: categorySlug,
      pageSize: 50, // Get more posts to filter from
    });

    // Filter out the current post and limit results
    const relatedPosts = posts
      .filter((post) => post.id !== postId)
      .slice(0, BLOG_CONFIG.relatedPostsCount)
      .map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        readTime: post.readTime,
        category: post.category,
      }));

    return relatedPosts;
  } catch (error) {
    console.error('Error getting related posts:', error);
    return [];
  }
}

/**
 * Get all blog categories with post counts
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const files = await getAllMDXFiles();
    const posts = await Promise.all(files.map((file) => readMDXFile(file)));
    const validPosts = posts.filter((post): post is BlogPost => post !== null);

    // Count posts per category
    const categoryCounts: Record<string, number> = {};
    for (const post of validPosts) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    }

    // Return categories with counts
    return BLOG_CONFIG.categories.map((category) => ({
      ...category,
      count: categoryCounts[category.slug] || 0,
    }));
  } catch (error) {
    console.error('Error getting blog categories:', error);
    return BLOG_CONFIG.categories.map((category) => ({
      ...category,
      count: 0,
    }));
  }
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  return getBlogPosts({
    searchQuery: query.trim(),
    pageSize: 20,
  });
}

/**
 * Get recent posts for RSS or sitemap
 */
export async function getRecentPosts(limit = 10): Promise<BlogPost[]> {
  return getBlogPosts({
    pageSize: limit,
  });
}

/**
 * Validate blog post data
 */
export function validateBlogPost(post: unknown): post is BlogPostFrontmatter {
  return (
    typeof post === 'object' &&
    post !== null &&
    'title' in post &&
    'slug' in post &&
    'excerpt' in post &&
    'publishedAt' in post &&
    'category' in post &&
    typeof (post as BlogPostFrontmatter).title === 'string' &&
    typeof (post as BlogPostFrontmatter).slug === 'string' &&
    typeof (post as BlogPostFrontmatter).excerpt === 'string' &&
    typeof (post as BlogPostFrontmatter).publishedAt === 'string' &&
    typeof (post as BlogPostFrontmatter).category === 'string'
  );
}
