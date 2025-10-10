// src/components/organisms/CalculatorResults/ResultsTable.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Building,
  Calculator,
  CreditCard,
  DollarSign,
  GraduationCap,
  Heart,
  Percent,
  PiggyBank,
  Scale,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { ScrollIndicator } from '@/components/atoms/ScrollIndicator';
import { PeriodSelectorCard } from '@/components/molecules/PeriodSelectorCard';
import { ResultTableRow } from '@/components/molecules/ResultTableRow';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

interface ResultsTableProps {
  results: TaxCalculationResults;
  allowancesDeductions?: string;
  studentLoans?: string[];
  hoursPerWeek?: string;
  visiblePeriods?: string[];
  onVisiblePeriodsChange?: (periods: string[]) => void;
}

interface ResultRowData {
  category: string;
  icon: React.ElementType;
  annual: number;
  percentage: string;
  color: string;
  isHighlight?: boolean;
  isSubRow?: boolean;
}

const periodOptions: Record<string, number> = {
  Yearly: 1,
  Monthly: 12,
  '4-Weekly': 13,
  Fortnightly: 26,
  Weekly: 52,
  Daily: 260,
  Hourly: 1950,
};

export function ResultsTable({
  results,
  allowancesDeductions = '0',
  studentLoans = [],
  visiblePeriods = ['Yearly', 'Monthly', 'Weekly'],
  onVisiblePeriodsChange,
}: ResultsTableProps) {
  // Scroll indicators
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = React.useState(false);
  const [showRightIndicator, setShowRightIndicator] = React.useState(false);

  // Check scroll position - recheck when periods change
  // biome-ignore lint/correctness/useExhaustiveDependencies: visiblePeriods needed to trigger recheck when toggling periods
  React.useEffect(() => {
    const checkScrollPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      setShowLeftIndicator(hasHorizontalScroll && scrollLeft > 5);
      setShowRightIndicator(hasHorizontalScroll && scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = containerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition, { passive: true });
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [visiblePeriods]);

  const handlePeriodToggle = (period: string) => {
    if (!onVisiblePeriodsChange) return;

    const newPeriods = visiblePeriods.includes(period)
      ? visiblePeriods.filter((p) => p !== period)
      : (() => {
          // Add period and sort by logical order
          const allPeriods = [
            'Yearly',
            'Monthly',
            '4-Weekly',
            'Fortnightly',
            'Weekly',
            'Daily',
            'Hourly',
          ];
          const combined = [...visiblePeriods, period];
          return allPeriods.filter((p) => combined.includes(p));
        })();

    onVisiblePeriodsChange(newPeriods);
  };

  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  };

  const grossAnnual = results.grossSalary.annually;
  const taxFreeAllowance = results.taxFreeAmount;
  const taxableIncome = results.taxableIncome;
  const allowancesAmount = parseFloat(allowancesDeductions.replace(/,/g, ''));

  const tableRows: ResultRowData[] = [
    {
      category: 'Gross Pay',
      icon: DollarSign,
      annual: grossAnnual,
      percentage: '100%',
      color: 'text-foreground',
      isHighlight: false,
    },
    {
      category: 'Tax-Free Allowance',
      icon: Shield,
      annual: taxFreeAllowance,
      percentage: calculatePercentage(taxFreeAllowance, grossAnnual),
      color: 'text-foreground',
      isHighlight: false,
    },
    {
      category: 'Total Taxable',
      icon: Scale,
      annual: taxableIncome,
      percentage: calculatePercentage(taxableIncome, grossAnnual),
      color: 'text-foreground',
      isHighlight: false,
    },
    {
      category: 'Total Tax Due',
      icon: Calculator,
      annual: results.incomeTax.annually,
      percentage: calculatePercentage(results.incomeTax.annually, grossAnnual),
      color: 'text-red-600 dark:text-red-400',
      isHighlight: false,
    },
    // Tax Band Breakdown
    ...results.taxBands.map((band) => ({
      category: `${band.rate}% Rate`,
      icon: Percent,
      annual: band.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      color: 'text-red-600 dark:text-red-400',
      isHighlight: false,
      isSubRow: true,
    })),
    // Student Loans
    ...(studentLoans.length > 0
      ? [
          {
            category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
            icon: GraduationCap,
            annual: results.studentLoan.annually,
            percentage: calculatePercentage(results.studentLoan.annually, grossAnnual),
            color: 'text-orange-600 dark:text-orange-400',
            isHighlight: false,
          },
        ]
      : []),
    {
      category: 'National Insurance',
      icon: CreditCard,
      annual: results.nationalInsurance.annually,
      percentage: calculatePercentage(results.nationalInsurance.annually, grossAnnual),
      color: 'text-amber-600 dark:text-yellow-400',
      isHighlight: false,
    },
    {
      category: 'Pension [You]',
      icon: PiggyBank,
      annual: results.pensionContribution.annually,
      percentage: calculatePercentage(results.pensionContribution.annually, grossAnnual),
      color: 'text-purple-600 dark:text-purple-400',
      isHighlight: false,
    },
    {
      category: 'Pension [HMRC Relief]',
      icon: Heart,
      annual: 0,
      percentage: 'N/A',
      color: 'text-purple-600 dark:text-purple-400',
      isHighlight: false,
    },
    {
      category: 'Allowances/Deductions',
      icon: DollarSign,
      annual: allowancesAmount,
      percentage: calculatePercentage(allowancesAmount, grossAnnual),
      color: 'text-teal-600 dark:text-teal-400',
      isHighlight: false,
    },
    {
      category: 'Net Pay',
      icon: Wallet,
      annual: results.netPay.annually,
      percentage: calculatePercentage(results.netPay.annually, grossAnnual),
      color: 'text-green-600 dark:text-green-400',
      isHighlight: true,
    },
    {
      category: 'Employers NI',
      icon: Building,
      annual: results.employerNI,
      percentage: calculatePercentage(results.employerNI, grossAnnual),
      color: 'text-muted-foreground',
      isHighlight: false,
    },
    {
      category: 'Net Change from Previous Year',
      icon: TrendingUp,
      annual: 0,
      percentage: '0.0%',
      color: 'text-blue-600 dark:text-blue-400',
      isHighlight: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className='space-y-4'
      style={{ minHeight: '650px' }}
    >
      {/* Period Selection */}
      <PeriodSelectorCard
        periods={Object.keys(periodOptions)}
        visiblePeriods={visiblePeriods}
        onPeriodToggle={handlePeriodToggle}
      />

      {/* Results Table with Scroll Indicators */}
      <div className='-mx-2 relative sm:mx-0'>
        {/* Scroll Indicators */}
        <ScrollIndicator direction='left' visible={showLeftIndicator} />
        <ScrollIndicator direction='right' visible={showRightIndicator} />

        <Card className='overflow-hidden border-primary/20'>
          {/* biome-ignore lint/a11y/useSemanticElements: div needed for ref and scroll functionality */}
          <div
            ref={containerRef}
            className='touch-pan-x overflow-x-auto scroll-smooth'
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'oklch(var(--muted-foreground)) transparent',
              WebkitOverflowScrolling: 'touch',
            }}
            role='region'
            aria-label='Tax calculation results table'
          >
            <Table data-testid='results-table'>
              <TableHeader>
                <TableRow className='bg-card hover:bg-card'>
                  <TableHead className='sticky left-0 z-20 min-w-[160px] bg-card font-semibold sm:min-w-[180px]'>
                    Category
                  </TableHead>
                  <TableHead className='min-w-[50px] text-right font-semibold'>%</TableHead>
                  {visiblePeriods.map((period) => (
                    <TableHead
                      key={period}
                      className='min-w-[90px] text-right font-semibold sm:min-w-[100px]'
                    >
                      {period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) => (
                  <ResultTableRow
                    key={`${row.category}-${index}`}
                    category={row.category}
                    icon={row.icon}
                    annual={row.annual}
                    percentage={row.percentage}
                    color={row.color}
                    isHighlight={row.isHighlight}
                    isSubRow={row.isSubRow}
                    visiblePeriods={visiblePeriods}
                    periodOptions={periodOptions}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <div className='mt-4 flex flex-col items-center gap-2'>
        <p className='text-center text-muted-foreground text-xs'>
          *Pension calculated as salary sacrifice; relief reflected in reduced tax and NI.
        </p>
        {showRightIndicator && (
          <div className='flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 font-medium text-muted-foreground text-xs md:hidden'>
            <span>👈 Swipe to see all periods</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
