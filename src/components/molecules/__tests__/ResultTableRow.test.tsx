// src/components/molecules/__tests__/ResultTableRow.test.tsx
import { render, screen } from '@testing-library/react';
import { Calculator } from 'lucide-react';
import { ResultTableRow } from '../ResultTableRow';

// Mock Table components need to be wrapped in a table
const TableWrapper = ({ children }: { children: React.ReactNode }) => (
  <table>
    <tbody>{children}</tbody>
  </table>
);

describe('ResultTableRow Component', () => {
  const defaultProps = {
    category: 'Income Tax',
    icon: Calculator,
    annual: 12000,
    percentage: '20%',
    color: 'text-blue-600',
    visiblePeriods: ['Yearly', 'Monthly'],
    periodOptions: {
      Yearly: 1,
      Monthly: 12,
      Fortnightly: 26,
      Weekly: 52,
    },
  };

  describe('Rendering', () => {
    it('should render category name', () => {
      render(<ResultTableRow {...defaultProps} />, { wrapper: TableWrapper });

      expect(screen.getByText('Income Tax')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render percentage', () => {
      render(<ResultTableRow {...defaultProps} />, { wrapper: TableWrapper });

      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should render values for visible periods', () => {
      render(<ResultTableRow {...defaultProps} />, { wrapper: TableWrapper });

      // Yearly: £12,000 / 1 = £12,000
      expect(screen.getByText('£12,000.00')).toBeInTheDocument();
      // Monthly: £12,000 / 12 = £1,000
      expect(screen.getByText('£1,000.00')).toBeInTheDocument();
    });

    it('should only render values for visible periods', () => {
      render(<ResultTableRow {...defaultProps} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('£12,000.00')).toBeInTheDocument();
      expect(screen.queryByText('£1,000.00')).not.toBeInTheDocument();
    });

    it('should render multiple period values', () => {
      render(
        <ResultTableRow {...defaultProps} visiblePeriods={['Yearly', 'Monthly', 'Weekly']} />,
        { wrapper: TableWrapper },
      );

      expect(screen.getByText('£12,000.00')).toBeInTheDocument(); // Yearly
      expect(screen.getByText('£1,000.00')).toBeInTheDocument(); // Monthly
      expect(screen.getByText('£230.77')).toBeInTheDocument(); // Weekly
    });
  });

  describe('Styling', () => {
    it('should apply color class', () => {
      const { container } = render(<ResultTableRow {...defaultProps} color='text-red-600' />, {
        wrapper: TableWrapper,
      });

      const cells = container.querySelectorAll('.text-red-600');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should apply highlight styles when isHighlight is true', () => {
      const { container } = render(<ResultTableRow {...defaultProps} isHighlight={true} />, {
        wrapper: TableWrapper,
      });

      const row = container.querySelector('tr');
      expect(row).toHaveClass('border-y');
      expect(row).toHaveClass('border-primary/40');
      expect(row).toHaveClass('bg-primary/10');
    });

    it('should not apply highlight styles when isHighlight is false', () => {
      const { container } = render(<ResultTableRow {...defaultProps} isHighlight={false} />, {
        wrapper: TableWrapper,
      });

      const row = container.querySelector('tr');
      expect(row).not.toHaveClass('border-t-2');
    });

    it('should apply font-bold to cells when isHighlight is true', () => {
      const { container } = render(<ResultTableRow {...defaultProps} isHighlight={true} />, {
        wrapper: TableWrapper,
      });

      const cells = container.querySelectorAll('.font-bold');
      expect(cells.length).toBeGreaterThan(0);
    });

    it('should apply sub-row indentation when isSubRow is true', () => {
      const { container } = render(<ResultTableRow {...defaultProps} isSubRow={true} />, {
        wrapper: TableWrapper,
      });

      // Updated to match responsive padding classes (pl-3 sm:pl-4)
      const categoryCell = container.querySelector('.pl-3');
      expect(categoryCell).toBeInTheDocument();
      expect(categoryCell).toHaveClass('sm:pl-4');
    });

    it('should not apply sub-row indentation when isSubRow is false', () => {
      const { container } = render(<ResultTableRow {...defaultProps} isSubRow={false} />, {
        wrapper: TableWrapper,
      });

      // When isSubRow is false, the indentation classes should NOT be applied to the div
      const iconContainer = container.querySelector('.flex.items-start.gap-1\\.5');
      expect(iconContainer).not.toHaveClass('pl-3');
      expect(iconContainer).not.toHaveClass('sm:pl-4');
    });

    it('should have hover styles', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const row = container.querySelector('tr');
      expect(row).toHaveClass('hover:bg-secondary/60');
    });
  });

  describe('Period Calculations', () => {
    it('should calculate yearly value correctly', () => {
      render(<ResultTableRow {...defaultProps} annual={50000} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('£50,000.00')).toBeInTheDocument();
    });

    it('should calculate monthly value correctly', () => {
      render(<ResultTableRow {...defaultProps} annual={12000} visiblePeriods={['Monthly']} />, {
        wrapper: TableWrapper,
      });

      // 12000 / 12 = 1000
      expect(screen.getByText('£1,000.00')).toBeInTheDocument();
    });

    it('should calculate weekly value correctly', () => {
      render(<ResultTableRow {...defaultProps} annual={26000} visiblePeriods={['Weekly']} />, {
        wrapper: TableWrapper,
      });

      // 26000 / 52 = 500
      expect(screen.getByText('£500.00')).toBeInTheDocument();
    });

    it('should calculate fortnightly value correctly', () => {
      render(<ResultTableRow {...defaultProps} annual={26000} visiblePeriods={['Fortnightly']} />, {
        wrapper: TableWrapper,
      });

      // 26000 / 26 = 1000
      expect(screen.getByText('£1,000.00')).toBeInTheDocument();
    });

    it('should handle zero annual value', () => {
      render(<ResultTableRow {...defaultProps} annual={0} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('£0.00')).toBeInTheDocument();
    });

    it('should handle large annual value', () => {
      render(<ResultTableRow {...defaultProps} annual={1000000} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('£1,000,000.00')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render table cells in correct order', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const cells = container.querySelectorAll('th, td');
      expect(cells.length).toBe(4); // Category (th), Percentage, Yearly, Monthly
    });

    it('should render correct number of cells based on visible periods', () => {
      const { container } = render(
        <ResultTableRow
          {...defaultProps}
          visiblePeriods={['Yearly', 'Monthly', 'Weekly', 'Fortnightly']}
        />,
        { wrapper: TableWrapper },
      );

      const cells = container.querySelectorAll('th, td');
      expect(cells.length).toBe(6); // Category (th), Percentage, 4 periods
    });

    it('should have text-right alignment for numeric cells', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const rightAlignedCells = container.querySelectorAll('.text-right');
      expect(rightAlignedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('should render different icon types', () => {
      const TestIcon = () => <div data-testid='test-icon' />;

      const { container } = render(<ResultTableRow {...defaultProps} icon={TestIcon} />, {
        wrapper: TableWrapper,
      });

      expect(container.querySelector('[data-testid="test-icon"]')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty visible periods array', () => {
      const { container } = render(<ResultTableRow {...defaultProps} visiblePeriods={[]} />, {
        wrapper: TableWrapper,
      });

      const cells = container.querySelectorAll('th, td');
      expect(cells.length).toBe(2); // Only category (th) and percentage
    });

    it('should handle negative annual value', () => {
      render(<ResultTableRow {...defaultProps} annual={-1000} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('-£1,000.00')).toBeInTheDocument();
    });

    it('should handle decimal annual value', () => {
      render(<ResultTableRow {...defaultProps} annual={999.99} visiblePeriods={['Yearly']} />, {
        wrapper: TableWrapper,
      });

      expect(screen.getByText('£999.99')).toBeInTheDocument();
    });

    it('should handle very long category names', () => {
      render(
        <ResultTableRow
          {...defaultProps}
          category='This is a very long category name that might wrap'
        />,
        { wrapper: TableWrapper },
      );

      expect(
        screen.getByText('This is a very long category name that might wrap'),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render table row with proper semantic HTML', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const row = container.querySelector('tr');
      expect(row).toBeInTheDocument();
    });

    it('should render table cells with proper semantic HTML', () => {
      const { container } = render(<ResultTableRow {...defaultProps} />, {
        wrapper: TableWrapper,
      });

      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});

// Import React for types
import type * as React from 'react';
