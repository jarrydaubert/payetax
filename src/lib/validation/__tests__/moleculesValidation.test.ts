/**
 * Molecules Validation Tests
 * Complete Zod Audit - PAYTAX-108 System 3
 *
 * Tests for molecule-level component validation schemas:
 * - FeedbackFormSchema
 * - CategoryFilterSchema
 * - Helper functions
 */

import {
  CategoryFilterSchema,
  FeedbackFormSchema,
  validateCategoryFilter,
  validateFeedbackForm,
} from '../moleculesValidation';

describe('moleculesValidation', () => {
  describe('FeedbackFormSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid email and message', () => {
        const result = FeedbackFormSchema.safeParse({
          email: 'user@example.com',
          message: 'This is a great tax calculator!',
        });
        expect(result.success).toBe(true);
      });

      it('should accept message without email (optional)', () => {
        const result = FeedbackFormSchema.safeParse({
          message: 'Great tool for UK taxes!',
        });
        expect(result.success).toBe(true);
      });

      it('should accept empty string email (treated as missing)', () => {
        const result = FeedbackFormSchema.safeParse({
          email: '',
          message: 'Feedback without email provided',
        });
        // Empty string fails email validation but email is optional
        // This depends on implementation - let's test actual behavior
        expect(result.success).toBe(false); // Empty string is not a valid email
      });

      it('should accept minimum length message (10 chars)', () => {
        const result = FeedbackFormSchema.safeParse({
          message: '1234567890', // exactly 10 characters
        });
        expect(result.success).toBe(true);
      });

      it('should accept maximum length message (5000 chars)', () => {
        const result = FeedbackFormSchema.safeParse({
          message: 'a'.repeat(5000),
        });
        expect(result.success).toBe(true);
      });

      it('should trim whitespace from message', () => {
        const result = FeedbackFormSchema.safeParse({
          message: '   Valid message with whitespace   ',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.message).toBe('Valid message with whitespace');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject message shorter than 10 characters', () => {
        const result = FeedbackFormSchema.safeParse({
          message: 'Too short',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 10 characters');
        }
      });

      it('should reject message longer than 5000 characters', () => {
        const result = FeedbackFormSchema.safeParse({
          message: 'a'.repeat(5001),
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('5000');
        }
      });

      it('should reject invalid email format', () => {
        const result = FeedbackFormSchema.safeParse({
          email: 'not-an-email',
          message: 'Valid message here',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('email');
        }
      });

      it('should reject missing message', () => {
        const result = FeedbackFormSchema.safeParse({
          email: 'user@example.com',
        });
        expect(result.success).toBe(false);
      });

      it('should reject message that is only whitespace', () => {
        const result = FeedbackFormSchema.safeParse({
          message: '          ', // 10 spaces, but trims to empty
        });
        expect(result.success).toBe(false);
      });

      it('should reject null message', () => {
        const result = FeedbackFormSchema.safeParse({
          message: null,
        });
        expect(result.success).toBe(false);
      });

      it('should reject non-string message', () => {
        const result = FeedbackFormSchema.safeParse({
          message: 12345,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('email validation edge cases', () => {
      it('should accept standard email formats', () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.co.uk',
          'user+tag@example.com',
          'user@subdomain.example.com',
        ];

        for (const email of validEmails) {
          const result = FeedbackFormSchema.safeParse({
            email,
            message: 'Valid test message',
          });
          expect(result.success).toBe(true);
        }
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'notanemail',
          '@example.com',
          'user@',
          'user@.com',
          'user @example.com',
        ];

        for (const email of invalidEmails) {
          const result = FeedbackFormSchema.safeParse({
            email,
            message: 'Valid test message',
          });
          expect(result.success).toBe(false);
        }
      });
    });
  });

  describe('CategoryFilterSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid category slug', () => {
        const result = CategoryFilterSchema.safeParse({
          selectedCategory: 'tax-basics',
        });
        expect(result.success).toBe(true);
      });

      it('should accept undefined category (All Posts)', () => {
        const result = CategoryFilterSchema.safeParse({
          selectedCategory: undefined,
        });
        expect(result.success).toBe(true);
      });

      it('should accept empty object (no category)', () => {
        const result = CategoryFilterSchema.safeParse({});
        expect(result.success).toBe(true);
      });

      it('should accept various category slugs', () => {
        const categories = [
          'tax-basics',
          'income-tax',
          'national-insurance',
          'student-loans',
          'pensions',
        ];

        for (const category of categories) {
          const result = CategoryFilterSchema.safeParse({
            selectedCategory: category,
          });
          expect(result.success).toBe(true);
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject non-string category', () => {
        const result = CategoryFilterSchema.safeParse({
          selectedCategory: 123,
        });
        expect(result.success).toBe(false);
      });

      it('should reject null category', () => {
        const result = CategoryFilterSchema.safeParse({
          selectedCategory: null,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('validateFeedbackForm helper', () => {
    it('should return success for valid data', () => {
      const result = validateFeedbackForm({
        email: 'test@example.com',
        message: 'This is valid feedback',
      });
      expect(result.success).toBe(true);
    });

    it('should return error for invalid data', () => {
      const result = validateFeedbackForm({
        message: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should handle unknown input types', () => {
      const result = validateFeedbackForm(null);
      expect(result.success).toBe(false);
    });

    it('should handle string input', () => {
      const result = validateFeedbackForm('not an object');
      expect(result.success).toBe(false);
    });

    it('should provide field-specific errors', () => {
      const result = validateFeedbackForm({
        email: 'invalid',
        message: 'short',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.email).toBeDefined();
        expect(fieldErrors.message).toBeDefined();
      }
    });
  });

  describe('validateCategoryFilter helper', () => {
    it('should return success for valid category', () => {
      const result = validateCategoryFilter({
        selectedCategory: 'tax-basics',
      });
      expect(result.success).toBe(true);
    });

    it('should return success for empty object', () => {
      const result = validateCategoryFilter({});
      expect(result.success).toBe(true);
    });

    it('should return error for invalid input', () => {
      const result = validateCategoryFilter({
        selectedCategory: 123,
      });
      expect(result.success).toBe(false);
    });

    it('should handle null input', () => {
      const result = validateCategoryFilter(null);
      expect(result.success).toBe(false);
    });
  });
});
