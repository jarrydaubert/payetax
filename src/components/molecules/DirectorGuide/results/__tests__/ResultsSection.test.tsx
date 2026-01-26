// src/components/molecules/DirectorGuide/results/__tests__/ResultsSection.test.tsx
import { render, screen } from '@testing-library/react';
import type {
  DirectorInput,
  DirectorResult,
  SurvivalResult,
} from '@/lib/validation/directorValidation';
import { ResultsSection } from '../ResultsSection';

const mockInput: DirectorInput = {
  region: 'rUK',
  revenue: 100000,
  includesVat: false,
  expenses: 20000,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
  confirmedSoleIncome: true,
};

const mockNormalResult: DirectorResult = {
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

const mockSurvivalResult: SurvivalResult = {
  mode: 'survival',
  grossRevenue: 10000,
  netRevenue: 10000,
  expenses: 15000,
  grossProfit: -5000,
  warnings: [{ type: 'SURVIVAL_MODE', message: 'No profit' }],
  taxYear: '2025-2026',
  region: 'rUK',
  maxPossibleSalary: 0,
  message: 'No profit available',
};

describe('ResultsSection', () => {
  describe('Normal mode', () => {
    it('should render the results heading', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByText("Here's what we worked out")).toBeInTheDocument();
    });

    it('should render profit summary', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByText(/£80,000 profit/)).toBeInTheDocument();
    });

    it('should render Company and Personal boxes', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByText('Your Company')).toBeInTheDocument();
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('should render How To Do It section', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByText('How to Actually Do This')).toBeInTheDocument();
    });

    it('should render disclaimer', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByText(/rough estimate, not advice/i)).toBeInTheDocument();
    });

    it('should render copy button', () => {
      render(<ResultsSection result={mockNormalResult} input={mockInput} />);
      expect(screen.getByRole('button', { name: /copy results/i })).toBeInTheDocument();
    });

    it('should show Scottish note for Scottish residents', () => {
      const scottishResult = { ...mockNormalResult, region: 'scotland' as const };
      const scottishInput = { ...mockInput, region: 'scotland' as const };
      render(<ResultsSection result={scottishResult} input={scottishInput} />);
      expect(screen.getByText(/Scottish resident/i)).toBeInTheDocument();
    });
  });

  describe('Survival mode', () => {
    it('should render survival mode message', () => {
      render(<ResultsSection result={mockSurvivalResult} input={mockInput} />);
      expect(screen.getByText(/hasn't made enough profit/i)).toBeInTheDocument();
    });

    it('should show profit amount', () => {
      render(<ResultsSection result={mockSurvivalResult} input={mockInput} />);
      expect(screen.getByText(/-£5,000/)).toBeInTheDocument();
    });

    it('should show options list', () => {
      render(<ResultsSection result={mockSurvivalResult} input={mockInput} />);
      expect(screen.getByText(/Wait until you have more profit/i)).toBeInTheDocument();
    });
  });
});
