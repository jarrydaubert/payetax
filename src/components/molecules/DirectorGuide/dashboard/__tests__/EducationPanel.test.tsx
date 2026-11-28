import { act, render, screen } from '@testing-library/react';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay, getSection455Rate } from '@/lib/tax';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

function setDirectorGuideState(
  partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>,
) {
  useDirectorGuideStore.setState((state) => ({
    ...partial,
    calculatedFormData: partial.strategyComparison ? (partial.formData ?? state.formData) : null,
    calculatedStrategy: partial.strategyComparison?.recommended ?? null,
    calculatedDraftScenario: {
      selectedStrategy: null,
      sliderSalary: null,
      profitWhatIfPercent: 0,
      objective: 'maximizeTakeHome',
    },
  }));
}

function createComparison(grossProfit: number) {
  const strategy = {
    name: 'Baseline Mix',
    salary: 0,
    dividends: 0,
    pension: 0,
    companyCarBIK: 0,
    employerNI: 0,
    class1ANI: 0,
    employeeNI: 0,
    incomeTax: 0,
    corporationTax: 0,
    taxableProfit: 0,
    dividendTax: 0,
    dividendPersonalAllowanceUsed: 0,
    dividendNilRateUsed: 0,
    dividendsSubjectToTax: 0,
    lossReliefUsed: 0,
    studentLoan: 0,
    totalPersonalTax: 0,
    retainedProfit: 0,
    companyShortfall: 0,
    takeHome: 0,
  };

  return {
    grossProfit,
    grossProfitAfterPension: grossProfit,
    alreadyTaken: 0,
    availableForExtraction: Math.max(0, grossProfit),
    strategies: {
      allSalary: { ...strategy, name: 'All Salary' },
      optimalMix: { ...strategy, name: 'Baseline Mix' },
      allDividends: { ...strategy, name: 'All Dividends' },
    },
    recommended: 'optimalMix' as const,
    savingsVsAllSalary: 0,
  };
}

describe('DirectorGuide EducationPanel', () => {
  beforeEach(() => {
    // Reset only what we touch in these tests to avoid analytics side effects from store.reset().
    const current = useDirectorGuideStore.getState();
    setDirectorGuideState({
      strategyComparison: null,
      formData: {
        ...current.formData,
        revenue: undefined,
        expenses: undefined,
        otherIncome: 0,
        ytdDrawings: 0,
      },
    });
  });

  test('shows the policy rate and its loan year when drawings exceed the comparison', () => {
    setDirectorGuideState({
      strategyComparison: createComparison(5000),
      formData: { ...useDirectorGuideStore.getState().formData, ytdDrawings: 1000 },
    });

    render(<EducationPanel />);

    const rate = getSection455Rate(CURRENT_TAX_YEAR);
    expect(rate).not.toBeNull();
    const percent = Number(((rate ?? 0) * 100).toFixed(2));
    expect(screen.getByText('Section 455 Tax Warning')).toBeInTheDocument();
    expect(
      screen.getByText(
        `For loans made in ${formatTaxYearDisplay(CURRENT_TAX_YEAR)}, your company may owe Section 455 tax at ${percent}% on amounts still unpaid nine months after the end of the accounting period.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /HMRC’s Section 455 guidance/ })).toHaveAttribute(
      'href',
      'https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505',
    );
  });

  test('does not show the Section 455 warning for an overdrawn comparison without drawings', () => {
    setDirectorGuideState({
      strategyComparison: createComparison(5000),
      formData: { ...useDirectorGuideStore.getState().formData, ytdSalary: 1000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('Already Taken Too Much')).toBeInTheDocument();
    expect(screen.queryByText('Section 455 Tax Warning')).not.toBeInTheDocument();
  });

  test('withholds submitted guidance and assumptions until a submission exists', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    render(<EducationPanel />);

    expect(screen.queryByText('VAT Registration')).not.toBeInTheDocument();
    expect(screen.queryByText('Personal Allowance Taper')).not.toBeInTheDocument();
    expect(screen.queryByText('High Income Child Benefit Charge')).not.toBeInTheDocument();
    expect(screen.queryByText('Assumptions')).not.toBeInTheDocument();
  });

  test.each([84999, 85000, 89999, 90000, 90001])(
    'explains VAT rules without classifying submitted revenue of £%i',
    (revenue) => {
      setDirectorGuideState({
        strategyComparison: createComparison(0),
        formData: { ...useDirectorGuideStore.getState().formData, revenue },
      });

      render(<EducationPanel />);

      expect(screen.getByText('VAT Registration')).toBeVisible();
      expect(
        screen.queryByText(/VAT Registration Required|VAT Threshold Approaching/),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(
          /rolling 12-month taxable turnover went over £90,000, notify HMRC within 30 days of the end of that month/i,
        ),
      ).toBeVisible();
      expect(
        screen.getByText(
          /in the next 30 days, notify HMRC by the end of that period, counted from when the expectation arose/i,
        ),
      ).toBeVisible();
      expect(screen.getByRole('link', { name: /VAT registration rules/i })).toHaveAttribute(
        'href',
        'https://www.gov.uk/register-for-vat',
      );
    },
  );

  test.each([59999, 60000, 80000, 80001])(
    'keeps Child Benefit guidance available at modelled income of £%i',
    (otherIncome) => {
      setDirectorGuideState({
        strategyComparison: createComparison(5000),
        formData: { ...useDirectorGuideStore.getState().formData, otherIncome },
      });

      render(<EducationPanel />);

      expect(screen.getByText('High Income Child Benefit Charge')).toBeVisible();
      expect(screen.getByText(/check both individual adjusted net incomes/i)).toHaveTextContent(
        'above £60,000 and reaches 100% of the benefit from £80,000.',
      );
      expect(
        screen.getByRole('link', { name: /check when the charge applies and how to pay it/i }),
      ).toHaveAttribute('href', 'https://www.gov.uk/child-benefit-tax-charge');
    },
  );

  test('explains taper using adjusted net income without quoting a universal rate', () => {
    const comparison = createComparison(10000);
    comparison.strategies.optimalMix.dividends = 8100;
    setDirectorGuideState({
      strategyComparison: comparison,
      formData: {
        ...useDirectorGuideStore.getState().formData,
        region: 'scotland',
        otherIncome: 101900,
      },
    });
    render(<EducationPanel />);

    expect(screen.getByText(/if your adjusted net income exceeds £100,000/i)).toHaveTextContent(
      'The tax impact depends on your region and mix of income.',
    );
    expect(screen.queryByText(/effective 60% tax rate/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Work out your adjusted net income/i }),
    ).toHaveAttribute('href', 'https://www.gov.uk/guidance/adjusted-net-income');
    expect(screen.getByText(/check when the dividend becomes due and payable/i)).toHaveTextContent(
      'For final dividends, use the payment date set in the resolution, or the declaration date if none is set. Interim dividends generally count when paid, including when credited to an account you can draw on.',
    );
    expect(screen.getByRole('link', { name: /dividend timing guidance/i })).toHaveAttribute(
      'href',
      'https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm15205',
    );
    expect(screen.getByText(/use the relevant accounts to check/i)).toBeVisible();
  });

  test('shows monthly projection and warnings only while their inputs are current', () => {
    const current = useDirectorGuideStore.getState();
    setDirectorGuideState({
      strategyComparison: createComparison(5000) as never,
      monthlyModeOutput: {
        monthsRemaining: 2,
        projectedRevenue: 12000,
        projectedExpenses: 5000,
      } as never,
      formData: {
        ...current.formData,
        mode: 'monthly',
        monthlyIncome: 6000,
        monthlyExpenses: 2500,
      },
    });

    const monthlyDraw = {
      taxBasedMonthlyDraw: 1200,
      requiredBuffer: 3600,
      cashBasedCeiling: 0,
      safeMonthlyDraw: 0,
      spendingShortfall: 900,
      shortfall: 1800,
      hasBufferShortfall: true,
      runwayTargetReachesProjectionEnd: false,
    };
    const { rerender } = render(<EducationPanel monthlyDraw={monthlyDraw} />);
    expect(screen.queryByText(/runway target is at least/i)).not.toBeInTheDocument();
    rerender(
      <EducationPanel monthlyDraw={{ ...monthlyDraw, runwayTargetReachesProjectionEnd: true }} />,
    );

    expect(screen.getByText('Cash Buffer Shortfall')).toBeInTheDocument();
    expect(
      screen.getByText(/runway target is at least as long as the period modelled/i),
    ).toBeVisible();
    expect(screen.queryByText('Contract-End Risk')).not.toBeInTheDocument();
    expect(screen.getByText('Mid-Year Projection Assumption')).toBeInTheDocument();
    expect(screen.getByText(/Monthly projection \(2 months remaining\)/i)).toBeInTheDocument();

    act(() => current.setMonthlyIncome(7000));

    expect(screen.queryByText('Cash Buffer Shortfall')).not.toBeInTheDocument();
    expect(screen.queryByText(/runway target is at least/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/2 months remaining/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Assumptions')).not.toBeInTheDocument();
    expect(screen.queryByText('Full Year')).not.toBeInTheDocument();
  });

  test('shows MTD for Income Tax timeline and scope note', () => {
    render(<EducationPanel />);

    expect(screen.getByText('MTD for Income Tax timeline (current HMRC plan)')).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2026: qualifying income over £50,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2027: qualifying income over £30,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/From 6 April 2028: qualifying income over £20,000/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Limited-company directors may still file Self Assessment outside MTD for Income Tax/i,
      ),
    ).toBeInTheDocument();
  });
});
