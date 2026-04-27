// src/app/calculator/[salary]/page.tsx
// Dynamic salary-specific landing pages for SEO
// Example: /calculator/70000-after-tax
// SSR: Tax results calculated server-side for Googlebot

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { StructuredData } from '@/components/organisms/StructuredData';
import { SalaryCalculatorPage } from '@/components/pages/SalaryCalculatorPage';
import { HMRC_INCOME_TAX_RATES_URL, HMRC_NI_RATES_URL } from '@/constants/sources';
import {
  CURRENT_TAX_YEAR,
  formatTaxYearDisplay,
  TAX_RATES,
  type TaxYear,
} from '@/constants/taxRates';
import { generateMetadata as generateMetadataHelper, SITE_URL } from '@/lib/metadata';
import {
  getCanonicalSalaryParam,
  HIGH_PRIORITY_SALARY_SET,
  INDEXABLE_SALARIES,
  INDEXABLE_SALARY_SET,
  PROGRAMMATIC_SALARY_SET,
} from '@/lib/seo/salaryPages';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { calculateTax } from '@/lib/taxCalculator';

// Tax year constant - single source of truth for this page
const TAX_YEAR_DISPLAY = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
  separator: '-',
  shortEndYear: true,
});
const TAX_YEAR_CALC: TaxYear = CURRENT_TAX_YEAR;

// Next.js 16: Route segment config
export const dynamic = 'force-static'; // Static generation with ISR
export const dynamicParams = true; // Unknown params generated on-demand (not just at build)
export const revalidate = 86400; // Revalidate daily (24 hours)

interface PageProps {
  params: Promise<{
    salary: string;
  }>;
}

function generateSalaryFAQs(
  salary: number,
  results: TaxCalculationResults,
  taxYearDisplay: string,
) {
  const formattedSalary = salary.toLocaleString('en-GB');
  const faqs = [
    {
      question: `How much tax do I pay on a £${formattedSalary} salary in the UK?`,
      answer: `On a £${formattedSalary} salary in the UK for ${taxYearDisplay}, you pay £${results.incomeTax.annually.toLocaleString('en-GB')} in income tax and £${results.nationalInsurance.annually.toLocaleString('en-GB')} in National Insurance, leaving you with £${results.netPay.annually.toLocaleString('en-GB')} take-home pay per year. Sources: HMRC Income Tax rates (${HMRC_INCOME_TAX_RATES_URL}) and HMRC National Insurance rates (${HMRC_NI_RATES_URL}).`,
    },
    {
      question: `What is the monthly take-home pay on £${formattedSalary}?`,
      answer: `With a gross salary of £${formattedSalary} per year, your monthly take-home pay is £${results.netPay.monthly.toLocaleString('en-GB')} after tax and National Insurance deductions. Sources: HMRC Income Tax rates (${HMRC_INCOME_TAX_RATES_URL}) and HMRC National Insurance rates (${HMRC_NI_RATES_URL}).`,
    },
    {
      question: `What is the effective tax rate on £${formattedSalary}?`,
      answer: `The effective tax rate on a £${formattedSalary} salary is ${(((results.incomeTax.annually + results.nationalInsurance.annually) / salary) * 100).toFixed(1)}%. This includes both income tax and National Insurance contributions. Sources: HMRC Income Tax rates (${HMRC_INCOME_TAX_RATES_URL}) and HMRC National Insurance rates (${HMRC_NI_RATES_URL}).`,
    },
  ];

  const rates = TAX_RATES[CURRENT_TAX_YEAR];
  const personalAllowanceFullyTaperedAt =
    rates.personalAllowanceReductionThreshold + rates.personalAllowance * 2;

  if (HIGH_PRIORITY_SALARY_SET.has(salary)) {
    faqs.push({
      question: `What is the weekly take-home pay on £${formattedSalary}?`,
      answer: `On £${formattedSalary} gross pay, weekly take-home pay is about £${results.netPay.weekly.toLocaleString('en-GB')} after PAYE tax and National Insurance. For scenario testing and assumptions, use the full calculator: ${SITE_URL}/calculator/${salary}-after-tax. Sources: HMRC Income Tax rates (${HMRC_INCOME_TAX_RATES_URL}) and HMRC National Insurance rates (${HMRC_NI_RATES_URL}).`,
    });
  }

  if (
    salary >= rates.personalAllowanceReductionThreshold &&
    salary <= personalAllowanceFullyTaperedAt
  ) {
    faqs.push({
      question: `How does the £100k tax trap affect a £${formattedSalary} salary?`,
      answer: `At £${formattedSalary}, you lose £1 of Personal Allowance for every £2 earned over £100,000. This creates an effective marginal tax rate of around 60% between £100,000 and £125,140 for most employees in England, Wales, and Northern Ireland. The impact depends on your circumstances. Source: HMRC Income Tax rates (${HMRC_INCOME_TAX_RATES_URL}).`,
    });
  }

  return faqs;
}

// Parse salary from URL parameter
function parseSalary(salaryParam: string): number | null {
  // Normalize to lowercase for case-insensitive matching (e.g., "70K" → "70k")
  const normalized = salaryParam.toLowerCase();

  // Handle formats: "70000-after-tax", "70000", "70k-after-tax", "70k"
  const match = normalized.match(/^(\d+)k?(-after-tax)?$/);
  if (!match) return null;

  const value = Number.parseInt(match[1] ?? '0', 10);
  const multiplier = normalized.includes('k') ? 1000 : 1;
  const salary = value * multiplier;

  // Validate salary is in reasonable range (£10k - £10M)
  if (salary < 10000 || salary > 10000000) return null;

  return salary;
}

// Get canonical URL param for a salary (e.g., "70000-after-tax")
function getCanonicalParam(salary: number): string {
  return getCanonicalSalaryParam(salary);
}

// Generate static params for common salaries (canonical URLs only)
// Non-canonical variants (70k, 70000) redirect to canonical at runtime
export function generateStaticParams() {
  return INDEXABLE_SALARIES.map((salary) => ({
    salary: getCanonicalParam(salary),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);

  // Prevent indexing of invalid or non-priority salary pages while keeping supported pages usable.
  if (!(salary && PROGRAMMATIC_SALARY_SET.has(salary))) {
    return { robots: { index: false, follow: false } };
  }
  if (!INDEXABLE_SALARY_SET.has(salary)) {
    return { robots: { index: false, follow: true } };
  }

  const formattedSalary = salary.toLocaleString('en-GB');

  // Always use the canonical format: {salary}-after-tax
  // This consolidates all URL variants (70000, 70k, 70000-after-tax, 70k-after-tax)
  // to a single canonical URL to prevent duplicate content issues
  const canonicalPath = `/calculator/${getCanonicalParam(salary)}`;

  return generateMetadataHelper({
    title: `£${formattedSalary} After Tax UK ${TAX_YEAR_DISPLAY} | PayeTax`,
    description: `Estimate take-home pay from a £${formattedSalary} salary in the UK for ${TAX_YEAR_DISPLAY}. See income tax, National Insurance, and net pay breakdown quickly.`,
    pathname: canonicalPath,
  });
}

// Main page component
export default async function SalaryPage({ params }: PageProps) {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);

  if (!(salary && PROGRAMMATIC_SALARY_SET.has(salary))) {
    notFound();
  }

  // Redirect non-canonical variants to canonical URL (e.g., /70k → /70000-after-tax)
  const canonicalParam = getCanonicalParam(salary);
  if (salaryParam !== canonicalParam) {
    redirect(`/calculator/${canonicalParam}`);
  }

  // Check if this is a high-priority salary for enhanced content
  const isHighPriority = HIGH_PRIORITY_SALARY_SET.has(salary);

  // Calculate tax results server-side for SSR (Googlebot sees this immediately)
  const initialResults = calculateTax({
    salary: salary,
    payPeriod: 'annually',
    taxYear: TAX_YEAR_CALC,
    taxCode: '1257L',
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    payNoNI: false,
    studentLoanPlans: 'none',
    pensionContribution: 0,
    pensionContributionType: 'percentage',
    niCategory: 'A',
    hoursPerWeek: 37.5,
  });

  const breadcrumbItems = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Calculator', url: `${SITE_URL}/` },
    {
      name: `£${salary.toLocaleString('en-GB')} Salary`,
      url: `${SITE_URL}/calculator/${salary}-after-tax`,
    },
  ];
  const salaryFAQs = generateSalaryFAQs(salary, initialResults, TAX_YEAR_DISPLAY);

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='faq' faqs={salaryFAQs} />
      <StructuredData type='calculator' />
      <StructuredData type='dataset' />
      <StructuredData
        type='salarycalculation'
        salaryData={{
          salary,
          netPay: initialResults.netPay.annually,
          incomeTax: initialResults.incomeTax.annually,
          nationalInsurance: initialResults.nationalInsurance.annually,
          url: `${SITE_URL}/calculator/${salary}-after-tax`,
        }}
      />
      <SalaryCalculatorPage
        salary={salary}
        isHighPriority={isHighPriority}
        initialResults={initialResults}
      />
    </>
  );
}
