import { getStudentLoanRepayment, getStudentLoanThreshold } from '../studentLoan';

describe('Student Loan Calculator', () => {
  const taxYear = '2025-2026';
  const previousTaxYear = '2024-2025';

  describe('getStudentLoanRepayment', () => {
    it('returns zero for empty plans array', () => {
      const result = getStudentLoanRepayment(50000, [], taxYear);
      expect(result.total).toBe(0);
    });

    it('returns zero for income below threshold', () => {
      // Plan 2 threshold is £28,470
      const result = getStudentLoanRepayment(25000, ['plan2'], taxYear);
      expect(result.total).toBe(0);
      expect(result.plan2).toBe(0);
    });

    it('calculates Plan 2 correctly for director with salary + dividends', () => {
      // Director with £12,570 salary + £35,000 dividends = £47,570 total
      // Plan 2: 9% of (£47,570 - £28,470) = 9% of £19,100 = £1,719
      const result = getStudentLoanRepayment(47570, ['plan2'], taxYear);
      expect(result.plan2).toBe(1719);
      expect(result.total).toBe(1719);
    });

    it('calculates Plan 1 correctly', () => {
      // Plan 1 threshold is £26,065
      // 9% of (£50,000 - £26,065) = 9% of £23,935 = £2,154.15
      const result = getStudentLoanRepayment(50000, ['plan1'], taxYear);
      expect(result.plan1).toBeCloseTo(2154.15, 2);
      expect(result.total).toBeCloseTo(2154.15, 2);
    });

    it('calculates postgrad loan at 6%', () => {
      // Postgrad threshold is £21,000
      // 6% of (£50,000 - £21,000) = 6% of £29,000 = £1,740
      const result = getStudentLoanRepayment(50000, ['postgrad'], taxYear);
      expect(result.postgrad).toBe(1740);
      expect(result.total).toBe(1740);
    });

    it('calculates multiple loans together', () => {
      // Plan 2: 9% of (£60,000 - £28,470) = £2,837.70
      // Postgrad: 6% of (£60,000 - £21,000) = £2,340
      // Total: £5,177.70
      const result = getStudentLoanRepayment(60000, ['plan2', 'postgrad'], taxYear);
      expect(result.plan2).toBeCloseTo(2837.7, 2);
      expect(result.postgrad).toBeCloseTo(2340, 2);
      expect(result.total).toBeCloseTo(5177.7, 2);
    });

    it('handles zero income', () => {
      const result = getStudentLoanRepayment(0, ['plan2'], taxYear);
      expect(result.total).toBe(0);
    });

    it('handles negative income', () => {
      const result = getStudentLoanRepayment(-5000, ['plan2'], taxYear);
      expect(result.total).toBe(0);
    });
  });

  describe('getStudentLoanThreshold', () => {
    it('returns correct thresholds for 2025-26', () => {
      expect(getStudentLoanThreshold('plan1', taxYear)).toBe(26065);
      expect(getStudentLoanThreshold('plan2', taxYear)).toBe(28470);
      expect(getStudentLoanThreshold('plan4', taxYear)).toBe(32745);
      expect(getStudentLoanThreshold('postgrad', taxYear)).toBe(21000);
    });

    it('returns the corrected Plan 4 threshold for 2024-25', () => {
      expect(getStudentLoanThreshold('plan4', previousTaxYear)).toBe(31395);
    });
  });

  describe('2024-25 Plan 4 regression', () => {
    it('does not repay at the threshold and starts above it', () => {
      const atThreshold = getStudentLoanRepayment(31395, ['plan4'], previousTaxYear);
      const aboveThreshold = getStudentLoanRepayment(31396, ['plan4'], previousTaxYear);

      expect(atThreshold.plan4).toBe(0);
      expect(atThreshold.total).toBe(0);
      expect(aboveThreshold.plan4).toBeCloseTo(0.09, 2);
      expect(aboveThreshold.total).toBeCloseTo(0.09, 2);
    });
  });

  describe('Integration with director scenarios', () => {
    it('correctly calculates student loan on £12,570 salary + dividends', () => {
      // Typical director: £12,570 salary, £40,000 dividends = £52,570 total
      // Plan 2: 9% of (£52,570 - £28,470) = 9% of £24,100 = £2,169
      const result = getStudentLoanRepayment(52570, ['plan2'], taxYear);
      expect(result.plan2).toBe(2169);
    });

    it('shows dividend income IS subject to student loans via SA', () => {
      // If someone thought dividends avoid student loans, they'd expect £0
      // But dividends DO count via Self Assessment
      const totalIncome = 12570 + 50000; // salary + dividends
      const result = getStudentLoanRepayment(totalIncome, ['plan2'], taxYear);
      expect(result.plan2).toBeGreaterThan(0);
      // 9% of (£62,570 - £28,470) = 9% of £34,100 = £3,069
      expect(result.plan2).toBe(3069);
    });
  });
});
