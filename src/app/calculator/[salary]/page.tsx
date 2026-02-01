// src/app/calculator/[salary]/page.tsx
// Dynamic salary-specific landing pages for SEO
// Example: /calculator/70000-after-tax
// SSR: Tax results calculated server-side for Googlebot

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SalaryCalculatorPage } from '@/components/pages/SalaryCalculatorPage';
import { generateMetadata as generateMetadataHelper } from '@/lib/metadata';
import { calculateTax } from '@/lib/taxCalculator';

// Tax year constant - single source of truth for this page
const TAX_YEAR_DISPLAY = '2025-26';
const TAX_YEAR_CALC = '2025-2026';

// Next.js 16: Route segment config
export const dynamic = 'force-static'; // Static generation with ISR
export const dynamicParams = true; // Unknown params generated on-demand (not just at build)
export const revalidate = 86400; // Revalidate daily (24 hours)

// Expanded salary range for comprehensive SEO coverage
// Covers £18k-£500k with higher density at common salary levels
const PROGRAMMATIC_SALARIES = [
  // Entry-level and minimum wage bracket (£18k-£25k)
  18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000,
  // Lower-mid range (£26k-£35k) - high volume searches
  26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000,
  // Mid range (£36k-£50k) - peak search volume
  36000, 37000, 38000, 39000, 40000, 41000, 42000, 43000, 44000, 45000, 46000, 47000, 48000, 49000,
  50000,
  // Upper-mid range (£51k-£75k) - professionals
  51000, 52000, 53000, 54000, 55000, 56000, 57000, 58000, 59000, 60000, 61000, 62000, 63000, 64000,
  65000, 66000, 67000, 68000, 69000, 70000, 71000, 72000, 73000, 74000, 75000,
  // Higher earners (£76k-£100k) - £5k increments
  76000, 77000, 78000, 79000, 80000, 82000, 85000, 87000, 90000, 92000, 95000, 97000, 100000,
  // Tax trap zone (£100k-£125k) - important for planning content
  101000, 102000, 103000, 104000, 105000, 106000, 107000, 108000, 109000, 110000, 111000, 112000,
  113000, 114000, 115000, 116000, 117000, 118000, 119000, 120000, 121000, 122000, 123000, 124000,
  125000,
  // High earners (£125k+) - £5k-£25k increments
  130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000,
  190000, 195000, 200000,
  // Executive salaries - larger increments
  210000, 220000, 225000, 230000, 240000, 250000, 275000, 300000, 325000, 350000, 375000, 400000,
  450000, 500000,
];

// High-priority salaries get enhanced content (richer descriptions, more FAQs)
const HIGH_PRIORITY_SALARIES = [
  25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000,
  95000, 100000, 105000, 110000, 115000, 120000, 125000, 130000, 140000, 150000, 175000, 200000,
  250000, 300000, 500000,
];

interface PageProps {
  params: Promise<{
    salary: string;
  }>;
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
  return `${salary}-after-tax`;
}

// Generate static params for common salaries (canonical URLs only)
// Non-canonical variants (70k, 70000) redirect to canonical at runtime
export function generateStaticParams() {
  return PROGRAMMATIC_SALARIES.map((salary) => ({
    salary: getCanonicalParam(salary),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);

  // Prevent indexing of invalid salary pages
  if (!salary) {
    return { robots: { index: false, follow: false } };
  }

  const formattedSalary = salary.toLocaleString('en-GB');

  // Always use the canonical format: {salary}-after-tax
  // This consolidates all URL variants (70000, 70k, 70000-after-tax, 70k-after-tax)
  // to a single canonical URL to prevent duplicate content issues
  const canonicalPath = `/calculator/${getCanonicalParam(salary)}`;

  return generateMetadataHelper({
    title: `£${formattedSalary} After Tax UK ${TAX_YEAR_DISPLAY} | PayeTax`,
    description: `Calculate exact take-home pay from a £${formattedSalary} salary in the UK for ${TAX_YEAR_DISPLAY}. See income tax, National Insurance, and net pay breakdown instantly.`,
    keywords: `${salary} after tax, ${salary} take home pay, ${salary} salary UK, ${salary} net pay, ${salary} salary calculator, £${formattedSalary} after tax UK`,
    pathname: canonicalPath,
  });
}

// Main page component
export default async function SalaryPage({ params }: PageProps) {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);

  if (!salary) {
    notFound();
  }

  // Redirect non-canonical variants to canonical URL (e.g., /70k → /70000-after-tax)
  const canonicalParam = getCanonicalParam(salary);
  if (salaryParam !== canonicalParam) {
    redirect(`/calculator/${canonicalParam}`);
  }

  // Check if this is a high-priority salary for enhanced content
  const isHighPriority = HIGH_PRIORITY_SALARIES.includes(salary);

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

  return (
    <SalaryCalculatorPage
      salary={salary}
      isHighPriority={isHighPriority}
      initialResults={initialResults}
    />
  );
}
