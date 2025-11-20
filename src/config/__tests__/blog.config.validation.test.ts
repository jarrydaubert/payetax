/**
 * Tests for Blog Configuration Validation Schemas
 * PAYTAX-128 (Config & Constants Validation)
 *
 * Testing Zod schemas for blog configuration:
 * - BlogBrandSchema
 * - BlogCategorySchema
 * - BlogConfigSchema
 */

import { describe, expect, it } from '@jest/globals';
import {
  BLOG_BRAND,
  BLOG_CATEGORIES,
  BLOG_CONFIG,
  BlogBrandSchema,
  BlogCategorySchema,
  BlogConfigSchema,
} from '../blog.config';

describe('BlogBrandSchema', () => {
  describe('valid blog brands', () => {
    it('should validate the actual BLOG_BRAND config', () => {
      const result = BlogBrandSchema.safeParse(BLOG_BRAND);
      expect(result.success).toBe(true);
    });

    it('should accept complete brand with all fields', () => {
      const result = BlogBrandSchema.safeParse({
        name: 'TaxInsights',
        fullName: 'TaxInsights by PayeTax',
        tagline: 'Expert UK Tax Guidance',
        description: 'Clear, actionable UK tax advice from qualified experts.',
        author: 'TaxInsights Editorial Team',
        publisher: 'PayeTax',
        url: 'https://payetax.co.uk/blog',
        logo: '/images/blog/taxinsights-logo.svg',
        socialImage: '/images/blog/taxinsights-og.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid URLs with different protocols', () => {
      const result = BlogBrandSchema.safeParse({
        ...BLOG_BRAND,
        url: 'http://example.com/blog',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid blog brands', () => {
    it('should reject empty name', () => {
      const result = BlogBrandSchema.safeParse({
        ...BLOG_BRAND,
        name: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject description < 10 characters', () => {
      const result = BlogBrandSchema.safeParse({
        ...BLOG_BRAND,
        description: 'Too short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10 characters');
      }
    });

    it('should reject invalid URL', () => {
      const result = BlogBrandSchema.safeParse({
        ...BLOG_BRAND,
        url: 'not-a-url',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('URL');
      }
    });

    it('should reject missing required fields', () => {
      const result = BlogBrandSchema.safeParse({
        name: 'Test',
        // Missing all other required fields
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });
});

describe('BlogCategorySchema', () => {
  describe('valid blog categories', () => {
    it('should validate all actual BLOG_CATEGORIES', () => {
      for (const category of BLOG_CATEGORIES) {
        const result = BlogCategorySchema.safeParse(category);
        expect(result.success).toBe(true);
      }
    });

    it('should accept valid category with kebab-case slug', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'tax-tips',
        description: 'Practical advice to optimize your tax situation',
      });
      expect(result.success).toBe(true);
    });

    it('should accept slug with numbers', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax 2024',
        slug: 'tax-2024',
        description: 'Tax information for the 2024 tax year',
      });
      expect(result.success).toBe(true);
    });

    it('should accept single-word slug', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Finance',
        slug: 'finance',
        description: 'General finance information and guidance',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid blog categories', () => {
    it('should reject empty name', () => {
      const result = BlogCategorySchema.safeParse({
        name: '',
        slug: 'tax-tips',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
    });

    it('should reject slug with uppercase letters', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'Tax-Tips',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('kebab-case');
      }
    });

    it('should reject slug with spaces', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'tax tips',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
    });

    it('should reject slug with underscores', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'tax_tips',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
    });

    it('should reject slug starting with hyphen', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: '-tax-tips',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
    });

    it('should reject slug ending with hyphen', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'tax-tips-',
        description: 'Valid description here',
      });
      expect(result.success).toBe(false);
    });

    it('should reject description < 10 characters', () => {
      const result = BlogCategorySchema.safeParse({
        name: 'Tax Tips',
        slug: 'tax-tips',
        description: 'Too short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10 characters');
      }
    });
  });
});

describe('BlogConfigSchema', () => {
  describe('valid blog configs', () => {
    it('should validate the actual BLOG_CONFIG', () => {
      const result = BlogConfigSchema.safeParse(BLOG_CONFIG);
      expect(result.success).toBe(true);
    });

    it('should accept valid config with minimum values', () => {
      const result = BlogConfigSchema.safeParse({
        postsPerPage: 1,
        featuredPostsCount: 1,
        relatedPostsCount: 1,
        categories: [
          {
            name: 'Tax Tips',
            slug: 'tax-tips',
            description: 'Valid description here',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid config with maximum values', () => {
      const result = BlogConfigSchema.safeParse({
        postsPerPage: 50,
        featuredPostsCount: 10,
        relatedPostsCount: 10,
        categories: BLOG_CATEGORIES,
      });
      expect(result.success).toBe(true);
    });

    it('should accept config with multiple categories', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        categories: [
          { name: 'Cat 1', slug: 'cat-1', description: 'Description 1 here' },
          { name: 'Cat 2', slug: 'cat-2', description: 'Description 2 here' },
          { name: 'Cat 3', slug: 'cat-3', description: 'Description 3 here' },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid blog configs', () => {
    it('should reject postsPerPage = 0', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        postsPerPage: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject postsPerPage > 50', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        postsPerPage: 51,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('50');
      }
    });

    it('should reject negative postsPerPage', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        postsPerPage: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject decimal postsPerPage', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        postsPerPage: 10.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject featuredPostsCount > 10', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        featuredPostsCount: 11,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('10');
      }
    });

    it('should reject relatedPostsCount = 0', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        relatedPostsCount: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty categories array', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        categories: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one category');
      }
    });

    it('should reject categories with invalid category', () => {
      const result = BlogConfigSchema.safeParse({
        ...BLOG_CONFIG,
        categories: [
          {
            name: 'Valid',
            slug: 'valid',
            description: 'Valid description',
          },
          {
            name: 'Invalid',
            slug: 'Invalid_Slug', // Invalid: has uppercase and underscore
            description: 'Valid description',
          },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
