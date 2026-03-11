// src/components/organisms/CalculatorContent.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalculatorHowToGuide } from '@/components/molecules/CalculatorHowToGuide';
import { FAQItem } from '@/components/molecules/FAQItem';
import { SalaryComparisonTable } from '@/components/molecules/SalaryComparisonTable';
import { TaxRatesOverview } from '@/components/molecules/TaxRatesOverview';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/constants/taxRates';
import { calculateTax } from '@/lib/taxCalculator';
import { cn, formatNumber } from '@/lib/utils';

/**
 * SEO-optimized content section below calculator
 * Includes FAQ, tax facts, and comparison tables for Answer Engine Optimization (AEO)
 *
 * IMPORTANT: All tax figures must match src/constants/taxRates.ts
 * When updating, verify against:
 * - TAX_RATES['2025-2026'].nationalInsurance.employee.A.primary.rate (8%)
 * - TAX_RATES['2025-2026'].studentLoan thresholds
 * - SCOTTISH_TAX_RATES['2025-2026'].bands (6 bands, top rate 48%)
 */
export function CalculatorContent() {
  const currentRates = TAX_RATES[CURRENT_TAX_YEAR];
  const employeeNI = currentRates.nationalInsurance.employee.A;
  const salary30kResults = calculateTax({
    salary: 30000,
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

  return (
    <div className={SPACING.SPACE_Y_16}>
      {/* Tax Rates Overview */}
      <TaxRatesOverview />

      {/* Salary Comparison Table */}
      <SalaryComparisonTable />

      {/* FAQ Section with Schema */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='bg-gradient-to-br from-accent/5 to-primary/5 py-16'
      >
        <div className={cn('mx-auto max-w-4xl', SPACING.PX_4)}>
          <div className='mb-10 text-center'>
            <h2
              className={cn(
                'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
                SPACING.MB_3,
                TYPOGRAPHY.TEXT_4XL,
              )}
            >
              Common Tax Questions
            </h2>
            <p className={`${TYPOGRAPHY.TEXT_LG} text-muted-foreground`}>
              Quick answers to the most frequently asked tax questions
            </p>
          </div>

          <div className={SPACING.SPACE_Y_4}>
            {/* £30k example - calculated using 2025-26 rates from taxRates.ts */}
            <FAQItem question='How much tax do I pay on £30,000 in UK 2025?'>
              <p>
                <strong>Quick Answer:</strong> On a £30,000 salary in England/Wales/NI for 2025-26:
              </p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>
                  <strong>Income Tax</strong>: £
                  {formatNumber(Math.round(salary30kResults.incomeTax.annually))} (20% on £
                  {formatNumber(Math.round(salary30kResults.taxableIncome))} taxable income)
                </li>
                <li>
                  <strong>National Insurance</strong>: £
                  {formatNumber(Math.round(salary30kResults.nationalInsurance.annually))} (
                  {employeeNI.primary.rate}% on earnings above £
                  {formatNumber(employeeNI.primary.threshold)})
                </li>
                <li>
                  <strong>Total Deductions</strong>: £
                  {formatNumber(
                    Math.round(
                      salary30kResults.incomeTax.annually +
                        salary30kResults.nationalInsurance.annually,
                    ),
                  )}
                </li>
                <li>
                  <strong>Take-Home Pay</strong>: £
                  {formatNumber(Math.round(salary30kResults.netPay.annually))}/year or £
                  {formatNumber(Math.round(salary30kResults.netPay.monthly))}/month
                </li>
              </ul>
              <a href='#tax-calculator' className='inline-block text-primary'>
                Calculate your salary →
              </a>
            </FAQItem>

            <FAQItem question='What is the UK personal allowance for 2025-26?'>
              <p>
                The UK personal allowance (tax-free allowance) for 2025-26 is{' '}
                <strong>£12,570</strong>. This is the amount you can earn tax-free each year before
                paying income tax.
              </p>
              <p className='font-medium'>Important notes:</p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>You pay 0% tax on the first £12,570 you earn</li>
                <li>
                  The allowance reduces by £1 for every £2 earned over £100,000 (affecting higher
                  rate taxpayers)
                </li>
                <li>It&apos;s completely lost when you earn £125,140 or more</li>
                <li>Scottish rates have the same allowance but different income tax bands</li>
                <li>
                  This is separate from capital gains tax and inheritance tax allowances which have
                  their own thresholds
                </li>
              </ul>
            </FAQItem>

            {/* NI rate updated to 8% for 2025-26 */}
            <FAQItem question='How is PAYE tax calculated in the UK?'>
              <p>
                PAYE (Pay As You Earn) is calculated monthly by your employer using this process:
              </p>
              <ol className={`ml-6 list-decimal ${SPACING.SPACE_Y_2}`}>
                <li>
                  <strong>Calculate taxable income</strong>: Gross salary - Personal allowance
                  (£12,570)
                </li>
                <li>
                  <strong>Apply tax bands</strong>: 20% basic rate (£12,571-£50,270), 40% higher
                  rate (£50,271-£125,140), 45% additional rate (£125,140+)
                </li>
                <li>
                  <strong>Add National Insurance</strong>: {employeeNI.primary.rate}% on £
                  {formatNumber(employeeNI.primary.threshold + 1)}-£
                  {formatNumber(employeeNI.upper.threshold)}, then {employeeNI.upper.rate}% above
                </li>
                <li>
                  <strong>Deduct pension contributions</strong> (if applicable)
                </li>
                <li>
                  <strong>Deduct student loan repayments</strong> (if applicable)
                </li>
              </ol>
              <p>Your employer reports this to HMRC through Real Time Information (RTI).</p>
            </FAQItem>

            {/* Scotland: 6 bands for 2025-26 (19%, 20%, 21%, 42%, 45%, 48%) */}
            <FAQItem question="What's the difference between Scottish and English tax rates?">
              <p>
                Scotland has different income tax bands but the same National Insurance and personal
                allowance (£12,570).
              </p>
              <p className='font-medium'>Key differences for 2025-26:</p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>
                  <strong>Scotland</strong> has 6 tax bands (19%, 20%, 21%, 42%, 45%, 48%)
                </li>
                <li>
                  <strong>England/Wales/NI</strong> has 3 tax bands (20%, 40%, 45%)
                </li>
                <li>Scottish taxpayers generally pay more tax on salaries above £28,000</li>
                <li>The difference increases significantly above £50,000</li>
              </ul>
              <Link
                href='/blog/scottish-vs-english-tax-rates-2026-comparison'
                className='inline-block text-primary'
              >
                Read full Scottish vs English comparison →
              </Link>
            </FAQItem>

            {/* Student loan thresholds updated to 2025-26 from taxRates.ts */}
            <FAQItem question='How do student loan repayments work with PAYE?'>
              <p>
                Student loan repayments are deducted automatically through PAYE if you earn above
                the threshold for your plan type:
              </p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>
                  <strong>Plan 1</strong>: 9% on earnings above £26,065
                </li>
                <li>
                  <strong>Plan 2</strong>: 9% on earnings above £28,470
                </li>
                <li>
                  <strong>Plan 4</strong> (Scotland): 9% on earnings above £32,745
                </li>
                <li>
                  <strong>Plan 5</strong>: 9% on earnings above £25,000
                </li>
                <li>
                  <strong>Postgraduate</strong>: 6% on earnings above £21,000
                </li>
              </ul>
              <p>
                If you have both an undergraduate and postgraduate loan, you repay 9% above your
                undergraduate threshold plus 6% above the postgraduate threshold.
              </p>
              <Link
                href='/blog/student-loan-repayment-changes-2025-26'
                className='inline-block text-primary'
              >
                Read full student loan guide →
              </Link>
            </FAQItem>

            <FAQItem question='How does pension tax relief work?'>
              <p>
                Pension tax relief depends on how your pension is set up. With{' '}
                <strong>salary sacrifice</strong> or <strong>net pay arrangements</strong>,
                contributions are deducted before tax. With <strong>relief at source</strong>, your
                provider reclaims 20% basic rate automatically (higher rate relief claimed via Self
                Assessment).
              </p>
              <p className='font-medium'>
                Example on £50,000 salary with 5% pension (salary sacrifice):
              </p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>Pension contribution: £2,500 (5% of £50,000)</li>
                <li>Taxable income: £34,930 (£50,000 - £2,500 pension - £12,570 allowance)</li>
                <li>Tax saved: £500 (20% of £2,500 at basic rate)</li>
                <li>Net cost of pension: £2,000 (£2,500 - £500 tax relief)</li>
              </ul>
              <p>Higher rate taxpayers (40%) save even more - £1,000 on a £2,500 contribution.</p>
            </FAQItem>

            {/* Blind Person's Allowance updated to £3,130 for 2025-26 */}
            <FAQItem question='What tax reliefs are available to reduce my tax bill?'>
              <p>
                The UK offers several tax reliefs that can reduce your tax bill. Here are the main
                ones:
              </p>
              <ul className={`ml-6 list-disc ${SPACING.SPACE_Y_1}`}>
                <li>
                  <strong>Personal Allowance</strong>: £12,570 tax-free income (for most people)
                </li>
                <li>
                  <strong>Marriage Allowance</strong>: Transfer £1,260 of unused personal allowance
                  to your spouse (saves up to £252/year)
                </li>
                <li>
                  <strong>Pension Tax Relief</strong>: Automatic relief on workplace pension
                  contributions
                </li>
                <li>
                  <strong>Blind Person&apos;s Allowance</strong>: Extra £3,130 tax-free income
                </li>
                <li>
                  <strong>Gift Aid</strong>: Tax relief on charitable donations
                </li>
              </ul>
              <p>
                Note: This is separate from <strong>capital gains tax</strong> (£3,000 annual exempt
                amount) and <strong>inheritance tax</strong> (£325,000 nil-rate band). Use our
                calculator to see how these tax reliefs affect your take-home pay.
              </p>
            </FAQItem>
          </div>

          <div className={cn('text-center', SPACING.MT_8)}>
            <p className={`text-muted-foreground ${TYPOGRAPHY.TEXT_SM}`}>
              Can&apos;t find your question?{' '}
              <Link href='/blog' className='text-primary'>
                Read our tax guides
              </Link>
              {' or '}
              <a href='mailto:support@payetax.co.uk' className='text-primary'>
                contact us
              </a>
            </p>
          </div>
        </div>
      </motion.section>

      {/* How to Use Guide */}
      <CalculatorHowToGuide />
    </div>
  );
}
