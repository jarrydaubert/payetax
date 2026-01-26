// src/components/molecules/DirectorGuide/results/CompanyBox.tsx
'use client';

import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/ui/card';
import { cn } from '@/lib/utils';
import type { DirectorResult } from '@/lib/validation/directorValidation';

interface CompanyBoxProps {
  result: DirectorResult;
  className?: string;
}

/**
 * Formats a number as GBP currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Company position box showing Corporation Tax + Employer NI
 *
 * Educates users that the company is a separate entity with its own taxes.
 */
export function CompanyBox({ result, className }: CompanyBoxProps) {
  const companyTaxPot = formatCurrency(result.companyTaxPot);
  const corporationTax = formatCurrency(result.corporationTax);
  const employerNI = formatCurrency(result.employerNI);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <Building2 className='size-5 text-primary' aria-hidden='true' />
          Your Company
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          The company is separate from you — it has its own tax.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <div className='flex items-baseline justify-between'>
            <span className='font-medium text-muted-foreground text-sm'>Company Tax Pot</span>
            <span className='font-semibold text-foreground text-xl'>{companyTaxPot}</span>
          </div>
          <p className='mt-1 text-muted-foreground text-xs'>
            Set aside for your company&apos;s taxes
          </p>
        </div>

        <div className='space-y-2 border-border/50 border-t pt-3'>
          <p className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
            This includes:
          </p>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Corporation Tax</span>
            <span className='text-foreground'>{corporationTax}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Employer NI</span>
            <span className='text-foreground'>{employerNI}/yr</span>
          </div>
        </div>

        <p className='text-muted-foreground text-xs'>
          Keep this in your business account. Don&apos;t touch it. Due ~9 months after your company
          year ends.
        </p>
      </CardContent>
    </Card>
  );
}
