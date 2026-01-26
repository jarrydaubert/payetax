// src/components/molecules/DirectorGuide/warnings/__tests__/SurvivalMode.test.tsx
import { render, screen } from '@testing-library/react';
import type { SurvivalResult } from '@/lib/validation/directorValidation';
import { SurvivalMode } from '../SurvivalMode';

const createSurvivalResult = (profit: number): SurvivalResult => ({
  mode: profit <= 0 ? 'survival' : 'modified_survival',
  grossRevenue: 20000,
  netRevenue: 20000,
  expenses: 20000 - profit,
  grossProfit: profit,
  warnings: [{ type: 'SURVIVAL_MODE', message: 'Low profit' }],
  taxYear: '2025-2026',
  region: 'rUK',
  maxPossibleSalary: Math.max(0, profit),
  message: 'Low profit',
});

describe('SurvivalMode', () => {
  describe('Zero/Negative profit', () => {
    it('should show "hasn\'t made profit" for negative profit', () => {
      render(<SurvivalMode result={createSurvivalResult(-5000)} />);
      expect(screen.getByText(/hasn't made profit yet/i)).toBeInTheDocument();
    });

    it('should show profit amount', () => {
      render(<SurvivalMode result={createSurvivalResult(-5000)} />);
      expect(screen.getByText(/-£5,000/)).toBeInTheDocument();
    });

    it("should mention Director's Loans", () => {
      render(<SurvivalMode result={createSurvivalResult(-5000)} />);
      expect(screen.getByText(/Director's Loans/i)).toBeInTheDocument();
    });

    it('should not show "take smaller salary" option', () => {
      render(<SurvivalMode result={createSurvivalResult(-5000)} />);
      expect(screen.queryByText(/Take a smaller salary/i)).not.toBeInTheDocument();
    });
  });

  describe('Low positive profit (modified survival)', () => {
    it('should show "hasn\'t made enough profit"', () => {
      render(<SurvivalMode result={createSurvivalResult(8000)} />);
      expect(screen.getByText(/hasn't made enough profit yet/i)).toBeInTheDocument();
    });

    it('should show max possible salary option', () => {
      render(<SurvivalMode result={createSurvivalResult(8000)} />);
      expect(screen.getByText(/Take a smaller salary.*£8,000/i)).toBeInTheDocument();
    });

    it('should show profit amount', () => {
      render(<SurvivalMode result={createSurvivalResult(8000)} />);
      expect(screen.getByText(/profit is ~£8,000/)).toBeInTheDocument();
    });
  });

  it('should show encouragement message', () => {
    render(<SurvivalMode result={createSurvivalResult(5000)} />);
    expect(screen.getByText(/normal in year 1/i)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <SurvivalMode result={createSurvivalResult(5000)} className='test-class' />
    );
    expect(container.firstChild).toHaveClass('test-class');
  });
});
