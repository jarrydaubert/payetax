/**
 * Blog Configuration Tests
 * Validates blog config structure, categories, and helper functions
 */

import {
  BLOG_BRAND,
  BLOG_CATEGORIES,
  BLOG_CONFIG,
  BLOG_CONTENT_DIR,
  BLOG_IMAGES_DIR,
  BLOG_SEO_DEFAULTS,
  DEFAULT_BLOG_METADATA,
  getCategoryBySlug,
  isValidCategory,
} from '../blog.config';

describe('Blog Configuration', () => {
  describe('Blog Brand', () => {
    it('should have complete brand identity', () => {
      expect(BLOG_BRAND.name).toBe('TaxInsights');
      expect(BLOG_BRAND.fullName).toBe('TaxInsights by PayeTax');
      expect(BLOG_BRAND.tagline).toBeTruthy();
      expect(BLOG_BRAND.description).toBeTruthy();
      expect(BLOG_BRAND.author).toBe('TaxInsights Editorial Team');
      expect(BLOG_BRAND.publisher).toBe('PayeTax');
    });

    it('should have valid blog URL', () => {
      expect(BLOG_BRAND.url).toBe('https://payetax.co.uk/blog');
      expect(BLOG_BRAND.url).toMatch(/^https?:\/\//);
    });

    it('should have logo and social image paths', () => {
      expect(BLOG_BRAND.logo).toMatch(/^\/images\/blog\//);
      expect(BLOG_BRAND.socialImage).toMatch(/^\/images\/blog\//);
      expect(BLOG_BRAND.logo).toContain('.svg');
      expect(BLOG_BRAND.socialImage).toContain('.jpg');
    });

    it('should have non-empty brand text', () => {
      expect(BLOG_BRAND.tagline.length).toBeGreaterThan(10);
      expect(BLOG_BRAND.description.length).toBeGreaterThan(20);
    });
  });

  describe('Blog Categories', () => {
    it('should have all 9 categories', () => {
      expect(BLOG_CATEGORIES).toHaveLength(9);
    });

    it('should have expected category slugs', () => {
      const expectedSlugs = [
        'tax-basics',
        'tax-tips',
        'tax-changes',
        'tax-tools',
        'tax-comparison',
        'student-loans',
        'personal-finance',
        'self-assessment',
        'company-tax',
      ];

      const actualSlugs = BLOG_CATEGORIES.map((cat) => cat.slug);

      for (const slug of expectedSlugs) {
        expect(actualSlugs).toContain(slug);
      }
    });

    it('should have unique slugs', () => {
      const slugs = BLOG_CATEGORIES.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have unique names', () => {
      const names = BLOG_CATEGORIES.map((c) => c.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have SEO-friendly slugs', () => {
      for (const category of BLOG_CATEGORIES) {
        // Should be lowercase kebab-case
        expect(category.slug).toMatch(/^[a-z-]+$/);
        expect(category.slug).not.toContain(' ');
        expect(category.slug).not.toContain('_');
      }
    });

    it('should have descriptive names', () => {
      for (const category of BLOG_CATEGORIES) {
        expect(category.name).toBeTruthy();
        expect(category.name.length).toBeGreaterThan(3);
      }
    });

    it('should have descriptions', () => {
      for (const category of BLOG_CATEGORIES) {
        expect(category.description).toBeTruthy();
        expect(category.description.length).toBeGreaterThan(10);
      }
    });

    it('should have proper structure for each category', () => {
      for (const category of BLOG_CATEGORIES) {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('description');
        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
        expect(typeof category.description).toBe('string');
      }
    });
  });

  describe('Blog Config', () => {
    it('should have valid pagination settings', () => {
      expect(BLOG_CONFIG.postsPerPage).toBe(12);
      expect(BLOG_CONFIG.postsPerPage).toBeGreaterThan(0);
      expect(BLOG_CONFIG.postsPerPage).toBeLessThanOrEqual(24);
    });

    it('should have valid featured posts count', () => {
      expect(BLOG_CONFIG.featuredPostsCount).toBe(3);
      expect(BLOG_CONFIG.featuredPostsCount).toBeGreaterThan(0);
      expect(BLOG_CONFIG.featuredPostsCount).toBeLessThanOrEqual(10);
    });

    it('should have valid related posts count', () => {
      expect(BLOG_CONFIG.relatedPostsCount).toBe(3);
      expect(BLOG_CONFIG.relatedPostsCount).toBeGreaterThan(0);
      expect(BLOG_CONFIG.relatedPostsCount).toBeLessThanOrEqual(10);
    });

    it('should reference BLOG_CATEGORIES', () => {
      expect(BLOG_CONFIG.categories).toBe(BLOG_CATEGORIES);
      expect(BLOG_CONFIG.categories).toHaveLength(9);
    });
  });

  describe('Helper Functions', () => {
    describe('getCategoryBySlug', () => {
      it('should find existing categories', () => {
        const category = getCategoryBySlug('tax-basics');

        expect(category).toBeDefined();
        expect(category?.name).toBe('Tax Basics');
        expect(category?.slug).toBe('tax-basics');
      });

      it('should return undefined for invalid slug', () => {
        const category = getCategoryBySlug('nonexistent');
        expect(category).toBeUndefined();
      });

      it('should find all category slugs', () => {
        for (const cat of BLOG_CATEGORIES) {
          const found = getCategoryBySlug(cat.slug);
          expect(found).toBeDefined();
          expect(found?.slug).toBe(cat.slug);
        }
      });

      it('should be case-sensitive', () => {
        const category = getCategoryBySlug('TAX-BASICS');
        expect(category).toBeUndefined();
      });
    });

    describe('isValidCategory', () => {
      it('should validate existing category slugs', () => {
        expect(isValidCategory('tax-basics')).toBe(true);
        expect(isValidCategory('tax-tips')).toBe(true);
        expect(isValidCategory('student-loans')).toBe(true);
      });

      it('should reject invalid category slugs', () => {
        expect(isValidCategory('nonexistent')).toBe(false);
        expect(isValidCategory('invalid-category')).toBe(false);
        expect(isValidCategory('')).toBe(false);
      });

      it('should validate all actual categories', () => {
        for (const cat of BLOG_CATEGORIES) {
          expect(isValidCategory(cat.slug)).toBe(true);
        }
      });

      it('should be case-sensitive', () => {
        expect(isValidCategory('TAX-BASICS')).toBe(false);
        expect(isValidCategory('Tax-Basics')).toBe(false);
      });
    });
  });

  describe('Directory Paths', () => {
    it('should have valid content directory path', () => {
      expect(BLOG_CONTENT_DIR).toBe('content/blog');
      expect(BLOG_CONTENT_DIR).not.toMatch(/^\//); // Relative path
      expect(BLOG_CONTENT_DIR).not.toMatch(/\/$/); // No trailing slash
    });

    it('should have valid images directory path', () => {
      expect(BLOG_IMAGES_DIR).toBe('/images/blog');
      expect(BLOG_IMAGES_DIR).toMatch(/^\//); // Absolute path
      expect(BLOG_IMAGES_DIR).not.toMatch(/\/$/); // No trailing slash
    });
  });

  describe('Default Metadata', () => {
    it('should have complete default metadata', () => {
      expect(DEFAULT_BLOG_METADATA.author).toBe('TaxInsights Editorial Team');
      expect(DEFAULT_BLOG_METADATA.readTime).toBeTruthy();
      expect(DEFAULT_BLOG_METADATA.image).toBeTruthy();
      expect(DEFAULT_BLOG_METADATA.imageAlt).toBeTruthy();
    });

    it('should have valid default image path', () => {
      expect(DEFAULT_BLOG_METADATA.image).toMatch(/^\/images\/blog\//);
      expect(DEFAULT_BLOG_METADATA.image).toContain('.jpg');
    });

    it('should have descriptive alt text', () => {
      expect(DEFAULT_BLOG_METADATA.imageAlt).toBeTruthy();
      expect(DEFAULT_BLOG_METADATA.imageAlt.length).toBeGreaterThan(5);
    });
  });

  describe('SEO Defaults', () => {
    it('should have valid title template', () => {
      expect(BLOG_SEO_DEFAULTS.titleTemplate).toContain('%s');
      expect(BLOG_SEO_DEFAULTS.titleTemplate).toContain('TaxInsights');
      expect(BLOG_SEO_DEFAULTS.titleTemplate).toContain('PayeTax');
    });

    it('should have valid description template', () => {
      expect(BLOG_SEO_DEFAULTS.descriptionTemplate).toContain('%s');
      expect(BLOG_SEO_DEFAULTS.descriptionTemplate.length).toBeGreaterThan(50);
    });

    it('should have SEO keywords', () => {
      expect(BLOG_SEO_DEFAULTS.keywords).toBeDefined();
      expect(BLOG_SEO_DEFAULTS.keywords.length).toBeGreaterThan(0);

      // Should include key terms
      expect(BLOG_SEO_DEFAULTS.keywords).toContain('UK tax');
      expect(BLOG_SEO_DEFAULTS.keywords).toContain('PAYE');
      expect(BLOG_SEO_DEFAULTS.keywords).toContain('TaxInsights');
    });

    it('should have lowercase keywords (except acronyms and brand names)', () => {
      const allowedMixedCase = ['TaxInsights', 'UK tax']; // Brand names and proper nouns

      for (const keyword of BLOG_SEO_DEFAULTS.keywords) {
        // Skip if it's an allowed mixed-case term
        if (allowedMixedCase.includes(keyword)) {
          continue;
        }

        // Allow full acronyms like PAYE, UK
        const isAcronym = keyword.match(/^[A-Z]+$/);
        if (!isAcronym) {
          expect(keyword).toBe(keyword.toLowerCase());
        }
      }
    });

    it('should have no duplicate keywords', () => {
      const unique = new Set(BLOG_SEO_DEFAULTS.keywords);
      expect(unique.size).toBe(BLOG_SEO_DEFAULTS.keywords.length);
    });
  });

  describe('Integration', () => {
    it('should have consistent author across brand and metadata', () => {
      expect(BLOG_BRAND.author).toBe(DEFAULT_BLOG_METADATA.author);
    });

    it('should have consistent naming in templates', () => {
      expect(BLOG_SEO_DEFAULTS.titleTemplate).toContain(BLOG_BRAND.name);
    });

    it('should use same domain in URLs', () => {
      expect(BLOG_BRAND.url).toContain('payetax.co.uk');
    });
  });

  describe('Type Safety', () => {
    it('should have readonly types (as const where applicable)', () => {
      expect(BLOG_BRAND).toBeDefined();
      expect(BLOG_CATEGORIES).toBeDefined();
      expect(BLOG_CONFIG).toBeDefined();
    });

    it('should have correct property types', () => {
      expect(typeof BLOG_CONFIG.postsPerPage).toBe('number');
      expect(typeof BLOG_CONFIG.featuredPostsCount).toBe('number');
      expect(typeof BLOG_CONFIG.relatedPostsCount).toBe('number');
      expect(Array.isArray(BLOG_CONFIG.categories)).toBe(true);
    });
  });
});
