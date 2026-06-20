import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import {
  CRAWLABLE_SALARY_EXAMPLE_AMOUNTS,
  getCrawlableSalaryExamples,
  getCrawlableTaxFacts,
  getCrawlableTaxFactsMarkdown,
} from '@/lib/crawlableTaxFacts';
import { calculateTax } from '@/lib/taxCalculator';

describe('crawlableTaxFacts', () => {
  it('builds take-home examples from the PAYE calculator engine', () => {
    const examples = getCrawlableSalaryExamples(CURRENT_TAX_YEAR);

    expect(examples.map((example) => example.salary)).toEqual([
      ...CRAWLABLE_SALARY_EXAMPLE_AMOUNTS,
    ]);

    for (const example of examples) {
      const results = calculateTax({
        salary: example.salary,
        payPeriod: 'annually',
        taxYear: CURRENT_TAX_YEAR,
        taxCode: '1257L',
        isScottish: false,
        isMarried: false,
        partnerGrossWage: 0,
        isBlind: false,
        payNoNI: false,
        pensionContribution: 0,
        pensionContributionType: 'percentage',
        studentLoanPlans: 'none',
        niCategory: 'A',
        hoursPerWeek: 37.5,
      });

      expect(example.incomeTax).toBe(Math.round(results.incomeTax.annually));
      expect(example.nationalInsurance).toBe(Math.round(results.nationalInsurance.annually));
      expect(example.annualTakeHome).toBe(Math.round(results.netPay.annually));
      expect(example.monthlyTakeHome).toBe(Math.round(results.netPay.monthly));
      expect(example.summary).toContain(example.annualTakeHomeLabel);
    }
  });

  it('exposes rate bands and student loan thresholds from current tax constants', () => {
    const facts = getCrawlableTaxFacts(CURRENT_TAX_YEAR);
    const currentRates = TAX_RATES[CURRENT_TAX_YEAR];

    expect(facts.taxYear).toBe(CURRENT_TAX_YEAR);
    expect(facts.restOfUkIncomeTaxBands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          band: 'Personal allowance',
          range: `£0 to £${currentRates.personalAllowance.toLocaleString('en-GB')}`,
          rate: '0%',
        }),
        expect.objectContaining({ band: 'Basic rate', rate: '20%' }),
      ]),
    );
    expect(facts.employeeNiBands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          band: 'Employee NI category A primary rate',
          rate: `${currentRates.nationalInsurance.employee.A.primary.rate}%`,
        }),
      ]),
    );
    expect(facts.studentLoanRates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          plan: 'Plan 1',
          threshold: `£${currentRates.studentLoan.plan1.threshold.toLocaleString('en-GB')}`,
        }),
      ]),
    );
  });

  it('renders compact markdown for llms.txt', () => {
    const markdown = getCrawlableTaxFactsMarkdown(CURRENT_TAX_YEAR);
    const firstExample = getCrawlableSalaryExamples(CURRENT_TAX_YEAR)[0];

    expect(markdown).toContain('## Citable PAYE Rates and Take-Home Examples');
    expect(markdown).toContain('Machine-readable dataset: /api/tax-rates');
    expect(markdown).not.toContain('/#tax-rates-and-take-home');
    expect(markdown).toContain(firstExample?.summary);
  });
});
