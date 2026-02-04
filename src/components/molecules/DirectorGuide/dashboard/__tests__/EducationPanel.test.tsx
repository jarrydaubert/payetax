import { render, screen } from '@testing-library/react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

function setDirectorGuideState(partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>) {
  useDirectorGuideStore.setState(partial as never);
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
        includesVat: false,
      },
    });
  });

  test('shows VAT mandatory warning based on revenue even with no results', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('VAT Registration Required')).toBeInTheDocument();
  });

  test('shows VAT approaching warning based on revenue even when profit is zero', () => {
    setDirectorGuideState({
      strategyComparison: {
        grossProfit: 0,
        alreadyTaken: 0,
        availableForExtraction: 0,
        strategies: {
          allSalary: {
            name: 'All Salary',
            salary: 0,
            dividends: 0,
            pension: 0,
            companyCarBIK: 0,
            employerNI: 0,
            employeeNI: 0,
            incomeTax: 0,
            corporationTax: 0,
            dividendTax: 0,
            studentLoan: 0,
            totalPersonalTax: 0,
            companyCost: 0,
            takeHome: 0,
            effectiveRate: 0,
          },
          optimalMix: {
            name: 'Baseline Mix',
            salary: 0,
            dividends: 0,
            pension: 0,
            companyCarBIK: 0,
            employerNI: 0,
            employeeNI: 0,
            incomeTax: 0,
            corporationTax: 0,
            dividendTax: 0,
            studentLoan: 0,
            totalPersonalTax: 0,
            companyCost: 0,
            takeHome: 0,
            effectiveRate: 0,
          },
          allDividends: {
            name: 'All Dividends',
            salary: 0,
            dividends: 0,
            pension: 0,
            companyCarBIK: 0,
            employerNI: 0,
            employeeNI: 0,
            incomeTax: 0,
            corporationTax: 0,
            dividendTax: 0,
            studentLoan: 0,
            totalPersonalTax: 0,
            companyCost: 0,
            takeHome: 0,
            effectiveRate: 0,
          },
        },
        recommended: 'optimalMix',
        savingsVsAllSalary: 0,
      },
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 86000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('VAT Threshold Approaching')).toBeInTheDocument();
  });

  test('adds a VAT note when revenue includes VAT (warning-only)', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000, includesVat: true },
    });

    render(<EducationPanel />);

    expect(
      screen.getByText(/turnover figure includes VAT/i),
    ).toBeInTheDocument();
  });
});

