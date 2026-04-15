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
import { formatCurrency } from '@/lib/utils';
import { useDirectorFormValue, useStrategyComparison } from '@/store/directorGuideStore';

export function TaxBreakdownTable() {
  const hasStudentLoans = useDirectorFormValue((formData) => formData.studentLoanPlans.length > 0);
  const comparison = useStrategyComparison();

  if (!comparison || comparison.grossProfit <= 0) return null;

  const { allSalary, optimalMix, allDividends } = comparison.strategies;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Tax Breakdown</CardTitle>
        <CardDescription>See what you pay on each side (personal vs company)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Type</TableHead>
                <TableHead className='text-right'>All Salary</TableHead>
                <TableHead className='text-right'>Baseline Mix</TableHead>
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
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.incomeTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.incomeTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.incomeTax, 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Employee NI</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.employeeNI, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employeeNI, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employeeNI, 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Dividend Tax</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.dividendTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.dividendTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.dividendTax, 0)}
                </TableCell>
              </TableRow>
              {hasStudentLoans && (
                <TableRow>
                  <TableCell className='pl-6'>Student Loan</TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(allSalary.studentLoan, 0)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(optimalMix.studentLoan, 0)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(allDividends.studentLoan, 0)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className='font-medium'>
                <TableCell className='pl-6'>Subtotal (Personal)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.totalPersonalTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.totalPersonalTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.totalPersonalTax, 0)}
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
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.employerNI, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employerNI, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employerNI, 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='pl-6'>Corporation Tax</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.corporationTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.corporationTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.corporationTax, 0)}
                </TableCell>
              </TableRow>
              <TableRow className='font-medium'>
                <TableCell className='pl-6'>Subtotal (Company)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allSalary.employerNI + allSalary.corporationTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(optimalMix.employerNI + optimalMix.corporationTax, 0)}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(allDividends.employerNI + allDividends.corporationTax, 0)}
                </TableCell>
              </TableRow>

              {/* Total */}
              <TableRow className='bg-muted/50 font-semibold'>
                <TableCell>TOTAL TAX (All Sources)</TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    allSalary.totalPersonalTax + allSalary.employerNI + allSalary.corporationTax,
                    0,
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    optimalMix.totalPersonalTax + optimalMix.employerNI + optimalMix.corporationTax,
                    0,
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatCurrency(
                    allDividends.totalPersonalTax +
                      allDividends.employerNI +
                      allDividends.corporationTax,
                    0,
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
