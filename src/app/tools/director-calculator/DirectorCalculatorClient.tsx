// src/app/tools/director-calculator/DirectorCalculatorClient.tsx
// Pro tool - all features, quick inputs, results table
'use client';

import { AlertTriangle, Calendar, CheckCircle2, Download, ExternalLink, Info, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import { calculateStrategyComparison, type StrategyComparison } from '@/lib/tax/strategyComparison';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';

// Tax year config - update this when adding new tax years
const CURRENT_TAX_YEAR: TaxYear = '2025-2026';
const TAX_YEAR_DISPLAY = '2025/26'; // Human-readable format
import { isNormalMode } from '@/lib/validation/directorValidation';

type Region = 'rUK' | 'scotland';
type YearEndMonth = '03' | '12' | 'other' | 'unknown';
type TakenViaPayroll = 'yes' | 'no' | 'unsure';

export function DirectorCalculatorClient() {
  // Core inputs
  const [revenue, setRevenue] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [region, setRegion] = useState<Region>('rUK');
  const [includesVat, setIncludesVat] = useState(false);

  // Already taken inputs
  const [alreadyTaken, setAlreadyTaken] = useState<string>('0');
  const [takenViaPayroll, setTakenViaPayroll] = useState<TakenViaPayroll>('unsure');

  // Other income
  const [otherIncome, setOtherIncome] = useState<string>('0');

  // Year-end for deadlines
  const [yearEndMonth, setYearEndMonth] = useState<YearEndMonth>('03');
  const [yearEndCustom, setYearEndCustom] = useState<string>('');

  // Employment Allowance
  const [hasEmploymentAllowance, setHasEmploymentAllowance] = useState(false);

  // Results
  const [result, setResult] = useState<DirectorCalculationResult | null>(null);
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'allSalary' | 'optimalMix' | 'allDividends'>('optimalMix');

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setComparison(null);

    const revenueNum = parseFloat(revenue) || 0;
    const expensesNum = parseFloat(expenses) || 0;
    const alreadyTakenNum = parseFloat(alreadyTaken) || 0;
    const otherIncomeNum = parseFloat(otherIncome) || 0;

    if (revenueNum < 0) {
      setError('Revenue cannot be negative');
      return;
    }

    // Map takenViaPayroll to boolean | null
    const takenViaPayrollValue =
      takenViaPayroll === 'yes' ? true : takenViaPayroll === 'no' ? false : null;

    try {
      // Main calculation (optimal mix)
      const calcResult = calculateDirectorScenario(
        {
          region,
          revenue: revenueNum,
          includesVat,
          expenses: expensesNum,
          alreadyTaken: alreadyTakenNum,
          alreadyTakenViaPayroll: takenViaPayrollValue,
          confirmedSoleIncome: otherIncomeNum === 0,
        },
        CURRENT_TAX_YEAR
      );
      setResult(calcResult);

      // Strategy comparison (includes other income for dividend tax calc)
      const comparisonResult = calculateStrategyComparison(
        {
          region,
          revenue: revenueNum,
          includesVat,
          expenses: expensesNum,
          otherIncome: otherIncomeNum,
          employmentAllowance: hasEmploymentAllowance,
        },
        CURRENT_TAX_YEAR
      );
      setComparison(comparisonResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const isNormal = result && isNormalMode(result);

  // Calculate key dates based on year-end
  const getKeyDates = () => {
    if (yearEndMonth === 'unknown') return null;

    const now = new Date();
    const currentYear = now.getFullYear();

    let yearEndDate: Date;
    if (yearEndMonth === '03') {
      yearEndDate = new Date(currentYear, 2, 31); // 31 March
    } else if (yearEndMonth === '12') {
      yearEndDate = new Date(currentYear, 11, 31); // 31 December
    } else if (yearEndMonth === 'other' && yearEndCustom) {
      const [month, day] = yearEndCustom.split('-').map(Number);
      if (month && day) {
        yearEndDate = new Date(currentYear, month - 1, day);
      } else {
        return null;
      }
    } else {
      return null;
    }

    // If year-end has passed this year, use next year
    if (yearEndDate < now) {
      yearEndDate.setFullYear(currentYear + 1);
    }

    // CT payment: 9 months + 1 day after year end
    const ctPaymentDate = new Date(yearEndDate);
    ctPaymentDate.setMonth(ctPaymentDate.getMonth() + 9);
    ctPaymentDate.setDate(ctPaymentDate.getDate() + 1);

    // CT return: 12 months after year end
    const ctReturnDate = new Date(yearEndDate);
    ctReturnDate.setFullYear(ctReturnDate.getFullYear() + 1);

    // SA payment: 31 January following tax year end (5 April)
    const taxYearEnd = new Date(yearEndDate.getFullYear(), 3, 5); // 5 April
    if (yearEndDate > taxYearEnd) {
      // Year-end is after 5 April, so SA due following January
      taxYearEnd.setFullYear(taxYearEnd.getFullYear() + 1);
    }
    const saPaymentDate = new Date(taxYearEnd.getFullYear() + 1, 0, 31); // 31 January

    return {
      yearEnd: yearEndDate,
      ctPayment: ctPaymentDate,
      ctReturn: ctReturnDate,
      saPayment: saPaymentDate,
    };
  };

  const keyDates = getKeyDates();
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Generate .ics calendar file
  const generateICS = (title: string, date: Date, description: string) => {
    const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PayeTax//Director Calculator//EN
BEGIN:VEVENT
UID:${Date.now()}@payetax.co.uk
DTSTAMP:${formatICSDate(new Date())}
DTSTART;VALUE=DATE:${date.toISOString().split('T')[0]?.replace(/-/g, '') ?? ''}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate VAT threshold warning
  const netRevenue = includesVat ? (parseFloat(revenue) || 0) / 1.2 : (parseFloat(revenue) || 0);
  const showVatWarning = netRevenue > 85000 && netRevenue < 95000;
  const showVatRequired = netRevenue >= 90000;

  return (
    <div className='mx-auto max-w-4xl p-6'>
      <h1 className='mb-2 font-bold text-3xl'>Director Calculator</h1>
      <p className='mb-6 text-muted-foreground'>
        Salary vs dividend comparison. Enter your numbers, see all strategies.
      </p>

      <TooltipProvider>
        {/* Core Inputs */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Company Financials</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='revenue'>Annual Revenue</Label>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='revenue'
                    type='number'
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder='100000'
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='includesVat'
                    checked={includesVat}
                    onCheckedChange={(checked) => setIncludesVat(checked === true)}
                  />
                  <Label htmlFor='includesVat' className='text-sm'>
                    Includes VAT (we&apos;ll deduct 20%)
                  </Label>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expenses'>Business Expenses</Label>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='expenses'
                    type='number'
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder='20000'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='region'>Region</Label>
                <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
                  <SelectTrigger id='region'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='rUK'>England / Wales / NI</SelectItem>
                    <SelectItem value='scotland'>Scotland</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='yearEnd'>Financial Year End</Label>
                <Select
                  value={yearEndMonth}
                  onValueChange={(v) => setYearEndMonth(v as YearEndMonth)}
                >
                  <SelectTrigger id='yearEnd'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='03'>31 March (most common)</SelectItem>
                    <SelectItem value='12'>31 December</SelectItem>
                    <SelectItem value='other'>Other date</SelectItem>
                    <SelectItem value='unknown'>I don&apos;t know</SelectItem>
                  </SelectContent>
                </Select>
                {yearEndMonth === 'other' && (
                  <Input
                    type='text'
                    value={yearEndCustom}
                    onChange={(e) => setYearEndCustom(e.target.value)}
                    placeholder='MM-DD (e.g. 06-30)'
                    className='mt-2'
                  />
                )}
                {yearEndMonth === 'unknown' && (
                  <p className='text-muted-foreground text-xs'>
                    Check Companies House or your accountant
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Director Situation */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Your Situation</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label htmlFor='alreadyTaken'>Already Taken This Year</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        Money you&apos;ve already transferred from company to personal account
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='alreadyTaken'
                    type='number'
                    value={alreadyTaken}
                    onChange={(e) => setAlreadyTaken(e.target.value)}
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label htmlFor='takenViaPayroll'>Was this via payroll?</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        If not via payroll, it may be a Director&apos;s Loan with tax implications
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={takenViaPayroll}
                  onValueChange={(v) => setTakenViaPayroll(v as TakenViaPayroll)}
                >
                  <SelectTrigger id='takenViaPayroll'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='yes'>Yes, via payroll/RTI</SelectItem>
                    <SelectItem value='no'>No, direct transfer</SelectItem>
                    <SelectItem value='unsure'>Not sure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label htmlFor='otherIncome'>Other Personal Income</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        Employment salary, rental income, etc. Affects your dividend tax bands.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='otherIncome'
                    type='number'
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label>Employment Allowance</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        £10,500 allowance against Employer NI for {TAX_YEAR_DISPLAY}. Most single-director
                        companies don&apos;t qualify (must have other employees or NI liability
                        below £100k in previous year).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2 pt-2'>
                  <Checkbox
                    id='employmentAllowance'
                    checked={hasEmploymentAllowance}
                    onCheckedChange={(checked) => setHasEmploymentAllowance(checked === true)}
                  />
                  <Label htmlFor='employmentAllowance' className='text-sm'>
                    Company claims Employment Allowance
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={handleCalculate} className='w-full sm:w-auto'>
              Calculate
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className='mb-6 border-destructive'>
            <CardContent className='pt-6'>
              <p className='text-destructive'>Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Payroll Warning - Always show after calculation */}
        {result && isNormal && (
          <Card className='mb-6 border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-blue-700 dark:text-blue-400'>
                <Users className='size-5' />
                Payroll Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <p className='mb-2'>
                <strong>If you pay yourself a salary, you must run payroll:</strong>
              </p>
              <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                <li>Register as employer with HMRC</li>
                <li>Submit RTI (Real Time Information) each payday</li>
                <li>Pay PAYE/NI monthly (or quarterly if under £1,500/month)</li>
              </ul>
              <p className='mt-2 text-muted-foreground'>
                Software like FreeAgent, Xero, or a payroll bureau can handle this for you.
              </p>
            </CardContent>
          </Card>
        )}

        {/* VAT Threshold Warning */}
        {(showVatWarning || showVatRequired) && (
          <Card className={`mb-6 ${showVatRequired ? 'border-red-500/50 bg-red-50/30 dark:bg-red-950/20' : 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'}`}>
            <CardHeader className='pb-2'>
              <CardTitle className={`flex items-center gap-2 ${showVatRequired ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                <AlertTriangle className='size-5' />
                {showVatRequired ? 'VAT Registration Required' : 'Approaching VAT Threshold'}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              {showVatRequired ? (
                <p>
                  Your revenue exceeds £90,000 - <strong>you must register for VAT</strong>. 
                  If not already registered, contact HMRC immediately. Late registration incurs penalties.
                </p>
              ) : (
                <p>
                  Your revenue is approaching the £90,000 VAT threshold. 
                  Monitor closely - you must register within 30 days of exceeding it.
                </p>
              )}
              <a 
                href="https://www.gov.uk/vat-registration" 
                target="_blank" 
                rel="noopener noreferrer"
                className='mt-2 inline-flex items-center gap-1 text-primary hover:underline'
              >
                Learn more about VAT registration <ExternalLink className='size-3' />
              </a>
            </CardContent>
          </Card>
        )}

        {/* Survival Mode - No/Low Profit */}
        {result && !isNormal && (
          <Card className='mb-6 border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-amber-700 dark:text-amber-400'>
                <AlertTriangle className='size-5' />
                {result.mode === 'survival' ? 'No Profit Yet' : 'Low Profit Year'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='mb-4'>{result.message}</p>
              <div className='space-y-2 text-sm'>
                <p><strong>Your options:</strong></p>
                <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                  <li>Dividends are NOT possible without profits/distributable reserves</li>
                  <li>Money taken = Director&apos;s Loan (must be repaid or face 33.75% S455 tax)</li>
                  <li>If you previously invested money IN, you can repay that loan to yourself</li>
                  <li>Safest approach: don&apos;t extract beyond expenses until profitable</li>
                </ul>
                {result.maxPossibleSalary > 0 && (
                  <p className='mt-3'>
                    <strong>Maximum salary possible:</strong> {formatCurrency(result.maxPossibleSalary)}
                  </p>
                )}
                {result.grossProfit < 0 && (
                  <div className='mt-4 rounded-md border border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20'>
                    <p className='font-medium text-green-700 dark:text-green-400'>Silver lining:</p>
                    <ul className='mt-1 list-inside list-disc space-y-1 text-muted-foreground'>
                      <li>Your {formatCurrency(Math.abs(result.grossProfit))} loss carries forward to reduce future Corporation Tax</li>
                      <li>You must still file a CT600 (even with a loss) to claim this relief</li>
                      <li>If VAT registered, you can reclaim VAT on your business expenses</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments on Account Warning */}
        {result && isNormal && result.includesPOA && (
          <Card className='mb-6 border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-amber-700 dark:text-amber-400'>
                <AlertTriangle className='size-5' />
                Payments on Account (Year 2 Surprise)
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <p className='mb-2'>
                Your dividend tax exceeds £1,000, so HMRC may require <strong>Payments on Account</strong>.
              </p>
              <p className='text-muted-foreground'>
                This means paying 50% of next year&apos;s estimated tax in advance (January + July).
                Your first Self Assessment bill may be <strong>150% of normal</strong> - plan for this!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Strategy Comparison Table */}
        {comparison && comparison.grossProfit > 0 && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Strategy Comparison</CardTitle>
              {comparison.savingsVsAllSalary > 0 && (
                <p className='text-muted-foreground text-sm'>
                  Save {formatCurrency(comparison.savingsVsAllSalary)} vs all-salary approach
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead className='text-right'>Salary</TableHead>
                      <TableHead className='text-right'>Dividends</TableHead>
                      <TableHead className='text-right'>Total Tax</TableHead>
                      <TableHead className='text-right'>Take-Home</TableHead>
                      <TableHead className='text-right'>Effective Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(comparison.strategies).map(([key, strategy]) => (
                      <TableRow
                        key={key}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedStrategy === key 
                            ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset dark:bg-blue-950/30' 
                            : comparison.recommended === key 
                              ? 'bg-green-50 dark:bg-green-950/20' 
                              : ''
                        }`}
                        onClick={() => setSelectedStrategy(key as 'allSalary' | 'optimalMix' | 'allDividends')}
                      >
                        <TableCell className='font-medium'>
                          {strategy.name}
                          {comparison.recommended === key && (
                            <span className='ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300'>
                              Best
                            </span>
                          )}
                          {selectedStrategy === key && (
                            <CheckCircle2 className='ml-2 inline size-4 text-blue-600' />
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(strategy.salary)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(strategy.dividends)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(
                            strategy.totalPersonalTax +
                              strategy.corporationTax +
                              strategy.employerNI
                          )}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {formatCurrency(strategy.takeHome)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {strategy.effectiveRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Tax Breakdown by Strategy */}
        {comparison && comparison.grossProfit > 0 && (
          <Card className='mb-6'>
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
                    <TableRow className='bg-muted/30'>
                      <TableCell colSpan={4} className='font-semibold'>
                        Personal Taxes (You Pay)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Income Tax</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.incomeTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.incomeTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.incomeTax)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Employee NI</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.employeeNI)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.employeeNI)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.employeeNI)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Dividend Tax</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.dividendTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.dividendTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.dividendTax)}</TableCell>
                    </TableRow>
                    <TableRow className='font-medium'>
                      <TableCell className='pl-6'>Subtotal (Personal)</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.totalPersonalTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.totalPersonalTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.totalPersonalTax)}</TableCell>
                    </TableRow>
                    <TableRow className='bg-muted/30'>
                      <TableCell colSpan={4} className='font-semibold'>
                        Company Taxes (Company Pays)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Employer NI</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.employerNI)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.employerNI)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.employerNI)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Corporation Tax</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.corporationTax)}</TableCell>
                    </TableRow>
                    <TableRow className='font-medium'>
                      <TableCell className='pl-6'>Subtotal (Company)</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.employerNI + comparison.strategies.allSalary.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.employerNI + comparison.strategies.optimalMix.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.employerNI + comparison.strategies.allDividends.corporationTax)}</TableCell>
                    </TableRow>
                    <TableRow className='bg-muted/50 font-semibold'>
                      <TableCell>TOTAL TAX (All Sources)</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allSalary.totalPersonalTax + comparison.strategies.allSalary.employerNI + comparison.strategies.allSalary.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.optimalMix.totalPersonalTax + comparison.strategies.optimalMix.employerNI + comparison.strategies.optimalMix.corporationTax)}</TableCell>
                      <TableCell className='text-right'>{formatCurrency(comparison.strategies.allDividends.totalPersonalTax + comparison.strategies.allDividends.employerNI + comparison.strategies.allDividends.corporationTax)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NI Credits / State Pension Note */}
        {comparison && comparison.grossProfit > 0 && (
          <Card className='mb-6 border-slate-500/30 bg-slate-50/30 dark:bg-slate-950/20'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Info className='size-5' />
                NI Credits &amp; State Pension
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <div className='space-y-2'>
                <p>
                  <strong>Lower Earnings Limit (LEL):</strong> {formatCurrency(TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit)}/year ({formatCurrency(Math.round(TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit / 12))}/month)
                </p>
                <p className='text-muted-foreground'>
                  Salary above LEL earns NI credits toward your State Pension, even if below the Primary Threshold where you start paying NI.
                </p>
                <div className='mt-3 rounded-lg bg-muted/50 p-3'>
                  {comparison.strategies.optimalMix.salary >= TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit ? (
                    <p className='text-green-700 dark:text-green-400'>
                      ✓ <strong>Optimal Mix salary ({formatCurrency(comparison.strategies.optimalMix.salary)})</strong> qualifies for NI credits - you&apos;ll build State Pension entitlement.
                    </p>
                  ) : (
                    <p className='text-amber-700 dark:text-amber-400'>
                      ⚠ <strong>Salary below {formatCurrency(TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit)}</strong> - you won&apos;t earn NI credits this year. Consider paying at least {formatCurrency(TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit)} salary to protect your State Pension.
                    </p>
                  )}
                </div>
                <p className='mt-2 text-muted-foreground text-xs'>
                  The £12,570 &quot;optimal&quot; salary is above the LEL, so you automatically qualify for NI credits without paying any NI.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        {result && comparison && (
          <>
            <Card className='mb-6'>
              <CardHeader>
                <CardTitle>
                  Results: {comparison.strategies[selectedStrategy].name}
                </CardTitle>
                <CardDescription>
                  {selectedStrategy === 'allSalary' && 'Take everything as PAYE salary'}
                  {selectedStrategy === 'optimalMix' && '£12,570 salary + dividends from remaining profit'}
                  {selectedStrategy === 'allDividends' && 'Minimum salary + maximum dividends'}
                  {selectedStrategy !== comparison.recommended && (
                    <span className='ml-2 text-amber-600'>
                      (Not optimal - take-home is {formatCurrency(comparison.strategies[comparison.recommended].takeHome - comparison.strategies[selectedStrategy].takeHome)} lower)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isNormal ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                        <TableHead className='text-right'>Rate/Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Income Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>Income</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Gross Profit</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.grossProfit)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>Revenue − Expenses</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Salary</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].salary)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>{formatCurrency(comparison.strategies[selectedStrategy].salary / 12)}/month</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dividends</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].dividends)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>After CT paid</TableCell>
                      </TableRow>

                      {/* Personal Taxes Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>Personal Taxes (You Pay)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Income Tax (on salary)</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].incomeTax)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {comparison.strategies[selectedStrategy].salary <= 12570 ? 'Within Personal Allowance' : '20-45%'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Employee NI (on salary)</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].employeeNI)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {comparison.strategies[selectedStrategy].salary <= 12570 ? 'Below threshold' : '8% / 2%'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dividend Tax</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].dividendTax)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>8.75% / 33.75% / 39.35%</TableCell>
                      </TableRow>
                      <TableRow className='font-medium'>
                        <TableCell>Personal Tax Total</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax)}</TableCell>
                        <TableCell className='text-right'></TableCell>
                      </TableRow>

                      {/* Company Taxes Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>Company Taxes (Company Pays)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Employer NI</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].employerNI)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {hasEmploymentAllowance ? '15% above £5k (minus £10.5k EA)' : '15% above £5,000'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Corporation Tax</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].corporationTax)}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>19-25%</TableCell>
                      </TableRow>
                      <TableRow className='font-medium'>
                        <TableCell>Company Tax Total</TableCell>
                        <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].employerNI + comparison.strategies[selectedStrategy].corporationTax)}</TableCell>
                        <TableCell className='text-right'></TableCell>
                      </TableRow>

                      {/* Totals Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>Summary</TableCell>
                      </TableRow>
                      <TableRow className='bg-red-50 dark:bg-red-950/20'>
                        <TableCell className='font-medium text-red-700 dark:text-red-400'>Total Tax (All Sources)</TableCell>
                        <TableCell className='text-right font-medium text-red-700 dark:text-red-400'>
                          {formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax + comparison.strategies[selectedStrategy].employerNI + comparison.strategies[selectedStrategy].corporationTax)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {comparison.strategies[selectedStrategy].effectiveRate.toFixed(1)}% effective
                        </TableCell>
                      </TableRow>
                      <TableRow className='bg-green-50 dark:bg-green-950/20'>
                        <TableCell className='font-semibold text-green-700 dark:text-green-400'>Annual Take-Home</TableCell>
                        <TableCell className='text-right font-semibold text-green-700 dark:text-green-400'>
                          {formatCurrency(comparison.strategies[selectedStrategy].takeHome)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {formatCurrency(comparison.strategies[selectedStrategy].takeHome / 12)}/month
                        </TableCell>
                      </TableRow>
                      {parseFloat(alreadyTaken) > 0 && (
                        <TableRow>
                          <TableCell>Remaining (after {formatCurrency(parseFloat(alreadyTaken))} taken)</TableCell>
                          <TableCell className='text-right'>{formatCurrency(comparison.strategies[selectedStrategy].takeHome - parseFloat(alreadyTaken))}</TableCell>
                          <TableCell className='text-right'></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='space-y-2'>
                    <p>
                      <span className='font-medium'>Mode:</span> {result.mode}
                    </p>
                    <p>
                      <span className='font-medium'>Message:</span> {result.message}
                    </p>
                    <p>
                      <span className='font-medium'>Max Possible Salary:</span>{' '}
                      {formatCurrency(result.maxPossibleSalary)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Two Pots - Business vs Personal */}
            {isNormal && comparison && (
              <div className='mb-6 grid gap-4 md:grid-cols-2'>
                {/* Company Tax Pot */}
                <Card className='border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>Company Tax Pot</CardTitle>
                    <CardDescription>Keep in business account - don&apos;t touch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='font-bold text-2xl text-blue-700 dark:text-blue-400'>
                      {formatCurrency(comparison.strategies[selectedStrategy].corporationTax + comparison.strategies[selectedStrategy].employerNI)}
                    </div>
                    <div className='mt-2 space-y-1 text-muted-foreground text-sm'>
                      <p>Corporation Tax: {formatCurrency(comparison.strategies[selectedStrategy].corporationTax)}</p>
                      <p>Employer NI: {formatCurrency(comparison.strategies[selectedStrategy].employerNI)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Tax Pot */}
                <Card className='border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>Personal Tax Pot</CardTitle>
                    <CardDescription>Transfer to personal savings account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='font-bold text-2xl text-purple-700 dark:text-purple-400'>
                      {formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax)}
                    </div>
                    <div className='mt-2 space-y-1 text-muted-foreground text-sm'>
                      <p>Income Tax: {formatCurrency(comparison.strategies[selectedStrategy].incomeTax)}</p>
                      <p>Employee NI: {formatCurrency(comparison.strategies[selectedStrategy].employeeNI)}</p>
                      <p>Dividend Tax: {formatCurrency(comparison.strategies[selectedStrategy].dividendTax)}</p>
                      <p>Monthly set-aside: {formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax / 12)}</p>
                      {comparison.strategies[selectedStrategy].dividendTax > 1000 && (
                        <p className='text-amber-600'>* Payments on Account may apply</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bank Transfer References */}
            {isNormal && comparison && (
              <Card className='mb-6'>
                <CardHeader>
                  <CardTitle>Bank Transfer References</CardTitle>
                  <CardDescription>Use these references for your transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between rounded-lg bg-muted/50 p-3'>
                      <div>
                        <p className='font-medium'>Monthly Salary</p>
                        <p className='text-muted-foreground text-sm'>
                          {formatCurrency(comparison.strategies[selectedStrategy].salary / 12)}/month
                        </p>
                      </div>
                      <code className='rounded bg-muted px-2 py-1 text-sm'>SALARY [Month]</code>
                    </div>
                    <div className='flex items-center justify-between rounded-lg bg-muted/50 p-3'>
                      <div>
                        <p className='font-medium'>Dividend Payment</p>
                        <p className='text-muted-foreground text-sm'>When declared</p>
                      </div>
                      <code className='rounded bg-muted px-2 py-1 text-sm'>DIVIDEND</code>
                    </div>
                    <div className='flex items-center justify-between rounded-lg bg-muted/50 p-3'>
                      <div>
                        <p className='font-medium'>Personal Tax Savings</p>
                        <p className='text-muted-foreground text-sm'>
                          {formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax / 12)}/month
                        </p>
                      </div>
                      <code className='rounded bg-muted px-2 py-1 text-sm'>TAX SAVE</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Dates with Calendar Download */}
            {isNormal && keyDates && (
              <Card className='mb-6'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='size-5' />
                    Key Dates
                  </CardTitle>
                  <CardDescription>
                    Click the download icon to add reminders to your calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Year End</p>
                        <p className='text-muted-foreground text-sm'>Financial year ends</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.yearEnd)}</p>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Corporation Tax Payment</p>
                        <p className='text-muted-foreground text-sm'>
                          {comparison ? formatCurrency(comparison.strategies[selectedStrategy].corporationTax) : formatCurrency(result.corporationTax)} due
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.ctPayment)}</p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => generateICS(
                            'Corporation Tax Payment Due',
                            keyDates.ctPayment,
                            `Pay ${comparison ? formatCurrency(comparison.strategies[selectedStrategy].corporationTax) : formatCurrency(result.corporationTax)} Corporation Tax to HMRC`
                          )}
                        >
                          <Download className='size-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>CT Return Due</p>
                        <p className='text-muted-foreground text-sm'>File CT600 with HMRC</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.ctReturn)}</p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => generateICS(
                            'Corporation Tax Return Due',
                            keyDates.ctReturn,
                            'File CT600 return with HMRC'
                          )}
                        >
                          <Download className='size-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Self Assessment Payment</p>
                        <p className='text-muted-foreground text-sm'>
                          {comparison ? formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax) : formatCurrency(result.personalTaxAnnual)} due
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.saPayment)}</p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => generateICS(
                            'Self Assessment Tax Due',
                            keyDates.saPayment,
                            `Pay ${comparison ? formatCurrency(comparison.strategies[selectedStrategy].totalPersonalTax) : formatCurrency(result.personalTaxAnnual)} Self Assessment tax to HMRC`
                          )}
                        >
                          <Download className='size-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 border-t pt-4'>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => {
                        const ctAmount = comparison ? comparison.strategies[selectedStrategy].corporationTax : result.corporationTax;
                        const saAmount = comparison ? comparison.strategies[selectedStrategy].totalPersonalTax : result.personalTaxAnnual;
                        generateICS('Corporation Tax Payment Due', keyDates.ctPayment, `Pay ${formatCurrency(ctAmount)} CT`);
                        setTimeout(() => generateICS('CT Return Due', keyDates.ctReturn, 'File CT600'), 100);
                        setTimeout(() => generateICS('Self Assessment Due', keyDates.saPayment, `Pay ${formatCurrency(saAmount)} SA`), 200);
                      }}
                    >
                      <Download className='mr-2 size-4' />
                      Download All Reminders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Talk to Accountant CTA */}
            {isNormal && (
              <Card className='mb-6 border-green-500/30 bg-green-50/30 dark:bg-green-950/20'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>Need Professional Help?</CardTitle>
                </CardHeader>
                <CardContent className='text-sm'>
                  <p className='mb-3 text-muted-foreground'>
                    This calculator provides estimates based on standard scenarios. Consider speaking to an accountant if:
                  </p>
                  <ul className='mb-4 list-inside list-disc space-y-1 text-muted-foreground'>
                    <li>You have multiple income sources</li>
                    <li>Your profit exceeds £100,000</li>
                    <li>You&apos;re unsure about VAT registration</li>
                    <li>You need help with payroll setup</li>
                    <li>You want to optimize pension contributions</li>
                  </ul>
                  <Button variant='outline' className='w-full' asChild>
                    <a 
                      href='https://www.unbiased.co.uk/find-an-accountant' 
                      target='_blank' 
                      rel='noopener noreferrer'
                    >
                      Find an Accountant <ExternalLink className='ml-2 size-4' />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Assumptions & Limitations */}
            <Card className='mb-6 border-slate-300/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-900/30'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>Assumptions &amp; Limitations</CardTitle>
              </CardHeader>
              <CardContent className='text-sm'>
                <div className='space-y-3'>
                  <div>
                    <p className='font-medium'>This calculator assumes:</p>
                    <ul className='mt-1 list-inside list-disc space-y-0.5 text-muted-foreground'>
                      <li>You&apos;re the sole director of a UK limited company</li>
                      <li>{TAX_YEAR_DISPLAY} tax year rates</li>
                      <li>No associated companies (CT thresholds would be divided)</li>
                      <li>12-month accounting period (short periods pro-rate CT thresholds)</li>
                      <li>NI Category A (standard) — other categories (B, C, H, etc.) have different rates</li>
                      <li>Annual NI method for directors — monthly payroll deductions may differ slightly</li>
                      <li>Under State Pension age — if over SPA, employee NI is not due</li>
                      <li>No pension contributions (these reduce taxable income)</li>
                      <li>Dividends taken within the same tax year</li>
                    </ul>
                  </div>
                  <div>
                    <p className='font-medium'>Not covered (talk to an accountant):</p>
                    <ul className='mt-1 list-inside list-disc space-y-0.5 text-muted-foreground'>
                      <li><strong>Distributable reserves</strong> — Dividends require accumulated profits, not just this year&apos;s profit. If prior years had losses, dividends may not be legally available even if profitable now</li>
                      <li><strong>Director&apos;s Loans (DLA)</strong> — If you&apos;ve taken money without declaring it as salary/dividends, you may owe S455 tax (33.75%) until repaid</li>
                      <li><strong>IR35 / Off-payroll rules</strong> — If caught inside IR35, you&apos;re taxed as an employee; this calculator assumes you&apos;re outside IR35</li>
                      <li><strong>Multiple directors/shareholders</strong> — Splitting income between spouses changes the optimal strategy</li>
                      <li><strong>Associated companies</strong> — CT thresholds (£50k/£250k) are divided by number of associated companies</li>
                      <li><strong>R&amp;D tax credits</strong> — Can significantly reduce your CT bill</li>
                      <li><strong>Capital Gains</strong> — Selling shares or company assets has different tax treatment</li>
                      <li><strong>VAT calculations</strong> — We warn if you need to register, but don&apos;t calculate VAT owed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {isNormal && result.warnings.length > 0 && (
              <Card className='border-amber-500/50'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertTriangle className='size-5 text-amber-500' />
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2'>
                    {result.warnings.map((warning, i) => (
                      <li key={i} className='text-sm'>
                        <span className='font-medium'>{warning.type}:</span> {warning.message}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TooltipProvider>
    </div>
  );
}
