// src/store/__tests__/calculatorStore.integration.test.ts
/**
 * Integration tests for calculatorStore using REAL calculateTax function.
 * These tests verify the store correctly integrates with tax calculations.
 * No mocking - catches issues where store passes wrong inputs to calculateTax.
 */

import { useCalculatorStore } from '../calculatorStore';

// NO MOCKING - uses real calculateTax

describe('CalculatorStore Integration', () => {
  beforeEach(() => {
    useCalculatorStore.getState().reset();
  });

  describe('Real Tax Calculations', () => {
    it('should produce correct tax for £50k salary', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(50000);
      calculate();

      const state = useCalculatorStore.getState();

      // Verify real calculation results
      // £50k: Tax = (£50,000 - £12,570) × 20% = £7,486
      // NI = (£50,000 - £12,570) × 8% = £2,994.40
      expect(state.results).not.toBeNull();
      expect(state.results?.incomeTax.annually).toBeCloseTo(7486, 0);
      expect(state.results?.nationalInsurance.annually).toBeCloseTo(2994.4, 0);
      expect(state.results?.netPay.annually).toBeCloseTo(39519.6, 0);
    });

    it('should produce correct tax for £30k salary', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(30000);
      calculate();

      const state = useCalculatorStore.getState();

      // £30k: Tax = (£30,000 - £12,570) × 20% = £3,486
      // NI = (£30,000 - £12,570) × 8% = £1,394.40
      expect(state.results?.incomeTax.annually).toBeCloseTo(3486, 0);
      expect(state.results?.nationalInsurance.annually).toBeCloseTo(1394.4, 0);
      expect(state.results?.netPay.annually).toBeCloseTo(25119.6, 0);
    });

    it('should handle higher rate taxpayer at £60k', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(60000);
      calculate();

      const state = useCalculatorStore.getState();

      // £60k crosses into 40% band at £50,270
      // Basic: (£50,270 - £12,570) × 20% = £7,540
      // Higher: (£60,000 - £50,270) × 40% = £3,892
      // Total tax: £11,432
      // NI: 8% up to upper earnings limit, 2% above
      expect(state.results?.incomeTax.annually).toBeCloseTo(11432, 0);
      expect(state.results?.nationalInsurance.annually).toBeCloseTo(3210.6, 0);
    });

    it('should handle Scottish tax rates when isScottish is true', () => {
      const { setSalary, setIsScottish, calculate } = useCalculatorStore.getState();

      setSalary(50000);
      setIsScottish(true);
      calculate();

      const state = useCalculatorStore.getState();

      // Scottish rates are different - just verify calculation runs and differs from England
      expect(state.results).not.toBeNull();
      expect(state.results?.incomeTax.annually).not.toBe(7486); // Should differ from England
    });

    it('should apply pension contribution correctly', () => {
      const { setSalary, setPensionContribution, calculate } = useCalculatorStore.getState();

      setSalary(50000);
      setPensionContribution(5); // 5%
      calculate();

      const state = useCalculatorStore.getState();

      // 5% of £50k = £2,500 pension
      // Taxable income reduced, so less tax
      expect(state.results?.pensionContribution.annually).toBeCloseTo(2500, 0);
      expect(state.results?.incomeTax.annually).toBeLessThan(7486); // Less than without pension
    });

    it('should handle student loan Plan 2', () => {
      const { setSalary, setStudentLoanPlans, calculate } = useCalculatorStore.getState();

      setSalary(35000);
      setStudentLoanPlans(['plan2']); // Must be array
      calculate();

      const state = useCalculatorStore.getState();

      // Plan 2 threshold: £28,470 (2025-26), 9% above
      // (£35,000 - £28,470) × 9% = £587.70
      expect(state.results?.studentLoan.annually).toBeGreaterThan(0);
      expect(state.results?.studentLoan.annually).toBeCloseTo(587.7, 0);
    });

    it('should calculate previous year comparison', () => {
      const { setSalary, calculate, calculatePreviousYear } = useCalculatorStore.getState();

      setSalary(50000);
      calculate();
      calculatePreviousYear();

      const state = useCalculatorStore.getState();

      expect(state.previousYearResults).not.toBeNull();
      // Previous year may have different thresholds
      expect(state.previousYearResults?.grossSalary.annually).toBe(50000);
    });

    it('should calculate What If scenario with real values', () => {
      const { setSalary, calculate, toggleWhatIf, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(50000);
      calculate();
      toggleWhatIf();
      setWhatIfValue(20); // 20% raise
      calculateWhatIf();

      const state = useCalculatorStore.getState();

      expect(state.whatIfResults).not.toBeNull();
      // 20% of £50k = £60k
      expect(state.whatIfResults?.grossSalary.annually).toBe(60000);
      // Should have higher tax due to higher rate band
      expect(state.whatIfResults?.incomeTax.annually).toBeGreaterThan(
        state.results?.incomeTax.annually ?? 0
      );
    });
  });

  describe('Edge Cases with Real Calculator', () => {
    it('should handle £0 salary', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(0);
      calculate();

      const state = useCalculatorStore.getState();

      expect(state.results?.incomeTax.annually).toBe(0);
      expect(state.results?.nationalInsurance.annually).toBe(0);
      expect(state.results?.netPay.annually).toBe(0);
    });

    it('should handle salary at personal allowance threshold', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(12570);
      calculate();

      const state = useCalculatorStore.getState();

      // Exactly at PA = no tax
      expect(state.results?.incomeTax.annually).toBe(0);
    });

    it('should handle £100k tax trap correctly', () => {
      const { setSalary, calculate } = useCalculatorStore.getState();

      setSalary(110000);
      calculate();

      const state = useCalculatorStore.getState();

      // At £110k, PA is reduced by (£110k - £100k) / 2 = £5,000
      // Effective PA = £12,570 - £5,000 = £7,570
      // This creates effective 60% marginal rate
      expect(state.results).not.toBeNull();
      expect(state.results?.incomeTax.annually).toBeGreaterThan(30000);
    });
  });
});
