/**
 * Tests for Page Data Validation Schemas
 *
 * Ensures Zod schemas properly validate page content data.
 */

import { Award, Calculator, Lock, Rocket, Shield, Zap } from 'lucide-react';
import {
  type ContactLinkData,
  ContactLinkSchema,
  type FeatureData,
  FeatureSchema,
  type SectionBadgeData,
  SectionBadgeSchema,
  type StatData,
  StatSchema,
  validateContactLinks,
  validateFeatures,
  validateStats,
} from '../pageDataValidation';

describe('pageDataValidation', () => {
  describe('StatSchema', () => {
    it('should validate a complete stat object', () => {
      const stat: StatData = {
        icon: Calculator,
        value: '100%',
        label: 'Free Forever',
        description: 'Always free, no hidden costs',
        color: 'from-primary to-accent',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal stat object', () => {
      const stat = {
        icon: Lock,
        value: '0',
        label: 'Data Stored',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(true);
    });

    it('should validate numeric values', () => {
      const stat = {
        icon: Award,
        value: 2025,
        label: 'Year Founded',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(true);
    });

    it('should validate string values with special chars', () => {
      const stat = {
        icon: Zap,
        value: '<300kB',
        label: 'Bundle Size',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(true);
    });

    it('should reject missing value', () => {
      const stat = {
        icon: Calculator,
        label: 'Missing Value',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(false);
    });

    it('should reject missing label', () => {
      const stat = {
        icon: Calculator,
        value: '100%',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(false);
    });

    it('should reject empty label', () => {
      const stat = {
        icon: Calculator,
        value: '100%',
        label: '',
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(false);
    });

    it('should reject label over 100 chars', () => {
      const stat = {
        icon: Calculator,
        value: '100%',
        label: 'a'.repeat(101),
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(false);
    });

    it('should reject description over 500 chars', () => {
      const stat = {
        icon: Calculator,
        value: '100%',
        label: 'Valid Label',
        description: 'a'.repeat(501),
      };

      const result = StatSchema.safeParse(stat);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStats', () => {
    it('should validate an array of stats', () => {
      const stats = [
        { icon: Calculator, value: '100%', label: 'Free' },
        { icon: Lock, value: '0', label: 'Secure' },
        { icon: Zap, value: 'Fast', label: 'Performance' },
      ];

      const result = validateStats(stats);
      expect(result.success).toBe(true);
    });

    it('should reject empty array', () => {
      const result = validateStats([]);
      // Empty arrays are valid - no minimum
      expect(result.success).toBe(true);
    });

    it('should reject invalid item in array', () => {
      const stats = [
        { icon: Calculator, value: '100%', label: 'Valid' },
        { icon: Lock, value: '0' }, // Missing label
      ];

      const result = validateStats(stats);
      expect(result.success).toBe(false);
    });

    it('should reject non-array input', () => {
      const result = validateStats({ not: 'an array' });
      expect(result.success).toBe(false);
    });
  });

  describe('FeatureSchema', () => {
    it('should validate a complete feature object', () => {
      const feature: FeatureData = {
        icon: Rocket,
        title: 'Blazing Fast',
        description: 'Sub-second page loads with optimized rendering',
        metric: '<1.5s',
        link: {
          text: 'Learn More',
          href: 'https://example.com',
        },
        gradient: {
          bg: 'from-primary to-accent',
          icon: 'text-primary',
          border: 'border-primary',
        },
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal feature object', () => {
      const feature = {
        icon: Shield,
        title: 'Secure',
        description: 'Enterprise-grade security with encryption',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });

    it('should validate link with URL', () => {
      const feature = {
        icon: Rocket,
        title: 'Fast',
        description: 'Lightning fast performance',
        link: {
          text: 'Benchmark',
          href: 'https://benchmark.com/results',
        },
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });

    it('should validate link with path', () => {
      const feature = {
        icon: Rocket,
        title: 'Fast',
        description: 'Lightning fast performance',
        link: {
          text: 'Docs',
          href: '/docs/performance',
        },
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(true);
    });

    it('should reject missing title', () => {
      const feature = {
        icon: Rocket,
        description: 'Missing title',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const feature = {
        icon: Rocket,
        title: '',
        description: 'Valid description',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject title over 100 chars', () => {
      const feature = {
        icon: Rocket,
        title: 'a'.repeat(101),
        description: 'Valid description',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject description under 10 chars', () => {
      const feature = {
        icon: Rocket,
        title: 'Valid Title',
        description: 'Short',
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject description over 500 chars', () => {
      const feature = {
        icon: Rocket,
        title: 'Valid Title',
        description: 'a'.repeat(501),
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject invalid link href', () => {
      const feature = {
        icon: Rocket,
        title: 'Valid Title',
        description: 'Valid description here',
        link: {
          text: 'Link',
          href: 'not-a-url', // Must be URL or start with /
        },
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });

    it('should reject metric over 20 chars', () => {
      const feature = {
        icon: Rocket,
        title: 'Valid Title',
        description: 'Valid description here',
        metric: 'a'.repeat(21),
      };

      const result = FeatureSchema.safeParse(feature);
      expect(result.success).toBe(false);
    });
  });

  describe('validateFeatures', () => {
    it('should validate an array of features', () => {
      const features = [
        {
          icon: Rocket,
          title: 'Fast',
          description: 'Lightning fast performance',
        },
        {
          icon: Shield,
          title: 'Secure',
          description: 'Enterprise-grade security',
        },
      ];

      const result = validateFeatures(features);
      expect(result.success).toBe(true);
    });

    it('should reject invalid item in array', () => {
      const features = [
        {
          icon: Rocket,
          title: 'Fast',
          description: 'Lightning fast performance',
        },
        {
          icon: Shield,
          title: 'Secure',
          // Missing description
        },
      ];

      const result = validateFeatures(features);
      expect(result.success).toBe(false);
    });
  });

  describe('SectionBadgeSchema', () => {
    it('should validate a complete badge object', () => {
      const badge: SectionBadgeData = {
        text: 'New Feature',
        variant: 'default',
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal badge (no variant)', () => {
      const badge = {
        text: 'Important',
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(true);
    });

    it('should validate all badge variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      for (const variant of variants) {
        const badge = { text: 'Test', variant };
        const result = SectionBadgeSchema.safeParse(badge);
        expect(result.success).toBe(true);
      }
    });

    it('should reject empty text', () => {
      const badge = {
        text: '',
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(false);
    });

    it('should reject text over 50 chars', () => {
      const badge = {
        text: 'a'.repeat(51),
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(false);
    });

    it('should reject invalid variant', () => {
      const badge = {
        text: 'Test',
        variant: 'invalid' as any,
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(false);
    });

    it('should reject missing text', () => {
      const badge = {
        variant: 'default',
      };

      const result = SectionBadgeSchema.safeParse(badge);
      expect(result.success).toBe(false);
    });
  });

  describe('ContactLinkSchema', () => {
    it('should validate a complete contact link object', () => {
      const link: ContactLinkData = {
        text: 'support@example.com',
        href: 'mailto:support@example.com',
        type: 'email',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal contact link (no type)', () => {
      const link = {
        text: 'Contact Us',
        href: '/contact',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should validate email type', () => {
      const link = {
        text: 'Email',
        href: 'mailto:test@example.com',
        type: 'email' as const,
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should validate link type', () => {
      const link = {
        text: 'Feedback',
        href: '/feedback',
        type: 'link' as const,
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should validate URL href', () => {
      const link = {
        text: 'Website',
        href: 'https://example.com',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should validate path href', () => {
      const link = {
        text: 'Support',
        href: '/support',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const link = {
        text: '',
        href: '/test',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });

    it('should reject text over 100 chars', () => {
      const link = {
        text: 'a'.repeat(101),
        href: '/test',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });

    it('should reject invalid href', () => {
      const link = {
        text: 'Test',
        href: 'not-a-valid-url',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });

    it('should reject missing text', () => {
      const link = {
        href: '/test',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });

    it('should reject missing href', () => {
      const link = {
        text: 'Test',
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const link = {
        text: 'Test',
        href: '/test',
        type: 'invalid' as any,
      };

      const result = ContactLinkSchema.safeParse(link);
      expect(result.success).toBe(false);
    });
  });

  describe('validateContactLinks', () => {
    it('should validate an array of contact links', () => {
      const links = [
        { text: 'Email', href: 'mailto:test@example.com', type: 'email' as const },
        { text: 'Feedback', href: '/feedback', type: 'link' as const },
      ];

      const result = validateContactLinks(links);
      expect(result.success).toBe(true);
    });

    it('should reject invalid item in array', () => {
      const links = [
        { text: 'Valid', href: '/valid' },
        { text: '', href: '/invalid' }, // Empty text
      ];

      const result = validateContactLinks(links);
      expect(result.success).toBe(false);
    });
  });
});
