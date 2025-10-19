/**
 * @jest-environment node
 */
// src/app/__tests__/sitemap.test.ts

// Mock contentlayer before any imports
jest.mock('contentlayer/generated', () => ({
  allPosts: [],
  allDocuments: [],
  isType: jest.fn(),
}));

jest.mock('@/lib/blog');

import * as blogLib from '@/lib/blog';
import sitemap from '../sitemap';

describe('Sitemap Generation', () => {
  const mockGetBlogPosts = blogLib.getBlogPosts as jest.MockedFunction<typeof blogLib.getBlogPosts>;
  const mockGetBlogCategories = blogLib.getBlogCategories as jest.MockedFunction<
    typeof blogLib.getBlogCategories
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Static Pages', () => {
    it('should include homepage with highest priority', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const homepage = result.find((entry) => entry.url === 'https://payetax.co.uk/');
      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBe(1.0);
      expect(homepage?.changeFrequency).toBe('weekly');
    });

    it('should include blog index page', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const blogPage = result.find((entry) => entry.url === 'https://payetax.co.uk/blog');
      expect(blogPage).toBeDefined();
      expect(blogPage?.priority).toBe(0.95);
      expect(blogPage?.changeFrequency).toBe('daily');
    });

    it('should include about page', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const aboutPage = result.find((entry) => entry.url === 'https://payetax.co.uk/about');
      expect(aboutPage).toBeDefined();
      expect(aboutPage?.priority).toBe(0.7);
      expect(aboutPage?.changeFrequency).toBe('monthly');
    });

    it('should include privacy page', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const privacyPage = result.find((entry) => entry.url === 'https://payetax.co.uk/privacy');
      expect(privacyPage).toBeDefined();
      expect(privacyPage?.priority).toBe(0.4);
      expect(privacyPage?.changeFrequency).toBe('yearly');
    });

    it('should include compliance page', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const compliancePage = result.find(
        (entry) => entry.url === 'https://payetax.co.uk/compliance'
      );
      expect(compliancePage).toBeDefined();
      expect(compliancePage?.priority).toBe(0.6);
      expect(compliancePage?.changeFrequency).toBe('monthly');
    });

    it('should include all 5 static pages', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const staticPages = result.filter(
        (entry) => !entry.url.includes('/blog/') && !entry.url.includes('/category/')
      );

      expect(staticPages.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Blog Posts', () => {
    it('should include blog posts from getBlogPosts', async () => {
      mockGetBlogPosts.mockResolvedValue([
        {
          slug: 'test-post',
          title: 'Test Post',
          publishedAt: '2025-10-01',
          updatedAt: '2025-10-05',
          featured: false,
        } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const blogPost = result.find((entry) => entry.url === 'https://payetax.co.uk/blog/test-post');
      expect(blogPost).toBeDefined();
      expect(blogPost?.lastModified).toBe('2025-10-05');
      expect(blogPost?.changeFrequency).toBe('monthly');
    });

    it('should prioritize featured posts higher', async () => {
      mockGetBlogPosts.mockResolvedValue([
        {
          slug: 'featured-post',
          title: 'Featured Post',
          publishedAt: '2025-10-01',
          updatedAt: '2025-10-05',
          featured: true,
        } as any,
        {
          slug: 'regular-post',
          title: 'Regular Post',
          publishedAt: '2025-10-01',
          updatedAt: '2025-10-05',
          featured: false,
        } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const featuredPost = result.find(
        (entry) => entry.url === 'https://payetax.co.uk/blog/featured-post'
      );
      const regularPost = result.find(
        (entry) => entry.url === 'https://payetax.co.uk/blog/regular-post'
      );

      expect(featuredPost?.priority).toBe(0.9);
      expect(regularPost?.priority).toBe(0.8);
    });

    it('should use updatedAt for lastModified if available', async () => {
      mockGetBlogPosts.mockResolvedValue([
        {
          slug: 'updated-post',
          title: 'Updated Post',
          publishedAt: '2025-10-01',
          updatedAt: '2025-10-10',
          featured: false,
        } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const post = result.find((entry) => entry.url === 'https://payetax.co.uk/blog/updated-post');
      expect(post?.lastModified).toBe('2025-10-10');
    });

    it('should fall back to publishedAt if updatedAt missing', async () => {
      mockGetBlogPosts.mockResolvedValue([
        {
          slug: 'new-post',
          title: 'New Post',
          publishedAt: '2025-10-01',
          updatedAt: null,
          featured: false,
        } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const post = result.find((entry) => entry.url === 'https://payetax.co.uk/blog/new-post');
      expect(post?.lastModified).toBe('2025-10-01');
    });

    it('should handle multiple blog posts', async () => {
      mockGetBlogPosts.mockResolvedValue([
        {
          slug: 'post-1',
          title: 'Post 1',
          publishedAt: '2025-10-01',
          featured: false,
        } as any,
        {
          slug: 'post-2',
          title: 'Post 2',
          publishedAt: '2025-10-02',
          featured: true,
        } as any,
        {
          slug: 'post-3',
          title: 'Post 3',
          publishedAt: '2025-10-03',
          featured: false,
        } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const blogPosts = result.filter(
        (entry) => entry.url.includes('/blog/') && !entry.url.includes('/category/')
      );
      expect(blogPosts.length).toBe(3);
    });
  });

  describe('Blog Categories', () => {
    it('should include category pages from getBlogCategories', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([
        {
          slug: 'tax-tips',
          name: 'Tax Tips',
        } as any,
      ]);

      const result = await sitemap();

      const categoryPage = result.find(
        (entry) => entry.url === 'https://payetax.co.uk/blog/category/tax-tips'
      );
      expect(categoryPage).toBeDefined();
      expect(categoryPage?.priority).toBe(0.7);
      expect(categoryPage?.changeFrequency).toBe('weekly');
    });

    it('should handle multiple categories', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([
        { slug: 'tax-basics', name: 'Tax Basics' } as any,
        { slug: 'tax-tips', name: 'Tax Tips' } as any,
        { slug: 'tax-changes', name: 'Tax Changes' } as any,
      ]);

      const result = await sitemap();

      const categories = result.filter((entry) => entry.url.includes('/category/'));
      expect(categories.length).toBe(3);
    });

    it('should use current date for category lastModified', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([{ slug: 'tax-tips', name: 'Tax Tips' } as any]);

      const beforeDate = new Date();
      const result = await sitemap();
      const afterDate = new Date();

      const categoryPage = result.find((entry) => entry.url.includes('/category/tax-tips'));
      const lastModified = new Date(categoryPage?.lastModified);

      expect(lastModified.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(lastModified.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('Error Handling', () => {
    it('should handle getBlogPosts error with fallback', async () => {
      mockGetBlogPosts.mockRejectedValue(new Error('Database error'));
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      // Should still have static pages and fallback blog posts
      expect(result.length).toBeGreaterThan(5);

      const fallbackPosts = result.filter((entry) => entry.url.includes('/blog/'));
      expect(fallbackPosts.length).toBeGreaterThan(0);
    });

    it('should handle getBlogCategories error with fallback', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockRejectedValue(new Error('Database error'));

      const result = await sitemap();

      // Should still have static pages and fallback categories
      expect(result.length).toBeGreaterThan(5);

      const fallbackCategories = result.filter((entry) => entry.url.includes('/category/'));
      expect(fallbackCategories.length).toBeGreaterThan(0);
    });

    it('should handle both blog functions failing', async () => {
      mockGetBlogPosts.mockRejectedValue(new Error('Database error'));
      mockGetBlogCategories.mockRejectedValue(new Error('Database error'));

      const result = await sitemap();

      // Should have static pages + fallback blog posts + fallback categories
      expect(result.length).toBeGreaterThan(7);
    });

    it('should handle empty blog posts', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      // Should have fallback blog posts and categories
      const blogPosts = result.filter(
        (entry) => entry.url.includes('/blog/') && !entry.url.includes('/category/')
      );
      const categories = result.filter((entry) => entry.url.includes('/category/'));

      expect(blogPosts.length).toBe(2); // Fallback posts
      expect(categories.length).toBe(2); // Fallback categories
    });
  });

  describe('URL Structure', () => {
    it('should use correct base URL', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.url).toMatch(/^https:\/\/payetax\.co\.uk/);
      });
    });

    it('should not have duplicate URLs', async () => {
      mockGetBlogPosts.mockResolvedValue([
        { slug: 'test-post', title: 'Test', publishedAt: '2025-10-01', featured: false } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([{ slug: 'tax-tips', name: 'Tax Tips' } as any]);

      const result = await sitemap();

      const urls = result.map((entry) => entry.url);
      const uniqueUrls = new Set(urls);

      expect(urls.length).toBe(uniqueUrls.size);
    });

    it('should properly format blog post URLs', async () => {
      mockGetBlogPosts.mockResolvedValue([
        { slug: 'my-test-post', title: 'Test', publishedAt: '2025-10-01', featured: false } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const post = result.find((entry) => entry.url.includes('my-test-post'));
      expect(post?.url).toBe('https://payetax.co.uk/blog/my-test-post');
    });

    it('should properly format category URLs', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([
        { slug: 'tax-planning', name: 'Tax Planning' } as any,
      ]);

      const result = await sitemap();

      const category = result.find((entry) => entry.url.includes('tax-planning'));
      expect(category?.url).toBe('https://payetax.co.uk/blog/category/tax-planning');
    });
  });

  describe('Metadata', () => {
    it('should set appropriate change frequencies', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const validFrequencies = [
        'always',
        'hourly',
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'never',
      ];

      result.forEach((entry) => {
        expect(validFrequencies).toContain(entry.changeFrequency);
      });
    });

    it('should set priorities between 0 and 1', async () => {
      mockGetBlogPosts.mockResolvedValue([
        { slug: 'test', title: 'Test', publishedAt: '2025-10-01', featured: true } as any,
      ]);
      mockGetBlogCategories.mockResolvedValue([{ slug: 'test', name: 'Test' } as any]);

      const result = await sitemap();

      result.forEach((entry) => {
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
      });
    });

    it('should set lastModified in ISO format', async () => {
      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      result.forEach((entry) => {
        expect(() => new Date(entry.lastModified)).not.toThrow();
        expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });

  describe('Large Datasets', () => {
    it('should handle 1000 blog posts', async () => {
      const posts = Array.from({ length: 1000 }, (_, i) => ({
        slug: `post-${i}`,
        title: `Post ${i}`,
        publishedAt: '2025-10-01',
        featured: i % 10 === 0,
      })) as any[];

      mockGetBlogPosts.mockResolvedValue(posts);
      mockGetBlogCategories.mockResolvedValue([]);

      const result = await sitemap();

      const blogPosts = result.filter(
        (entry) => entry.url.includes('/blog/') && !entry.url.includes('/category/')
      );
      expect(blogPosts.length).toBe(1000);
    });

    it('should handle many categories', async () => {
      const categories = Array.from({ length: 50 }, (_, i) => ({
        slug: `category-${i}`,
        name: `Category ${i}`,
      })) as any[];

      mockGetBlogPosts.mockResolvedValue([]);
      mockGetBlogCategories.mockResolvedValue(categories);

      const result = await sitemap();

      const categoryPages = result.filter((entry) => entry.url.includes('/category/'));
      expect(categoryPages.length).toBe(50);
    });
  });
});
