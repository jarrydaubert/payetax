/**
 * Blog Library Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for blog post management functions:
 * - sortPosts
 * - filterPosts
 * - paginatePosts
 * - getBlogPosts
 * - getBlogPostBySlug
 * - getBlogCategories
 * - getFeaturedPosts
 * - getRelatedPosts
 */

import type { BlogPost } from '@/types/blog';

// Mock next/cache
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
}));

// Mock mdx module
jest.mock('@/lib/mdx', () => ({
  getAllPosts: jest.fn(),
  getPostBySlug: jest.fn(),
}));

// Mock blog config
jest.mock('@/config/blog.config', () => ({
  BLOG_CATEGORIES: [
    { slug: 'tax-basics', name: 'Tax Basics', description: 'Tax fundamentals' },
    { slug: 'income-tax', name: 'Income Tax', description: 'Income tax info' },
    { slug: 'national-insurance', name: 'National Insurance', description: 'NI info' },
  ],
  BLOG_CONFIG: {
    postsPerPage: 10,
    featuredPostsCount: 3,
    relatedPostsCount: 3,
  },
  getCategoryBySlug: jest.fn((slug: string) => ({
    slug,
    name: slug.replace(/-/g, ' '),
    description: `Description for ${slug}`,
  })),
}));

import { getAllPosts, getPostBySlug } from '@/lib/mdx';
import {
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostsCount,
  getFeaturedPost,
  getFeaturedPosts,
  getRelatedPosts,
} from '../blog';

const mockGetAllPosts = getAllPosts as jest.Mock;
const mockGetPostBySlug = getPostBySlug as jest.Mock;

// Sample mock post data
const createMockPost = (overrides: Partial<ReturnType<typeof getAllPosts>[0]> = {}) => ({
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'Test excerpt',
  publishedAt: '2025-01-15',
  category: 'tax-basics',
  readingTime: 5,
  wordCount: 1000,
  featured: false,
  author: 'Test Author',
  tags: ['tax', 'uk'],
  seoKeywords: ['tax', 'uk'],
  ...overrides,
});

const mockPosts = [
  createMockPost({
    slug: 'post-1',
    title: 'Alpha Post',
    publishedAt: '2025-01-10',
    category: 'tax-basics',
    featured: true,
  }),
  createMockPost({
    slug: 'post-2',
    title: 'Beta Post',
    publishedAt: '2025-01-15',
    category: 'income-tax',
  }),
  createMockPost({
    slug: 'post-3',
    title: 'Gamma Post',
    publishedAt: '2025-01-05',
    category: 'tax-basics',
    tags: ['tax', 'basics'],
  }),
];

describe('blog.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllPosts.mockReturnValue(mockPosts);
  });

  describe('getBlogPosts', () => {
    it('should return all posts with default options', async () => {
      const posts = await getBlogPosts();
      expect(posts).toHaveLength(3);
    });

    it('should sort posts by date descending by default', async () => {
      const posts = await getBlogPosts();
      // Most recent first
      expect(posts[0].slug).toBe('post-2'); // Jan 15
      expect(posts[1].slug).toBe('post-1'); // Jan 10
      expect(posts[2].slug).toBe('post-3'); // Jan 5
    });

    it('should sort posts by date ascending', async () => {
      const posts = await getBlogPosts({ sortBy: 'date-asc' });
      expect(posts[0].slug).toBe('post-3');
      expect(posts[2].slug).toBe('post-2');
    });

    it('should sort posts by title ascending', async () => {
      const posts = await getBlogPosts({ sortBy: 'title-asc' });
      expect(posts[0].title).toBe('Alpha Post');
      expect(posts[1].title).toBe('Beta Post');
      expect(posts[2].title).toBe('Gamma Post');
    });

    it('should sort posts by title descending', async () => {
      const posts = await getBlogPosts({ sortBy: 'title-desc' });
      expect(posts[0].title).toBe('Gamma Post');
      expect(posts[2].title).toBe('Alpha Post');
    });

    it('should filter by category', async () => {
      const posts = await getBlogPosts({ category: 'tax-basics' });
      expect(posts).toHaveLength(2);
      for (const post of posts) {
        expect(post.category).toBe('tax-basics');
      }
    });

    it('should filter by tag', async () => {
      const posts = await getBlogPosts({ tag: 'basics' });
      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe('post-3');
    });

    it('should filter by featured status', async () => {
      const posts = await getBlogPosts({ featured: true });
      expect(posts).toHaveLength(1);
      expect(posts[0].featured).toBe(true);
    });

    it('should filter by search query in title', async () => {
      const posts = await getBlogPosts({ searchQuery: 'alpha' });
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Alpha Post');
    });

    it('should paginate results', async () => {
      const result = await getBlogPosts({ page: 1, pageSize: 2, paginated: true });
      expect(result.posts).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pageCount).toBe(2);
    });

    it('should return second page', async () => {
      const result = await getBlogPosts({ page: 2, pageSize: 2, paginated: true });
      expect(result.posts).toHaveLength(1);
      expect(result.pagination.page).toBe(2);
    });
  });

  describe('getBlogPostBySlug', () => {
    it('should return post when found', async () => {
      const mockPost = createMockPost({
        slug: 'test-slug',
        content: 'Full post content',
      });
      mockGetPostBySlug.mockReturnValue(mockPost);

      const post = await getBlogPostBySlug('test-slug');
      expect(post).not.toBeNull();
      expect(post?.slug).toBe('test-slug');
    });

    it('should return null when post not found', async () => {
      mockGetPostBySlug.mockReturnValue(null);

      const post = await getBlogPostBySlug('non-existent');
      expect(post).toBeNull();
    });
  });

  describe('getBlogCategories', () => {
    it('should return all categories with post counts', async () => {
      const categories = await getBlogCategories();
      expect(categories).toHaveLength(3);
    });

    it('should include count for each category', async () => {
      const categories = await getBlogCategories();
      const taxBasics = categories.find((c) => c.slug === 'tax-basics');
      expect(taxBasics?.count).toBe(2);
    });

    it('should return 0 count for categories with no posts', async () => {
      const categories = await getBlogCategories();
      const nationalInsurance = categories.find((c) => c.slug === 'national-insurance');
      expect(nationalInsurance?.count).toBe(0);
    });
  });

  describe('getBlogPostsCount', () => {
    it('should return total post count', async () => {
      const count = await getBlogPostsCount();
      expect(count).toBe(3);
    });

    it('should return count for specific category', async () => {
      const count = await getBlogPostsCount('tax-basics');
      expect(count).toBe(2);
    });
  });

  describe('getFeaturedPosts', () => {
    it('should return featured posts', async () => {
      const posts = await getFeaturedPosts();
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should return recent posts if no featured posts exist', async () => {
      mockGetAllPosts.mockReturnValue([
        createMockPost({ featured: false }),
        createMockPost({ slug: 'post-2', featured: false }),
      ]);

      const posts = await getFeaturedPosts();
      expect(posts.length).toBeGreaterThan(0);
    });
  });

  describe('getFeaturedPost', () => {
    it('should return first featured post', async () => {
      const post = await getFeaturedPost();
      expect(post).not.toBeNull();
    });

    it('should return null when no posts exist', async () => {
      mockGetAllPosts.mockReturnValue([]);
      const post = await getFeaturedPost();
      expect(post).toBeNull();
    });
  });

  describe('getRelatedPosts', () => {
    it('should return related posts by category', async () => {
      const currentPost: BlogPost = {
        id: 'current',
        slug: 'current-post',
        title: 'Current Post',
        excerpt: 'Excerpt',
        publishedAt: '2025-01-01',
        category: 'tax-basics',
        content: '',
        published: true,
        tags: ['tax'],
      };

      const related = await getRelatedPosts(currentPost);
      expect(related.length).toBeGreaterThan(0);
      // Should not include current post
      for (const post of related) {
        expect(post.slug).not.toBe('current-post');
      }
    });

    it('should prioritize posts in same category', async () => {
      const currentPost: BlogPost = {
        id: 'current',
        slug: 'current-post',
        title: 'Current Post',
        excerpt: 'Excerpt',
        publishedAt: '2025-01-01',
        category: 'tax-basics',
        content: '',
        published: true,
        tags: [],
      };

      const related = await getRelatedPosts(currentPost);
      // Related posts should be from same category when available
      expect(related[0].category).toBe('tax-basics');
    });

    it('should limit results', async () => {
      const currentPost: BlogPost = {
        id: 'current',
        slug: 'current-post',
        title: 'Current Post',
        excerpt: 'Excerpt',
        publishedAt: '2025-01-01',
        category: 'tax-basics',
        content: '',
        published: true,
        tags: [],
      };

      const related = await getRelatedPosts(currentPost, 1);
      expect(related).toHaveLength(1);
    });
  });
});
