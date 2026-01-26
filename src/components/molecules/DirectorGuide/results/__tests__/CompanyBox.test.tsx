// src/components/molecules/DirectorGuide/results/__tests__/CompanyBox.test.tsx
import { render, screen } from '@testing-library/react';
import type { DirectorResult } from '@/lib/validation/directorValidation';
import { CompanyBox } from '../CompanyBox';

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

describe('CompanyBox', () => {
  it('should render the company tax pot', () => {
    render(<CompanyBox result={mockResult} />);
    expect(screen.getByText('£16,136')).toBeInTheDocument();
  });

  it('should render Corporation Tax breakdown', () => {
    render(<CompanyBox result={mockResult} />);
    expect(screen.getByText('Corporation Tax')).toBeInTheDocument();
    expect(screen.getByText('£15,000')).toBeInTheDocument();
  });

  it('should render Employer NI breakdown', () => {
    render(<CompanyBox result={mockResult} />);
    expect(screen.getByText('Employer NI')).toBeInTheDocument();
    expect(screen.getByText('£1,136/yr')).toBeInTheDocument();
  });

  it('should render company context text', () => {
    render(<CompanyBox result={mockResult} />);
    expect(screen.getByText(/company is separate from you/i)).toBeInTheDocument();
  });

  it('should render payment due reminder', () => {
    render(<CompanyBox result={mockResult} />);
    expect(screen.getByText(/9 months after your company year ends/i)).toBeInTheDocument();
  });

  describe('Edge cases', () => {
    it('should handle zero company tax pot', () => {
      const zeroResult = { ...mockResult, companyTaxPot: 0, corporationTax: 0, employerNI: 0 };
      render(<CompanyBox result={zeroResult} />);
      // Multiple £0 values will appear (tax pot, CT, NI)
      const zeroElements = screen.getAllByText('£0');
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large values', () => {
      const largeResult = {
        ...mockResult,
        companyTaxPot: 10000000,
        corporationTax: 9000000,
        employerNI: 1000000,
      };
      render(<CompanyBox result={largeResult} />);
      expect(screen.getByText('£10,000,000')).toBeInTheDocument();
    });

    it('should handle decimal rounding correctly', () => {
      const decimalResult = { ...mockResult, companyTaxPot: 16135.49 };
      render(<CompanyBox result={decimalResult} />);
      // Should round to nearest pound
      expect(screen.getByText('£16,135')).toBeInTheDocument();
    });
  });
});
