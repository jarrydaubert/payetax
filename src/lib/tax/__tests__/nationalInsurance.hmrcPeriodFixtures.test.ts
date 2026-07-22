/**
 * HMRC per-period Class 1 NI fixtures on non-annual pay bases.
 *
 * What bug will this test find?
 * - CALC-DRIFT: the shared NI mechanics diverging from HMRC-published
 *   per-period figures on weekly, fortnightly, four-weekly and monthly bases
 * - ROUNDING: period-threshold or penny regressions in the payroll basis
 *
 * These expectations were originally anchored by the retired shadow
 * calculator in `payrollPeriodDeductions.ts`; they now exercise the shared
 * production mechanics directly (the engine's own monthly composition selects
 * rates via `getEmployeeClass1MonthSegments`, covered in
 * `nationalInsuranceVertical.test.ts`). The fortnightly and four-weekly rows
 * are HMRC data-linearity checks on the published weekly thresholds — no
 * production path composes NI on those period bases. The shadow's cumulative
 * income-tax expectations retired with it: cumulative PAYE is not a supported
 * route — the engine models a month-1 monthly estimate, and no production
 * code computes cumulative tax to date.
 *
 * Sources:
 * - https://www.gov.uk/government/publications/taxable-pay-tables-manual-method
 * - https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
 */

import {
  getClass1PeriodThresholds,
  getEmployeeClass1RateForPayDate,
  getPayDateForTaxPeriod,
  sliceClass1EmployeeEarnings,
  TAX_RATES,
} from '@/lib/tax';
import { roundToPence } from '../utils';

const TAX_YEAR = '2025-2026';
const NI_CATEGORY = 'A';

type PayrollPeriod = 'monthly' | 'weekly' | 'fortnightly' | 'fourWeekly';

/**
 * HMRC period thresholds: monthly and weekly are published directly; a
 * fortnight or four-week period uses the weekly threshold times the weeks in
 * the period, as the payroll basis has always derived them.
 */
function periodNIThresholds(period: PayrollPeriod): { primary: number; upper: number } {
  if (period === 'monthly' || period === 'weekly') {
    const thresholds = getClass1PeriodThresholds(TAX_YEAR, NI_CATEGORY, period);
    return { primary: thresholds.primary, upper: thresholds.upper };
  }

  const weekly = getClass1PeriodThresholds(TAX_YEAR, NI_CATEGORY, 'weekly');
  const weeks = period === 'fortnightly' ? 2 : 4;
  return { primary: weekly.primary * weeks, upper: weekly.upper * weeks };
}

function periodEmployeeNI(grossPay: number, period: PayrollPeriod, periodNumber: number): number {
  const thresholds = periodNIThresholds(period);
  const payDate = getPayDateForTaxPeriod(TAX_YEAR, period, periodNumber);

  return roundToPence(
    sliceClass1EmployeeEarnings(grossPay, {
      primaryThreshold: thresholds.primary,
      upperEarningsLimit: thresholds.upper,
      primaryRate: getEmployeeClass1RateForPayDate(TAX_YEAR, NI_CATEGORY, payDate),
      upperRate: TAX_RATES[TAX_YEAR].nationalInsurance.employee[NI_CATEGORY].upper.rate,
    }).employeeNI,
  );
}

describe('HMRC per-period Class 1 NI fixtures (2025-26, category A)', () => {
  it.each([
    ['basic-rate month', 3_000, 156.16],
    ['higher-rate month', 8_000, 327.5],
    ['taper-band month', 9_166.67, 350.83],
    ['additional-rate month', 20_000, 567.5],
  ] as const)('matches HMRC monthly NI for %s', (_name, grossPay, expected) => {
    expect(periodEmployeeNI(grossPay, 'monthly', 2)).toBe(expected);
  });

  it.each([
    ['weekly', 800, 44.64],
    ['fortnightly', 1_600, 89.28],
    ['fourWeekly', 3_200, 178.56],
  ] as const)('matches HMRC %s NI on the weekly-derived threshold basis', (period, gross, expected) => {
    expect(periodEmployeeNI(gross, period, 2)).toBe(expected);
  });
});
