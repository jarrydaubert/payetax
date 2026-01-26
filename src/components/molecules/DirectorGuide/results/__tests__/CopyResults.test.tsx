// src/components/molecules/DirectorGuide/results/__tests__/CopyResults.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { DirectorInput, DirectorResult } from '@/lib/validation/directorValidation';
import { CopyResults } from '../CopyResults';

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

const mockInput: DirectorInput = {
  region: 'rUK',
  revenue: 100000,
  includesVat: false,
  expenses: 20000,
  alreadyTaken: 0,
  alreadyTakenViaPayroll: null,
  confirmedSoleIncome: true,
};

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe('CopyResults', () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  it('should render copy button', () => {
    render(<CopyResults result={mockResult} input={mockInput} />);
    expect(screen.getByRole('button', { name: /copy results/i })).toBeInTheDocument();
  });

  it('should copy text to clipboard when clicked', async () => {
    render(<CopyResults result={mockResult} input={mockInput} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });
  });

  it('should show "Copied!" after clicking', async () => {
    render(<CopyResults result={mockResult} input={mockInput} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should include key data in copied text', async () => {
    render(<CopyResults result={mockResult} input={mockInput} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain('PayeTax');
      expect(copiedText).toContain('2025-2026');
      expect(copiedText).toContain('£100,000');
      expect(copiedText).toContain('£80,000');
      expect(copiedText).toContain('rough estimate');
    });
  });

  it('should include VAT note when VAT included', async () => {
    const vatInput = { ...mockInput, includesVat: true };
    render(<CopyResults result={mockResult} input={vatInput} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain('before VAT');
    });
  });

  it('should show Scotland in copied text for Scottish users', async () => {
    const scottishInput = { ...mockInput, region: 'scotland' as const };
    const scottishResult = { ...mockResult, region: 'scotland' as const };
    render(<CopyResults result={scottishResult} input={scottishInput} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const copiedText = mockWriteText.mock.calls[0][0];
      expect(copiedText).toContain('Scotland');
    });
  });
});
