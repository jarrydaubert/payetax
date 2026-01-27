// src/app/tools/director-calculator/DirectorCalculatorClient.tsx
// Pro tool - all features, quick inputs, results table
'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
  Users,
} from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TAX_RATES, type StudentLoanPlan, type TaxYear } from '@/constants/taxRates';
import { DirectorEmailResultsForm } from '@/components/molecules/DirectorEmailResultsForm';
import { calculateDirectorScenario } from '@/lib/tax/directorCalculator';
import {
  calculateSalaryScenario,
  calculateStrategyComparison,
  type StrategyComparison,
} from '@/lib/tax/strategyComparison';
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

  // Student Loans
  const [studentLoanPlans, setStudentLoanPlans] = useState<StudentLoanPlan[]>([]);

  // Pension
  const [pensionContribution, setPensionContribution] = useState<string>('0');

  // Company Car BIK
  const [companyCarBIK, setCompanyCarBIK] = useState<string>('0');

  // Results
  const [result, setResult] = useState<DirectorCalculationResult | null>(null);
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<
    'allSalary' | 'optimalMix' | 'allDividends'
  >('optimalMix');

  // Salary explorer slider
  const [sliderSalary, setSliderSalary] = useState<number | null>(null);

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
      const pensionNum = parseFloat(pensionContribution) || 0;
      const bikNum = parseFloat(companyCarBIK) || 0;
      const comparisonResult = calculateStrategyComparison(
        {
          region,
          revenue: revenueNum,
          includesVat,
          expenses: expensesNum,
          otherIncome: otherIncomeNum,
          employmentAllowance: hasEmploymentAllowance,
          studentLoanPlans,
          pensionContribution: pensionNum,
          companyCarBIK: bikNum,
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

  // Live scenario calculation - updates with slider
  const activeScenario = (() => {
    if (!comparison || comparison.grossProfit <= 0) return null;
    
    const otherIncomeNum = parseFloat(otherIncome) || 0;
    
    // If slider is being used, calculate custom scenario
    if (sliderSalary !== null) {
      const pensionNum = parseFloat(pensionContribution) || 0;
      const bikNum = parseFloat(companyCarBIK) || 0;
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - pensionNum, // Profit after pension
        region,
        CURRENT_TAX_YEAR,
        otherIncomeNum,
        hasEmploymentAllowance,
        studentLoanPlans,
        pensionNum,
        bikNum
      );
      
      const totalPersonalTax = scenario.incomeTax + scenario.employeeNI + scenario.dividendTax + scenario.studentLoan;
      const effectiveRate = comparison.grossProfit > 0 
        ? ((comparison.grossProfit - scenario.takeHome) / comparison.grossProfit) * 100 
        : 0;
      
      return {
        name: `Custom (£${sliderSalary.toLocaleString()} salary)`,
        salary: scenario.salary,
        dividends: scenario.dividends,
        pension: scenario.pension,
        companyCarBIK: scenario.companyCarBIK,
        employerNI: scenario.employerNI,
        employeeNI: scenario.employeeNI,
        incomeTax: scenario.incomeTax,
        corporationTax: scenario.corporationTax,
        dividendTax: scenario.dividendTax,
        studentLoan: scenario.studentLoan,
        totalPersonalTax,
        companyCost: scenario.salary + scenario.employerNI + scenario.corporationTax,
        takeHome: scenario.takeHome,
        effectiveRate,
      };
    }
    
    // Otherwise use the selected strategy
    return comparison.strategies[selectedStrategy];
  })();

  const maxSliderSalary = comparison 
    ? Math.min(comparison.grossProfit, comparison.strategies.allSalary.salary)
    : 0;

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
  const netRevenue = includesVat ? (parseFloat(revenue) || 0) / 1.2 : parseFloat(revenue) || 0;
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
                <Label htmlFor='expenses'>Business Expenses (excl. Director Salary)</Label>
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
                  <Label htmlFor='pensionContribution'>Employer Pension Contribution</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        <strong>Most tax-efficient extraction method.</strong> Company pays directly to your pension:
                        <span className='mt-1 block'>• Deductible from Corporation Tax</span>
                        <span className='block'>• No Employer or Employee NI</span>
                        <span className='block'>• No Income Tax</span>
                        <span className='mt-1 block text-amber-200'>
                          ⚠️ Annual Allowance: £60,000 (or 100% of earnings if lower)
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='pensionContribution'
                    type='number'
                    value={pensionContribution}
                    onChange={(e) => setPensionContribution(e.target.value)}
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label htmlFor='companyCarBIK'>Company Car (BIK Value)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        <strong>Taxable benefit = List Price × BIK Rate</strong>
                        <span className='mt-1 block'>• Tesla Model 3 (£40k × 2%) = £800/year</span>
                        <span className='block'>• BMW 330e (£45k × 8%) = £3,600/year</span>
                        <span className='block'>• Range Rover (£80k × 37%) = £29,600/year</span>
                        <span className='mt-1 block text-amber-200'>
                          Enter the annual BIK value (List Price × BIK %)
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>£</span>
                  <Input
                    id='companyCarBIK'
                    type='number'
                    value={companyCarBIK}
                    onChange={(e) => setCompanyCarBIK(e.target.value)}
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
                        £10,500 allowance against Employer NI for {TAX_YEAR_DISPLAY}.
                        <strong className='mt-1 block text-amber-200'>
                          ⚠️ Not available to sole director companies
                        </strong>
                        You must have at least one other employee paid above £5,000/year to qualify.
                        Two directors both paid above £5,000 also qualifies.
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

              <div className='space-y-2'>
                <div className='flex items-center gap-1'>
                  <Label>Student Loan</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='size-4 text-muted-foreground' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='max-w-xs'>
                        <strong>Directors pay student loans on TOTAL income</strong> (salary + dividends)
                        via Self Assessment — not just salary.
                        <span className='mt-1 block text-amber-200'>
                          ⚠️ This is different from employees where student loans only come from salary via PAYE.
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='space-y-2 pt-2'>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='plan1'
                      checked={studentLoanPlans.includes('plan1')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStudentLoanPlans([...studentLoanPlans, 'plan1']);
                        } else {
                          setStudentLoanPlans(studentLoanPlans.filter(p => p !== 'plan1'));
                        }
                      }}
                    />
                    <Label htmlFor='plan1' className='text-sm'>
                      Plan 1 (pre-2012, threshold £{TAX_RATES[CURRENT_TAX_YEAR].studentLoan.plan1.threshold.toLocaleString()})
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='plan2'
                      checked={studentLoanPlans.includes('plan2')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStudentLoanPlans([...studentLoanPlans, 'plan2']);
                        } else {
                          setStudentLoanPlans(studentLoanPlans.filter(p => p !== 'plan2'));
                        }
                      }}
                    />
                    <Label htmlFor='plan2' className='text-sm'>
                      Plan 2 (post-2012 England/Wales, threshold £{TAX_RATES[CURRENT_TAX_YEAR].studentLoan.plan2.threshold.toLocaleString()})
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='plan4'
                      checked={studentLoanPlans.includes('plan4')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStudentLoanPlans([...studentLoanPlans, 'plan4']);
                        } else {
                          setStudentLoanPlans(studentLoanPlans.filter(p => p !== 'plan4'));
                        }
                      }}
                    />
                    <Label htmlFor='plan4' className='text-sm'>
                      Plan 4 (Scotland, threshold £{TAX_RATES[CURRENT_TAX_YEAR].studentLoan.plan4.threshold.toLocaleString()})
                    </Label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='postgrad'
                      checked={studentLoanPlans.includes('postgrad')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStudentLoanPlans([...studentLoanPlans, 'postgrad']);
                        } else {
                          setStudentLoanPlans(studentLoanPlans.filter(p => p !== 'postgrad'));
                        }
                      }}
                    />
                    <Label htmlFor='postgrad' className='text-sm'>
                      Postgraduate Loan (threshold £{TAX_RATES[CURRENT_TAX_YEAR].studentLoan.postgrad.threshold.toLocaleString()}, 6%)
                    </Label>
                  </div>
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
          <Card
            className={`mb-6 ${showVatRequired ? 'border-red-500/50 bg-red-50/30 dark:bg-red-950/20' : 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20'}`}
          >
            <CardHeader className='pb-2'>
              <CardTitle
                className={`flex items-center gap-2 ${showVatRequired ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}
              >
                <AlertTriangle className='size-5' />
                {showVatRequired ? 'VAT Registration Required' : 'Approaching VAT Threshold'}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              {showVatRequired ? (
                <p>
                  Your revenue exceeds £90,000 - <strong>you must register for VAT</strong>. If not
                  already registered, contact HMRC immediately. Late registration incurs penalties.
                </p>
              ) : (
                <p>
                  Your revenue is approaching the £90,000 VAT threshold. Monitor closely - you must
                  register within 30 days of exceeding it.
                </p>
              )}
              <a
                href='https://www.gov.uk/vat-registration'
                target='_blank'
                rel='noopener noreferrer'
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
                <p>
                  <strong>Your options:</strong>
                </p>
                <ul className='list-inside list-disc space-y-1 text-muted-foreground'>
                  <li>Dividends are NOT possible without profits/distributable reserves</li>
                  <li>
                    Money taken = Director&apos;s Loan (must be repaid or face 33.75% S455 tax)
                  </li>
                  <li>If you previously invested money IN, you can repay that loan to yourself</li>
                  <li>Safest approach: don&apos;t extract beyond expenses until profitable</li>
                </ul>
                {result.maxPossibleSalary > 0 && (
                  <p className='mt-3'>
                    <strong>Maximum salary possible:</strong>{' '}
                    {formatCurrency(result.maxPossibleSalary)}
                  </p>
                )}
                {result.grossProfit < 0 && (
                  <div className='mt-4 rounded-md border border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20'>
                    <p className='font-medium text-green-700 dark:text-green-400'>Silver lining:</p>
                    <ul className='mt-1 list-inside list-disc space-y-1 text-muted-foreground'>
                      <li>
                        Your {formatCurrency(Math.abs(result.grossProfit))} loss carries forward to
                        reduce future Corporation Tax
                      </li>
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
                Your Self Assessment tax liability exceeds £1,000, so HMRC may require{' '}
                <strong>Payments on Account</strong>.
              </p>
              <p className='text-muted-foreground'>
                This means paying 50% of next year&apos;s estimated tax in advance (January + July).
                Your first Self Assessment bill may be <strong>150% of normal</strong> - plan for
                this!
              </p>
              <p className='mt-2 text-muted-foreground text-xs'>
                <strong>Exception:</strong> POA doesn&apos;t apply if ≥80% of your total tax was
                already collected via PAYE (e.g., from employment income).
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
                        onClick={() =>
                          setSelectedStrategy(key as 'allSalary' | 'optimalMix' | 'allDividends')
                        }
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

        {/* Salary Slider - Controls entire page */}
        {comparison && comparison.grossProfit > 0 && activeScenario && (
          <Card className='mb-6 border-primary/30 bg-primary/5'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center justify-between'>
                <span>Adjust Salary</span>
                {sliderSalary !== null && (
                  <Button variant='outline' size='sm' onClick={() => setSliderSalary(null)}>
                    Reset to Recommended
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Drag to see how the entire breakdown changes in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='text-lg font-semibold'>
                    {formatCurrency(activeScenario.salary)}
                  </Label>
                  <span className='text-muted-foreground'>
                    {formatCurrency(activeScenario.salary / 12)}/month
                  </span>
                </div>
                <Slider
                  value={[sliderSalary ?? activeScenario.salary]}
                  onValueChange={(value) => setSliderSalary(value[0] ?? null)}
                  min={0}
                  max={maxSliderSalary}
                  step={100}
                  className='w-full'
                />
                <div className='flex justify-between text-muted-foreground text-xs'>
                  <button
                    type='button'
                    className='hover:text-primary hover:underline'
                    onClick={() => setSliderSalary(0)}
                  >
                    £0
                  </button>
                  <button
                    type='button'
                    className='hover:text-primary hover:underline'
                    onClick={() => setSliderSalary(TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit)}
                  >
                    £{TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit.toLocaleString()} (LEL)
                  </button>
                  <button
                    type='button'
                    className='hover:text-primary hover:underline'
                    onClick={() => setSliderSalary(TAX_RATES[CURRENT_TAX_YEAR].personalAllowance)}
                  >
                    £{TAX_RATES[CURRENT_TAX_YEAR].personalAllowance.toLocaleString()} (PA)
                  </button>
                  <button
                    type='button'
                    className='hover:text-primary hover:underline'
                    onClick={() => setSliderSalary(50270)}
                  >
                    £50,270 (Basic)
                  </button>
                  <span>{formatCurrency(maxSliderSalary)}</span>
                </div>
                
                {/* Live summary strip */}
                <div className='mt-4 grid grid-cols-4 gap-2 rounded-lg bg-background p-3'>
                  <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>Salary</p>
                    <p className='font-semibold'>{formatCurrency(activeScenario.salary)}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>Dividends</p>
                    <p className='font-semibold'>{formatCurrency(activeScenario.dividends)}</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>Total Tax</p>
                    <p className='font-semibold text-red-600 dark:text-red-400'>
                      {formatCurrency(activeScenario.totalPersonalTax + activeScenario.employerNI + activeScenario.corporationTax)}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='text-muted-foreground text-xs'>Take-Home</p>
                    <p className='font-semibold text-green-600 dark:text-green-400'>
                      {formatCurrency(activeScenario.takeHome)}
                    </p>
                  </div>
                </div>
                
                {sliderSalary !== null && (() => {
                  const optimalTakeHome = comparison.strategies[comparison.recommended].takeHome;
                  const diff = activeScenario.takeHome - optimalTakeHome;
                  if (diff === 0) return null;
                  return (
                    <p className={`text-center text-sm ${diff > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {diff > 0 ? '+' : ''}{formatCurrency(diff)} vs recommended strategy
                    </p>
                  );
                })()}
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
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.incomeTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.incomeTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.incomeTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Employee NI</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.employeeNI)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.employeeNI)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.employeeNI)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Dividend Tax</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.dividendTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.dividendTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.dividendTax)}
                      </TableCell>
                    </TableRow>
                    {studentLoanPlans.length > 0 && (
                      <TableRow>
                        <TableCell className='pl-6'>Student Loan</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(comparison.strategies.allSalary.studentLoan)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(comparison.strategies.optimalMix.studentLoan)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(comparison.strategies.allDividends.studentLoan)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className='font-medium'>
                      <TableCell className='pl-6'>Subtotal (Personal)</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.totalPersonalTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.totalPersonalTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.totalPersonalTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow className='bg-muted/30'>
                      <TableCell colSpan={4} className='font-semibold'>
                        Company Taxes (Company Pays)
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Employer NI</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.employerNI)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.employerNI)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.employerNI)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='pl-6'>Corporation Tax</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allSalary.corporationTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.optimalMix.corporationTax)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(comparison.strategies.allDividends.corporationTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow className='font-medium'>
                      <TableCell className='pl-6'>Subtotal (Company)</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.allSalary.employerNI +
                            comparison.strategies.allSalary.corporationTax
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.optimalMix.employerNI +
                            comparison.strategies.optimalMix.corporationTax
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.allDividends.employerNI +
                            comparison.strategies.allDividends.corporationTax
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow className='bg-muted/50 font-semibold'>
                      <TableCell>TOTAL TAX (All Sources)</TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.allSalary.totalPersonalTax +
                            comparison.strategies.allSalary.employerNI +
                            comparison.strategies.allSalary.corporationTax
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.optimalMix.totalPersonalTax +
                            comparison.strategies.optimalMix.employerNI +
                            comparison.strategies.optimalMix.corporationTax
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(
                          comparison.strategies.allDividends.totalPersonalTax +
                            comparison.strategies.allDividends.employerNI +
                            comparison.strategies.allDividends.corporationTax
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NI Credits / State Pension Note */}
        {comparison && comparison.grossProfit > 0 && activeScenario && (() => {
          const currentSalary = activeScenario.salary;
          const lel = TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit;
          const st = TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.employer.A.secondary.threshold;
          const isInPensionGap = currentSalary > st && currentSalary < lel;
          const qualifiesForCredits = currentSalary >= lel;
          const employerNIInGap = isInPensionGap ? (currentSalary - st) * 0.15 : 0;
          const extraNICost = isInPensionGap ? (lel - st) * 0.15 - employerNIInGap : 0;
          
          return (
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
                    <strong>Lower Earnings Limit (LEL):</strong>{' '}
                    {formatCurrency(lel)}/year ({formatCurrency(Math.round(lel / 12))}/month)
                  </p>
                  <p className='text-muted-foreground'>
                    Salary above LEL earns NI credits toward your State Pension, even if below the
                    Primary Threshold where you start paying NI.
                  </p>
                  <div className='mt-3 rounded-lg bg-muted/50 p-3'>
                    {qualifiesForCredits ? (
                      <p className='text-green-700 dark:text-green-400'>
                        ✓ <strong>{formatCurrency(currentSalary)} salary</strong> qualifies for NI
                        credits — you&apos;ll build State Pension entitlement.
                      </p>
                    ) : isInPensionGap ? (
                      <p className='text-amber-700 dark:text-amber-400'>
                        ⚠ <strong>Inefficient zone:</strong> Paying{' '}
                        {formatCurrency(employerNIInGap)}/year Employer NI but earning no pension
                        credits. Increase to {formatCurrency(lel)} (+
                        {formatCurrency(Math.round(extraNICost / 12))}/month) to secure a qualifying
                        year.
                      </p>
                    ) : (
                      <p className='text-muted-foreground'>
                        {formatCurrency(currentSalary)} salary is below the Secondary Threshold — no
                        Employer NI, but also no pension credits.
                      </p>
                    )}
                  </div>
                  <p className='mt-2 text-muted-foreground text-xs'>
                    The £12,570 &quot;optimal&quot; salary is above the LEL, so you automatically
                    qualify for NI credits without paying any Employee NI.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Detailed Results */}
        {result && comparison && activeScenario && (
          <>
            <Card className='mb-6'>
              <CardHeader>
                <CardTitle>Results: {activeScenario.name}</CardTitle>
                <CardDescription>
                  {selectedStrategy === 'allSalary' && 'Take everything as PAYE salary'}
                  {selectedStrategy === 'optimalMix' &&
                    `${formatCurrency(comparison.strategies.optimalMix.salary)} salary + dividends from remaining profit`}
                  {selectedStrategy === 'allDividends' && 'Minimum salary + maximum dividends'}
                  {selectedStrategy !== comparison.recommended && (
                    <span className='ml-2 text-amber-600'>
                      (Not optimal - take-home is{' '}
                      {formatCurrency(
                        comparison.strategies[comparison.recommended].takeHome -
                          activeScenario.takeHome
                      )}{' '}
                      lower)
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
                        <TableCell colSpan={3} className='font-semibold'>
                          Income
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Gross Profit</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(comparison.grossProfit)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          Revenue − Expenses
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Salary</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.salary)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {formatCurrency(activeScenario.salary / 12)}
                          /month
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dividends</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.dividends)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          After CT paid
                        </TableCell>
                      </TableRow>
                      {activeScenario.pension > 0 && (
                        <TableRow>
                          <TableCell>Employer Pension</TableCell>
                          <TableCell className='text-right'>
                            {formatCurrency(activeScenario.pension)}
                          </TableCell>
                          <TableCell className='text-right text-muted-foreground'>
                            Tax-free (to pension pot)
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Personal Taxes Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>
                          Personal Taxes (You Pay)
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Income Tax (on salary)</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.incomeTax)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {activeScenario.salary <= 12570
                            ? 'Within Personal Allowance'
                            : '20-45%'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Employee NI (on salary)</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.employeeNI)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {activeScenario.salary <= 12570
                            ? 'Below threshold'
                            : '8% / 2%'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Dividend Tax</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.dividendTax)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          8.75% / 33.75% / 39.35%
                        </TableCell>
                      </TableRow>
                      {studentLoanPlans.length > 0 && (
                        <TableRow>
                          <TableCell>Student Loan</TableCell>
                          <TableCell className='text-right'>
                            {formatCurrency(activeScenario.studentLoan)}
                          </TableCell>
                          <TableCell className='text-right text-muted-foreground'>
                            {studentLoanPlans.map(p => p === 'postgrad' ? '6%' : '9%').join(' + ')} on total income
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className='font-medium'>
                        <TableCell>Personal Tax Total</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.totalPersonalTax)}
                        </TableCell>
                        <TableCell className='text-right'></TableCell>
                      </TableRow>

                      {/* Company Taxes Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>
                          Company Taxes (Company Pays)
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Employer NI</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.employerNI)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {hasEmploymentAllowance
                            ? '15% above £5k (minus £10.5k EA)'
                            : '15% above £5,000'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Corporation Tax</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(activeScenario.corporationTax)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>19-25%</TableCell>
                      </TableRow>
                      <TableRow className='font-medium'>
                        <TableCell>Company Tax Total</TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(
                            activeScenario.employerNI +
                              activeScenario.corporationTax
                          )}
                        </TableCell>
                        <TableCell className='text-right'></TableCell>
                      </TableRow>

                      {/* Totals Section */}
                      <TableRow className='bg-muted/30'>
                        <TableCell colSpan={3} className='font-semibold'>
                          Summary
                        </TableCell>
                      </TableRow>
                      <TableRow className='bg-red-50 dark:bg-red-950/20'>
                        <TableCell className='font-medium text-red-700 dark:text-red-400'>
                          Total Tax (All Sources)
                        </TableCell>
                        <TableCell className='text-right font-medium text-red-700 dark:text-red-400'>
                          {formatCurrency(
                            activeScenario.totalPersonalTax +
                              activeScenario.employerNI +
                              activeScenario.corporationTax
                          )}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {activeScenario.effectiveRate.toFixed(1)}%
                          effective
                        </TableCell>
                      </TableRow>
                      <TableRow className='bg-green-50 dark:bg-green-950/20'>
                        <TableCell className='font-semibold text-green-700 dark:text-green-400'>
                          Annual Take-Home
                        </TableCell>
                        <TableCell className='text-right font-semibold text-green-700 dark:text-green-400'>
                          {formatCurrency(activeScenario.takeHome)}
                        </TableCell>
                        <TableCell className='text-right text-muted-foreground'>
                          {formatCurrency(activeScenario.takeHome / 12)}
                          /month
                        </TableCell>
                      </TableRow>
                      {parseFloat(alreadyTaken) > 0 && (
                        <TableRow>
                          <TableCell>
                            Remaining (after {formatCurrency(parseFloat(alreadyTaken))} taken)
                          </TableCell>
                          <TableCell className='text-right'>
                            {formatCurrency(
                              activeScenario.takeHome -
                                parseFloat(alreadyTaken)
                            )}
                          </TableCell>
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

            {/* Email Results */}
            {comparison && activeScenario && (
              <Card className='mb-6'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>Save Your Results</CardTitle>
                  <CardDescription>Get a copy of this calculation emailed to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <DirectorEmailResultsForm
                    grossProfit={comparison.grossProfit}
                    strategy={activeScenario}
                    taxYear={TAX_YEAR_DISPLAY}
                  />
                </CardContent>
              </Card>
            )}

            {/* Two Pots - Business vs Personal */}
            {isNormal && comparison && activeScenario && (
              <div className='mb-6 grid gap-4 md:grid-cols-2'>
                {/* Company Tax Pot */}
                <Card className='border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>Company Tax Pot</CardTitle>
                    <CardDescription>Keep in business account - don&apos;t touch</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='font-bold text-2xl text-blue-700 dark:text-blue-400'>
                      {formatCurrency(
                        activeScenario.corporationTax +
                          activeScenario.employerNI
                      )}
                    </div>
                    <div className='mt-2 space-y-1 text-muted-foreground text-sm'>
                      <p>
                        Corporation Tax:{' '}
                        {formatCurrency(activeScenario.corporationTax)}
                      </p>
                      <p>
                        Employer NI:{' '}
                        {formatCurrency(activeScenario.employerNI)}
                      </p>
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
                      {formatCurrency(activeScenario.totalPersonalTax)}
                    </div>
                    <div className='mt-2 space-y-1 text-muted-foreground text-sm'>
                      <p>
                        Income Tax:{' '}
                        {formatCurrency(activeScenario.incomeTax)}
                      </p>
                      <p>
                        Employee NI:{' '}
                        {formatCurrency(activeScenario.employeeNI)}
                      </p>
                      <p>
                        Dividend Tax:{' '}
                        {formatCurrency(activeScenario.dividendTax)}
                      </p>
                      {studentLoanPlans.length > 0 && (
                        <p>
                          Student Loan:{' '}
                          {formatCurrency(activeScenario.studentLoan)}
                        </p>
                      )}
                      <p>
                        Monthly set-aside:{' '}
                        {formatCurrency(
                          activeScenario.totalPersonalTax / 12
                        )}
                      </p>
                      {activeScenario.dividendTax > 1000 && (
                        <p className='text-amber-600'>
                          * Payments on Account may apply (SA liability &gt;£1k)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bank Transfer References */}
            {isNormal && comparison && activeScenario && (
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
                          {formatCurrency(activeScenario.salary / 12)}
                          /month
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
                          {formatCurrency(
                            activeScenario.totalPersonalTax / 12
                          )}
                          /month
                        </p>
                      </div>
                      <code className='rounded bg-muted px-2 py-1 text-sm'>TAX SAVE</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Dates with Calendar Download */}
            {isNormal && keyDates && activeScenario && (
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
                          {comparison
                            ? formatCurrency(activeScenario.corporationTax)
                            : formatCurrency(result.corporationTax)}{' '}
                          due
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.ctPayment)}</p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            generateICS(
                              'Corporation Tax Payment Due',
                              keyDates.ctPayment,
                              `Pay ${comparison ? formatCurrency(activeScenario.corporationTax) : formatCurrency(result.corporationTax)} Corporation Tax to HMRC`
                            )
                          }
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
                          onClick={() =>
                            generateICS(
                              'Corporation Tax Return Due',
                              keyDates.ctReturn,
                              'File CT600 return with HMRC'
                            )
                          }
                        >
                          <Download className='size-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>Self Assessment Payment</p>
                        <p className='text-muted-foreground text-sm'>
                          {comparison
                            ? formatCurrency(
                                activeScenario.totalPersonalTax
                              )
                            : formatCurrency(result.personalTaxAnnual)}{' '}
                          due
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>{formatDate(keyDates.saPayment)}</p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            generateICS(
                              'Self Assessment Tax Due',
                              keyDates.saPayment,
                              `Pay ${comparison ? formatCurrency(activeScenario.totalPersonalTax) : formatCurrency(result.personalTaxAnnual)} Self Assessment tax to HMRC`
                            )
                          }
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
                        const ctAmount = comparison
                          ? activeScenario.corporationTax
                          : result.corporationTax;
                        const saAmount = comparison
                          ? activeScenario.totalPersonalTax
                          : result.personalTaxAnnual;
                        generateICS(
                          'Corporation Tax Payment Due',
                          keyDates.ctPayment,
                          `Pay ${formatCurrency(ctAmount)} CT`
                        );
                        setTimeout(
                          () => generateICS('CT Return Due', keyDates.ctReturn, 'File CT600'),
                          100
                        );
                        setTimeout(
                          () =>
                            generateICS(
                              'Self Assessment Due',
                              keyDates.saPayment,
                              `Pay ${formatCurrency(saAmount)} SA`
                            ),
                          200
                        );
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
                    This calculator provides estimates based on standard scenarios. Consider
                    speaking to an accountant if:
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
                  <div className='rounded-md border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20'>
                    <p className='font-medium text-amber-800 dark:text-amber-200'>
                      ⚠️ Not professional advice
                    </p>
                    <p className='mt-1 text-amber-700 text-xs dark:text-amber-300'>
                      This tool provides estimates for illustrative purposes only. Tax rules are
                      complex and individual circumstances vary. Always consult a qualified
                      accountant before making tax decisions.
                    </p>
                  </div>
                  <div>
                    <p className='font-medium'>This calculator assumes:</p>
                    <ul className='mt-1 list-inside list-disc space-y-0.5 text-muted-foreground'>
                      <li>You&apos;re the sole director of a UK limited company</li>
                      <li>{TAX_YEAR_DISPLAY} tax year rates</li>
                      <li>No associated companies (CT thresholds would be divided)</li>
                      <li>12-month accounting period (short periods pro-rate CT thresholds)</li>
                      <li>
                        NI Category A (standard) — other categories (B, C, H, etc.) have different
                        rates
                      </li>
                      <li>
                        Annual NI method for directors — monthly payroll deductions may differ
                        slightly
                      </li>
                      <li>Under State Pension age — if over SPA, employee NI is not due</li>
                      <li>No pension contributions (these reduce taxable income)</li>
                      <li>Dividends taken within the same tax year</li>
                    </ul>
                  </div>
                  <div>
                    <p className='font-medium'>Not covered (talk to an accountant):</p>
                    <ul className='mt-1 list-inside list-disc space-y-0.5 text-muted-foreground'>
                      <li>
                        <strong>Distributable reserves</strong> — Dividends require accumulated
                        profits, not just this year&apos;s profit. If prior years had losses,
                        dividends may not be legally available even if profitable now
                      </li>
                      <li>
                        <strong>Director&apos;s Loans (DLA)</strong> — If you&apos;ve taken money
                        without declaring it as salary/dividends, you may owe S455 tax (33.75%)
                        until repaid
                      </li>
                      <li>
                        <strong>IR35 / Off-payroll rules</strong> — If caught inside IR35,
                        you&apos;re taxed as an employee; this calculator assumes you&apos;re
                        outside IR35
                      </li>
                      <li>
                        <strong>Multiple directors/shareholders</strong> — Splitting income between
                        spouses changes the optimal strategy
                      </li>
                      <li>
                        <strong>Associated companies</strong> — CT thresholds (£50k/£250k) are
                        divided by number of associated companies
                      </li>
                      <li>
                        <strong>R&amp;D tax credits</strong> — Can significantly reduce your CT bill
                      </li>
                      <li>
                        <strong>Capital Gains</strong> — Selling shares or company assets has
                        different tax treatment
                      </li>
                      <li>
                        <strong>VAT calculations</strong> — We warn if you need to register, but
                        don&apos;t calculate VAT owed
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thresholds Reference */}
            {isNormal && comparison && activeScenario && (
              <Card className='mb-6'>
                <CardHeader>
                  <CardTitle>Key Thresholds ({TAX_YEAR_DISPLAY})</CardTitle>
                  <CardDescription>
                    How your numbers compare to important tax thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-sm'>
                  <div className='space-y-4'>
                    {/* Personal Thresholds */}
                    <div>
                      <h4 className='mb-2 font-semibold'>Personal Tax Thresholds</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Threshold</TableHead>
                            <TableHead className='text-right'>Limit</TableHead>
                            <TableHead className='text-right'>Your Position</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/national-insurance-rates-letters'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Lower Earnings Limit (State Pension)
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit
                              )}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.salary)}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const lel = TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.lowerEarningsLimit;
                                const st = TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.employer.A.secondary.threshold;
                                if (activeScenario.salary >= lel) {
                                  return <span className='text-green-600'>✓ Qualifies for NI credits</span>;
                                }
                                if (activeScenario.salary > st) {
                                  return <span className='text-amber-600'>⚠ Paying NI, no credits</span>;
                                }
                                return <span className='text-muted-foreground'>No NI, no credits</span>;
                              })()}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/national-insurance-rates-letters'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Primary Threshold (Employee NI)
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(12570)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.salary)}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary <= 12570 ? (
                                <span className='text-green-600'>✓ No Employee NI</span>
                              ) : (
                                <span className='text-amber-600'>Paying 8% on excess</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/income-tax-rates'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Personal Allowance
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(TAX_RATES[CURRENT_TAX_YEAR].personalAllowance)}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.salary)}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary <=
                              TAX_RATES[CURRENT_TAX_YEAR].personalAllowance ? (
                                <span className='text-green-600'>✓ No income tax on salary</span>
                              ) : (
                                <span className='text-amber-600'>Paying 20%+ on excess</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/income-tax-rates'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Higher Rate Band
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(50270)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                activeScenario.salary +
                                  activeScenario.dividends +
                                  (parseFloat(otherIncome) || 0)
                              )}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary +
                                activeScenario.dividends +
                                (parseFloat(otherIncome) || 0) <=
                              50270 ? (
                                <span className='text-green-600'>✓ Basic rate only</span>
                              ) : (
                                <span className='text-amber-600'>In higher rate band</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/income-tax-rates'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                PA Taper (60% trap)
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(100000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                activeScenario.salary +
                                  activeScenario.dividends +
                                  (parseFloat(otherIncome) || 0)
                              )}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary +
                                activeScenario.dividends +
                                (parseFloat(otherIncome) || 0) <=
                              100000 ? (
                                <span className='text-green-600'>✓ Full PA retained</span>
                              ) : activeScenario.salary +
                                  activeScenario.dividends +
                                  (parseFloat(otherIncome) || 0) <=
                                125140 ? (
                                <span className='text-red-600'>⚠ PA tapering (60% rate)</span>
                              ) : (
                                <span className='text-red-600'>✗ PA fully lost</span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Company Thresholds */}
                    <div>
                      <h4 className='mb-2 font-semibold'>Company Thresholds</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Threshold</TableHead>
                            <TableHead className='text-right'>Limit</TableHead>
                            <TableHead className='text-right'>Your Position</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/national-insurance-rates-letters/category-letters'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Secondary Threshold (Employer NI)
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(5000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.salary)}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary <= 5000 ? (
                                <span className='text-green-600'>✓ No Employer NI</span>
                              ) : (
                                <span className='text-amber-600'>
                                  Paying 15% on{' '}
                                  {formatCurrency(
                                    activeScenario.salary - 5000
                                  )}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/corporation-tax-rates'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                CT Small Profits
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(50000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                comparison.grossProfit -
                                  activeScenario.salary -
                                  activeScenario.employerNI
                              )}
                            </TableCell>
                            <TableCell>
                              {comparison.grossProfit -
                                activeScenario.salary -
                                activeScenario.employerNI <=
                              50000 ? (
                                <span className='text-green-600'>✓ 19% rate</span>
                              ) : comparison.grossProfit -
                                  activeScenario.salary -
                                  activeScenario.employerNI <=
                                250000 ? (
                                <span className='text-amber-600'>
                                  Marginal relief zone (19-25%)
                                </span>
                              ) : (
                                <span className='text-amber-600'>Main rate 25%</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/vat-registration/when-to-register'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                VAT Registration
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(90000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(netRevenue)}
                            </TableCell>
                            <TableCell>
                              {netRevenue < 85000 ? (
                                <span className='text-green-600'>✓ Not required</span>
                              ) : netRevenue < 90000 ? (
                                <span className='text-amber-600'>⚠ Approaching threshold</span>
                              ) : (
                                <span className='text-red-600'>✗ Must register</span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Other Thresholds */}
                    <div>
                      <h4 className='mb-2 font-semibold'>Other Thresholds</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Threshold</TableHead>
                            <TableHead className='text-right'>Limit</TableHead>
                            <TableHead className='text-right'>Your Position</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/tax-on-dividends'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Dividend Allowance
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(500)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.dividends)}
                            </TableCell>
                            <TableCell>
                              {activeScenario.dividends <= 500 ? (
                                <span className='text-green-600'>✓ Tax-free</span>
                              ) : (
                                <span className='text-muted-foreground'>First £500 tax-free</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/understand-self-assessment-bill/payments-on-account'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Payments on Account
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(1000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(activeScenario.dividendTax)}
                            </TableCell>
                            <TableCell>
                              {activeScenario.dividendTax <= 1000 ? (
                                <span className='text-green-600'>✓ Not required</span>
                              ) : (
                                <span className='text-amber-600'>⚠ POA likely required</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/child-benefit-tax-charge'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                High Income Child Benefit Charge
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>{formatCurrency(60000)}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                activeScenario.salary +
                                  activeScenario.dividends +
                                  (parseFloat(otherIncome) || 0)
                              )}
                            </TableCell>
                            <TableCell>
                              {activeScenario.salary +
                                activeScenario.dividends +
                                (parseFloat(otherIncome) || 0) <=
                              60000 ? (
                                <span className='text-green-600'>✓ No clawback</span>
                              ) : activeScenario.salary +
                                  activeScenario.dividends +
                                  (parseFloat(otherIncome) || 0) <=
                                80000 ? (
                                <span className='text-amber-600'>⚠ Partial clawback</span>
                              ) : (
                                <span className='text-red-600'>✗ Full clawback</span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <a
                                href='https://www.gov.uk/claim-employment-allowance'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='underline hover:no-underline'
                              >
                                Employment Allowance
                              </a>
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(
                                TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.employmentAllowance
                              )}
                            </TableCell>
                            <TableCell className='text-right'>—</TableCell>
                            <TableCell>
                              {hasEmploymentAllowance ? (
                                <span className='text-green-600'>
                                  ✓ Claimed (
                                  {formatCurrency(
                                    TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance
                                      .employmentAllowance
                                  )}{' '}
                                  offset)
                                </span>
                              ) : (
                                <span className='text-muted-foreground'>
                                  Not claimed (sole director?)
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* HMRC Sources */}
                    <div className='rounded-md border p-3'>
                      <h4 className='mb-2 font-semibold'>Official HMRC Sources</h4>
                      <div className='grid gap-2 text-xs md:grid-cols-2'>
                        <a
                          href='https://www.gov.uk/income-tax-rates'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> Income Tax rates and bands
                        </a>
                        <a
                          href='https://www.gov.uk/national-insurance-rates-letters'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> National Insurance rates
                        </a>
                        <a
                          href='https://www.gov.uk/corporation-tax-rates'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> Corporation Tax rates
                        </a>
                        <a
                          href='https://www.gov.uk/tax-on-dividends'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> Dividend Tax rates
                        </a>
                        <a
                          href='https://www.gov.uk/vat-registration/when-to-register'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> VAT registration thresholds
                        </a>
                        <a
                          href='https://www.gov.uk/new-state-pension'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> State Pension qualification
                        </a>
                        <a
                          href='https://www.gov.uk/guidance/corporation-tax-marginal-relief'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> CT Marginal Relief
                        </a>
                        <a
                          href='https://www.gov.uk/child-benefit-tax-charge'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <ExternalLink className='size-3' /> High Income Child Benefit
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
