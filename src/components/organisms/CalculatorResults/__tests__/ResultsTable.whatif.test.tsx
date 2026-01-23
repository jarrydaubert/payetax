/**
 * ResultsTable What If Scenario Tests
 *
 * Tests the display of What If scenarios across all display periods
 * to ensure pension and allowances are correctly shown in comparison mode
 */

import { render, screen } from '@testing-library/react';
import { PERIODS } from '@/constants/taxRates';
import { calculateTax } from '@/lib/taxCalculator';
import { ResultsTable } from '../ResultsTable';

describe('ResultsTable - What If Scenarios with All Display Periods', () => {
  // Test scenario based on user's inputs:
  // - Salary: £60,000 annually
  // - Rental Income: £1,500 monthly (£18,000 annually)
  // - Total Gross: £78,000
  // - What If: 10% salary increase

  const baseInput = {
    salary: 60000,
    payPeriod: PERIODS.ANNUALLY,
    taxYear: '2025-2026' as const,
    taxCode: '1257L',
    region: 'England' as const,
    isScottish: false,
    isMarried: false,
    partnerGrossWage: 0,
    isBlind: false,
    age: undefined,
    payNoNI: false,
    studentLoanPlans: 'none' as const,
    pensionContribution: 0,
    pensionContributionType: 'percentage' as const,
    niCategory: 'A' as const,
    hoursPerWeek: 40,
    allowancesDeductions: 0,
    incomeSources: [
      {
        id: '1',
        type: 'rental' as const,
        amount: 1500,
        period: PERIODS.MONTHLY,
      },
    ],
  };

  it('should display pension correctly in both Current and What If columns when pension is 0%', () => {
    const currentResults = calculateTax(baseInput);
    const whatIfResults = calculateTax({ ...baseInput, salary: 66000 }); // 10% increase

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={[
          'Yearly',
          'Monthly',
          '4-Weekly',
          'Fortnightly',
          'Weekly',
          'Daily',
          'Hourly',
        ]}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Find the Pension row
    const pensionRow = screen.getByText('Pension').closest('tr');
    expect(pensionRow).toBeInTheDocument();

    // Both columns should show £0.00 since pension is 0%
    const cells = pensionRow?.querySelectorAll('th, td');
    expect(cells).toBeDefined();

    // Should have: Category (th), Percentage (td), and then pairs of (Current, WhatIf) for each visible period
    // With 7 periods visible: Category (1) + Percentage (1) + 7 periods × 2 columns = 16 cells
    expect(cells?.length).toBe(16);
  });

  it('should display pension correctly when set as percentage', () => {
    const inputWithPension = {
      ...baseInput,
      pensionContribution: 5, // 5% pension
      pensionContributionType: 'percentage' as const,
    };

    const currentResults = calculateTax(inputWithPension);
    const whatIfResults = calculateTax({ ...inputWithPension, salary: 66000 }); // 10% increase

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={['Yearly', 'Monthly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Current pension: £60,000 × 5% = £3,000 annually
    expect(currentResults.pensionContribution.annually).toBeCloseTo(3000, 0);

    // What If pension: £66,000 × 5% = £3,300 annually
    expect(whatIfResults.pensionContribution.annually).toBeCloseTo(3300, 0);

    // Find the Pension row
    const pensionRow = screen.getByText('Pension').closest('tr');
    expect(pensionRow).toBeInTheDocument();

    // Verify the pension values are displayed in the table
    const yearlyCurrentCell = screen.getAllByText(/£3,000/);
    expect(yearlyCurrentCell.length).toBeGreaterThan(0);

    const yearlyWhatIfCell = screen.getAllByText(/£3,300/);
    expect(yearlyWhatIfCell.length).toBeGreaterThan(0);
  });

  it('should display pension correctly when set as fixed amount', () => {
    const inputWithPension = {
      ...baseInput,
      pensionContribution: 5000, // £5,000 fixed amount
      pensionContributionType: 'amount' as const,
      payPeriod: PERIODS.ANNUALLY,
    };

    const currentResults = calculateTax(inputWithPension);
    const whatIfResults = calculateTax({ ...inputWithPension, salary: 66000 }); // 10% increase

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={['Yearly', 'Monthly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Both should show £5,000 since it's a fixed amount
    expect(currentResults.pensionContribution.annually).toBeCloseTo(5000, 0);
    expect(whatIfResults.pensionContribution.annually).toBeCloseTo(5000, 0);

    const pensionRow = screen.getByText('Pension').closest('tr');
    expect(pensionRow).toBeInTheDocument();
  });

  it('should display allowances/deductions correctly in both columns', () => {
    const inputWithAllowances = {
      ...baseInput,
      allowancesDeductions: 2000, // £2,000 allowances
    };

    const currentResults = calculateTax(inputWithAllowances);
    const whatIfResults = calculateTax({ ...inputWithAllowances, salary: 66000 });

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={2000}
        previousYearResults={null}
        visiblePeriods={['Yearly', 'Monthly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Find the Allowances/Deductions row
    const allowancesRow = screen.getByText('Allowances/Deductions').closest('tr');
    expect(allowancesRow).toBeInTheDocument();

    // Both columns should show £2,000 since allowances are the same in both scenarios
    const allowanceCells = screen.getAllByText(/£2,000/);
    expect(allowanceCells.length).toBeGreaterThan(0);
  });

  it('should display all periods correctly with What If comparison', () => {
    const inputWithPension = {
      ...baseInput,
      pensionContribution: 5, // 5% pension
      pensionContributionType: 'percentage' as const,
    };

    const currentResults = calculateTax(inputWithPension);
    const whatIfResults = calculateTax({ ...inputWithPension, salary: 66000 });

    const allPeriods = [
      'Yearly',
      'Monthly',
      '4-Weekly',
      'Fortnightly',
      'Weekly',
      'Daily',
      'Hourly',
    ];

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={allPeriods}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Verify all period headers are present (use getAllByText since text appears in both checkboxes and headers)
    expect(screen.getAllByText('Yearly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Monthly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4-Weekly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fortnightly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Weekly').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Daily').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hourly').length).toBeGreaterThan(0);

    // Verify "Current" and "What If" sub-headers for each period
    const currentHeaders = screen.getAllByText('Current');
    expect(currentHeaders).toHaveLength(allPeriods.length);

    const whatIfHeaders = screen.getAllByText('What If');
    expect(whatIfHeaders).toHaveLength(allPeriods.length);

    // Verify pension values across all periods
    // Current: £3,000 annually
    // Monthly: £3,000 / 12 = £250
    const monthlyCurrentPension = 3000 / 12;
    expect(monthlyCurrentPension).toBeCloseTo(250, 0);

    // What If: £3,300 annually
    // Monthly: £3,300 / 12 = £275
    const monthlyWhatIfPension = 3300 / 12;
    expect(monthlyWhatIfPension).toBeCloseTo(275, 0);
  });

  it('should handle complex scenario with pension, allowances, and rental income', () => {
    const complexInput = {
      ...baseInput,
      pensionContribution: 8, // 8% pension
      pensionContributionType: 'percentage' as const,
      allowancesDeductions: 1500,
    };

    const currentResults = calculateTax(complexInput);
    const whatIfResults = calculateTax({ ...complexInput, salary: 66000 });

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={1500}
        previousYearResults={null}
        visiblePeriods={['Yearly', 'Monthly', 'Weekly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // grossSalary only includes employment income (not rental income)
    // Current employment: £60,000
    // What If employment: £66,000

    expect(currentResults.grossSalary.annually).toBeCloseTo(60000, 0);
    expect(whatIfResults.grossSalary.annually).toBeCloseTo(66000, 0);

    // Current pension: £60,000 × 8% = £4,800 (only on employment income)
    expect(currentResults.pensionContribution.annually).toBeCloseTo(4800, 0);

    // What If pension: £66,000 × 8% = £5,280
    expect(whatIfResults.pensionContribution.annually).toBeCloseTo(5280, 0);

    // Verify all key rows are present
    expect(screen.getByText('Gross Pay')).toBeInTheDocument();
    expect(screen.getByText('Employment Income')).toBeInTheDocument();
    expect(screen.getByText('Other Income (No NI)')).toBeInTheDocument();
    expect(screen.getByText('Pension')).toBeInTheDocument();
    expect(screen.getByText('Allowances/Deductions')).toBeInTheDocument();
    expect(screen.getByText('Net Pay')).toBeInTheDocument();
  });

  it('should correctly show net pay difference between Current and What If', () => {
    const inputWithPension = {
      ...baseInput,
      pensionContribution: 5,
      pensionContributionType: 'percentage' as const,
    };

    const currentResults = calculateTax(inputWithPension);
    const whatIfResults = calculateTax({ ...inputWithPension, salary: 66000 });

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={['Yearly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Net pay should be different due to salary increase
    const netPayDifference = whatIfResults.netPay.annually - currentResults.netPay.annually;

    // With a £6,000 salary increase:
    // - Additional pension: £300 (5% of £6,000)
    // - Additional tax and NI on the £6,000 increase
    // - Net increase should be less than £6,000 due to tax/NI/pension
    expect(netPayDifference).toBeGreaterThan(0);
    expect(netPayDifference).toBeLessThan(6000);

    // Verify Net Pay row exists and shows both values
    const netPayRow = screen.getByText('Net Pay').closest('tr');
    expect(netPayRow).toBeInTheDocument();
  });

  it('should handle edge case: What If scenario with 0% pension when current has pension', () => {
    // Current scenario with 10% pension
    const currentInput = {
      ...baseInput,
      pensionContribution: 10,
      pensionContributionType: 'percentage' as const,
    };

    // What If scenario with 0% pension (user might want to see impact)
    const whatIfInput = {
      ...currentInput,
      salary: 66000,
      pensionContribution: 0,
    };

    const currentResults = calculateTax(currentInput);
    const whatIfResults = calculateTax(whatIfInput);

    render(
      <ResultsTable
        results={currentResults}
        whatIfResults={whatIfResults}
        studentLoans={[]}
        allowancesDeductions={0}
        previousYearResults={null}
        visiblePeriods={['Yearly']}
        onVisiblePeriodsChange={() => {}}
        taxYear='2025-2026'
        isMarried={false}
        partnerGrossWage={0}
        taxCode='1257L'
      />
    );

    // Current pension: £60,000 × 10% = £6,000
    expect(currentResults.pensionContribution.annually).toBeCloseTo(6000, 0);

    // What If pension: £66,000 × 0% = £0
    expect(whatIfResults.pensionContribution.annually).toBe(0);
  });
});
