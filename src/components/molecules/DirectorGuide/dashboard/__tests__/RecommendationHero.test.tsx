import { render, screen } from '@testing-library/react';
import { RecommendationHero } from '../RecommendationHero';

const mockUseActiveDirectorScenario = jest.fn();

jest.mock(
  '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario',
  () => ({
    useActiveDirectorScenario: () => mockUseActiveDirectorScenario(),
  }),
);

function strategy(overrides: Record<string, number> = {}) {
  return {
    salary: 12570,
    dividends: 40000,
    employerNI: 0,
    employeeNI: 0,
    incomeTax: 2000,
    corporationTax: 8000,
    dividendTax: 3000,
    studentLoan: 0,
    pension: 0,
    companyCarBIK: 0,
    totalPersonalTax: 5000,
    companyCost: 0,
    effectiveRate: 18.4,
    takeHome: 45000,
    ...overrides,
  };
}

function comparison(recommended: 'allSalary' | 'optimalMix' | 'allDividends', savings: number) {
  return {
    grossProfit: 60000,
    grossProfitAfterPension: 60000,
    recommended,
    savingsVsAllSalary: savings,
    strategies: {
      allSalary: strategy({ takeHome: 41000 }),
      optimalMix: strategy({ takeHome: 45000 }),
      allDividends: strategy({ takeHome: 43000 }),
    },
  };
}

describe('RecommendationHero', () => {
  it('renders the recommended strategy with take-home and savings', () => {
    mockUseActiveDirectorScenario.mockReturnValue({
      comparison: comparison('optimalMix', 4000),
    });

    render(<RecommendationHero />);

    expect(screen.getByText('Optimal salary & dividend mix')).toBeInTheDocument();
    expect(screen.getByText('£45,000')).toBeInTheDocument();
    expect(screen.getByText('vs all salary')).toBeInTheDocument();
    expect(screen.getByText('+£4,000')).toBeInTheDocument();
  });

  it('hides the savings figure when all-salary is recommended', () => {
    mockUseActiveDirectorScenario.mockReturnValue({
      comparison: comparison('allSalary', 0),
    });

    render(<RecommendationHero />);

    expect(screen.getByText('Take it all as salary')).toBeInTheDocument();
    expect(screen.queryByText('vs all salary')).not.toBeInTheDocument();
  });

  it('renders nothing without a positive-profit comparison', () => {
    mockUseActiveDirectorScenario.mockReturnValue({ comparison: null });
    const { container } = render(<RecommendationHero />);
    expect(container).toBeEmptyDOMElement();
  });
});
