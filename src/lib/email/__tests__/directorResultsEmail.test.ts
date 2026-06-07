import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import {
  escapeHtml,
  generateDirectorEmailHtml,
  getDirectorEmailThresholds,
} from '@/lib/email/directorResultsEmail';
import type { DirectorStrategy } from '@/lib/validation/emailValidation';

describe('directorResultsEmail', () => {
  test('escapeHtml escapes dangerous characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  test('thresholds are sourced from taxRates.ts (no drift)', () => {
    const t = getDirectorEmailThresholds('2025-26');
    const rates = TAX_RATES['2025-2026'];

    expect(t.personalAllowance).toBe(rates.personalAllowance);
    expect(t.basicRateLimit).toBe(rates.personalAllowance + rates.bands[0].threshold);
    expect(t.niPrimaryThreshold).toBe(rates.nationalInsurance.employee.A.primary.threshold);
    expect(t.employerNiThreshold).toBe(rates.nationalInsurance.employer.A.secondary.threshold);
    expect(t.dividendAllowance).toBe(rates.dividendAllowance);
  });

  test('thresholds default to the current tax year', () => {
    const thresholds = getDirectorEmailThresholds();
    const rates = TAX_RATES[CURRENT_TAX_YEAR];

    expect(thresholds.taxYear).toBe(CURRENT_TAX_YEAR);
    expect(thresholds.personalAllowance).toBe(rates.personalAllowance);
  });

  test('HTML template escapes strategy.name (prevents injection)', () => {
    const strategy: DirectorStrategy = {
      name: `<img src=x onerror=alert(1)>`,
      salary: 0,
      dividends: 0,
      pension: 0,
      companyCarBIK: 0,
      employerNI: 0,
      employeeNI: 0,
      incomeTax: 0,
      corporationTax: 0,
      dividendTax: 0,
      studentLoan: 0,
      totalPersonalTax: 0,
      companyCost: 0,
      takeHome: 0,
      effectiveRate: 0,
    };

    const html = generateDirectorEmailHtml({
      grossProfit: 0,
      strategies: { allSalary: strategy, optimalMix: strategy, allDividends: strategy },
      recommended: 'optimalMix',
      savingsVsAllSalary: 0,
      taxYear: '2025-26',
      generatedDate: '2 Feb 2026',
    });

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('linear-gradient');
    expect(html).not.toContain('#06b6d4');
    expect(html).not.toContain('#10b981');
    expect(html).toContain('#f8f5ed');
    expect(html).toContain('#123a66');
    expect(html).toContain('@media only screen');
    expect(html).toContain('font-variant-numeric: tabular-nums');
    expect(html).toContain('Recalculate in Director Intelligence');

    // Deadline should be derived from tax year (2025-26 => 31 Jan 2027).
    expect(html).toContain('31 January 2027');
  });
});
