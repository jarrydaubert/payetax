// src/components/molecules/SalarySEOContent.tsx
import Link from 'next/link';
import { getNearestSalaryPageTarget } from '@/constants/salaryPageTargets';
import { HMRC_INCOME_TAX_RATES_URL, HMRC_NI_RATES_URL, ONS_ASHE_URL } from '@/constants/sources';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

interface SalarySEOContentProps {
  salary: number;
  results: TaxCalculationResults;
}

/**
 * SEO-optimized content molecule for salary landing pages
 * Provides detailed breakdown, salary context, and customization instructions
 */
export function SalarySEOContent({ salary, results }: SalarySEOContentProps) {
  const formattedSalary = salary.toLocaleString('en-GB');
  const taxYearDisplay = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '-',
    shortEndYear: true,
  });
  const taxYearStart = CURRENT_TAX_YEAR.split('-')[0] || 'current';
  const nearbySalary = getNearestSalaryPageTarget(salary, { excludeExact: true });
  const nearbySalaryDisplay = nearbySalary.toLocaleString('en-GB');

  return (
    <div className='space-y-6 text-sm'>
      {/* Take-Home Pay Breakdown */}
      <div>
        <h2 className='mb-3 font-semibold text-base text-foreground'>Take-Home Pay Breakdown</h2>
        <p className='text-muted-foreground leading-relaxed'>
          With a gross annual salary of{' '}
          <strong className='text-foreground'>£{formattedSalary}</strong> in the UK for the{' '}
          {taxYearDisplay} tax year, your take-home pay will be approximately{' '}
          <strong className='text-primary'>
            £{results.netPay.annually.toLocaleString('en-GB')}
          </strong>{' '}
          per year, or{' '}
          <strong className='text-primary'>
            £{results.netPay.monthly.toLocaleString('en-GB')}
          </strong>{' '}
          per month.
        </p>
      </div>

      {/* Tax and NI Deductions */}
      <div>
        <h3 className='mb-3 font-semibold text-base text-foreground'>
          Tax and National Insurance Deductions
        </h3>
        <ul className='space-y-2 text-muted-foreground'>
          <li className='flex justify-between border-border/50 border-b pb-2'>
            <span>
              <strong className='text-foreground'>Income Tax:</strong>
            </span>
            <span>
              £{results.incomeTax.annually.toLocaleString('en-GB')}/year{' '}
              <span className='text-xs'>
                ({((results.incomeTax.annually / salary) * 100).toFixed(1)}%)
              </span>
            </span>
          </li>
          <li className='flex justify-between border-border/50 border-b pb-2'>
            <span>
              <strong className='text-foreground'>National Insurance:</strong>
            </span>
            <span>
              £{results.nationalInsurance.annually.toLocaleString('en-GB')}/year{' '}
              <span className='text-xs'>
                ({((results.nationalInsurance.annually / salary) * 100).toFixed(1)}%)
              </span>
            </span>
          </li>
          <li className='flex justify-between font-medium text-foreground'>
            <span>Total Deductions:</span>
            <span>
              £
              {(results.incomeTax.annually + results.nationalInsurance.annually).toLocaleString(
                'en-GB',
              )}
              /year{' '}
              <span className='text-xs'>
                (
                {(
                  ((results.incomeTax.annually + results.nationalInsurance.annually) / salary) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </span>
          </li>
        </ul>
        <p className='mt-2 text-muted-foreground text-xs'>
          Sources:{' '}
          <Link
            href={HMRC_INCOME_TAX_RATES_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-2'
          >
            HMRC income tax rates
          </Link>{' '}
          and{' '}
          <Link
            href={HMRC_NI_RATES_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-2'
          >
            HMRC National Insurance rates
          </Link>
          .
        </p>
      </div>

      {/* Salary Context */}
      <div>
        <h3 className='mb-3 font-semibold text-base text-foreground'>
          Is £{formattedSalary} a Good Salary in {taxYearStart}?
        </h3>
        <p className='text-muted-foreground leading-relaxed'>
          A £{formattedSalary} salary puts you{' '}
          {salary > 100000 && (
            <strong className='text-foreground'>
              in the top 5% of UK earners and well above the UK median full-time salary
            </strong>
          )}
          {salary >= 70000 && salary <= 100000 && (
            <strong className='text-foreground'>
              in the top 10% of UK earners and above the UK median full-time salary
            </strong>
          )}
          {salary >= 50000 && salary < 70000 && (
            <strong className='text-foreground'>well above the UK median salary</strong>
          )}
          {salary >= 30000 && salary < 50000 && (
            <strong className='text-foreground'>around the UK median full-time salary</strong>
          )}
          {salary < 30000 && (
            <strong className='text-foreground'>
              below the UK median salary, but above minimum wage
            </strong>
          )}
          .
        </p>
        <p className='mt-2 text-muted-foreground text-xs'>
          Earnings context source:{' '}
          <Link
            href={ONS_ASHE_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-2'
          >
            ONS Annual Survey of Hours and Earnings
          </Link>
          .
        </p>
        {salary >= 100000 && (
          <p className='mt-2 text-muted-foreground text-xs'>
            If you are near or above £100k, read our{' '}
            <Link
              href='/blog/100k-tax-trap-avoid-60-percent-tax-2025'
              className='underline underline-offset-2'
            >
              100k tax trap guide
            </Link>{' '}
            for Personal Allowance taper planning.
          </p>
        )}
        <p className='mt-2 text-muted-foreground text-xs'>
          See also:{' '}
          <Link
            href={`/calculator/${nearbySalary}-after-tax`}
            className='underline underline-offset-2'
          >
            £{nearbySalaryDisplay} after tax
          </Link>
          .
        </p>
      </div>

      {/* Customize */}
      <div>
        <h3 className='mb-3 font-semibold text-base text-foreground'>Customize Your Calculation</h3>
        <p className='mb-3 text-muted-foreground'>
          The calculation above uses standard assumptions (tax code 1257L, no student loan, no
          pension contributions). Use the full calculator below to:
        </p>
        <ul className='space-y-1 text-muted-foreground'>
          <li>• Add student loan repayments (Plans 1, 2, 4, 5, or Postgraduate)</li>
          <li>• Include pension contributions (with tax relief)</li>
          <li>• Apply Scottish tax rates if applicable</li>
          <li>• Adjust your tax code</li>
          <li>• Account for salary sacrifice schemes</li>
        </ul>
      </div>
    </div>
  );
}
