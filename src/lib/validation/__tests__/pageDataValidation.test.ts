/**
 * Tests for Page Data Validation Schemas
 *
 * Ensures Zod schemas properly validate page content data.
 */

import { Award, Calculator, Lock, Rocket, Shield, Zap } from 'lucide-react';
import {
  type FeatureData,
  FeatureSchema,
  type StatData,
  StatSchema,
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
});
