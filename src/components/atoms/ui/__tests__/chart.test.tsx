/**
 * Chart Components Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for Recharts wrapper components:
 * - ChartContainer with context provider
 * - ChartTooltipContent with payload handling
 * - ChartLegendContent with config rendering
 * - useChart hook error handling
 * - CHART_COLORS export
 */

import { render, screen } from '@testing-library/react';
import * as RechartsPrimitive from 'recharts';
import {
  CHART_COLORS,
  ChartContainer,
  ChartContext,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
} from '../chart';

// Test helper component to use the hook
function TestUseChartComponent() {
  const { config } = useChart();
  return <div data-testid='config'>{JSON.stringify(config)}</div>;
}

describe('chart.tsx', () => {
  describe('CHART_COLORS', () => {
    it('should export predefined chart colors', () => {
      expect(CHART_COLORS).toBeDefined();
      expect(CHART_COLORS.employment).toBeDefined();
      expect(CHART_COLORS.incomeTax).toBeDefined();
      expect(CHART_COLORS.ni).toBeDefined();
      expect(CHART_COLORS.netPay).toBeDefined();
      expect(CHART_COLORS.pension).toBeDefined();
      expect(CHART_COLORS.studentLoan).toBeDefined();
      expect(CHART_COLORS.other).toBeDefined();
    });

    it('should use HSL color format', () => {
      for (const color of Object.values(CHART_COLORS)) {
        expect(color).toMatch(/^hsl\(/);
      }
    });
  });

  describe('ChartContainer', () => {
    const defaultConfig = {
      salary: { label: 'Salary', color: 'blue' },
      tax: { label: 'Tax', color: 'red' },
    };

    it('should render children', () => {
      render(
        <ChartContainer config={defaultConfig}>
          <div data-testid='child'>Chart Content</div>
        </ChartContainer>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide context to children', () => {
      render(
        <ChartContainer config={defaultConfig}>
          <TestUseChartComponent />
        </ChartContainer>
      );
      expect(screen.getByTestId('config')).toHaveTextContent('Salary');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ChartContainer config={defaultConfig} className='custom-class'>
          <div>Content</div>
        </ChartContainer>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have correct base styling', () => {
      const { container } = render(
        <ChartContainer config={defaultConfig}>
          <div>Content</div>
        </ChartContainer>
      );
      expect(container.firstChild).toHaveClass('relative', 'flex', 'w-full');
    });

    it('should support aria-label for accessibility', () => {
      const { container } = render(
        <ChartContainer config={defaultConfig} aria-label='Tax breakdown chart' role='img'>
          <div>Content</div>
        </ChartContainer>
      );
      expect(container.firstChild).toHaveAttribute('aria-label', 'Tax breakdown chart');
      expect(container.firstChild).toHaveAttribute('role', 'img');
    });

    it('should support ref forwarding', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(
        <ChartContainer config={defaultConfig} ref={ref}>
          <div>Content</div>
        </ChartContainer>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('useChart hook', () => {
    it('should throw error when used outside ChartContainer', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestUseChartComponent />);
      }).toThrow('useChart must be used within a <ChartContainer />');

      consoleSpy.mockRestore();
    });

    it('should return config when used inside ChartContainer', () => {
      const testConfig = { test: { label: 'Test Label' } };
      render(
        <ChartContainer config={testConfig}>
          <TestUseChartComponent />
        </ChartContainer>
      );
      expect(screen.getByTestId('config')).toHaveTextContent('Test Label');
    });
  });

  describe('ChartTooltip', () => {
    it('should be exported from recharts', () => {
      expect(ChartTooltip).toBe(RechartsPrimitive.Tooltip);
    });
  });

  describe('ChartTooltipContent', () => {
    const mockConfig = {
      salary: { label: 'Gross Salary', color: 'blue' },
      tax: { label: 'Income Tax', color: 'red' },
    };

    const mockPayload = [
      { name: 'salary', value: 50000, dataKey: 'salary', color: 'blue' },
      { name: 'tax', value: 10000, dataKey: 'tax', color: 'red' },
    ];

    it('should return null when not active', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} payload={mockPayload} />
        </ChartContainer>
      );
      expect(container.querySelector('[class*="rounded-lg"]')).not.toBeInTheDocument();
    });

    it('should return null when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={[]} />
        </ChartContainer>
      );
      expect(container.querySelector('[class*="rounded-lg"]')).not.toBeInTheDocument();
    });

    it('should render tooltip when active with payload', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.getByText('50000')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
    });

    it('should display labels from config', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );
      // Labels appear in multiple places (label and row)
      expect(screen.getAllByText('Gross Salary').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Income Tax').length).toBeGreaterThan(0);
    });

    it('should hide label when hideLabel is true', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            hideLabel={true}
            label='Test Label'
          />
        </ChartContainer>
      );
      // Label should not be rendered
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });

    it('should hide indicator when hideIndicator is true', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} hideIndicator={true} />
        </ChartContainer>
      );
      // No color indicators should be present
      const indicators = container.querySelectorAll('.h-2\\.5.w-2\\.5');
      expect(indicators.length).toBe(0);
    });

    it('should render dot indicator by default', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} />
        </ChartContainer>
      );
      const dotIndicators = container.querySelectorAll('.rounded-full');
      expect(dotIndicators.length).toBeGreaterThan(0);
    });

    it('should render line indicator when specified', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} indicator='line' />
        </ChartContainer>
      );
      const lineIndicators = container.querySelectorAll('.w-1');
      expect(lineIndicators.length).toBeGreaterThan(0);
    });

    it('should use custom formatter', () => {
      const formatter = (value: number | string) => `£${value}`;
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} formatter={formatter} />
        </ChartContainer>
      );
      expect(screen.getByText('£50000')).toBeInTheDocument();
    });

    it('should use labelFormatter when provided', () => {
      const labelFormatter = () => 'Custom Label';
      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent
            active={true}
            payload={mockPayload}
            label='Original'
            labelFormatter={labelFormatter}
          />
        </ChartContainer>
      );
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={mockPayload} className='custom-tooltip' />
        </ChartContainer>
      );
      expect(container.querySelector('.custom-tooltip')).toBeInTheDocument();
    });
  });

  describe('ChartLegend', () => {
    it('should be exported from recharts', () => {
      expect(ChartLegend).toBe(RechartsPrimitive.Legend);
    });
  });

  describe('ChartLegendContent', () => {
    const mockConfig = {
      salary: { label: 'Gross Salary' },
      tax: { label: 'Income Tax' },
    };

    const mockPayload = [
      { value: 'salary', color: 'blue' },
      { value: 'tax', color: 'red' },
    ];

    it('should return null when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>
      );
      // Should render nothing visible
      expect(container.querySelector('.flex.items-center.justify-center')).not.toBeInTheDocument();
    });

    it('should return null when payload is undefined', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={undefined} />
        </ChartContainer>
      );
      expect(container.querySelector('.flex.items-center.justify-center')).not.toBeInTheDocument();
    });

    it('should render legend items', () => {
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );
      expect(screen.getByText('Gross Salary')).toBeInTheDocument();
      expect(screen.getByText('Income Tax')).toBeInTheDocument();
    });

    it('should hide icon when hideIcon is true', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} hideIcon={true} />
        </ChartContainer>
      );
      // No color indicators should be present
      const indicators = container.querySelectorAll('.h-2.w-2');
      expect(indicators.length).toBe(0);
    });

    it('should show color indicators by default', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} />
        </ChartContainer>
      );
      const indicators = container.querySelectorAll('.h-2.w-2');
      expect(indicators.length).toBe(2);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={mockPayload} className='custom-legend' />
        </ChartContainer>
      );
      expect(container.querySelector('.custom-legend')).toBeInTheDocument();
    });

    it('should use nameKey when provided', () => {
      const payloadWithDataKey = [{ value: 'salary', dataKey: 'salary', color: 'blue' }];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payloadWithDataKey} nameKey='salary' />
        </ChartContainer>
      );
      expect(screen.getByText('Gross Salary')).toBeInTheDocument();
    });

    it('should fall back to item.value when config not found', () => {
      const payloadWithUnknown = [{ value: 'unknown', color: 'gray' }];
      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payloadWithUnknown} />
        </ChartContainer>
      );
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });

  describe('ChartContext', () => {
    it('should be exported', () => {
      expect(ChartContext).toBeDefined();
    });
  });
});
