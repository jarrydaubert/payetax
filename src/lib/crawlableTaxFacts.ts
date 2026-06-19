import {
  CURRENT_TAX_YEAR,
  formatTaxYearDisplay,
  SCOTTISH_TAX_RATES,
  TAX_RATES,
  TAX_YEAR_SOURCES,
  type TaxYear,
} from '@/constants/taxRates';
import { calculateTax } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

export const CRAWLABLE_SALARY_EXAMPLE_AMOUNTS = [
  20_000, 25_000, 30_000, 40_000, 50_000, 60_000, 80_000, 100_000,
] as const;

export interface CrawlableSalaryExample {
  salary: number;
  salaryLabel: string;
  incomeTax: number;
  incomeTaxLabel: string;
  nationalInsurance: number;
  nationalInsuranceLabel: string;
  annualTakeHome: number;
  annualTakeHomeLabel: string;
  monthlyTakeHome: number;
  monthlyTakeHomeLabel: string;
  summary: string;
}

export interface CrawlableRateBand {
  band: string;
  range: string;
  rate: string;
}

export interface CrawlableStudentLoanRate {
  plan: string;
  threshold: string;
  rate: string;
}

export interface CrawlableTaxFacts {
  taxYear: TaxYear;
  taxYearLabel: string;
  taxYearLongLabel: string;
  taxYearDateRange: string;
  ratesVerifiedOn: string;
  assumptions: string;
  salaryExamples: CrawlableSalaryExample[];
  restOfUkIncomeTaxBands: CrawlableRateBand[];
  scottishIncomeTaxBands: CrawlableRateBand[];
  employeeNiBands: CrawlableRateBand[];
  studentLoanRates: CrawlableStudentLoanRate[];
  sourceUrls: string[];
}

function money(amount: number): string {
  return formatCurrency(amount, 0);
}

function percent(rate: number): string {
  return `${rate}%`;
}

function boundedRange(start: number, end: number): string {
  return `${money(start)} to ${money(end)}`;
}

function overRange(threshold: number): string {
  return `Over ${money(threshold)}`;
}

function taxYearDateRange(taxYear: TaxYear): string {
  const [startYear, endYear] = taxYear.split('-');
  if (!(startYear && endYear)) return taxYear;
  return `6 April ${startYear} to 5 April ${endYear}`;
}

export function getCrawlableSalaryExamples(
  taxYear: TaxYear = CURRENT_TAX_YEAR,
): CrawlableSalaryExample[] {
  return CRAWLABLE_SALARY_EXAMPLE_AMOUNTS.map((salary) => {
    const results = calculateTax({
      salary,
      payPeriod: 'annually',
      taxYear,
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

    const incomeTax = Math.round(results.incomeTax.annually);
    const nationalInsurance = Math.round(results.nationalInsurance.annually);
    const annualTakeHome = Math.round(results.netPay.annually);
    const monthlyTakeHome = Math.round(results.netPay.monthly);
    const salaryLabel = money(salary);
    const annualTakeHomeLabel = money(annualTakeHome);
    const monthlyTakeHomeLabel = money(monthlyTakeHome);
    const incomeTaxLabel = money(incomeTax);
    const nationalInsuranceLabel = money(nationalInsurance);

    return {
      salary,
      salaryLabel,
      incomeTax,
      incomeTaxLabel,
      nationalInsurance,
      nationalInsuranceLabel,
      annualTakeHome,
      annualTakeHomeLabel,
      monthlyTakeHome,
      monthlyTakeHomeLabel,
      summary: `${salaryLabel} gross salary gives ${annualTakeHomeLabel} annual take-home pay (${monthlyTakeHomeLabel} per month) after ${incomeTaxLabel} income tax and ${nationalInsuranceLabel} employee National Insurance.`,
    };
  });
}

function getRestOfUkIncomeTaxBands(taxYear: TaxYear): CrawlableRateBand[] {
  const rates = TAX_RATES[taxYear];
  const [basicBand, higherBand, additionalBand] = rates.bands;
  const basicUpper = rates.personalAllowance + (basicBand?.threshold ?? 0);
  const higherUpper = higherBand?.threshold ?? basicUpper;

  return [
    {
      band: 'Personal allowance',
      range: boundedRange(0, rates.personalAllowance),
      rate: '0%',
    },
    {
      band: basicBand?.name ?? 'Basic rate',
      range: boundedRange(rates.personalAllowance + 1, basicUpper),
      rate: percent(basicBand?.rate ?? 20),
    },
    {
      band: higherBand?.name ?? 'Higher rate',
      range: boundedRange(basicUpper + 1, higherUpper),
      rate: percent(higherBand?.rate ?? 40),
    },
    {
      band: additionalBand?.name ?? 'Additional rate',
      range: overRange(higherUpper),
      rate: percent(additionalBand?.rate ?? 45),
    },
  ];
}

function getScottishIncomeTaxBands(taxYear: TaxYear): CrawlableRateBand[] {
  const rates = SCOTTISH_TAX_RATES[taxYear];
  let previousUpper = rates.personalAllowance;

  const bands: CrawlableRateBand[] = [
    {
      band: 'Personal allowance',
      range: boundedRange(0, rates.personalAllowance),
      rate: '0%',
    },
  ];

  for (const band of rates.bands) {
    if (Number.isFinite(band.threshold)) {
      const upper = rates.personalAllowance + band.threshold;
      bands.push({
        band: band.name,
        range: boundedRange(previousUpper + 1, upper),
        rate: percent(band.rate),
      });
      previousUpper = upper;
      continue;
    }

    bands.push({
      band: band.name,
      range: overRange(previousUpper),
      rate: percent(band.rate),
    });
  }

  return bands;
}

function getEmployeeNiBands(taxYear: TaxYear): CrawlableRateBand[] {
  const employeeNi = TAX_RATES[taxYear].nationalInsurance.employee.A;

  return [
    {
      band: 'Employee NI category A',
      range: boundedRange(0, employeeNi.primary.threshold),
      rate: '0%',
    },
    {
      band: 'Employee NI category A primary rate',
      range: boundedRange(employeeNi.primary.threshold + 1, employeeNi.upper.threshold),
      rate: percent(employeeNi.primary.rate),
    },
    {
      band: 'Employee NI category A upper rate',
      range: overRange(employeeNi.upper.threshold),
      rate: percent(employeeNi.upper.rate),
    },
  ];
}

function getStudentLoanRates(taxYear: TaxYear): CrawlableStudentLoanRate[] {
  const studentLoans = TAX_RATES[taxYear].studentLoan;

  return [
    {
      plan: 'Plan 1',
      threshold: money(studentLoans.plan1.threshold),
      rate: percent(studentLoans.plan1.rate),
    },
    {
      plan: 'Plan 2',
      threshold: money(studentLoans.plan2.threshold),
      rate: percent(studentLoans.plan2.rate),
    },
    {
      plan: 'Plan 4',
      threshold: money(studentLoans.plan4.threshold),
      rate: percent(studentLoans.plan4.rate),
    },
    {
      plan: 'Plan 5',
      threshold: money(studentLoans.plan5.threshold),
      rate: percent(studentLoans.plan5.rate),
    },
    {
      plan: 'Postgraduate loan',
      threshold: money(studentLoans.postgrad.threshold),
      rate: percent(studentLoans.postgrad.rate),
    },
  ];
}

function uniqueSourceUrls(taxYear: TaxYear): string[] {
  const sources = TAX_YEAR_SOURCES[taxYear];
  return Array.from(
    new Set([
      ...sources.incomeTax.ukMainBands,
      ...sources.incomeTax.scotlandBands,
      ...sources.nationalInsurance.employeeAndEmployerClass1,
      ...sources.studentLoan.plansAndThresholds,
    ]),
  );
}

export function getCrawlableTaxFacts(taxYear: TaxYear = CURRENT_TAX_YEAR): CrawlableTaxFacts {
  return {
    taxYear,
    taxYearLabel: formatTaxYearDisplay(taxYear, { separator: '-', shortEndYear: true }),
    taxYearLongLabel: formatTaxYearDisplay(taxYear, { separator: '-', shortEndYear: false }),
    taxYearDateRange: taxYearDateRange(taxYear),
    ratesVerifiedOn: TAX_YEAR_SOURCES[taxYear].verifiedOn,
    assumptions:
      'Salary examples use England, Wales and Northern Ireland PAYE rates, tax code 1257L, employee National Insurance category A, annual salary, no pension contribution, and no student loan.',
    salaryExamples: getCrawlableSalaryExamples(taxYear),
    restOfUkIncomeTaxBands: getRestOfUkIncomeTaxBands(taxYear),
    scottishIncomeTaxBands: getScottishIncomeTaxBands(taxYear),
    employeeNiBands: getEmployeeNiBands(taxYear),
    studentLoanRates: getStudentLoanRates(taxYear),
    sourceUrls: uniqueSourceUrls(taxYear),
  };
}

export function getCrawlableTaxFactsMarkdown(taxYear: TaxYear = CURRENT_TAX_YEAR): string {
  const facts = getCrawlableTaxFacts(taxYear);
  const salaryLines = facts.salaryExamples.map((example) => `- ${example.summary}`).join('\n');
  const incomeTaxLines = facts.restOfUkIncomeTaxBands
    .map((band) => `- ${band.band}: ${band.rate} on ${band.range}`)
    .join('\n');
  const niLines = facts.employeeNiBands
    .map((band) => `- ${band.band}: ${band.rate} on ${band.range}`)
    .join('\n');
  const studentLoanLines = facts.studentLoanRates
    .map((loan) => `- ${loan.plan}: ${loan.rate} above ${loan.threshold} per year`)
    .join('\n');

  return `## Citable PAYE Rates and Take-Home Examples

Static HTML section: /#tax-rates-and-take-home
Tax year: ${facts.taxYearLongLabel} (${facts.taxYearDateRange})
Rate verification date: ${facts.ratesVerifiedOn}
Assumptions: ${facts.assumptions}

### Take-Home Pay Examples

${salaryLines}

### England, Wales and Northern Ireland Income Tax

${incomeTaxLines}

### Employee National Insurance

${niLines}

### Student Loan Thresholds

${studentLoanLines}`;
}
