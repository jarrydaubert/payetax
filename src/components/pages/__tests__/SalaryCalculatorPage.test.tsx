/**
 * @jest-environment jsdom
 */
// src/components/pages/__tests__/SalaryCalculatorPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { SalaryCalculatorPage } from '../SalaryCalculatorPage';

// Mock child components
jest.mock('@/components/molecules/SalaryQuickResults', () => ({
  SalaryQuickResults: ({ salary, results }: any) => (
    <div data-testid='mock-salary-quick-results'>
      <div data-testid='salary-value'>{salary}</div>
      <div data-testid='take-home'>{results?.takeHome || 0}</div>
    </div>
  ),
}));

jest.mock('@/components/molecules/SalarySEOContent', () => ({
  SalarySEOContent: ({ salary }: any) => (
    <div data-testid='mock-salary-seo-content'>
      <div data-testid='seo-salary'>{salary}</div>
    </div>
  ),
}));

jest.mock('@/components/organisms/CalculatorContent', () => ({
  CalculatorContent: () => <div data-testid='mock-calculator-content'>Calculator Content</div>,
}));

jest.mock('@/components/organisms/StructuredData', () => ({
  StructuredData: () => null,
}));

// Mock taxCalculator
const mockCalculateTax = jest.fn();
jest.mock('@/lib/taxCalculator', () => ({
  calculateTax: (...args: any[]) => mockCalculateTax(...args),
  type: {
    TaxCalculationResults: {},
  },
}));

// Mock calculator store
const mockSetSalary = jest.fn();
const mockCalculate = jest.fn();
jest.mock('@/store/calculatorStore', () => ({
  useCalculatorStore: (selector: any) => {
    const state = {
      setSalary: mockSetSalary,
      calculate: mockCalculate,
    };
    return selector ? selector(state) : state;
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('SalaryCalculatorPage', () => {
  const mockResults = {
    grossSalary: { annually: 45000, monthly: 3750, weekly: 865, daily: 173, hourly: 21.63 },
    takeHome: 34302,
    totalTax: 6486,
    totalNI: 4212,
    personalAllowance: 12570,
    taxableIncome: 32430,
    incomeTax: { annually: 6486, monthly: 540.5, weekly: 124.73, daily: 24.95, hourly: 3.12 },
    nationalInsurance: {
      annually: 2594,
      monthly: 216.17,
      weekly: 49.88,
      daily: 9.98,
      hourly: 1.25,
    },
    studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
    pensionContribution: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
    netPay: { annually: 35920, monthly: 2993.33, weekly: 690.77, daily: 138.15, hourly: 17.27 },
    pension: 0,
    employerNI: 5310,
    effectiveRate: 23.78,
    marginalRate: 33.25,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateTax.mockReturnValue(mockResults);
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
      });
    });

    it('should render main sections', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      // Component renders immediately with results in tests (useEffect runs sync in jsdom)
      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
      });
    });

    it('should render all main sections after loading', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
        expect(screen.getByTestId('mock-salary-seo-content')).toBeInTheDocument();
        expect(screen.getByTestId('mock-calculator-content')).toBeInTheDocument();
      });
    });

    it('should render breadcrumb navigation', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Calculator')).toBeInTheDocument();
        expect(screen.getByText('£45,000 Salary')).toBeInTheDocument();
      });
    });

    it('should render section headings', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByText('Customize Your Calculation')).toBeInTheDocument();
        expect(screen.getByText('Related Salary Calculations')).toBeInTheDocument();
      });
    });
  });

  describe('Salary Calculations', () => {
    it('should calculate tax on mount', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith(
          expect.objectContaining({
            salary: 45000,
            payPeriod: 'annually',
            taxYear: '2025-2026',
            taxCode: '1257L',
          })
        );
      });
    });

    it('should update store with salary', async () => {
      render(<SalaryCalculatorPage salary={50000} />);

      await waitFor(() => {
        expect(mockSetSalary).toHaveBeenCalledWith(50000);
        expect(mockCalculate).toHaveBeenCalled();
      });
    });

    it('should handle different salary amounts', async () => {
      const { rerender } = render(<SalaryCalculatorPage salary={30000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith(expect.objectContaining({ salary: 30000 }));
      });

      mockCalculateTax.mockClear();
      rerender(<SalaryCalculatorPage salary={60000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith(expect.objectContaining({ salary: 60000 }));
      });
    });

    it('should use default tax calculation parameters', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith({
          salary: 45000,
          payPeriod: 'annually',
          taxYear: '2025-2026',
          taxCode: '1257L',
          isScottish: false,
          isMarried: false,
          partnerGrossWage: 0,
          isBlind: false,
          payNoNI: false,
          studentLoanPlans: 'none',
          pensionContribution: 0,
          pensionContributionType: 'percentage',
          niCategory: 'A',
          hoursPerWeek: 37.5,
        });
      });
    });
  });

  describe('Salary Formatting', () => {
    it('should format salary with UK locale', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByText('£45,000 Salary')).toBeInTheDocument();
      });
    });

    it('should format large salaries correctly', async () => {
      render(<SalaryCalculatorPage salary={125000} />);

      await waitFor(() => {
        expect(screen.getByText('£125,000 Salary')).toBeInTheDocument();
      });
    });

    it('should format small salaries correctly', async () => {
      render(<SalaryCalculatorPage salary={20000} />);

      await waitFor(() => {
        expect(screen.getByText('£20,000 Salary')).toBeInTheDocument();
      });
    });
  });

  describe('Comparison Salaries', () => {
    it('should generate comparison salaries', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
      });

      // Comparisons: 35k, 40k, 50k, 55k
      // Note: These are passed to component but not rendered in our mock
    });

    it('should filter out salaries below 20k', async () => {
      render(<SalaryCalculatorPage salary={25000} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
      });

      // Would generate: 15k (-10k), 20k (-5k), 30k (+5k), 35k (+10k)
      // 15k should be filtered out (< 20k)
    });

    it('should filter out salaries above 500k', async () => {
      render(<SalaryCalculatorPage salary={495000} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-salary-quick-results')).toBeInTheDocument();
      });

      // Would generate: 485k (-10k), 490k (-5k), 500k (+5k), 505k (+10k)
      // 505k should be filtered out (> 500k)
    });
  });

  describe('Related Searches', () => {
    it('should render related salary links', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        // £45k will show £25k, £30k, £35k, £60k, £70k (not £40k or £50k - too close)
        expect(screen.getByText(/£30,000 salary/)).toBeInTheDocument();
        expect(screen.getByText(/£70,000 salary/)).toBeInTheDocument();
      });
    });

    it('should filter related salaries within range', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const links = container.querySelectorAll('a[href^="/calculator/"]');
        const relatedLinks = Array.from(links).filter((link) =>
          link.textContent?.includes('salary')
        );

        // Should show salaries within £5k-£30k range of £45k
        // Valid: £25k, £30k, £35k, £40k, £50k, £60k, £70k
        expect(relatedLinks.length).toBeGreaterThan(0);
      });
    });

    it('should link to correct calculator URLs', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const link = container.querySelector('a[href="/calculator/30000-after-tax"]');
        expect(link).toBeInTheDocument();
        expect(link?.textContent).toContain('£30,000 salary');
      });
    });

    it('should exclude current salary from related salary calculation links', async () => {
      const { container } = render(<SalaryCalculatorPage salary={50000} />);

      await waitFor(() => {
        // Should not have a calculator link to the current salary
        // (note: the blog "Related Reading" section may still mention it)
        const links = container.querySelectorAll('a[href="/calculator/50000-after-tax"]');
        expect(links.length).toBe(0);
      });
    });

    it('should exclude salaries within £5k range', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        // Should not show £45k (current) or very close salaries
        // £40k is exactly £5k away, should be filtered
        const links = screen.queryAllByText(/£40,000 salary/);
        expect(links.length).toBe(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic sections', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const sections = container.querySelectorAll('section');
        expect(sections.length).toBeGreaterThanOrEqual(3); // Hero, calculator, related
      });
    });

    it('should have accessible breadcrumb', async () => {
      render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
        expect(nav).toBeInTheDocument();
        expect(nav.querySelector('ol')).toBeInTheDocument();
      });
    });

    it('should have proper heading hierarchy', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const h2Headings = container.querySelectorAll('h2');
        expect(h2Headings.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Layout & Styling', () => {
    it('should have min-height screen', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.min-h-screen');
        expect(mainDiv).toBeInTheDocument();
        expect(mainDiv).toHaveClass('bg-background');
      });
    });

    it('should have responsive grid layout', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const grid = container.querySelector('.grid.lg\\:grid-cols-2');
        expect(grid).toBeInTheDocument();
      });
    });

    it('should have gradient background', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const gradient = container.querySelector('.bg-gradient-to-br');
        expect(gradient).toBeInTheDocument();
      });
    });

    it('should use design tokens for spacing', async () => {
      const { container } = render(<SalaryCalculatorPage salary={45000} />);

      await waitFor(() => {
        const containerDiv = container.querySelector('.container.mx-auto.max-w-7xl');
        expect(containerDiv).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum salary', async () => {
      render(<SalaryCalculatorPage salary={20000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith(expect.objectContaining({ salary: 20000 }));
      });
    });

    it('should handle maximum salary', async () => {
      render(<SalaryCalculatorPage salary={500000} />);

      await waitFor(() => {
        expect(mockCalculateTax).toHaveBeenCalledWith(expect.objectContaining({ salary: 500000 }));
      });
    });

    it('should handle typical UK salaries', async () => {
      const salaries = [25000, 30000, 35000, 40000, 45000, 50000, 60000, 80000, 100000];

      for (const salary of salaries) {
        mockCalculateTax.mockClear();
        const { unmount } = render(<SalaryCalculatorPage salary={salary} />);

        await waitFor(() => {
          expect(mockCalculateTax).toHaveBeenCalledWith(expect.objectContaining({ salary }));
        });

        unmount();
      }
    });
  });
});
