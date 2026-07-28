/**
 * Invariants for the effective-dated tax-policy model.
 *
 * These enforce, at runtime, the units and bases that the schema types document,
 * the completeness of every supported year, and the ordering/non-overlap of
 * within-year (effective-dated) changes. They are the guardrail that keeps the
 * "one coherent policy model" honest as the data evolves.
 */

import { getCorporationTax } from '@/lib/tax/corporationTax';
import {
  getEmployeeClass1MonthSegments,
  getEmployeeClass1RateForPayDate,
} from '@/lib/tax/nationalInsurance';
import {
  CORPORATION_TAX_RATES,
  CT_RATES,
  CURRENT_TAX_YEAR,
  DIVIDEND_TAX_RATES,
  type NICategory,
  PAYMENTS_ON_ACCOUNT,
  PAYROLL_PERIOD_THRESHOLDS,
  PENSION_ALLOWANCES,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEARS,
  type TaxYear,
} from '../taxRates';

const NI_CATEGORIES: NICategory[] = ['A', 'B', 'C', 'H', 'J', 'M', 'Z'];

function taxYearStart(taxYear: TaxYear): Date {
  const startYear = Number.parseInt(taxYear.slice(0, 4), 10);
  return new Date(Date.UTC(startYear, 3, 6)); // 6 April
}
function taxYearEnd(taxYear: TaxYear): Date {
  const startYear = Number.parseInt(taxYear.slice(0, 4), 10);
  return new Date(Date.UTC(startYear + 1, 3, 6)); // next 6 April (exclusive)
}

const isPercentRate = (r: number) => Number.isFinite(r) && r >= 0 && r <= 100;
const isFractionRate = (r: number) => Number.isFinite(r) && r > 0 && r < 1;
const isNonNegMoney = (m: number) => Number.isFinite(m) && m >= 0;

interface PrimaryRateChangeCase {
  year: TaxYear;
  cat: NICategory;
  effectiveFrom: string;
  before: number;
  after: number;
}

function buildPrimaryRateChangeCases(
  year: TaxYear,
  cat: NICategory,
  openingRate: number,
  changes: readonly { effectiveFrom: string; rate: number }[],
): PrimaryRateChangeCase[] {
  return changes.map((change, index) => ({
    year,
    cat,
    effectiveFrom: change.effectiveFrom,
    before: index === 0 ? openingRate : (changes[index - 1]?.rate ?? openingRate),
    after: change.rate,
  }));
}

describe('effective-dated tax-policy model', () => {
  describe('every supported year is present in every record', () => {
    it.each(TAX_YEARS)('has a complete rUK + Scottish + ancillary record for %s', (year) => {
      expect(TAX_RATES[year]).toBeDefined();
      expect(SCOTTISH_TAX_RATES[year]).toBeDefined();
      expect(DIVIDEND_TAX_RATES[year]).toBeDefined();
      expect(CORPORATION_TAX_RATES[year]).toBeDefined();
      expect(PENSION_ALLOWANCES[year]).toBeDefined();
      expect(PAYMENTS_ON_ACCOUNT[year]).toBeDefined();
      expect(PAYROLL_PERIOD_THRESHOLDS[year]).toBeDefined();
    });

    it.each(TAX_YEARS)('has all NI categories for %s', (year) => {
      for (const cat of NI_CATEGORIES) {
        expect(TAX_RATES[year].nationalInsurance.employee[cat]).toBeDefined();
        expect(TAX_RATES[year].nationalInsurance.employer[cat]).toBeDefined();
      }
    });
  });

  describe('unit invariants (percent-int vs fraction)', () => {
    it.each(
      TAX_YEARS,
    )('rUK/Scottish band + NI + student-loan rates are percentages in %s', (year) => {
      const ruk = TAX_RATES[year];
      for (const band of ruk.bands) expect(isPercentRate(band.rate)).toBe(true);
      for (const band of SCOTTISH_TAX_RATES[year].bands)
        expect(isPercentRate(band.rate)).toBe(true);
      for (const cat of NI_CATEGORIES) {
        const emp = ruk.nationalInsurance.employee[cat];
        expect(isPercentRate(emp.primary.rate)).toBe(true);
        expect(isPercentRate(emp.upper.rate)).toBe(true);
        expect(isPercentRate(ruk.nationalInsurance.employer[cat].secondary.rate)).toBe(true);
        for (const change of emp.primaryRateChanges ?? [])
          expect(isPercentRate(change.rate)).toBe(true);
        if (emp.directorsPrimaryRate !== undefined)
          expect(isPercentRate(emp.directorsPrimaryRate)).toBe(true);
      }
      expect(isPercentRate(ruk.nationalInsurance.class1A.rate)).toBe(true);
      for (const plan of Object.values(ruk.studentLoan))
        expect(isPercentRate(plan.rate)).toBe(true);
    });

    it.each(TAX_YEARS)('dividend + Corporation Tax rates are fractions in %s', (year) => {
      const d = DIVIDEND_TAX_RATES[year];
      expect(isFractionRate(d.BASIC_RATE)).toBe(true);
      expect(isFractionRate(d.HIGHER_RATE)).toBe(true);
      expect(isFractionRate(d.ADDITIONAL_RATE)).toBe(true);
      const ct = CORPORATION_TAX_RATES[year];
      expect(isFractionRate(ct.SMALL_PROFITS_RATE)).toBe(true);
      expect(isFractionRate(ct.MAIN_RATE)).toBe(true);
      expect(isFractionRate(ct.MARGINAL_RELIEF_FRACTION)).toBe(true);
    });
  });

  describe('basis invariants', () => {
    it.each(
      TAX_YEARS,
    )('band thresholds are ascending taxable-income bounds with an open top in %s', (year) => {
      for (const bands of [TAX_RATES[year].bands, SCOTTISH_TAX_RATES[year].bands]) {
        for (let i = 1; i < bands.length; i += 1) {
          expect((bands[i]?.threshold ?? 0) > (bands[i - 1]?.threshold ?? 0)).toBe(true);
        }
        expect(bands[bands.length - 1]?.threshold).toBe(Number.POSITIVE_INFINITY);
      }
    });

    it.each(
      TAX_YEARS,
    )('published NI period thresholds are present and not naive annual/12 in %s', (year) => {
      const period = PAYROLL_PERIOD_THRESHOLDS[year];
      for (const p of [period.weekly, period.monthly]) {
        expect(isNonNegMoney(p.niPrimary)).toBe(true);
        expect(isNonNegMoney(p.niUpper)).toBe(true);
        expect(isNonNegMoney(p.payeFreePay)).toBe(true);
      }
      // Published monthly PT (1048) is deliberately not the annual PT / 12 (1047.5):
      // this asserts the value is a published period figure, not a projection.
      const annualPrimary = TAX_RATES[year].nationalInsurance.employee.A.primary.threshold;
      expect(period.monthly.niPrimary).not.toBe(annualPrimary / 12);
    });
  });

  describe('effective-dated changes: ordering, non-overlap, within-year', () => {
    it.each(
      TAX_YEARS,
    )('primaryRateChanges are ISO, ascending, within %s, and pair with a directors rate', (year) => {
      const start = taxYearStart(year).getTime();
      const end = taxYearEnd(year).getTime();
      for (const cat of NI_CATEGORIES) {
        const emp = TAX_RATES[year].nationalInsurance.employee[cat];
        const changes = emp.primaryRateChanges ?? [];
        if (changes.length === 0) continue;

        // A mid-year change must publish a blended annual (directors) rate.
        expect(emp.directorsPrimaryRate).toBeDefined();

        let previous = -Infinity;
        for (const change of changes) {
          expect(change.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          const t = new Date(`${change.effectiveFrom}T00:00:00Z`).getTime();
          expect(Number.isNaN(t)).toBe(false);
          expect(t).toBeGreaterThan(start); // after 6 April
          expect(t).toBeLessThan(end); // before next 6 April
          expect(t).toBeGreaterThan(previous); // strictly ascending, non-overlapping
          previous = t;
        }
      }
    });
  });

  describe('both sides of every existing mid-year NI change select correctly', () => {
    // Data-driven: derive the (year, category, change) triples from the model so
    // this stays correct as data evolves.
    const midYearCases: PrimaryRateChangeCase[] = [];
    for (const year of TAX_YEARS) {
      for (const cat of NI_CATEGORIES) {
        const emp = TAX_RATES[year].nationalInsurance.employee[cat];
        midYearCases.push(
          ...buildPrimaryRateChangeCases(year, cat, emp.primary.rate, emp.primaryRateChanges ?? []),
        );
      }
    }

    it('has at least one mid-year change to exercise (2023-24 NI cut)', () => {
      expect(midYearCases.length).toBeGreaterThan(0);
    });

    it('uses each previous change rate before later changes without mutating production policy', () => {
      const syntheticChanges = [
        { effectiveFrom: '2025-07-01', rate: 10 },
        { effectiveFrom: '2026-01-01', rate: 8 },
      ] as const;

      expect(buildPrimaryRateChangeCases('2025-2026', 'A', 12, syntheticChanges)).toEqual([
        {
          year: '2025-2026',
          cat: 'A',
          effectiveFrom: '2025-07-01',
          before: 12,
          after: 10,
        },
        {
          year: '2025-2026',
          cat: 'A',
          effectiveFrom: '2026-01-01',
          before: 10,
          after: 8,
        },
      ]);
      expect(syntheticChanges).toEqual([
        { effectiveFrom: '2025-07-01', rate: 10 },
        { effectiveFrom: '2026-01-01', rate: 8 },
      ]);
    });

    it.each(
      midYearCases,
    )('$year cat $cat: rate is $before before $effectiveFrom and $after on/after', ({
      year,
      cat,
      effectiveFrom,
      before,
      after,
    }) => {
      const change = new Date(`${effectiveFrom}T00:00:00Z`);
      const dayBefore = new Date(change.getTime() - 24 * 60 * 60 * 1000);
      expect(getEmployeeClass1RateForPayDate(year, cat, dayBefore)).toBe(before);
      expect(getEmployeeClass1RateForPayDate(year, cat, change)).toBe(after);

      // Segments cover exactly 12 months and use both rates.
      const segments = getEmployeeClass1MonthSegments(year, cat);
      expect(segments.reduce((sum, s) => sum + s.months, 0)).toBe(12);
      const rates = segments.map((s) => s.rate);
      expect(rates).toContain(before);
      expect(rates).toContain(after);
    });

    it('single-rate years return one 12-month segment (reduces to the old arithmetic)', () => {
      const segments = getEmployeeClass1MonthSegments('2025-2026', 'A');
      expect(segments).toEqual([
        { rate: TAX_RATES['2025-2026'].nationalInsurance.employee.A.primary.rate, months: 12 },
      ]);
    });
  });

  describe('moved statutory values are unchanged (parity)', () => {
    it('Corporation Tax: current-year alias mirrors the per-year record', () => {
      expect(CT_RATES).toBe(CORPORATION_TAX_RATES[CURRENT_TAX_YEAR]);
      expect(CT_RATES).toEqual({
        SMALL_PROFITS_RATE: 0.19,
        SMALL_PROFITS_LIMIT: 50_000,
        MAIN_RATE: 0.25,
        MAIN_RATE_LIMIT: 250_000,
        MARGINAL_RELIEF_FRACTION: 3 / 200,
      });
    });

    it('Corporation Tax is year-aware yet identical across all supported years', () => {
      const profits = [40_000, 100_000, 300_000];
      for (const profit of profits) {
        const values = TAX_YEARS.map((y) => getCorporationTax(profit, y));
        expect(new Set(values).size).toBe(1);
      }
    });

    it('Pension allowances hold the expected statutory values', () => {
      expect(PENSION_ALLOWANCES[CURRENT_TAX_YEAR]).toEqual({
        annualAllowance: 60_000,
        adjustedIncomeTaperThreshold: 260_000,
        minimumTaperedAllowance: 10_000,
        moneyPurchaseAnnualAllowance: 10_000,
        taperRate: 0.5,
      });
    });

    it('Payments on Account hold the expected statutory values', () => {
      expect(PAYMENTS_ON_ACCOUNT[CURRENT_TAX_YEAR]).toEqual({
        threshold: 1_000,
        advanceMultiplier: 1.5,
      });
    });
  });
});
