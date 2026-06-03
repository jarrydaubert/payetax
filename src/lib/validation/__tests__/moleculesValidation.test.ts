import { CategoryFilterSchema, validateCategoryFilter } from '../moleculesValidation';

describe('moleculesValidation', () => {
  describe('CategoryFilterSchema', () => {
    it('accepts a valid category slug', () => {
      const result = CategoryFilterSchema.safeParse({
        selectedCategory: 'tax-basics',
      });
      expect(result.success).toBe(true);
    });

    it('accepts undefined category for all posts', () => {
      const result = CategoryFilterSchema.safeParse({
        selectedCategory: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('accepts an empty object', () => {
      const result = CategoryFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects a non-string category', () => {
      const result = CategoryFilterSchema.safeParse({
        selectedCategory: 123,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateCategoryFilter', () => {
    it('returns success for a valid category', () => {
      const result = validateCategoryFilter({
        selectedCategory: 'tax-basics',
      });
      expect(result.success).toBe(true);
    });

    it('returns an error for invalid input', () => {
      const result = validateCategoryFilter({
        selectedCategory: 123,
      });
      expect(result.success).toBe(false);
    });
  });
});
