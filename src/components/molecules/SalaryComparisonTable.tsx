// src/components/molecules/SalaryComparisonTable.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { Card } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { calculateTax } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

// Salaries to display in the comparison table
const COMPARISON_SALARIES = [20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000];

/**
 * Generate salary data dynamically using the tax calculator
 * This ensures values always match current tax rates from taxRates.ts
 */
function generateSalaryData() {
  return COMPARISON_SALARIES.map((salary) => {
    const results = calculateTax({
      salary,
      payPeriod: 'annually',
      taxYear: '2025-2026',
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

    return {
      salary,
      tax: Math.round(results.incomeTax.annually),
      ni: Math.round(results.nationalInsurance.annually),
      annual: Math.round(results.netPay.annually),
      monthly: Math.round(results.netPay.monthly),
    };
  });
}

/**
 * Salary comparison table molecule
 * Shows popular UK salaries with tax, NI, and take-home calculations
 * Includes horizontal scroll indicators for mobile UX
 * Design tokens: TEXT_4XL for heading, TEXT_SM for table
 */
export function SalaryComparisonTable() {
  const comparisonTableRef = React.useRef<HTMLDivElement>(null);
  const { showLeftIndicator, showRightIndicator } =
    useHorizontalScrollIndicator(comparisonTableRef);

  // Generate salary data dynamically from current tax rates
  const salaryData = React.useMemo(() => generateSalaryData(), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={cn('bg-gradient-to-br from-accent/5 to-primary/5', 'py-16')}
    >
      <div className={cn('mx-auto max-w-6xl', SPACING.PX_4)}>
        <div className={cn('text-center', SPACING.MB_10)}>
          <h2
            className={cn(
              'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
              SPACING.MB_3,
              TYPOGRAPHY.TEXT_4XL,
            )}
          >
            Salary Take-Home Comparison
          </h2>
          <p className={`${TYPOGRAPHY.TEXT_LG} text-muted-foreground`}>
            See exactly how much you&apos;ll take home at different salary levels
          </p>
        </div>

        <div className='relative'>
          <ScrollIndicator direction='left' visible={showLeftIndicator} />
          <ScrollIndicator direction='right' visible={showRightIndicator} />

          <Card className='overflow-hidden'>
            <section
              ref={comparisonTableRef}
              className='overflow-x-auto scroll-smooth'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
                WebkitOverflowScrolling: 'touch',
              }}
              aria-label='Salary comparison table - scrollable'
            >
              <table className='w-full min-w-[640px] border-collapse'>
                <thead className='bg-gradient-to-r from-primary/10 to-accent/10'>
                  <tr className='border-border/20 border-b'>
                    <th className={cn('text-left font-bold text-foreground', SPACING.P_4)}>
                      Gross Salary
                    </th>
                    <th className={cn('text-right font-bold text-foreground', SPACING.P_4)}>
                      Income Tax
                    </th>
                    <th className={cn('text-right font-bold text-foreground', SPACING.P_4)}>
                      National Insurance
                    </th>
                    <th className={cn('text-right font-bold text-foreground', SPACING.P_4)}>
                      Annual Take-Home
                    </th>
                    <th className={cn('text-right font-bold text-foreground', SPACING.P_4)}>
                      Monthly Take-Home
                    </th>
                  </tr>
                </thead>
                <tbody className={TYPOGRAPHY.TEXT_SM}>
                  {salaryData.map((row, idx) => (
                    <tr
                      key={row.salary}
                      className={`border-border/10 border-b transition-colors hover:bg-primary/5 ${idx % 2 === 0 ? 'bg-muted/20' : ''}`}
                    >
                      <td className={SPACING.P_4}>
                        <Link
                          href={`/calculator/${row.salary}-after-tax`}
                          className='font-semibold text-foreground hover:text-primary hover:underline'
                        >
                          £{row.salary.toLocaleString()}
                        </Link>
                      </td>
                      <td className={cn('text-right text-destructive', SPACING.P_4)}>
                        £{row.tax.toLocaleString()}
                      </td>
                      <td
                        className={cn('text-right text-amber-600 dark:text-amber-400', SPACING.P_4)}
                      >
                        £{row.ni.toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          'text-right font-bold text-green-600 dark:text-green-400',
                          SPACING.P_4,
                        )}
                      >
                        £{row.annual.toLocaleString()}
                      </td>
                      <td className={cn('text-right text-muted-foreground', SPACING.P_4)}>
                        £{row.monthly.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </Card>
        </div>

        <div className={cn('text-center', SPACING.MT_6)}>
          <p className={`text-muted-foreground ${TYPOGRAPHY.TEXT_SM}`}>
            Based on England/Wales/NI rates for 2025-26. Scottish rates differ.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
