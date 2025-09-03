// src/lib/__tests__/blog.test.ts

import fs from 'node:fs';
import path from 'node:path';
import type { BlogPost } from '@/types/blog';
import {
  BlogError,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostsCount,
  getFeaturedPost,
  getFeaturedPosts,
  getPaginatedBlogPosts,
  getRelatedPosts,
} from '../blog';

// Mock fs.promises
jest.mock('node:fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
    readFile: jest.fn(),
  },
}));

// Mock gray-matter
jest.mock('gray-matter', () => {
  return jest.fn();
});

// Mock js-yaml
jest.mock('js-yaml', () => ({
  load: jest.fn(),
}));

// Mock blog config
jest.mock('@/config/blog.config', () => ({
  BLOG_CONFIG: {
    postsPerPage: 5,
    relatedPostsLimit: 3,
  },
  BLOG_CONTENT_DIR: 'content/blog',
  DEFAULT_BLOG_METADATA: {
    author: 'Default Author',
    readTime: 5,
    image: '/default-image.jpg',
    imageAlt: 'Default image',
  },
  getCategoryBySlug: jest.fn(),
}));

const mockFs = fs.promises as jest.Mocked<typeof fs.promises>;
const mockMatter = require('gray-matter') as jest.MockedFunction<any>;
const mockYaml = require('js-yaml') as jest.Mocked<any>;
const mockGetCategoryBySlug = require('@/config/blog.config')
  .getCategoryBySlug as jest.MockedFunction<any>;

describe('Blog Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const sampleBlogPost: BlogPost = {
    id: 'test-post',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'This is a test post excerpt',
    publishedAt: '2024-01-01',
    updatedAt: '2024-01-01',
    category: 'tax-tips',
    content: 'This is the content of the test post.',
    featured: false,
    author: 'Test Author',
    readTime: 3,
    tags: ['test', 'blog'],
    image: '/test-image.jpg',
    imageAlt: 'Test image',
    seoTitle: 'Test Post',
    seoDescription: 'This is a test post excerpt',
    seoKeywords: [],
    categoryData: {
      name: 'Tax Tips',
      slug: 'tax-tips',
      description: 'Tax advice and tips',
      color: '#blue',
    },
  };

  describe('Blog directory management', () => {
    test('should handle missing blog directory gracefully', async () => {
      mockFs.access.mockRejectedValue(new Error('Directory not found'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(mockFs.mkdir).toHaveBeenCalledWith(expect.stringContaining('content/blog'), {
        recursive: true,
      });
    });

    test('should handle readdir errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockRejectedValue(new Error('Read error'));

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'No blog content directory found, returning empty array'
      );
    });
  });

  describe('File parsing and validation', () => {
    test('should parse valid MDX file correctly', async () => {
      const frontmatter = {
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        publishedAt: '2024-01-01',
        category: 'tax-tips',
        featured: true,
        author: 'Test Author',
        tags: ['test'],
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['test-post.mdx']);
      mockFs.readFile.mockResolvedValue('frontmatter + content');
      mockMatter.mockReturnValue({
        data: frontmatter,
        content: 'Post content',
      });
      mockYaml.load.mockReturnValue(frontmatter);
      mockGetCategoryBySlug.mockReturnValue({
        name: 'Tax Tips',
        slug: 'tax-tips',
        description: 'Tax advice',
        color: '#blue',
      });

      const posts = await getBlogPosts();

      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject({
        id: 'test-post',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        publishedAt: '2024-01-01',
        category: 'tax-tips',
        featured: true,
        author: 'Test Author',
        content: 'Post content',
      });
    });

    test('should handle invalid frontmatter gracefully', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['invalid-post.mdx']);
      mockFs.readFile.mockResolvedValue('invalid content');
      mockMatter.mockReturnValue({
        data: null, // Invalid frontmatter
        content: 'Content',
      });

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid frontmatter in invalid-post.mdx')
      );
    });

    test('should handle missing required fields', async () => {
      const incompleteFrontmatter = {
        title: 'Test Post',
        // Missing required fields: slug, excerpt, publishedAt, category
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['incomplete-post.mdx']);
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: incompleteFrontmatter,
        content: 'Content',
      });

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Invalid frontmatter in incomplete-post.mdx: missing required fields'
        ),
        expect.objectContaining({
          title: true,
          slug: false,
          excerpt: false,
          publishedAt: false,
          category: false,
        })
      );
    });

    test('should handle YAML parsing errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['yaml-error.mdx']);
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: {},
        content: 'Content',
      });
      mockYaml.load.mockImplementation(() => {
        throw new Error('YAML parse error');
      });

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('YAML parse error in yaml-error.mdx:'),
        expect.any(Error)
      );
    });

    test('should apply default values for optional fields', async () => {
      const minimalFrontmatter = {
        title: 'Minimal Post',
        slug: 'minimal-post',
        excerpt: 'Minimal excerpt',
        publishedAt: '2024-01-01',
        category: 'tax-tips',
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['minimal-post.mdx']);
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: minimalFrontmatter,
        content: 'Content',
      });
      mockYaml.load.mockReturnValue(minimalFrontmatter);
      mockGetCategoryBySlug.mockReturnValue({ name: 'Tax Tips', slug: 'tax-tips' });

      const posts = await getBlogPosts();

      expect(posts[0]).toMatchObject({
        updatedAt: '2024-01-01', // Should default to publishedAt
        featured: false,
        author: 'Default Author',
        readTime: 5,
        tags: [],
        image: '/default-image.jpg',
        imageAlt: 'Default image',
        seoTitle: 'Minimal Post', // Should default to title
        seoDescription: 'Minimal excerpt', // Should default to excerpt
        seoKeywords: [],
      });
    });
  });

  describe('File type filtering', () => {
    test('should filter MDX and MD files only', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        'post1.mdx',
        'post2.md',
        'image.jpg',
        'data.json',
        'post3.mdx',
        'readme.txt',
      ]);

      // Mock successful parsing for valid files
      const validFrontmatter = {
        title: 'Test',
        slug: 'test',
        excerpt: 'Test',
        publishedAt: '2024-01-01',
        category: 'test',
      };

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: validFrontmatter,
        content: 'Content',
      });
      mockYaml.load.mockReturnValue(validFrontmatter);
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const posts = await getBlogPosts();

      expect(posts).toHaveLength(3); // Only .mdx and .md files
      expect(mockFs.readFile).toHaveBeenCalledTimes(3); // Called only for valid files
    });
  });

  describe('getBlogPosts', () => {
    test('should return posts sorted by default criteria', async () => {
      const posts = [
        { ...sampleBlogPost, id: 'post1', publishedAt: '2024-01-01' },
        { ...sampleBlogPost, id: 'post2', publishedAt: '2024-01-03' },
        { ...sampleBlogPost, id: 'post3', publishedAt: '2024-01-02' },
      ];

      // Mock the internal functions to return our test posts
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'post3.mdx']);

      let callCount = 0;
      mockFs.readFile.mockImplementation(() => Promise.resolve('content'));
      mockMatter.mockImplementation(() => {
        const postData = posts[callCount++];
        return {
          data: {
            title: postData.title,
            slug: postData.slug,
            excerpt: postData.excerpt,
            publishedAt: postData.publishedAt,
            category: postData.category,
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockImplementation((str) => JSON.parse(str || '{}'));
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const result = await getBlogPosts({ sortBy: 'date', sortOrder: 'desc' });

      expect(result).toHaveLength(3);
      // Should be sorted by date descending
      expect(result[0].publishedAt >= result[1].publishedAt).toBe(true);
      expect(result[1].publishedAt >= result[2].publishedAt).toBe(true);
    });

    test('should filter by category when specified', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx']);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        const categories = ['tax-tips', 'finance'];
        return {
          data: {
            title: 'Test',
            slug: 'test',
            excerpt: 'Test',
            publishedAt: '2024-01-01',
            category: categories[callCount++],
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const result = await getBlogPosts({ category: 'tax-tips' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('tax-tips');
    });

    test('should limit results when specified', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'post3.mdx', 'post4.mdx']);

      const validFrontmatter = {
        title: 'Test',
        slug: 'test',
        excerpt: 'Test',
        publishedAt: '2024-01-01',
        category: 'test',
      };

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: validFrontmatter,
        content: 'Content',
      });
      mockYaml.load.mockReturnValue(validFrontmatter);
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const result = await getBlogPosts({ limit: 2 });

      expect(result).toHaveLength(2);
    });
  });

  describe('getBlogPostsCount', () => {
    test('should return total count of posts', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'post3.mdx']);

      const validFrontmatter = {
        title: 'Test',
        slug: 'test',
        excerpt: 'Test',
        publishedAt: '2024-01-01',
        category: 'test',
      };

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: validFrontmatter,
        content: 'Content',
      });
      mockYaml.load.mockReturnValue(validFrontmatter);
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const count = await getBlogPostsCount();

      expect(count).toBe(3);
    });

    test('should return count for specific category', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'post3.mdx']);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        const categories = ['tax-tips', 'finance', 'tax-tips'];
        return {
          data: {
            title: 'Test',
            slug: 'test',
            excerpt: 'Test',
            publishedAt: '2024-01-01',
            category: categories[callCount++],
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const count = await getBlogPostsCount('tax-tips');

      expect(count).toBe(2);
    });
  });

  describe('getBlogPostBySlug', () => {
    test('should return post matching slug', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['test-post.mdx', 'other-post.mdx']);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        const slugs = ['test-post', 'other-post'];
        return {
          data: {
            title: 'Test Post',
            slug: slugs[callCount++],
            excerpt: 'Test excerpt',
            publishedAt: '2024-01-01',
            category: 'test',
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const post = await getBlogPostBySlug('test-post');

      expect(post).toBeTruthy();
      expect(post?.slug).toBe('test-post');
    });

    test('should return null for non-existent slug', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['other-post.mdx']);

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: {
          title: 'Other Post',
          slug: 'other-post',
          excerpt: 'Test',
          publishedAt: '2024-01-01',
          category: 'test',
        },
        content: 'Content',
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const post = await getBlogPostBySlug('non-existent-post');

      expect(post).toBeNull();
    });
  });

  describe('getFeaturedPosts', () => {
    test('should return only featured posts', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'post3.mdx']);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        const featured = [true, false, true];
        return {
          data: {
            title: 'Test',
            slug: `test-${callCount}`,
            excerpt: 'Test',
            publishedAt: '2024-01-01',
            category: 'test',
            featured: featured[callCount++],
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const posts = await getFeaturedPosts();

      expect(posts).toHaveLength(2);
      expect(posts.every((post) => post.featured)).toBe(true);
    });
  });

  describe('getFeaturedPost', () => {
    test('should return single featured post', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx']);

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: {
          title: 'Featured Post',
          slug: 'featured-post',
          excerpt: 'Test',
          publishedAt: '2024-01-01',
          category: 'test',
          featured: true,
        },
        content: 'Content',
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const post = await getFeaturedPost();

      expect(post).toBeTruthy();
      expect(post?.featured).toBe(true);
    });

    test('should return null if no featured posts', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['post1.mdx']);

      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockReturnValue({
        data: {
          title: 'Regular Post',
          slug: 'regular-post',
          excerpt: 'Test',
          publishedAt: '2024-01-01',
          category: 'test',
          featured: false,
        },
        content: 'Content',
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const post = await getFeaturedPost();

      expect(post).toBeNull();
    });
  });

  describe('getRelatedPosts', () => {
    test('should return posts from same category excluding current post', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        'current-post.mdx',
        'related1.mdx',
        'related2.mdx',
        'different-cat.mdx',
      ]);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        const data = [
          { slug: 'current-post', category: 'tax-tips' },
          { slug: 'related1', category: 'tax-tips' },
          { slug: 'related2', category: 'tax-tips' },
          { slug: 'different-cat', category: 'finance' },
        ];
        return {
          data: {
            title: 'Test',
            slug: data[callCount].slug,
            excerpt: 'Test',
            publishedAt: '2024-01-01',
            category: data[callCount++].category,
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const relatedPosts = await getRelatedPosts('current-post', 'tax-tips');

      expect(relatedPosts).toHaveLength(2);
      expect(relatedPosts.every((post) => post.category === 'tax-tips')).toBe(true);
      expect(relatedPosts.every((post) => post.slug !== 'current-post')).toBe(true);
    });

    test('should limit number of related posts', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['current.mdx', 'r1.mdx', 'r2.mdx', 'r3.mdx', 'r4.mdx']);

      let callCount = 0;
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        return {
          data: {
            title: 'Test',
            slug: `post-${callCount++}`,
            excerpt: 'Test',
            publishedAt: '2024-01-01',
            category: 'tax-tips',
          },
          content: 'Content',
        };
      });
      mockYaml.load.mockReturnValue({});
      mockGetCategoryBySlug.mockReturnValue({ name: 'Test', slug: 'test' });

      const relatedPosts = await getRelatedPosts('post-0', 'tax-tips', 2);

      expect(relatedPosts).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    test('should handle file read errors gracefully', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['error-post.mdx']);
      mockFs.readFile.mockRejectedValue(new Error('File read error'));

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
    });

    test('should handle matter parsing errors', async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue(['error-post.mdx']);
      mockFs.readFile.mockResolvedValue('content');
      mockMatter.mockImplementation(() => {
        throw new Error('Matter parsing error');
      });

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
    });
  });

  describe('BlogError', () => {
    test('should export BlogError class', () => {
      expect(BlogError).toBeDefined();
      expect(typeof BlogError).toBe('function');

      const error = new BlogError('Test error', 'TEST_CODE');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });
  });
});
