// src/app/calculator/[salary]/page.tsx
// Dynamic salary-specific landing pages for SEO
// Example: /calculator/70000-after-tax

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SalaryCalculatorPage } from '@/components/salary/SalaryCalculatorPage';
import { generateMetadata as generateMetadataHelper } from '@/lib/metadata';

// Common UK salary searches based on keyword research
// const SALARY_RANGES = [
//   20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000,
//   70000, 75000, 80000, 85000, 90000, 95000, 100000, 105000, 110000, 115000,
//   120000, 125000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000,
// ];

// High-volume keywords from CSV analysis - all salaries in sitemap
const HIGH_PRIORITY_SALARIES = [
  30000, // 280 searches/month
  35000, // 250 searches/month
  40000, // 320 searches/month
  45000, // 230 searches/month
  50000, // 350 searches/month
  55000, // 210 searches/month
  60000, // 390 searches/month
  65000, // 190 searches/month
  70000, // 480 searches/month
  75000, // 180 searches/month
  80000, // 620 searches/month
  85000, // 160 searches/month
  90000, // 530 searches/month
  95000, // 150 searches/month
  100000, // 450 searches/month
  105000, // 170 searches/month
  110000, // 130 searches/month
  115000, // 170 searches/month
  120000, // 120 searches/month
  125000, // 140 searches/month
];

interface PageProps {
  params: Promise<{
    salary: string;
  }>;
}

// Parse salary from URL parameter
function parseSalary(salaryParam: string): number | null {
  // Handle formats: "70000-after-tax", "70000", "70k-after-tax", "70k"
  const match = salaryParam.match(/^(\d+)k?(-after-tax)?$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const multiplier = salaryParam.includes('k') ? 1000 : 1;
  const salary = value * multiplier;

  // Validate salary is in reasonable range (£10k - £10M)
  if (salary < 10000 || salary > 10000000) return null;

  return salary;
}

// Generate static params for common salaries (for SSG)
export async function generateStaticParams() {
  // Start with high-priority salaries for initial deployment
  const salaries = HIGH_PRIORITY_SALARIES;

  return salaries.flatMap((salary) => [
    { salary: `${salary}-after-tax` },
    { salary: `${salary}` },
    // Also generate with 'k' notation for common searches
    { salary: `${salary / 1000}k-after-tax` },
    { salary: `${salary / 1000}k` },
  ]);
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);
  if (!salary) return {};

  const formattedSalary = salary.toLocaleString('en-GB');
  const monthlyTakeHome = Math.round((salary * 0.75) / 12); // Rough estimate for meta
  const formattedMonthly = monthlyTakeHome.toLocaleString('en-GB');

  return generateMetadataHelper({
    title: `£${formattedSalary} After Tax UK 2025-26 | PayeTax`,
    description: `Calculate exact take-home pay from a £${formattedSalary} salary in the UK. After tax and NI, you'll take home approximately £${formattedMonthly} per month. Free HMRC-compliant calculator with student loans and pension options.`,
    keywords: `${salary} after tax, ${salary} take home pay, ${salary} salary UK, ${salary} net pay, ${salary} salary calculator, £${formattedSalary} after tax UK`,
    pathname: `/calculator/${salaryParam}`,
  });
}

// Main page component
export default async function SalaryPage({ params }: PageProps) {
  const { salary: salaryParam } = await params;
  const salary = parseSalary(salaryParam);

  if (!salary) {
    notFound();
  }

  // Check if this is a high-priority salary for enhanced content
  const isHighPriority = HIGH_PRIORITY_SALARIES.includes(salary);

  return <SalaryCalculatorPage salary={salary} isHighPriority={isHighPriority} />;
}
