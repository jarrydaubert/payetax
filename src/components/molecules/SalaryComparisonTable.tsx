// src/components/molecules/SalaryComparisonTable.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { Card } from '@/components/ui/card';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { useHorizontalScrollIndicator } from '@/hooks/useHorizontalScrollIndicator';
import { cn } from '@/lib/utils';

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

  const salaryData = [
    { salary: 20000, tax: 1486, ni: 1220, annual: 17294, monthly: 1441 },
    { salary: 25000, tax: 2486, ni: 1920, annual: 20594, monthly: 1716 },
    { salary: 30000, tax: 3486, ni: 2620, annual: 23894, monthly: 1991 },
    { salary: 40000, tax: 5486, ni: 3820, annual: 30694, monthly: 2558 },
    { salary: 50000, tax: 7486, ni: 4720, annual: 37794, monthly: 3150 },
    { salary: 60000, tax: 11432, ni: 5069, annual: 43499, monthly: 3625 },
    { salary: 80000, tax: 19432, ni: 5669, annual: 54899, monthly: 4575 },
    { salary: 100000, tax: 27432, ni: 6069, annual: 66499, monthly: 5542 },
  ];

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
              TYPOGRAPHY.TEXT_4XL
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

          <Card className='overflow-hidden border-primary/20'>
            <div
              ref={comparisonTableRef}
              className='overflow-x-auto scroll-smooth'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
                WebkitOverflowScrolling: 'touch',
              }}
              tabIndex={0}
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
                          SPACING.P_4
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
            </div>
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
