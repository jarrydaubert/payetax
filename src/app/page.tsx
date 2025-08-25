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
  title: 'UK PAYE Tax Calculator 2025 | Free Take-Home Pay Calculator with HMRC Rates',
  description:
    'Calculate your exact UK take-home pay with our free PAYE calculator using official HMRC rates for 2025-2026. Includes Scottish tax rates, student loans, pension contributions and marriage allowance.',
  keywords:
    'UK tax calculator 2025, PAYE calculator, income tax calculator, take home pay calculator, salary calculator, Scottish tax rates 2025, student loan calculator UK, pension tax relief calculator, marriage allowance calculator',
  pathname: '/',
});

// Enhanced Tax calculator FAQ items for structured data and AI discovery
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
    question: 'How does the marriage allowance affect UK tax calculations in 2025?',
    answer:
      'Marriage allowance allows you to transfer £1,260 of your personal allowance to your spouse or civil partner if you earn less than the personal allowance threshold (£12,570) and they are a basic rate taxpayer. This can save up to £252 per year in tax. You can backdate claims for up to 4 tax years and must apply through HMRC.',
  },
  {
    question: 'What are the Scottish tax rates for 2024-2025?',
    answer:
      'Scottish taxpayers pay different income tax rates: 19% starter rate (£12,571-£14,876), 20% basic rate (£14,877-£26,561), 21% intermediate rate (£26,562-£43,662), 42% higher rate (£43,663-£75,000), 45% advanced rate (£75,001-£125,140), and 48% top rate (over £125,140). National Insurance rates remain the same across the UK.',
  },
  {
    question: 'How do I calculate tax on bonus payments and overtime?',
    answer:
      'Bonus payments and overtime are taxed as regular income using your cumulative tax position. HMRC uses your tax code to calculate tax owed across the entire tax year. Large bonuses may push you into higher tax bands temporarily, but this evens out over the tax year through your regular payroll.',
  },
  {
    question: 'What expenses can I claim to reduce my taxable income?',
    answer:
      'You can claim tax relief on work-related expenses including uniforms, professional subscriptions, home working costs (£6 per week or actual costs), travel between work sites, and tools/equipment. You cannot claim for normal commuting costs. Keep receipts and apply through HMRC or your Self Assessment.',
  },
  {
    question: 'How does pension auto-enrolment affect my tax calculation?',
    answer:
      'Auto-enrolment requires employers to contribute minimum 3% of qualifying earnings (£6,240-£50,270 for 2024-25) with employees contributing at least 5%. Employee contributions reduce taxable income, providing immediate tax relief. Total minimum contribution is 8% including employer contribution.',
  },
  {
    question: 'What happens if I have multiple jobs or income sources?',
    answer:
      'With multiple jobs, your personal allowance applies only to your main job (tax code 1257L). Secondary jobs typically use BR (20%) or D0 (40%) tax codes, taxing all income at those rates. You may need to complete a Self Assessment if total income exceeds certain thresholds or for complex tax situations.',
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
      {/* Enhanced structured data for SEO and AI discovery */}
      <StructuredData type='organization' />
      <StructuredData type='website' />
      <StructuredData type='calculator' />
      <StructuredData type='financialservice' />
      <StructuredData type='howto' />
      <StructuredData type='faq' faqs={TAX_FAQS} />

      {/* Main content with Suspense for client components */}
      <Suspense fallback={<div className='p-8 text-center'>Loading calculator...</div>}>
        <HomePageClientWrapper />
      </Suspense>

      {/* Add structured breadcrumbs */}
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[{ name: 'Home', url: 'https://toolhubx.uk/' }]}
      />
    </>
  );
}
