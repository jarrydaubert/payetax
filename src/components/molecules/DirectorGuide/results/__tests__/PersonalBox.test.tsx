// src/components/molecules/DirectorGuide/results/__tests__/PersonalBox.test.tsx
import { render, screen } from '@testing-library/react';
import { PersonalBox } from '../PersonalBox';
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
  averageMonthlyPay: 4905,
  companyTaxPot: 16135.5,
  personalTaxAnnual: 7500,
  personalTaxMonthly: 625,
  includesPOA: true,
  warnings: [],
  taxYear: '2025-2026',
  region: 'rUK',
};

describe('PersonalBox', () => {
  it('should render average monthly pay', () => {
    render(<PersonalBox result={mockResult} />);
    expect(screen.getByText('~£4,905')).toBeInTheDocument();
  });

  it('should render monthly salary', () => {
    render(<PersonalBox result={mockResult} />);
    expect(screen.getByText(/£1,048\/mo/)).toBeInTheDocument();
  });

  it('should render tax savings target', () => {
    render(<PersonalBox result={mockResult} />);
    expect(screen.getByText('£625/mo')).toBeInTheDocument();
  });

  it('should show POA notice when applicable', () => {
    render(<PersonalBox result={mockResult} />);
    expect(screen.getByText(/payment on account/i)).toBeInTheDocument();
  });

  it('should not show POA notice when not applicable', () => {
    const noPOAResult = { ...mockResult, includesPOA: false };
    render(<PersonalBox result={noPOAResult} />);
    expect(screen.queryByText(/payment on account/i)).not.toBeInTheDocument();
  });

  it('should render tax bill due date', () => {
    render(<PersonalBox result={mockResult} />);
    expect(screen.getByText(/due 31 Jan/i)).toBeInTheDocument();
  });
});
