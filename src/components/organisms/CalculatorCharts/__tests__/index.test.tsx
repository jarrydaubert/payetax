/**
 * CalculatorCharts Index Tests
 * Phase 4: Fix coverage threshold violations
 *
 * Tests that all chart components are properly exported from the index.
 */

import {
  ChartsContainer,
  ChartsSkeleton,
  IncomeBreakdownChart,
  NetIncomeComparisonChart,
  TaxLiabilityChart,
} from '../index';

describe('CalculatorCharts Index Exports', () => {
  describe('Export Verification', () => {
    it('should export ChartsContainer', () => {
      expect(ChartsContainer).toBeDefined();
      // ChartsContainer is a memoized component (object with $$typeof)
      expect(ChartsContainer).toBeTruthy();
    });

    it('should export ChartsSkeleton', () => {
      expect(ChartsSkeleton).toBeDefined();
      expect(typeof ChartsSkeleton).toBe('function');
    });

    it('should export IncomeBreakdownChart', () => {
      expect(IncomeBreakdownChart).toBeDefined();
      // Memoized components are objects
      expect(IncomeBreakdownChart).toBeTruthy();
    });

    it('should export NetIncomeComparisonChart', () => {
      expect(NetIncomeComparisonChart).toBeDefined();
      // Memoized components are objects
      expect(NetIncomeComparisonChart).toBeTruthy();
    });

    it('should export TaxLiabilityChart', () => {
      expect(TaxLiabilityChart).toBeDefined();
      // Memoized components are objects
      expect(TaxLiabilityChart).toBeTruthy();
    });
  });

  describe('Module Structure', () => {
    it('should export all chart components from single entry point', () => {
      // All exports should be available from index
      const exports = {
        ChartsContainer,
        ChartsSkeleton,
        IncomeBreakdownChart,
        NetIncomeComparisonChart,
        TaxLiabilityChart,
      };

      expect(Object.keys(exports)).toHaveLength(5);
      Object.values(exports).forEach((exp) => {
        expect(exp).toBeDefined();
      });
    });

    it('ChartsSkeleton should be a regular function component', () => {
      // ChartsSkeleton is not memoized, so it's a function
      expect(typeof ChartsSkeleton).toBe('function');
      expect(ChartsSkeleton.name).toBe('ChartsSkeleton');
    });
  });
});
