// src/components/organisms/CalculatorContent.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { Card } from '@/components/ui/card';

/**
 * SEO-optimized content section below calculator
 * Includes FAQ, tax facts, and comparison tables for Answer Engine Optimization (AEO)
 */
export function CalculatorContent() {
  const comparisonTableRef = React.useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = React.useState(false);
  const [showRightIndicator, setShowRightIndicator] = React.useState(false);

  // Check scroll position for comparison table
  React.useEffect(() => {
    const checkScrollPosition = () => {
      const container = comparisonTableRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      setShowLeftIndicator(hasHorizontalScroll && scrollLeft > 5);
      setShowRightIndicator(hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = comparisonTableRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  return (
    <div className='space-y-16'>
      {/* Quick Tax Facts Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='bg-gradient-to-br from-primary/5 to-accent/5 py-16'
      >
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-10 text-center'>
            <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
              UK Tax Rates 2025-26
            </h2>
            <p className='text-muted-foreground'>
              Quick reference for current tax year rates and thresholds
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            <Card className='group overflow-hidden border-primary/20 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
                  <Wallet className='size-5 text-white' />
                </div>
                <h3 className='font-bold text-foreground text-lg'>Income Tax Bands</h3>
              </div>
              <ul className='space-y-3'>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>Personal Allowance</span>
                  <strong className='text-foreground'>0%</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£12,571 - £50,270</span>
                  <strong className='text-green-600 dark:text-green-400'>20%</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£50,271 - £125,140</span>
                  <strong className='text-orange-600 dark:text-orange-400'>40%</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£125,140+</span>
                  <strong className='text-red-600 dark:text-red-400'>45%</strong>
                </li>
              </ul>
            </Card>

            <Card className='group overflow-hidden border-primary/20 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
                  <TrendingUp className='size-5 text-white' />
                </div>
                <h3 className='font-bold text-foreground text-lg'>National Insurance</h3>
              </div>
              <ul className='space-y-3'>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£0 - £12,570</span>
                  <strong className='text-foreground'>0%</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£12,571 - £50,270</span>
                  <strong className='text-amber-600 dark:text-amber-400'>12%</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£50,270+</span>
                  <strong className='text-amber-600 dark:text-amber-400'>2%</strong>
                </li>
                <li className='pt-1 text-center text-muted-foreground text-xs'>
                  Class 1 contributions for employees
                </li>
              </ul>
            </Card>

            <Card className='group overflow-hidden border-primary/20 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-xl'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end'>
                  <Calculator className='size-5 text-white' />
                </div>
                <h3 className='font-bold text-foreground text-lg'>Quick Examples</h3>
              </div>
              <ul className='space-y-3'>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£20,000 salary</span>
                  <strong className='text-green-600 dark:text-green-400'>£17,294</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£30,000 salary</span>
                  <strong className='text-blue-600 dark:text-blue-400'>£23,894</strong>
                </li>
                <li className='flex justify-between rounded-md bg-muted/30 p-2 text-sm'>
                  <span className='text-muted-foreground'>£50,000 salary</span>
                  <strong className='text-purple-600 dark:text-purple-400'>£37,794</strong>
                </li>
                <li className='pt-1 text-center text-muted-foreground text-xs'>
                  Annual take-home pay
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Salary Comparison Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='bg-gradient-to-br from-accent/5 to-primary/5 py-16'
      >
        <div className='mx-auto max-w-6xl px-4'>
          <div className='mb-10 text-center'>
            <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
              Salary Take-Home Comparison
            </h2>
            <p className='text-lg text-muted-foreground'>
              See exactly how much you&apos;ll take home at different salary levels
            </p>
          </div>

          <div className='relative'>
            <ScrollIndicator direction='left' visible={showLeftIndicator} />
            <ScrollIndicator direction='right' visible={showRightIndicator} />

            <Card className='overflow-hidden border-primary/20'>
              <div
                ref={comparisonTableRef}
                className='overflow-x-auto scroll-smooth'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <table className='w-full min-w-[640px] border-collapse'>
                  <thead className='bg-gradient-to-r from-primary/10 to-accent/10'>
                    <tr className='border-border/20 border-b'>
                      <th className='p-4 text-left font-bold text-foreground'>Gross Salary</th>
                      <th className='p-4 text-right font-bold text-foreground'>Income Tax</th>
                      <th className='p-4 text-right font-bold text-foreground'>
                        National Insurance
                      </th>
                      <th className='p-4 text-right font-bold text-foreground'>Annual Take-Home</th>
                      <th className='p-4 text-right font-bold text-foreground'>
                        Monthly Take-Home
                      </th>
                    </tr>
                  </thead>
                  <tbody className='text-sm'>
                    {[
                      { salary: 20000, tax: 1486, ni: 1220, annual: 17294, monthly: 1441 },
                      { salary: 25000, tax: 2486, ni: 1920, annual: 20594, monthly: 1716 },
                      { salary: 30000, tax: 3486, ni: 2620, annual: 23894, monthly: 1991 },
                      { salary: 40000, tax: 5486, ni: 3820, annual: 30694, monthly: 2558 },
                      { salary: 50000, tax: 7486, ni: 4720, annual: 37794, monthly: 3150 },
                      { salary: 60000, tax: 11432, ni: 5069, annual: 43499, monthly: 3625 },
                      { salary: 80000, tax: 19432, ni: 5669, annual: 54899, monthly: 4575 },
                      { salary: 100000, tax: 27432, ni: 6069, annual: 66499, monthly: 5542 },
                    ].map((row, idx) => (
                      <tr
                        key={row.salary}
                        className={`border-border/10 border-b transition-colors hover:bg-primary/5 ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}
                      >
                        <td className='p-4 font-semibold text-foreground'>
                          £{row.salary.toLocaleString()}
                        </td>
                        <td className='p-4 text-right text-red-600 dark:text-red-400'>
                          £{row.tax.toLocaleString()}
                        </td>
                        <td className='p-4 text-right text-amber-600 dark:text-amber-400'>
                          £{row.ni.toLocaleString()}
                        </td>
                        <td className='p-4 text-right font-bold text-green-600 dark:text-green-400'>
                          £{row.annual.toLocaleString()}
                        </td>
                        <td className='p-4 text-right text-muted-foreground'>
                          £{row.monthly.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className='mt-6 text-center'>
            <p className='text-muted-foreground text-sm'>
              Based on England/Wales/NI rates for 2025-26. Scottish rates differ.
            </p>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section with Schema */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='bg-gradient-to-br from-accent/5 to-primary/5 py-16'
      >
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-10 text-center'>
            <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
              Common Tax Questions
            </h2>
            <p className='text-lg text-muted-foreground'>
              Quick answers to the most frequently asked tax questions
            </p>
          </div>

          <div className='space-y-4'>
            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                How much tax do I pay on £30,000 in UK 2025?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  <strong>Quick Answer:</strong> On a £30,000 salary in England/Wales/NI for
                  2025-26:
                </p>
                <ul className='ml-6 list-disc space-y-1'>
                  <li>
                    <strong>Income Tax</strong>: £3,486 (20% on £17,430 taxable income)
                  </li>
                  <li>
                    <strong>National Insurance</strong>: £2,620 (12% on £17,430)
                  </li>
                  <li>
                    <strong>Total Deductions</strong>: £6,106
                  </li>
                  <li>
                    <strong>Take-Home Pay</strong>: £23,894/year or £1,991/month
                  </li>
                </ul>
                <a href='#calculator' className='inline-block text-primary'>
                  Calculate your exact salary →
                </a>
              </div>
            </details>

            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                What is the UK personal allowance for 2025-26?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  The UK personal allowance for 2025-26 is <strong>£12,570</strong>. This is the
                  amount you can earn tax-free each year.
                </p>
                <p className='font-medium'>Important notes:</p>
                <ul className='ml-6 list-disc space-y-1'>
                  <li>You pay 0% tax on the first £12,570 you earn</li>
                  <li>The allowance reduces by £1 for every £2 earned over £100,000</li>
                  <li>It&apos;s completely lost when you earn £125,140 or more</li>
                  <li>Scottish rates have the same allowance but different tax bands</li>
                </ul>
              </div>
            </details>

            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                How is PAYE tax calculated in the UK?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  PAYE (Pay As You Earn) is calculated monthly by your employer using this process:
                </p>
                <ol className='ml-6 list-decimal space-y-2'>
                  <li>
                    <strong>Calculate taxable income</strong>: Gross salary - Personal allowance
                    (£12,570)
                  </li>
                  <li>
                    <strong>Apply tax bands</strong>: 20% basic rate (£12,571-£50,270), 40% higher
                    rate (£50,271-£125,140), 45% additional rate (£125,140+)
                  </li>
                  <li>
                    <strong>Add National Insurance</strong>: 12% on £12,571-£50,270, then 2% above
                  </li>
                  <li>
                    <strong>Deduct pension contributions</strong> (if applicable)
                  </li>
                  <li>
                    <strong>Deduct student loan repayments</strong> (if applicable)
                  </li>
                </ol>
                <p>Your employer reports this to HMRC through Real Time Information (RTI).</p>
              </div>
            </details>

            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                What&apos;s the difference between Scottish and English tax rates?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  Scotland has different income tax bands but the same National Insurance and
                  personal allowance (£12,570).
                </p>
                <p className='font-medium'>Key differences for 2025-26:</p>
                <ul className='ml-6 list-disc space-y-1'>
                  <li>
                    <strong>Scotland</strong> has 5 tax bands (19%, 20%, 21%, 42%, 47%)
                  </li>
                  <li>
                    <strong>England/Wales/NI</strong> has 3 tax bands (20%, 40%, 45%)
                  </li>
                  <li>Scottish taxpayers generally pay more tax on salaries above £28,000</li>
                  <li>The difference increases significantly above £50,000</li>
                </ul>
                <Link
                  href='/blog/scottish-vs-english-tax-rates-2025-comparison'
                  className='inline-block text-primary'
                >
                  Read full Scottish vs English comparison →
                </Link>
              </div>
            </details>

            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                How do student loan repayments work with PAYE?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  Student loan repayments are deducted automatically through PAYE if you earn above
                  the threshold for your plan type:
                </p>
                <ul className='ml-6 list-disc space-y-1'>
                  <li>
                    <strong>Plan 1</strong>: 9% on earnings above £24,990
                  </li>
                  <li>
                    <strong>Plan 2</strong>: 9% on earnings above £27,295
                  </li>
                  <li>
                    <strong>Plan 4</strong> (Scotland): 9% on earnings above £31,395
                  </li>
                  <li>
                    <strong>Plan 5</strong>: 9% on earnings above £25,000
                  </li>
                  <li>
                    <strong>Postgraduate</strong>: 6% on earnings above £21,000
                  </li>
                </ul>
                <p>You can have multiple plans and repay to each simultaneously.</p>
                <Link
                  href='/blog/student-loan-repayment-changes-2025-26'
                  className='inline-block text-primary'
                >
                  Read full student loan guide →
                </Link>
              </div>
            </details>

            <details className='group overflow-hidden rounded-xl border-2 border-border/20 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg'>
              <summary className='cursor-pointer font-bold text-foreground text-lg transition-colors hover:text-primary'>
                How does pension tax relief work?
              </summary>
              <div className='mt-4 space-y-3 text-muted-foreground text-sm'>
                <p>
                  Pension contributions are deducted <strong>before</strong> tax is calculated,
                  reducing your taxable income. This means you get tax relief automatically.
                </p>
                <p className='font-medium'>Example on £50,000 salary with 5% pension:</p>
                <ul className='ml-6 list-disc space-y-1'>
                  <li>Pension contribution: £2,500 (5% of £50,000)</li>
                  <li>Taxable income: £37,500 (£50,000 - £12,570 allowance)</li>
                  <li>Tax saved: £500 (20% of £2,500)</li>
                  <li>Net cost of pension: £2,000 (£2,500 - £500 tax relief)</li>
                </ul>
                <p>Higher rate taxpayers (40%) save even more - £1,000 on a £2,500 contribution.</p>
              </div>
            </details>
          </div>

          <div className='mt-8 text-center'>
            <p className='text-muted-foreground text-sm'>
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

      {/* How to Use Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className='bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-16'
      >
        <div className='mx-auto max-w-5xl px-4'>
          <div className='mb-10 text-center'>
            <h2 className='mb-3 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-4xl text-transparent'>
              How to Use the Calculator
            </h2>
            <p className='text-lg text-muted-foreground'>
              Calculate your take-home pay in 4 simple steps
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card className='group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl'>
              <div className='absolute top-4 right-4 font-bold text-[80px] text-primary/10'>1</div>
              <div className='relative'>
                <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-2xl text-white shadow-lg'>
                  1
                </div>
                <h3 className='mb-3 font-bold text-foreground text-xl'>Enter Your Salary</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  Input your gross annual, monthly, or weekly salary. Our calculator automatically
                  formats numbers with commas for easy reading.
                </p>
              </div>
            </Card>

            <Card className='group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl'>
              <div className='absolute top-4 right-4 font-bold text-[80px] text-primary/10'>2</div>
              <div className='relative'>
                <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-2xl text-white shadow-lg'>
                  2
                </div>
                <h3 className='mb-3 font-bold text-foreground text-xl'>Select Tax Year & Region</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  Choose the tax year (2025-26 for current rates) and your region (England,
                  Scotland, Wales, or Northern Ireland).
                </p>
              </div>
            </Card>

            <Card className='group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl'>
              <div className='absolute top-4 right-4 font-bold text-[80px] text-primary/10'>3</div>
              <div className='relative'>
                <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-2xl text-white shadow-lg'>
                  3
                </div>
                <h3 className='mb-3 font-bold text-foreground text-xl'>
                  Add Deductions (Optional)
                </h3>
                <p className='text-muted-foreground leading-relaxed'>
                  Include pension contributions, student loan plans, and other deductions for
                  accurate results. Leave blank if not applicable.
                </p>
              </div>
            </Card>

            <Card className='group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-2xl'>
              <div className='absolute top-4 right-4 font-bold text-[80px] text-primary/10'>4</div>
              <div className='relative'>
                <div className='mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end font-bold text-2xl text-white shadow-lg'>
                  4
                </div>
                <h3 className='mb-3 font-bold text-foreground text-xl'>View & Export Results</h3>
                <p className='text-muted-foreground leading-relaxed'>
                  See your breakdown by income tax, National Insurance, and take-home pay across
                  multiple periods. Export to CSV or print for your records.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
