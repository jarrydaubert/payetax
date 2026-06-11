import {
  escapeHtml,
  formatTaxYearForEmail,
  generatePayeEmailHtml,
  generatePayeEmailText,
} from '@/lib/email/payeResultsEmail';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

const sampleResults: TaxCalculationResults = {
  grossSalary: {
    annually: 50000,
    monthly: 4166.67,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 961.54,
    daily: 192.31,
    hourly: 24.04,
  },
  taxFreeAmount: 12570,
  taxableIncome: 37430,
  incomeTax: {
    annually: 7486,
    monthly: 623.83,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 143.96,
    daily: 28.79,
    hourly: 3.6,
  },
  nationalInsurance: {
    annually: 3000,
    monthly: 250,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 57.69,
    daily: 11.54,
    hourly: 1.44,
  },
  studentLoan: {
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  pensionContribution: {
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  employerNI: 0,
  netPay: {
    annually: 39514,
    monthly: 3292.84,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 759.88,
    daily: 151.98,
    hourly: 19,
  },
  taxBands: [],
};

describe('payeResultsEmail', () => {
  test('escapeHtml escapes dangerous characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  test('formats long tax years for email display', () => {
    expect(formatTaxYearForEmail('2025-2026')).toBe('2025-26');
  });

  test('HTML template escapes interpolated tax year', () => {
    const html = generatePayeEmailHtml(sampleResults, `<img src=x onerror=alert(1)>`);

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
  });

  test('HTML template follows the Ledger email styling', () => {
    const html = generatePayeEmailHtml(sampleResults, '2026-27');

    expect(html).toContain('#f8f5ed');
    expect(html).toContain('#123a66');
    expect(html).toContain('@media only screen');
    expect(html).toContain('font-variant-numeric: tabular-nums');
    expect(html).not.toContain('linear-gradient');
    expect(html).not.toContain('#06b6d4');
    expect(html).not.toContain('#10b981');
    expect(html).not.toContain('#0d9488');
  });

  test('text template omits zero-value optional deductions', () => {
    const text = generatePayeEmailText(sampleResults, '2025-26');

    expect(text).not.toContain('Pension:');
    expect(text).not.toContain('Student Loan:');
    expect(text).toContain('TAKE-HOME PAY:');
  });
});
