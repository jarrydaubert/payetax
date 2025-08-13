// src/app/page.tsx

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StructuredData } from '@/components/ui/StructuredData';
import { generateMetadata } from '@/lib/metadata';

// Import the client-side HomePageContent component
// We'll use Suspense to handle the loading state
const HomePageClientWrapper = () => {
  // Using an inline dynamic import with Suspense
  // This approach avoids SSR issues with client components
  const HomePageContent = require('@/components/pages/HomePageContent').default;
  return <HomePageContent />;
};

/**
 * Enhanced metadata for the homepage with tax calculator
 */
export const metadata: Metadata = generateMetadata({
  title: 'UK PAYE Tax Calculator 2024-2025 | Free Take-Home Pay Calculator',
  description:
    'Calculate your exact UK take-home pay after tax, National Insurance, student loan and pension deductions with our free PAYE calculator. Updated for 2024-2025 tax year.',
  keywords:
    'UK tax calculator, PAYE calculator, income tax calculator, take home pay calculator, salary calculator, net pay calculator, UK tax 2024-2025, tax year calculator',
  pathname: '/',
});

// Tax calculator FAQ items for structured data
const TAX_FAQS = [
  {
    question: 'How is UK income tax calculated?',
    answer:
      'UK income tax is calculated using a progressive band system. For the 2024-2025 tax year, you pay 0% on income up to your Personal Allowance (£12,570), 20% on income between £12,571 and £50,270 (Basic rate), 40% on income between £50,271 and £125,140 (Higher rate), and 45% on income over £125,140 (Additional rate). Scotland has different rates and bands.',
  },
  {
    question: 'What is National Insurance and how is it calculated?',
    answer:
      "National Insurance is a tax on earnings that provides entitlement to certain state benefits. For employees (Class 1 NICs), you pay 8% on weekly earnings between £242 and £967, and 2% on earnings above £967. The rates and thresholds are different if you're self-employed. You don't pay National Insurance once you reach State Pension age.",
  },
  {
    question: 'How do student loan repayments work?',
    answer:
      'Student loan repayments are income-contingent and collected automatically through the tax system when your income exceeds the threshold for your loan type. Plan 1: 9% on income over £22,015, Plan 2: 9% on income over £27,295, Plan 4 (Scotland): 9% on income over £27,660, Plan 5: 9% on income over £25,000, and Postgraduate Loans: 6% on income over £21,000.',
  },
  {
    question: 'What does my tax code mean?',
    answer:
      "Your tax code indicates how much tax-free income you're entitled to. The most common code is 1257L, which means you have the standard Personal Allowance of £12,570 (the numbers multiplied by 10). Letters have specific meanings: L means you're entitled to the standard Personal Allowance, S means you're taxed at Scottish rates, BR means all income is taxed at the basic rate (20%), and 0T means you have no tax-free allowance.",
  },
  {
    question: 'How does salary sacrifice for pension contributions affect my tax?',
    answer:
      'Salary sacrifice pension contributions are deducted from your gross salary before tax and National Insurance are calculated. This reduces your taxable income, potentially lowering the amount of income tax and National Insurance you pay. This is more advantageous than relief at source pension contributions where only income tax (not NI) relief is provided.',
  },
  {
    question: 'How accurate is this tax calculator?',
    answer:
      'This calculator uses the latest tax rates and thresholds from HMRC and provides accurate estimates for most standard employment situations. However, it may not account for all individual circumstances or special tax rules. For complex situations or official tax calculations, always consult with a qualified tax professional or HMRC directly.',
  },
];

/**
 * Home page component with enhanced SEO
 */
export default function HomePage() {
  return (
    <>
      {/* Add structured data for SEO */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="calculator" />
      <StructuredData type="faq" faqs={TAX_FAQS} />

      {/* Main content with Suspense for client components */}
      <Suspense fallback={<div className="p-8 text-center">Loading calculator...</div>}>
        <HomePageClientWrapper />
      </Suspense>

      {/* Add structured breadcrumbs */}
      <StructuredData
        type="breadcrumb"
        breadcrumbs={[{ name: 'Home', url: 'https://toolhubx.uk/' }]}
      />
    </>
  );
}
