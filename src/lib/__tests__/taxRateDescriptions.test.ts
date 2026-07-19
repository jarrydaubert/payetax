// src/lib/__tests__/taxRateDescriptions.test.ts

import { TAX_RATES } from '@/constants/taxRates';
import {
  getCurrentTaxYearLabel,
  getPersonalAllowance,
  getTaxRateDescription,
} from '../taxRateDescriptions';

// Mock formatCurrency from utils
jest.mock('../utils', () => ({
  formatCurrency: jest.fn((amount: number) => `£${amount.toLocaleString()}`),
}));

describe('Tax Rate Descriptions', () => {
  describe('getTaxRateDescription', () => {
    test('should generate description for default tax year (2026-2027)', () => {
      const description = getTaxRateDescription();

      expect(description).toContain('2026-2027 tax year');
      expect(description).toContain('2000% basic rate');
      expect(description).toContain('4000% higher rate');
      expect(description).toContain('4500% additional rate');
      expect(description).toContain('National Insurance is 800%');
      expect(description).toContain('£12,570'); // Personal allowance
    });

    test('should generate description for specific tax year (2024-2025)', () => {
      const description = getTaxRateDescription('2024-2025');

      expect(description).toContain('2024-2025 tax year');
      expect(description).toContain('2000% basic rate');
      expect(description).toContain('4000% higher rate');
      expect(description).toContain('4500% additional rate');
      expect(description).toContain('National Insurance is 800%');
      expect(description).toContain('£12,570');
    });

    test('should generate description for 2023-2024 tax year', () => {
      const description = getTaxRateDescription('2023-2024');

      expect(description).toContain('2023-2024 tax year');
      expect(description).toContain('2000% basic rate');
      expect(description).toContain('4000% higher rate');
      expect(description).toContain('4500% additional rate');
      expect(description).toContain('National Insurance is 1200%'); // Different rate in 2023-2024
      expect(description).toContain('£12,570');
    });

    test('should handle tax band descriptions correctly', () => {
      const description = getTaxRateDescription('2024-2025');

      // Should include all the tax bands with proper formatting
      expect(description).toMatch(/2000% basic rate rate \(£12,570-£37,700\)/);
      expect(description).toMatch(/4000% higher rate rate \(£37,700-£125,140\)/);
      expect(description).toMatch(/4500% additional rate \(above £125,140\)/);
    });

    test('should handle National Insurance rates correctly', () => {
      const description2024 = getTaxRateDescription('2024-2025');
      const description2023 = getTaxRateDescription('2023-2024');

      expect(description2024).toContain(
        'National Insurance is 800% on earnings between £12,570-£50,270 and 200% above that',
      );
      expect(description2023).toContain(
        'National Insurance is 1200% on earnings between £12,570-£50,270 and 200% above that',
      );
    });

    test('should return fallback message for invalid tax year', () => {
      // Test with an invalid tax year by mocking TAX_RATES
      const originalTaxRates = TAX_RATES;
      (TAX_RATES as Record<string, unknown>)['2024-2025'] = undefined;

      const description = getTaxRateDescription('2024-2025');
      expect(description).toBe('Tax rates not available for this year');

      // Restore original TAX_RATES
      Object.assign(TAX_RATES, originalTaxRates);
    });

    test('should handle infinity threshold for additional rate', () => {
      const description = getTaxRateDescription('2026-2027');

      // Should specifically mention "above" for the additional rate with infinity threshold
      expect(description).toContain('4500% additional rate (above £125,140)');
    });

    test('should format currency amounts properly', () => {
      const description = getTaxRateDescription('2026-2027');

      // Check that formatCurrency is called and amounts are formatted
      expect(description).toContain('£12,570');
      expect(description).toContain('£37,700');
      expect(description).toContain('£50,270');
      expect(description).toContain('£125,140');
    });
  });

  describe('getCurrentTaxYearLabel', () => {
    test('should return current tax year when 2026-2027 data exists', () => {
      const label = getCurrentTaxYearLabel();
      expect(label).toBe('2026-2027');
    });

    test('should return fallback when 2026-2027 data does not exist', () => {
      // Mock scenario where 2026-2027 data is not available
      const originalCurrentData = TAX_RATES['2026-2027'];
      (TAX_RATES as Record<string, unknown>)['2026-2027'] = undefined;

      const label = getCurrentTaxYearLabel();
      expect(label).toBe('current tax year');

      // Restore original data
      TAX_RATES['2026-2027'] = originalCurrentData;
    });
  });

  describe('getPersonalAllowance', () => {
    test('should return personal allowance for default tax year (2026-2027)', () => {
      const allowance = getPersonalAllowance();
      expect(allowance).toBe(12570);
    });

    test('should return personal allowance for specific tax year', () => {
      const allowance2024 = getPersonalAllowance('2024-2025');
      const allowance2023 = getPersonalAllowance('2023-2024');

      expect(allowance2024).toBe(12570);
      expect(allowance2023).toBe(12570);
    });

    test('should return default allowance for invalid tax year', () => {
      // Test with non-existent tax year
      const allowance = getPersonalAllowance('2030-2031' as never);
      expect(allowance).toBe(12570); // Should return default
    });

    test('should handle undefined tax year', () => {
      const allowance = getPersonalAllowance(undefined as never);
      expect(allowance).toBe(12570);
    });
  });
});
