// src/components/molecules/DirectorGuide/results/__tests__/HowToDoIt.test.tsx
import { render, screen } from '@testing-library/react';
import { HowToDoIt } from '../HowToDoIt';
import type { DirectorResult } from '@/lib/validation/directorValidation';

const mockResult: DirectorResult = {
  mode: 'normal',
  grossRevenue: 100000,
  netRevenue: 100000,
  expenses: 20000,
  grossProfit: 80000,
  salary: 12570,
  monthlySalary: 1047.5,
  employerNI: 1135.5,
  taxableProfit: 66294.5,
  corporationTax: 15000,
  dividendsAvailable: 51294.5,
  dividendTax: 5000,
  annualTakeHome: 58864.5,
  remainingTakeHome: 58864.5,
  averageMonthlyPay: 4905.38,
  companyTaxPot: 16135.5,
  personalTaxAnnual: 7500,
  personalTaxMonthly: 625,
  includesPOA: true,
  warnings: [],
  taxYear: '2025-2026',
  region: 'rUK',
};

describe('HowToDoIt', () => {
  it('should render the title', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText('How to Actually Do This')).toBeInTheDocument();
  });

  it('should render all 4 steps', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should show payroll setup step', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText(/Set up payroll/i)).toBeInTheDocument();
  });

  it('should show monthly salary amount', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText(/£1,048\/month as salary/i)).toBeInTheDocument();
  });

  it('should show dividends step', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText(/Take dividends occasionally/i)).toBeInTheDocument();
  });

  it('should show tax savings amount', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText(/£625\/mo to a savings account/i)).toBeInTheDocument();
  });

  it('should explain why £12,570 salary', () => {
    render(<HowToDoIt result={mockResult} />);
    expect(screen.getByText(/£12,570\/year to stay tax-efficient/i)).toBeInTheDocument();
  });
});
