// src/components/molecules/SalarySEOContent.tsx
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

  return (
    <div className='prose prose-sm max-w-none'>
      <h2>£{formattedSalary} Salary Take-Home Pay Breakdown</h2>
      <p>
        With a gross annual salary of <strong>£{formattedSalary}</strong> in the UK for the 2025-26
        tax year, your take-home pay will be approximately{' '}
        <strong>£{results.netPay.annually.toLocaleString('en-GB')}</strong> per year, or{' '}
        <strong>£{results.netPay.monthly.toLocaleString('en-GB')}</strong> per month.
      </p>

      <h3>Tax and National Insurance Deductions</h3>
      <ul>
        <li>
          <strong>Income Tax:</strong> £{results.incomeTax.annually.toLocaleString('en-GB')} per
          year ({((results.incomeTax.annually / salary) * 100).toFixed(1)}% of gross)
        </li>
        <li>
          <strong>National Insurance:</strong> £
          {results.nationalInsurance.annually.toLocaleString('en-GB')} per year (
          {((results.nationalInsurance.annually / salary) * 100).toFixed(1)}% of gross)
        </li>
        <li>
          <strong>Total Deductions:</strong> £
          {(
            results.incomeTax.annually +
            results.nationalInsurance.annually +
            results.studentLoan.annually
          ).toLocaleString('en-GB')}{' '}
          per year (
          {(
            ((results.incomeTax.annually + results.nationalInsurance.annually) / salary) *
            100
          ).toFixed(1)}
          % effective rate)
        </li>
      </ul>

      <h3>Is £{formattedSalary} a Good Salary in 2025?</h3>
      <p>
        A £{formattedSalary} salary puts you {salary > 100000 && 'in the top 5% of UK earners'}
        {salary >= 70000 && salary <= 100000 && 'in the top 10% of UK earners'}
        {salary >= 50000 && salary < 70000 && 'well above the UK median salary'}
        {salary >= 30000 && salary < 50000 && 'around the UK median salary'}
        {salary < 30000 && 'below the UK median salary, but above minimum wage'}. The UK median
        full-time salary is approximately £35,000 (2025 data).
      </p>

      <h3>Customize Your Calculation</h3>
      <p>
        The calculation above uses standard assumptions (tax code 1257L, no student loan, no pension
        contributions). Use the full calculator below to:
      </p>
      <ul>
        <li>Add student loan repayments (Plans 1, 2, 4, 5, or Postgraduate)</li>
        <li>Include pension contributions (with tax relief)</li>
        <li>Apply Scottish tax rates if applicable</li>
        <li>Adjust your tax code</li>
        <li>Account for salary sacrifice schemes</li>
      </ul>
    </div>
  );
}
