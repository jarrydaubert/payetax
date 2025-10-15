// src/components/salary/SalaryCalculatorPage.tsx
// Main component for salary-specific landing pages

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { CalculatorContent } from '@/components/organisms/CalculatorContent';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { useCalculatorStore } from '@/store/calculatorStore';
import { cn } from '@/lib/utils';

interface SalaryCalculatorPageProps {
  salary: number;
  isHighPriority?: boolean;
}

export function SalaryCalculatorPage({ salary }: SalaryCalculatorPageProps) {
  const [results, setResults] = useState<TaxCalculationResults | null>(null);
  const setSalary = useCalculatorStore(state => state.setSalary);
  const calculate = useCalculatorStore(state => state.calculate);
  
  // Calculate results immediately on mount
  useEffect(() => {
    const quickResults = calculateTax({
      salary: salary,
      payPeriod: 'annually',
      taxYear: '2025-2026',
      taxCode: '1257L',
      isScottish: false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlan: 'none',
      pensionContribution: 0,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });
    setResults(quickResults);
    
    // Also set in store for the full calculator
    setSalary(salary);
    calculate();
  }, [salary, setSalary, calculate]);
  
  const formattedSalary = salary.toLocaleString('en-GB');
  
  // Generate comparison salaries
  const comparisons = [
    { amount: salary - 10000, label: '£10k less' },
    { amount: salary - 5000, label: '£5k less' },
    { amount: salary + 5000, label: '£5k more' },
    { amount: salary + 10000, label: '£10k more' },
  ].filter(c => c.amount >= 20000 && c.amount <= 500000);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Instant Answer */}
      <section className="relative overflow-hidden py-8 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li>/</li>
              <li><Link href="/#calculator" className="hover:text-primary">Calculator</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">£{formattedSalary} Salary</li>
            </ol>
          </nav>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Instant Results Card */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                £{formattedSalary} Salary After Tax
              </h1>
              <p className="mb-6 text-muted-foreground">
                UK take-home pay calculator for 2025-26 tax year
              </p>
              
              {results && (
                <Card className="p-6 sm:p-8">
                  <div className="space-y-6">
                    {/* Main Take-Home */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        Monthly Take-Home Pay
                      </p>
                      <p className="text-4xl font-bold text-primary mt-2">
                        £{results.netPay.monthly.toLocaleString('en-GB')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        After tax and National Insurance
                      </p>
                    </div>
                    
                    {/* Quick Breakdown */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Take-Home</p>
                        <p className="text-xl font-semibold">
                          £{results.netPay.annually.toLocaleString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weekly Take-Home</p>
                        <p className="text-xl font-semibold">
                          £{results.netPay.weekly.toLocaleString('en-GB')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tax Breakdown */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gross Salary</span>
                        <span className="font-medium">£{formattedSalary}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span className="text-sm">Income Tax</span>
                        <span className="font-medium">
                          -£{results.incomeTax.annually.toLocaleString('en-GB')}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span className="text-sm">National Insurance</span>
                        <span className="font-medium">
                          -£{results.nationalInsurance.annually.toLocaleString('en-GB')}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Net Pay (Annual)</span>
                        <span className="text-primary">
                          £{results.netPay.annually.toLocaleString('en-GB')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Effective Tax Rate */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Effective Tax Rate</span>
                        <Badge variant="secondary" className="font-mono">
                          {((results.incomeTax.annually + results.nationalInsurance.annually) / salary * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Compare Salaries */}
              <Card className="mt-4 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Compare Similar Salaries
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {comparisons.map(comp => (
                    <Link
                      key={comp.amount}
                      href={`/calculator/${comp.amount}-after-tax`}
                      className={cn(
                        "text-sm px-3 py-2 rounded-md text-center",
                        "border border-border hover:border-primary",
                        "hover:bg-primary/5 transition-colors"
                      )}
                    >
                      <span className="text-muted-foreground text-xs">{comp.label}</span>
                      <br />
                      £{comp.amount.toLocaleString('en-GB')}
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* SEO Content */}
            <div className="prose prose-sm max-w-none">
              <h2>£{formattedSalary} Salary Take-Home Pay Breakdown</h2>
              <p>
                With a gross annual salary of <strong>£{formattedSalary}</strong> in the UK for the 
                2025-26 tax year, your take-home pay will be approximately{' '}
                <strong>£{results?.netPay.annually.toLocaleString('en-GB')}</strong> per year, or{' '}
                <strong>£{results?.netPay.monthly.toLocaleString('en-GB')}</strong> per month.
              </p>
              
              {results && (
                <>
                  <h3>Tax and National Insurance Deductions</h3>
                  <ul>
                    <li>
                      <strong>Income Tax:</strong> £{results.incomeTax.annually.toLocaleString('en-GB')}{' '}
                      per year ({(results.incomeTax.annually / salary * 100).toFixed(1)}% of gross)
                    </li>
                    <li>
                      <strong>National Insurance:</strong> £{results.nationalInsurance.annually.toLocaleString('en-GB')}{' '}
                      per year ({(results.nationalInsurance.annually / salary * 100).toFixed(1)}% of gross)
                    </li>
                    <li>
                      <strong>Total Deductions:</strong> £{(results.incomeTax.annually + results.nationalInsurance.annually + results.studentLoan.annually).toLocaleString('en-GB')}{' '}
                      per year ({((results.incomeTax.annually + results.nationalInsurance.annually) / salary * 100).toFixed(1)}% effective rate)
                    </li>
                  </ul>
                  
                  <h3>Is £{formattedSalary} a Good Salary in 2025?</h3>
                  <p>
                    A £{formattedSalary} salary puts you{' '}
                    {salary > 100000 && 'in the top 5% of UK earners'}
                    {salary >= 70000 && salary <= 100000 && 'in the top 10% of UK earners'}
                    {salary >= 50000 && salary < 70000 && 'well above the UK median salary'}
                    {salary >= 30000 && salary < 50000 && 'around the UK median salary'}
                    {salary < 30000 && 'below the UK median salary, but above minimum wage'}
                    . The UK median full-time salary is approximately £35,000 (2025 data).
                  </p>
                  
                  <h3>Customize Your Calculation</h3>
                  <p>
                    The calculation above uses standard assumptions (tax code 1257L, no student loan, 
                    no pension contributions). Use the full calculator below to:
                  </p>
                  <ul>
                    <li>Add student loan repayments (Plans 1, 2, 4, 5, or Postgraduate)</li>
                    <li>Include pension contributions (with tax relief)</li>
                    <li>Apply Scottish tax rates if applicable</li>
                    <li>Adjust your tax code</li>
                    <li>Account for salary sacrifice schemes</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Full Calculator Section */}
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Customize Your Calculation</h2>
            <p className="text-muted-foreground">
              Add student loans, pension contributions, and more for a precise calculation
            </p>
          </div>
          <CalculatorContent />
        </div>
      </section>
      
      {/* Related Searches (SEO) */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-4">Related Salary Calculations</h2>
          <div className="flex flex-wrap gap-2">
            {[25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000]
              .filter(s => Math.abs(s - salary) > 5000 && Math.abs(s - salary) <= 30000)
              .map(relatedSalary => (
                <Link
                  key={relatedSalary}
                  href={`/calculator/${relatedSalary}-after-tax`}
                  className="text-sm px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  £{relatedSalary.toLocaleString('en-GB')} salary
                </Link>
              ))
            }
          </div>
        </div>
      </section>
    </div>
  );
}
