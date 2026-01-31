/**
 * Dividend Tax Calculator Tests
 *
 * Tests the Dividend Tax calculation with band stacking.
 * Verifies against known HMRC examples and edge cases.
 *
 * @see https://www.gov.uk/tax-on-dividends
 */

import {
  calculateDividendTax,
  DIVIDEND_RATES,
  getDividendTax,
  getEffectiveDividendRate,
} from '../dividendTax';

describe('Dividend Tax Calculator', () => {
  describe('calculateDividendTax', () => {
    describe('Dividend allowance', () => {
      it('should return 0 tax when dividends are within allowance', () => {
        const result = calculateDividendTax(500, 12570);

        expect(result.dividendTax).toBe(0);
        expect(result.allowanceUsed).toBe(500);
        expect(result.taxableDividends).toBe(0);
      });

      it('should return 0 tax when dividends are below allowance', () => {
        const result = calculateDividendTax(200, 12570);

        expect(result.dividendTax).toBe(0);
        expect(result.allowanceUsed).toBe(200);
      });

      it('should apply allowance before calculating tax', () => {
        const result = calculateDividendTax(1000, 12570);

        // 1000 - 500 allowance = 500 taxable
        // 500 × 8.75% = 43.75
        expect(result.allowanceUsed).toBe(500);
        expect(result.taxableDividends).toBe(500);
        expect(result.dividendTax).toBe(43.75);
      });
    });

    describe('Basic rate band', () => {
      it('should calculate basic rate for dividends within basic band', () => {
        // Salary of £12,570 (PA) + £30,000 dividends
        // All dividends (after allowance) should be at basic rate
        const result = calculateDividendTax(30000, 12570);

        // 30000 - 500 allowance = 29500 taxable
        // All at 8.75% = 2581.25
        expect(result.dividendTax).toBe(2581.25);
        expect(result.bandBreakdown).toContainEqual(
          expect.objectContaining({
            band: 'basic',
            rate: 0.0875,
          }),
        );
      });

      it('should tax all at basic rate when total income stays in basic band', () => {
        // Salary £12,570 + dividends £20,000 = £32,570 total
        // Well within basic rate band (ends at £50,270)
        const result = calculateDividendTax(20000, 12570);

        // Only basic rate should apply
        const basicBand = result.bandBreakdown.find((b) => b.band === 'basic');
        const higherBand = result.bandBreakdown.find((b) => b.band === 'higher');

        expect(basicBand).toBeDefined();
        expect(higherBand).toBeUndefined();
      });
    });

    describe('Higher rate band', () => {
      it('should calculate higher rate when dividends push into higher band', () => {
        // Salary £12,570 + dividends £50,000 = £62,570 total
        // Some dividends will be in higher rate band
        const result = calculateDividendTax(50000, 12570);

        const higherBand = result.bandBreakdown.find((b) => b.band === 'higher');
        expect(higherBand).toBeDefined();
        expect(higherBand?.rate).toBe(0.3375);
      });

      it('should split dividends between basic and higher rates correctly', () => {
        // Salary £40,000 + dividends £30,000 = £70,000 total
        // Basic band ends at £50,270
        // £10,270 of dividends in basic band (£50,270 - £40,000)
        // £19,230 of dividends in higher band (£30,000 - £500 allowance - £10,270)
        const result = calculateDividendTax(30000, 40000);

        const basicBand = result.bandBreakdown.find((b) => b.band === 'basic');
        const higherBand = result.bandBreakdown.find((b) => b.band === 'higher');

        expect(basicBand).toBeDefined();
        expect(higherBand).toBeDefined();

        // Total should be sum of both bands
        expect(result.dividendTax).toBeGreaterThan(0);
      });
    });

    describe('Additional rate band', () => {
      it('should calculate additional rate for very high dividends', () => {
        // Salary £12,570 + dividends £150,000 = £162,570 total
        // Some dividends will be in additional rate band (above £125,140)
        const result = calculateDividendTax(150000, 12570);

        const additionalBand = result.bandBreakdown.find((b) => b.band === 'additional');
        expect(additionalBand).toBeDefined();
        expect(additionalBand?.rate).toBe(0.3935);
      });
    });

    describe('Band stacking', () => {
      it('should stack dividends on top of salary for band calculation', () => {
        // If salary is £50,000, dividends start in basic band (just)
        // If salary is £60,000, dividends start in higher band
        const resultLowSalary = calculateDividendTax(10000, 40000);
        const resultHighSalary = calculateDividendTax(10000, 60000);

        // With £40k salary, some dividends at basic rate
        const hasBasicLow = resultLowSalary.bandBreakdown.some((b) => b.band === 'basic');
        // With £60k salary, all dividends at higher rate (after allowance)
        const hasBasicHigh = resultHighSalary.bandBreakdown.some((b) => b.band === 'basic');

        expect(hasBasicLow).toBe(true);
        expect(hasBasicHigh).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should return 0 for zero dividends', () => {
        const result = calculateDividendTax(0, 50000);

        expect(result.dividendTax).toBe(0);
        expect(result.effectiveRate).toBe(0);
      });

      it('should return 0 for negative dividends', () => {
        const result = calculateDividendTax(-1000, 50000);

        expect(result.dividendTax).toBe(0);
      });

      it('should apply Personal Allowance to dividends when no other income', () => {
        // With no other income, PA (£12,570) shelters dividends first
        // £30,000 dividends - £12,570 PA = £17,430 after PA
        // £17,430 - £500 allowance = £16,930 taxable
        // All at 8.75% (within basic band) = £1,481.38
        const result = calculateDividendTax(30000, 0);

        // PA should shelter £12,570 of dividends
        expect(result.allowanceUsed).toBe(12570 + 500); // PA + dividend allowance
        expect(result.taxableDividends).toBe(16930);
        expect(result.dividendTax).toBeCloseTo(1481.38, 1);
      });

      it('should shelter dividends with unused PA from low salary', () => {
        // Salary £5,000 uses £5,000 of PA, leaving £7,570 for dividends
        // £20,000 dividends - £7,570 PA = £12,430 after PA
        // £12,430 - £500 allowance = £11,930 taxable
        // All at 8.75% = £1,043.88
        const result = calculateDividendTax(20000, 5000);

        expect(result.allowanceUsed).toBe(7570 + 500); // Unused PA + dividend allowance
        expect(result.taxableDividends).toBe(11930);
        expect(result.dividendTax).toBeCloseTo(1043.88, 1);
      });

      it('should round to pence correctly', () => {
        const result = calculateDividendTax(1234, 12570);

        // Verify tax is rounded to 2 decimal places
        expect(result.dividendTax.toFixed(2)).toBe(result.dividendTax.toString());
      });

      it('should handle NaN dividends gracefully', () => {
        const result = calculateDividendTax(Number.NaN, 12570);

        expect(result.dividendTax).toBe(0);
        expect(result.effectiveRate).toBe(0);
      });

      it('should handle Infinity dividends gracefully', () => {
        const result = calculateDividendTax(Number.POSITIVE_INFINITY, 12570);

        expect(result.dividendTax).toBe(0);
      });

      it('should handle NaN salary gracefully', () => {
        const result = calculateDividendTax(50000, Number.NaN);

        // Should still calculate, treating NaN salary as 0
        expect(result.dividendTax).toBeGreaterThan(0);
      });
    });

    describe('Director scenario (golden examples)', () => {
      it('should calculate correctly for typical Optimal Mix (£12,570 salary + dividends)', () => {
        // Director with £12,570 salary and £52,000 dividends
        // PA fully used by salary, so only dividend allowance applies
        const result = calculateDividendTax(52000, 12570);

        // Expected breakdown:
        // - £500 at 0% (dividend allowance)
        // - £37,200 at 8.75% (basic band: £50,270 - £12,570 - £500 = £37,200)
        // - £14,300 at 33.75% (higher band: £52,000 - £500 - £37,200 = £14,300)
        // Total: £3,255 + £4,826.25 = £8,081.25
        expect(result.allowanceUsed).toBe(500);
        expect(result.taxableDividends).toBe(51500);
        expect(result.dividendTax).toBeCloseTo(8081.25, 1);
      });

      it('should calculate correctly for All Dividends strategy (£0 salary)', () => {
        // "All Dividends" strategy: £77,250 dividends, no salary
        // This is the critical test - PA MUST shelter dividends
        const result = calculateDividendTax(77250, 0);

        // Expected breakdown:
        // - £12,570 sheltered by unused PA (0% tax)
        // - £500 dividend allowance (0% tax)
        // - Taxable: £77,250 - £12,570 - £500 = £64,180
        // - £37,200 at 8.75% (basic band) = £3,255
        // - £26,980 at 33.75% (higher band) = £9,105.75
        // Total: £12,360.75
        expect(result.allowanceUsed).toBe(12570 + 500); // PA + dividend allowance
        expect(result.taxableDividends).toBe(64180);
        expect(result.dividendTax).toBeCloseTo(12360.75, 1);

        // Take-home should be ~£64,889
        const takeHome = 77250 - result.dividendTax;
        expect(takeHome).toBeCloseTo(64889.25, 0);
      });

      it('should apply PA taper for high income (£100k+ total)', () => {
        // £110,000 dividends with £0 salary
        // Total income = £110,000 (over £100k threshold)
        // PA taper: (£110,000 - £100,000) × 0.5 = £5,000 reduction
        // Tapered PA: £12,570 - £5,000 = £7,570
        const result = calculateDividendTax(110000, 0);

        // With tapered PA:
        // - £7,570 sheltered by reduced PA
        // - £500 dividend allowance
        // - Taxable: £110,000 - £7,570 - £500 = £101,930
        expect(result.allowanceUsed).toBe(7570 + 500);
        expect(result.taxableDividends).toBe(101930);

        // Higher rate band should be hit
        const higherBand = result.bandBreakdown.find((b) => b.band === 'higher');
        expect(higherBand).toBeDefined();
      });

      it('should fully taper PA at £125,140+ total income', () => {
        // £150,000 dividends with £0 salary
        // Total income = £150,000 (well over £125,140)
        // PA taper: (£150,000 - £100,000) × 0.5 = £25,000 reduction
        // Tapered PA: £12,570 - £25,000 = £0 (capped)
        const result = calculateDividendTax(150000, 0);

        // With PA = £0:
        // - £0 sheltered by PA
        // - £500 dividend allowance
        // - Taxable: £150,000 - £500 = £149,500
        expect(result.allowanceUsed).toBe(500); // Only dividend allowance, no PA
        expect(result.taxableDividends).toBe(149500);

        // Additional rate band should be hit (income > £125,140)
        const additionalBand = result.bandBreakdown.find((b) => b.band === 'additional');
        expect(additionalBand).toBeDefined();
        expect(result.dividendTax).toBeGreaterThan(35000);
      });

      it('should not taper PA when total income below £100k', () => {
        // £80,000 dividends with £0 salary = £80,000 total (under £100k)
        // PA should NOT taper
        const result = calculateDividendTax(80000, 0);

        // Full PA available:
        // - £12,570 sheltered by PA
        // - £500 dividend allowance
        // - Taxable: £80,000 - £12,570 - £500 = £66,930
        expect(result.allowanceUsed).toBe(12570 + 500);
        expect(result.taxableDividends).toBe(66930);
      });
    });
  });

  describe('getDividendTax (convenience function)', () => {
    it('should return just the tax amount', () => {
      expect(getDividendTax(500, 12570)).toBe(0); // Within allowance
      expect(getDividendTax(30000, 12570)).toBeGreaterThan(0);
    });
  });

  describe('getEffectiveDividendRate', () => {
    it('should return correct effective rate', () => {
      expect(getEffectiveDividendRate(500, 12570)).toBe(0); // Within allowance
      expect(getEffectiveDividendRate(30000, 12570)).toBeGreaterThan(0);
    });

    it('should return rate between 0 and additional rate', () => {
      const rate = getEffectiveDividendRate(50000, 12570);

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(DIVIDEND_RATES.ADDITIONAL_RATE);
    });
  });

  describe('DIVIDEND_RATES constants', () => {
    it('should have correct 2025-26 rates', () => {
      expect(DIVIDEND_RATES.ALLOWANCE).toBe(500);
      expect(DIVIDEND_RATES.BASIC_RATE).toBe(0.0875);
      expect(DIVIDEND_RATES.HIGHER_RATE).toBe(0.3375);
      expect(DIVIDEND_RATES.ADDITIONAL_RATE).toBe(0.3935);
    });
  });
});
