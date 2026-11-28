import { projectDirectorFinancials } from '@/lib/directorFinancialPresentation';
import {
  escapeHtml,
  generateDirectorEmailHtml,
  generateDirectorEmailText,
} from '@/lib/email/directorResultsEmail';
import { calculateStrategyComparison } from '@/lib/tax';
import {
  consultancy,
  recruiter,
  referenceTaxYear,
} from '@/test/directorReferenceFixtures/referenceCompanies';

describe('directorResultsEmail', () => {
  test('personal reserve excludes payroll NI while deduction totals retain it', () => {
    const comparison = calculateStrategyComparison(
      { ...consultancy.input, includesVat: false, studentLoanPlans: ['plan2'] },
      referenceTaxYear,
    );
    const strategy = comparison.strategies.allSalary;
    const args = {
      strategyName: strategy.name,
      financials: projectDirectorFinancials(comparison.grossProfit, strategy),
      savingsVsAllSalary: 0,
      taxYear: referenceTaxYear,
    };
    const html = generateDirectorEmailHtml(args);
    // B's documented one-penny Income Tax observation applies here too.
    // £15,518.96 Income Tax + £3,674.92 loan = £19,193.88 budget.
    // Adding £3,414.95 employee NI gives £22,608.83 personal deductions.
    expect(html).toMatch(/Personal tax and loan budget<\/td>\s*<td[^>]*>£19,193\.88<\/td>/);
    expect(html).toMatch(/Personal deductions<\/td>\s*<td[^>]*>£22,608\.83<\/td>/);
    const text = generateDirectorEmailText(args);
    expect(text).toContain('Employee NI: £3,414.95');
    expect(text).toContain('Personal tax and loan budget: £19,193.88');
    expect(text).toContain('Annual Take-Home: £47,608.56');
  });

  test('escapeHtml escapes dangerous characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  test('HTML template escapes strategy.name (prevents injection)', () => {
    const comparison = calculateStrategyComparison(
      { ...recruiter.input, includesVat: false },
      '2025-2026',
    );
    const html = generateDirectorEmailHtml({
      strategyName: '<img src=x onerror=alert(1)>',
      financials: projectDirectorFinancials(
        comparison.grossProfit,
        comparison.strategies.allSalary,
      ),
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
