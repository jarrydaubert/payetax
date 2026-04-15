// src/components/molecules/DirectorGuide/calculator/TaxPots.tsx
/**
 * Tax Pots - Company and Personal tax pots to set aside
 *
 * Dark theme with cyan/emerald accents.
 */
'use client';

import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { formatCurrency } from '@/lib/utils';

export function TaxPots() {
  const { activeScenario } = useActiveDirectorScenario();

  if (!activeScenario) return null;

  const personalTotal =
    activeScenario.incomeTax + activeScenario.dividendTax + activeScenario.studentLoan;
  const companyTotal = activeScenario.corporationTax + activeScenario.employerNI;

  // Monthly set-aside amounts (annual ÷ 12)
  const monthlyCompanyPot = Math.round(companyTotal / 12);
  const monthlyPersonalPot = Math.round(personalTotal / 12);

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Company Tax Pot */}
        <div className='rounded-xl border border-primary/30 bg-card p-5'>
          <div className='mb-4'>
            <h3 className='font-semibold text-primary text-sm'>Company Tax Pot</h3>
            <p className='text-muted-foreground text-xs'>Set aside in company account</p>
          </div>
          <div className='space-y-1.5 text-sm'>
            <div className='flex justify-between text-foreground'>
              <span>Corporation Tax</span>
              <span className='font-mono'>{formatCurrency(activeScenario.corporationTax, 0)}</span>
            </div>
            {activeScenario.employerNI > 0 && (
              <div className='flex justify-between text-foreground'>
                <span>
                  {activeScenario.companyCarBIK > 0 ? 'Employer NI + Class 1A' : 'Employer NI'}
                </span>
                <span className='font-mono'>{formatCurrency(activeScenario.employerNI, 0)}</span>
              </div>
            )}
            <div className='flex justify-between border-border/50 border-t pt-2'>
              <span className='font-medium text-foreground'>Monthly</span>
              <span className='font-mono font-semibold text-primary'>
                {formatCurrency(monthlyCompanyPot, 0)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Personal Tax Pot */}
        <div className='rounded-xl border border-success/30 bg-card p-5'>
          <div className='mb-4'>
            <h3 className='font-semibold text-sm text-success'>Personal Tax Pot</h3>
            <p className='text-muted-foreground text-xs'>Set aside for Self Assessment</p>
          </div>
          <div className='space-y-1.5 text-sm'>
            <div className='flex justify-between text-foreground'>
              <span>Income Tax</span>
              <span className='font-mono'>{formatCurrency(activeScenario.incomeTax, 0)}</span>
            </div>
            <div className='flex justify-between text-foreground'>
              <span>Dividend Tax</span>
              <span className='font-mono'>{formatCurrency(activeScenario.dividendTax, 0)}</span>
            </div>
            {activeScenario.studentLoan > 0 && (
              <div className='flex justify-between text-foreground'>
                <span>Student Loan</span>
                <span className='font-mono'>{formatCurrency(activeScenario.studentLoan, 0)}</span>
              </div>
            )}
            <div className='flex justify-between border-border/50 border-t pt-2'>
              <span className='font-medium text-foreground'>Monthly</span>
              <span className='font-mono font-semibold text-success'>
                {formatCurrency(monthlyPersonalPot, 0)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer per spec */}
      <p className='text-center text-muted-foreground text-xs'>
        Illustrative set-aside for budgeting — not HMRC payment amounts. See Key Dates for actual
        due dates.
      </p>
    </div>
  );
}
