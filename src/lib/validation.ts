// src/lib/validation.ts

import { z } from 'zod';

/**
 * Blog Frontmatter Validation Schema
 * Validates all required and optional fields in blog post frontmatter
 */
export const BlogFrontmatterSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(160, 'Description must not exceed 160 characters'),
  excerpt: z
    .string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(200, 'Excerpt must not exceed 200 characters'),
  publishedAt: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: 'Invalid date format - must be ISO 8601',
  }),
  updatedAt: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Invalid date format - must be ISO 8601',
    })
    .optional(),
  category: z.enum(['tax', 'paye', 'guide', 'update', 'calculator', 'compliance']),
  tags: z.array(z.string()).optional(),
  author: z.string().optional().default('PayeTax Team'),
  featured: z.boolean().optional().default(false),
  image: z.string().url('Image must be a valid URL').optional(),
  imageAlt: z.string().optional(),
  readTime: z.string().optional(),
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

/**
 * Calculator Input Validation Schema
 * Validates all calculator inputs from the store
 */
export const CalculatorInputSchema = z.object({
  salary: z
    .number()
    .min(0, 'Salary must be positive')
    .max(10_000_000, 'Salary exceeds maximum (£10,000,000)')
    .finite('Salary must be a valid number'),
  taxCode: z
    .string()
    .regex(/^\d{1,4}[LMNPT]$/i, 'Invalid tax code format (e.g., 1257L)')
    .optional(),
  taxYear: z.enum(['2024-25', '2025-26']),
  region: z.enum(['england', 'scotland', 'wales']),
  payPeriod: z.enum(['yearly', 'monthly', 'weekly']),
  pension: z
    .number()
    .min(0, 'Pension contribution must be positive')
    .max(100, 'Pension contribution cannot exceed 100%')
    .optional(),
  studentLoan: z.enum(['none', 'plan1', 'plan2', 'plan4', 'plan5', 'postgraduate']).optional(),
  childcare: z
    .number()
    .min(0, 'Childcare vouchers must be positive')
    .max(10000, 'Childcare vouchers exceed maximum')
    .optional(),
  blindAllowance: z.boolean().optional(),
  marriageAllowance: z.boolean().optional(),
});

export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;

/**
 * URL Parameter Validation Schemas
 */

// Salary URL parameter (e.g., /calculator/50000)
export const SalaryParamSchema = z
  .string()
  .regex(/^\d+$/, 'Salary must be a number')
  .transform((val) => Number.parseInt(val, 10))
  .refine((val) => val >= 0 && val <= 10_000_000, {
    message: 'Salary out of valid range (0-10,000,000)',
  });

// Blog slug parameter (e.g., /blog/uk-tax-guide)
export const BlogSlugSchema = z
  .string()
  .min(1, 'Blog slug cannot be empty')
  .max(200, 'Blog slug too long')
  .regex(/^[a-z0-9-]+$/, 'Blog slug must contain only lowercase letters, numbers, and hyphens');

// Category slug parameter (e.g., /blog?category=tax)
export const CategorySlugSchema = z
  .string()
  .min(1, 'Category slug cannot be empty')
  .max(50, 'Category slug too long')
  .regex(/^[a-z0-9-]+$/, 'Category slug must contain only lowercase letters, numbers, and hyphens');

/**
 * Environment Variables Validation Schema
 * Validates required and optional environment variables
 */
export const EnvSchema = z.object({
  // Required
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Optional analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .startsWith('G-', 'GA Measurement ID must start with G-')
    .optional(),

  // Optional error tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Sentry DSN must be a valid URL').optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Optional API keys
  LINEAR_API_KEY: z
    .string()
    .startsWith('lin_api_', 'Linear API key must start with lin_api_')
    .optional(),

  // Build info
  NEXT_PUBLIC_VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Feedback Form Validation Schema
 * Used in /api/feedback endpoint
 */
export const FeedbackSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters'),
  page: z.string().url('Page must be a valid URL').optional(),
  userAgent: z.string().optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

/**
 * Search Query Validation Schema
 */
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').max(100, 'Search query too long'),
  category: CategorySlugSchema.optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val > 0 && val <= 1000, {
      message: 'Page out of valid range (1-1000)',
    })
    .optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

/**
 * Pagination Validation Schema
 */
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(10),
  offset: z.number().int().min(0, 'Offset must be non-negative').default(0),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Helper function to safely parse and validate data
 * Returns either parsed data or error details
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for display to users
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}
