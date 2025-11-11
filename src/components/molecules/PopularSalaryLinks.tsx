// src/components/molecules/PopularSalaryLinks.tsx
import { Calculator } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Popular salary calculator links molecule
 * Grid of common UK salary amounts with links to detailed calculators
 */
export function PopularSalaryLinks() {
  const salaries = [
    { salary: 30000, label: '£30k' },
    { salary: 40000, label: '£40k' },
    { salary: 50000, label: '£50k' },
    { salary: 60000, label: '£60k' },
    { salary: 70000, label: '£70k' },
    { salary: 80000, label: '£80k' },
    { salary: 90000, label: '£90k' },
    { salary: 100000, label: '£100k' },
    { salary: 110000, label: '£110k' },
    { salary: 120000, label: '£120k' },
  ];

  return (
    <section
      className={cn(
        'container mx-auto max-w-7xl',
        SPACING.PX_4,
        SPACING.PY_12,
        'md:px-6 md:py-16 lg:py-20'
      )}
    >
      <div className={cn('text-center', SPACING.MB_12)}>
        <h2
          className={cn(
            'mb-3 font-bold tracking-tight',
            TYPOGRAPHY.TEXT_3XL,
            `md:${TYPOGRAPHY.TEXT_4XL}`
          )}
        >
          Popular Salary Calculators
        </h2>
        <Separator className='mx-auto my-4 w-24' />
        <p className={cn('text-muted-foreground', `md:${TYPOGRAPHY.TEXT_LG}`)}>
          Calculate exact take-home pay for common UK salaries
        </p>
      </div>
      <div
        className={cn(
          'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          SPACING.GAP_4,
          'md:gap-6'
        )}
      >
        {salaries.map(({ salary, label }) => (
          <Button
            key={salary}
            asChild
            variant='outline'
            className={cn(
              'h-auto flex-col transition-all hover:border-primary hover:shadow-md',
              SPACING.GAP_2,
              SPACING.P_4
            )}
          >
            <Link href={`/calculator/${salary}-after-tax`}>
              <Calculator className={`${ICON_SIZES.SIZE_5} text-primary`} aria-hidden='true' />
              <span className='font-semibold text-foreground'>{label} Salary</span>
              <span className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>After Tax</span>
            </Link>
          </Button>
        ))}
      </div>
      <div className='mt-6 text-center'>
        <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
          View detailed breakdowns including income tax, National Insurance, and monthly take-home
          pay
        </p>
      </div>
    </section>
  );
}
