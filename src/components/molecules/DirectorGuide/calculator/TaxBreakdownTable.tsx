// src/components/molecules/DirectorGuide/calculator/TaxBreakdownTable.tsx
/**
 * Tax Breakdown Table - Detailed breakdown by strategy
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDirectorFormData, useStrategyComparison } from '@/store/directorGuideStore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function TaxBreakdownTable() {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  if (!comparison || comparison.grossProfit <= 0) return null;

  const { allSalary, optimalMix, allDividends } = comparison.strategies;
  const hasStudentLoans = formData.studentLoanPlans.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Tax Breakdown</CardTitle>
        <CardDescription>
          See exactly what you pay on each side (personal vs company)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Type</TableHead>
                <TableHead className='text-right'>All Salary</TableHead>
                <TableHead className='text-right'>Optimal Mix</TableHead>
                <TableHead className='text-right'>All Dividends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Personal Taxes Section */}
              <TableRow className='bg-muted/30'>
                <TableCell colSpan={4} className='font-semibold'>
                  Personal Taxes (You Pay)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Income Tax</TableCell>
                <TableCell className='text-right'>{formatCurrency(allSalary.incomeTax)}</TableCell>
                <TableCell className='text-right'>{formatCurrency(optimalMix.incomeTax)}</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.incomeTax)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Employee NI</TableCell>
                <TableCell className='text-right'>{formatCurrency(allSalary.employeeNI)}</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employeeNI)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employeeNI)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Dividend Tax</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.dividendTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.dividendTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.dividendTax)}
                </TableCell>
              </TableRow>
              {hasStudentLoans && (
                <TableRow>
                  <TableCell className='pl-6'>Student Loan</TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(allSalary.studentLoan)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(optimalMix.studentLoan)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(allDividends.studentLoan)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className='font-medium'>
                <TableCell className='pl-6'>Subtotal (Personal)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.totalPersonalTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.totalPersonalTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.totalPersonalTax)}
                </TableCell>
              </TableRow>

              {/* Company Taxes Section */}
              <TableRow className='bg-muted/30'>
                <TableCell colSpan={4} className='font-semibold'>
                  Company Taxes (Company Pays)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Employer NI</TableCell>
                <TableCell className='text-right'>{formatCurrency(allSalary.employerNI)}</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employerNI)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employerNI)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Corporation Tax</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.corporationTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.corporationTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.corporationTax)}
                </TableCell>
              </TableRow>
              <TableRow className='font-medium'>
                <TableCell className='pl-6'>Subtotal (Company)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.employerNI + allSalary.corporationTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employerNI + optimalMix.corporationTax)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employerNI + allDividends.corporationTax)}
                </TableCell>
              </TableRow>

              {/* Total */}
              <TableRow className='bg-muted/50 font-semibold'>
                <TableCell>TOTAL TAX (All Sources)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    allSalary.totalPersonalTax + allSalary.employerNI + allSalary.corporationTax
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    optimalMix.totalPersonalTax + optimalMix.employerNI + optimalMix.corporationTax
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    allDividends.totalPersonalTax +
                      allDividends.employerNI +
                      allDividends.corporationTax
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
