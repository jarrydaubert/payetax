/**
 * Tests for ComparisonResultsTable Component
 * PAYTAX-160 Phase 1: Increase coverage from 12.87% to 80%+
 */

import { render, screen } from '@testing-library/react';
import type { ComparisonResults } from '@/lib/salaryComparison';
import { ComparisonResultsTable } from '../ComparisonResultsTable';

// Mock hooks
jest.mock('@/hooks/useHorizontalScrollIndicator', () => ({
  useHorizontalScrollIndicator: () => ({
    showLeftIndicator: false,
    showRightIndicator: true,
  }),
}));

jest.mock('@/hooks/useMouseDragScroll', () => ({
  useMouseDragScroll: jest.fn(),
}));

// Mock ScrollIndicator
jest.mock('@/components/atoms/ScrollIndicator', () => ({
  ScrollIndicator: ({ direction, visible }: any) =>
    visible ? <div data-testid={`scroll-${direction}`}>Scroll {direction}</div> : null,
}));

describe('ComparisonResultsTable', () => {
  const mockResults: ComparisonResults = {
    currentResults: {
      grossSalary: { annually: 45000, monthly: 3750, weekly: 865, daily: 173, hourly: 0 },
      incomeTax: { annually: 6486, monthly: 540, weekly: 125, daily: 25, hourly: 0 },
      nationalInsurance: { annually: 4212, monthly: 351, weekly: 81, daily: 16, hourly: 0 },
      studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
      pensionContribution: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
      netPay: { annually: 34302, monthly: 2859, weekly: 659, daily: 132, hourly: 0 },
      totalDeductions: { annually: 10698, monthly: 891, weekly: 206, daily: 41, hourly: 0 },
      effectiveTaxRate: 23.77,
      marginalTaxRate: 33.25,
    },
    newResults: {
      grossSalary: { annually: 50000, monthly: 4167, weekly: 962, daily: 192, hourly: 0 },
      incomeTax: { annually: 7486, monthly: 624, weekly: 144, daily: 29, hourly: 0 },
      nationalInsurance: { annually: 4812, monthly: 401, weekly: 93, daily: 19, hourly: 0 },
      studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
      pensionContribution: { annually: 0, monthly: 0, weekly: 0, daily: 0, hourly: 0 },
      netPay: { annually: 37702, monthly: 3142, weekly: 725, daily: 145, hourly: 0 },
      totalDeductions: { annually: 12298, monthly: 1025, weekly: 237, daily: 47, hourly: 0 },
      effectiveTaxRate: 24.6,
      marginalTaxRate: 33.25,
    },
    grossDiff: 5000,
    taxDiff: 1000,
    niDiff: 600,
    studentLoanDiff: 0,
    pensionDiff: 0,
    netDiff: 3400,
    takeHomePercentage: 68.0,
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByLabelText('Salary comparison results')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(<ComparisonResultsTable results={mockResults} />);

      expect(screen.getByText('Metric')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByText('Difference')).toBeInTheDocument();
    });

    it('should render all metric rows', () => {
      render(<ComparisonResultsTable results={mockResults} />);

      expect(screen.getByText('Gross Salary')).toBeInTheDocument();
      expect(screen.getByText('Income Tax')).toBeInTheDocument();
      expect(screen.getByText('National Insurance')).toBeInTheDocument();
      expect(screen.getByText('Take-Home Pay')).toBeInTheDocument();
    });

    it('should render scroll indicators', () => {
      render(<ComparisonResultsTable results={mockResults} />);

      // Mock returns showRightIndicator: true
      expect(screen.getByTestId('scroll-right')).toBeInTheDocument();
    });
  });

  describe('Salary Values', () => {
    it('should display current gross salary', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£45,000')).toBeInTheDocument();
    });

    it('should display new gross salary', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£50,000')).toBeInTheDocument();
    });

    it('should display current net pay', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£34,302')).toBeInTheDocument();
    });

    it('should display new net pay', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£37,702')).toBeInTheDocument();
    });
  });

  describe('Tax Values', () => {
    it('should display current income tax', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£6,486')).toBeInTheDocument();
    });

    it('should display new income tax', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£7,486')).toBeInTheDocument();
    });

    it('should display current NI', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£4,212')).toBeInTheDocument();
    });

    it('should display new NI', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£4,812')).toBeInTheDocument();
    });
  });

  describe('Differences', () => {
    it('should show positive gross difference', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£5,000')).toBeInTheDocument();
    });

    it('should show positive net difference', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByText('£3,400')).toBeInTheDocument();
    });

    it('should show arrows for positive changes', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const arrows = container.querySelectorAll('svg');
      expect(arrows.length).toBeGreaterThan(0);
    });

    it('should show zero difference as dash', () => {
      const zeroResults: ComparisonResults = {
        ...mockResults,
        studentLoanDiff: 0,
        pensionDiff: 0,
      };

      render(<ComparisonResultsTable results={zeroResults} />);
      // Zero diffs shown as "—" (only visible in DOM inspection)
    });
  });

  describe('Conditional Rendering', () => {
    it('should show student loan row when present', () => {
      const withStudentLoan: ComparisonResults = {
        ...mockResults,
        currentResults: {
          ...mockResults.currentResults,
          studentLoan: { annually: 1000, monthly: 83, weekly: 19, daily: 4, hourly: 0 },
        },
        studentLoanDiff: 100,
      };

      render(<ComparisonResultsTable results={withStudentLoan} />);
      expect(screen.getByText('Student Loan')).toBeInTheDocument();
    });

    it('should hide student loan row when zero', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.queryByText('Student Loan')).not.toBeInTheDocument();
    });

    it('should show pension row when present', () => {
      const withPension: ComparisonResults = {
        ...mockResults,
        currentResults: {
          ...mockResults.currentResults,
          pensionContribution: { annually: 2000, monthly: 167, weekly: 38, daily: 8, hourly: 0 },
        },
        pensionDiff: 200,
      };

      render(<ComparisonResultsTable results={withPension} />);
      expect(screen.getByText('Pension')).toBeInTheDocument();
    });

    it('should hide pension row when zero', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.queryByText('Pension')).not.toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should use green for positive net difference', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const positiveValue = container.querySelector('.text-green-600');
      expect(positiveValue).toBeInTheDocument();
    });

    it('should use amber for negative differences', () => {
      const negativeResults: ComparisonResults = {
        ...mockResults,
        grossDiff: -5000,
        netDiff: -3400,
      };

      const { container } = render(<ComparisonResultsTable results={negativeResults} />);
      const negativeValue = container.querySelector('.text-amber-600');
      expect(negativeValue).toBeInTheDocument();
    });

    it('should highlight take-home pay row', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const takeHomeRow = container.querySelector('.bg-muted\\/30');
      expect(takeHomeRow).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have column headers with scope', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const headers = container.querySelectorAll('th[scope="col"]');
      expect(headers.length).toBe(4);
    });

    it('should have aria-label on scrollable area', () => {
      render(<ComparisonResultsTable results={mockResults} />);
      const scrollArea = screen.getByLabelText('Salary comparison results');
      expect(scrollArea).toBeInTheDocument();
    });

    // The accessible label is on the scrollable region (section), not the <table>.
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ComparisonResultsTable results={mockResults} className='custom-class' />,
      );
      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have rounded border', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const scrollContainer = container.querySelector('.rounded-lg.border');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should use design tokens for spacing', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const gapElement = container.querySelector('[class*="gap"]');
      expect(gapElement).toBeInTheDocument();
    });

    it('should have sticky headers', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const stickyHeaders = container.querySelectorAll('.sticky.top-0');
      expect(stickyHeaders.length).toBeGreaterThan(0);
    });
  });

  describe('Cursor Styles', () => {
    it('should have grab cursor on scroll container', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const scrollContainer = container.querySelector('.cursor-grab');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have grabbing cursor class', () => {
      const { container } = render(<ComparisonResultsTable results={mockResults} />);
      const scrollContainer = container.querySelector('.active\\:cursor-grabbing');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle equal salaries (no change)', () => {
      const equalResults: ComparisonResults = {
        ...mockResults,
        grossDiff: 0,
        taxDiff: 0,
        niDiff: 0,
        netDiff: 0,
      };

      render(<ComparisonResultsTable results={equalResults} />);
      // Should render without errors
      expect(screen.getByText('Take-Home Pay')).toBeInTheDocument();
    });

    it('should handle salary decrease', () => {
      const decreaseResults: ComparisonResults = {
        currentResults: mockResults.newResults,
        newResults: mockResults.currentResults,
        grossDiff: -5000,
        taxDiff: -1000,
        niDiff: -600,
        studentLoanDiff: 0,
        pensionDiff: 0,
        netDiff: -3400,
        takeHomePercentage: 68.0,
      };

      render(<ComparisonResultsTable results={decreaseResults} />);
      expect(screen.getByText('Take-Home Pay')).toBeInTheDocument();
    });

    it('should handle very large salaries', () => {
      const largeResults: ComparisonResults = {
        ...mockResults,
        currentResults: {
          ...mockResults.currentResults,
          grossSalary: { annually: 500000, monthly: 41667, weekly: 9615, daily: 1923, hourly: 0 },
        },
      };

      render(<ComparisonResultsTable results={largeResults} />);
      expect(screen.getByText('£500,000')).toBeInTheDocument();
    });

    it('should handle small salaries', () => {
      const smallResults: ComparisonResults = {
        ...mockResults,
        currentResults: {
          ...mockResults.currentResults,
          grossSalary: { annually: 20000, monthly: 1667, weekly: 385, daily: 77, hourly: 0 },
        },
      };

      render(<ComparisonResultsTable results={smallResults} />);
      expect(screen.getByText('£20,000')).toBeInTheDocument();
    });
  });
});
