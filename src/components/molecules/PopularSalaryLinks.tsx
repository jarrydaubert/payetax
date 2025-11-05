// src/components/molecules/PopularSalaryLinks.tsx
import { Calculator } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
    <section className='container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:py-20'>
      <div className='mb-12 text-center'>
        <h2 className='mb-3 font-bold text-3xl tracking-tight md:text-4xl'>
          Popular Salary Calculators
        </h2>
        <Separator className='mx-auto my-4 w-24' />
        <p className='text-muted-foreground md:text-lg'>
          Calculate exact take-home pay for common UK salaries
        </p>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5'>
        {salaries.map(({ salary, label }) => (
          <Button
            key={salary}
            asChild
            variant='outline'
            className='h-auto flex-col gap-2 p-4 transition-all hover:border-primary hover:shadow-md'
          >
            <Link href={`/calculator/${salary}-after-tax`}>
              <Calculator className='size-5 text-primary' />
              <span className='font-semibold text-foreground'>{label} Salary</span>
              <span className='text-muted-foreground text-xs'>After Tax</span>
            </Link>
          </Button>
        ))}
      </div>
      <div className='mt-6 text-center'>
        <p className='text-muted-foreground text-sm'>
          View detailed breakdowns including income tax, National Insurance, and monthly take-home
          pay
        </p>
      </div>
    </section>
  );
}
