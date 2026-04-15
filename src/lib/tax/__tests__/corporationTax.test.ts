/**
 * Corporation Tax Calculator Tests
 *
 * Tests the Corporation Tax calculation with marginal relief.
 * Verifies against known HMRC examples and edge cases.
 *
 * @see https://www.gov.uk/corporation-tax-rates
 */

import { CT_RATES } from '@/constants/taxRates';
import { calculateCorporationTax, getCorporationTax, getEffectiveCTRate } from '../corporationTax';

describe('Corporation Tax Calculator', () => {
  describe('calculateCorporationTax', () => {
    describe('Small profits rate (≤ £50,000)', () => {
      it('should calculate 19% for profits at £40,000', () => {
        const result = calculateCorporationTax(40000);

        expect(result.corporationTax).toBe(7600); // 40000 × 0.19
        expect(result.effectiveRate).toBe(0.19);
        expect(result.rateBand).toBe('small_profits');
        expect(result.marginalRelief).toBe(0);
      });

      it('should calculate 19% for profits exactly at £50,000', () => {
        const result = calculateCorporationTax(50000);

        expect(result.corporationTax).toBe(9500); // 50000 × 0.19
        expect(result.effectiveRate).toBe(0.19);
        expect(result.rateBand).toBe('small_profits');
      });

      it('should handle very small profits correctly', () => {
        const result = calculateCorporationTax(1000);

        expect(result.corporationTax).toBe(190); // 1000 × 0.19
        expect(result.rateBand).toBe('small_profits');
      });
    });

    describe('Main rate (≥ £250,000)', () => {
      it('should calculate 25% for profits at £300,000', () => {
        const result = calculateCorporationTax(300000);

        expect(result.corporationTax).toBe(75000); // 300000 × 0.25
        expect(result.effectiveRate).toBe(0.25);
        expect(result.rateBand).toBe('main');
        expect(result.marginalRelief).toBe(0);
      });

      it('should calculate 25% for profits exactly at £250,000', () => {
        const result = calculateCorporationTax(250000);

        expect(result.corporationTax).toBe(62500); // 250000 × 0.25
        expect(result.effectiveRate).toBe(0.25);
        expect(result.rateBand).toBe('main');
      });

      it('should handle very large profits correctly', () => {
        const result = calculateCorporationTax(10_000_000);

        expect(result.corporationTax).toBe(2_500_000); // 10M × 0.25
        expect(result.rateBand).toBe('main');
      });
    });

    describe('Marginal relief (£50,001 - £249,999)', () => {
      it('should calculate exact marginal relief for £100,000 profit', () => {
        // HMRC Marginal Relief formula (simple company, no distributions):
        // Tax = (Profit × 25%) - MarginalRelief
        // MarginalRelief = (250,000 - Profit) × 3/200
        //
        // For £100,000:
        // Main rate tax: £100,000 × 25% = £25,000
        // Marginal relief: (£250,000 - £100,000) × 3/200 = £150,000 × 0.015 = £2,250
        // Final tax: £25,000 - £2,250 = £22,750
        // Effective rate: 22.75%
        const result = calculateCorporationTax(100000);

        expect(result.rateBand).toBe('marginal');
        expect(result.marginalRelief).toBe(2250);
        expect(result.corporationTax).toBe(22750);
        expect(result.effectiveRate).toBe(0.2275);
      });

      it('should calculate exact marginal relief for £150,000 profit', () => {
        // Main rate tax: £150,000 × 25% = £37,500
        // Marginal relief: (£250,000 - £150,000) × 3/200 = £100,000 × 0.015 = £1,500
        // Final tax: £37,500 - £1,500 = £36,000
        // Effective rate: 24%
        const result = calculateCorporationTax(150000);

        expect(result.rateBand).toBe('marginal');
        expect(result.marginalRelief).toBe(1500);
        expect(result.corporationTax).toBe(36000);
        expect(result.effectiveRate).toBe(0.24);
      });

      it('should calculate correctly just above small profits limit (£50,001)', () => {
        // Main rate tax: £50,001 × 25% = £12,500.25
        // Marginal relief: (£250,000 - £50,001) × 3/200 = £199,999 × 0.015 = £2,999.985
        // Final tax: £12,500.25 - £2,999.985 = £9,500.265 → £9,500.27
        const result = calculateCorporationTax(50001);

        expect(result.rateBand).toBe('marginal');
        // Effective rate should be very close to 19%
        expect(result.effectiveRate).toBeCloseTo(0.19, 2);
        expect(result.corporationTax).toBeCloseTo(9500.27, 2);
      });

      it('should calculate correctly just below main rate limit (£249,999)', () => {
        // Main rate tax: £249,999 × 25% = £62,499.75
        // Marginal relief: (£250,000 - £249,999) × 3/200 = £1 × 0.015 = £0.015
        // Final tax: £62,499.75 - £0.015 = £62,499.735 → £62,499.74
        const result = calculateCorporationTax(249999);

        expect(result.rateBand).toBe('marginal');
        // Effective rate should be very close to 25%
        expect(result.effectiveRate).toBeCloseTo(0.25, 2);
        expect(result.corporationTax).toBeCloseTo(62499.74, 2);
      });
    });

    describe('Associated company threshold adjustments', () => {
      it('should split CT thresholds across associated companies', () => {
        const singleCompany = calculateCorporationTax(40000);
        const twoAssociatedCompanies = calculateCorporationTax(40000, 2);

        expect(singleCompany.rateBand).toBe('small_profits');
        expect(twoAssociatedCompanies.rateBand).toBe('marginal');
        expect(twoAssociatedCompanies.corporationTax).toBeGreaterThan(singleCompany.corporationTax);
      });

      it('should treat £25,000 as small-profits limit when there are 2 companies', () => {
        const result = calculateCorporationTax(25000, 2);

        expect(result.rateBand).toBe('small_profits');
        expect(result.corporationTax).toBe(4750);
      });
    });

    describe('Edge cases', () => {
      it('should return 0 for zero profit', () => {
        const result = calculateCorporationTax(0);

        expect(result.corporationTax).toBe(0);
        expect(result.effectiveRate).toBe(0);
        expect(result.rateBand).toBe('small_profits');
      });

      it('should return 0 for negative profit', () => {
        const result = calculateCorporationTax(-10000);

        expect(result.corporationTax).toBe(0);
        expect(result.effectiveRate).toBe(0);
      });

      it('should round to pence correctly', () => {
        const result = calculateCorporationTax(12345);

        // 12345 × 0.19 = 2345.55
        expect(result.corporationTax).toBe(2345.55);
        // Verify it's rounded to 2 decimal places
        expect(result.corporationTax.toFixed(2)).toBe('2345.55');
      });

      it('should handle decimal profits', () => {
        const result = calculateCorporationTax(40000.5);

        expect(result.corporationTax).toBe(7600.1); // 40000.5 × 0.19 = 7600.095 → 7600.10
      });

      it('should handle NaN gracefully', () => {
        const result = calculateCorporationTax(Number.NaN);

        expect(result.corporationTax).toBe(0);
        expect(result.effectiveRate).toBe(0);
      });

      it('should handle Infinity gracefully', () => {
        const result = calculateCorporationTax(Number.POSITIVE_INFINITY);

        // Should not throw, returns safe default
        expect(result.corporationTax).toBe(0);
      });

      it('should handle negative Infinity gracefully', () => {
        const result = calculateCorporationTax(Number.NEGATIVE_INFINITY);

        expect(result.corporationTax).toBe(0);
      });
    });
  });

  describe('getCorporationTax (convenience function)', () => {
    it('should return just the tax amount', () => {
      expect(getCorporationTax(40000)).toBe(7600);
      expect(getCorporationTax(300000)).toBe(75000);
      expect(getCorporationTax(0)).toBe(0);
    });

    it('should apply associated company adjustments when provided', () => {
      expect(getCorporationTax(40000, undefined, 2)).toBeGreaterThan(getCorporationTax(40000));
    });
  });

  describe('getEffectiveCTRate', () => {
    it('should return correct effective rate', () => {
      expect(getEffectiveCTRate(40000)).toBe(0.19);
      expect(getEffectiveCTRate(300000)).toBe(0.25);
      expect(getEffectiveCTRate(0)).toBe(0);
    });

    it('should return blended rate for marginal relief', () => {
      const rate = getEffectiveCTRate(150000);

      expect(rate).toBeGreaterThan(0.19);
      expect(rate).toBeLessThan(0.25);
    });
  });

  describe('CT_RATES constants', () => {
    it('should have correct 2023+ rates', () => {
      expect(CT_RATES.SMALL_PROFITS_RATE).toBe(0.19);
      expect(CT_RATES.SMALL_PROFITS_LIMIT).toBe(50000);
      expect(CT_RATES.MAIN_RATE).toBe(0.25);
      expect(CT_RATES.MAIN_RATE_LIMIT).toBe(250000);
      expect(CT_RATES.MARGINAL_RELIEF_FRACTION).toBe(3 / 200);
    });
  });
});
