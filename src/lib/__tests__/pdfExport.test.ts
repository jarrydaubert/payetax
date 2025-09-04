// src/lib/__tests__/pdfExport.test.ts

import { type ExportData, generatePDF } from '../pdfExport';
import type { TaxCalculationResults } from '../taxCalculator';

// Mock jsPDF
const mockJsPDFInstance = {
  setFillColor: jest.fn(),
  rect: jest.fn(),
  setTextColor: jest.fn(),
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  text: jest.fn(),
  line: jest.fn(),
  save: jest.fn(),
};

const mockJsPDF = jest.fn(() => mockJsPDFInstance);

// Mock the dynamic import of jsPDF
jest.mock(
  'jspdf',
  () => ({
    jsPDF: mockJsPDF,
  }),
  { virtual: true }
);

// Mock formatCurrency
jest.mock('../utils', () => ({
  formatCurrency: jest.fn(
    (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
  ),
}));

// Mock console.error
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Sample tax calculation results for testing
const mockTaxResults: TaxCalculationResults = {
  grossSalary: {
    annually: 50000,
    monthly: 4166.67,
    fourWeekly: 3846.15,
    fortnightly: 1923.08,
    weekly: 961.54,
    daily: 192.31,
    hourly: 24.04,
  },
  taxFreeAmount: 12570,
  taxableIncome: 37430,
  incomeTax: {
    annually: 7486,
    monthly: 623.83,
    fourWeekly: 575.08,
    fortnightly: 287.54,
    weekly: 143.77,
    daily: 28.75,
    hourly: 3.59,
  },
  nationalInsurance: {
    annually: 2994.4,
    monthly: 249.53,
    fourWeekly: 229.95,
    fortnightly: 114.98,
    weekly: 57.49,
    daily: 11.5,
    hourly: 1.44,
  },
  studentLoan: {
    annually: 1200,
    monthly: 100,
    fourWeekly: 92.31,
    fortnightly: 46.15,
    weekly: 23.08,
    daily: 4.62,
    hourly: 0.58,
  },
  pensionContribution: {
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
  },
  netPay: {
    annually: 39319.6,
    monthly: 3276.63,
    fourWeekly: 3024.59,
    fortnightly: 1512.3,
    weekly: 756.15,
    daily: 151.23,
    hourly: 18.9,
  },
  effectiveTaxRate: 21.36,
  marginalTaxRate: 32,
  taxYear: '2024-2025',
  taxCode: '1257L',
  isScottish: false,
  workingHoursPerWeek: 40,
  employerNI: 3500,
  taxBands: [{ name: 'Basic rate', rate: 20, amount: 7486 }],
  additionalAllowances: {
    annually: 0,
    breakdown: [],
  },
};

const mockExportData: ExportData = {
  results: mockTaxResults,
  salary: 50000,
  taxYear: '2024-2025',
  taxCode: '1257L',
  region: 'England & Wales',
  studentLoans: ['Plan 2'],
  exportDate: '3 September 2025',
};

describe('PDF Export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  describe('generatePDF', () => {
    test('should create PDF with correct configuration', async () => {
      await generatePDF(mockExportData);

      expect(mockJsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
    });

    test('should set up header with branding', async () => {
      await generatePDF(mockExportData);

      // Check header setup
      expect(mockJsPDFInstance.setFillColor).toHaveBeenCalledWith(99, 102, 241);
      expect(mockJsPDFInstance.rect).toHaveBeenCalledWith(0, 0, 297, 25, 'F');

      // Check header text
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(255, 255, 255);
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('ToolHubX', 20, 15);
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('UK Tax Calculator Results', 20, 21);
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Generated on 3 September 2025', 220, 21);
    });

    test('should include personal information section', async () => {
      await generatePDF(mockExportData);

      // Check personal info calls
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Personal Information', 20, 40);
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Annual Salary:', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('£50,000.00', 80, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Tax Code:', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('1257L', 80, expect.any(Number));
    });

    test('should include salary breakdown table', async () => {
      await generatePDF(mockExportData);

      // Check that salary breakdown elements are called
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Salary Breakdown',
        20,
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Gross Pay:',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Income Tax:',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'National Insurance:',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Net Pay:',
        expect.any(Number),
        expect.any(Number)
      );
    });

    test('should include period breakdown if required', async () => {
      await generatePDF(mockExportData);

      // Check various periods are included
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Annual',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Monthly',
        expect.any(Number),
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Weekly',
        expect.any(Number),
        expect.any(Number)
      );
    });

    test('should include student loan information when applicable', async () => {
      const dataWithStudentLoan = {
        ...mockExportData,
        studentLoans: ['Plan 2', 'Postgraduate'],
      };

      await generatePDF(dataWithStudentLoan);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Student Loans:', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Plan 2, Postgraduate',
        80,
        expect.any(Number)
      );
    });

    test('should handle empty student loans array', async () => {
      const dataWithoutStudentLoan = {
        ...mockExportData,
        studentLoans: [],
      };

      await generatePDF(dataWithoutStudentLoan);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Student Loans:', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('None', 80, expect.any(Number));
    });

    test('should include tax rate calculations', async () => {
      await generatePDF(mockExportData);

      // Check tax rate section
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Tax Rates', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Effective Tax Rate:',
        20,
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Income Tax Rate:',
        20,
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'National Insurance Rate:',
        20,
        expect.any(Number)
      );
    });

    test('should calculate effective tax rates correctly', async () => {
      await generatePDF(mockExportData);

      // Calculate expected rates
      const totalTaxAndNI =
        mockTaxResults.incomeTax.annually + mockTaxResults.nationalInsurance.annually;
      const expectedEffectiveRate = (
        (totalTaxAndNI / mockTaxResults.grossSalary.annually) *
        100
      ).toFixed(1);
      const expectedIncomeTaxRate = (
        (mockTaxResults.incomeTax.annually / mockTaxResults.grossSalary.annually) *
        100
      ).toFixed(1);
      const expectedNIRate = (
        (mockTaxResults.nationalInsurance.annually / mockTaxResults.grossSalary.annually) *
        100
      ).toFixed(1);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        `${expectedEffectiveRate}%`,
        80,
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        `${expectedIncomeTaxRate}%`,
        80,
        expect.any(Number)
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        `${expectedNIRate}%`,
        80,
        expect.any(Number)
      );
    });

    test('should include footer information', async () => {
      await generatePDF(mockExportData);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Generated by ToolHubX UK Tax Calculator - https://toolhubx.uk',
        20,
        190
      );
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Results calculated using official HMRC rates for 2024-2025',
        20,
        195
      );
    });

    test('should save PDF with correct filename format', async () => {
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1641024000000); // Fixed timestamp

      await generatePDF(mockExportData);

      expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
        'tax-calculation-2024-2025-1641024000000.pdf'
      );

      Date.now = originalDateNow;
    });

    test('should handle different tax years in filename', async () => {
      const data2023 = { ...mockExportData, taxYear: '2023/2024' };

      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1641024000000);

      await generatePDF(data2023);

      expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
        'tax-calculation-2023-2024-1641024000000.pdf'
      );

      Date.now = originalDateNow;
    });

    test('should handle Scottish region', async () => {
      const scottishData = {
        ...mockExportData,
        region: 'Scotland',
        results: { ...mockTaxResults, isScottish: true },
      };

      await generatePDF(scottishData);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Region:', 20, expect.any(Number));
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('Scotland', 80, expect.any(Number));
    });

    test('should use correct color scheme', async () => {
      await generatePDF(mockExportData);

      // Check primary colors are used
      expect(mockJsPDFInstance.setFillColor).toHaveBeenCalledWith(99, 102, 241); // Purple
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(255, 255, 255); // White
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(51, 51, 51); // Dark gray
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalledWith(156, 163, 175); // Light gray
    });

    test('should set up proper typography', async () => {
      await generatePDF(mockExportData);

      // Check font configurations
      expect(mockJsPDFInstance.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockJsPDFInstance.setFont).toHaveBeenCalledWith('helvetica', 'normal');
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(20); // Main title
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(14); // Subtitle
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(12); // Section headers
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(10); // Body text
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalledWith(8); // Footer
    });

    test('should handle high salary amounts correctly', async () => {
      const highSalaryData = {
        ...mockExportData,
        salary: 500000,
        results: {
          ...mockTaxResults,
          grossSalary: { ...mockTaxResults.grossSalary, annually: 500000 },
        },
      };

      await generatePDF(highSalaryData);

      expect(mockJsPDFInstance.text).toHaveBeenCalledWith('£500,000.00', 80, expect.any(Number));
    });

    test('should handle pension contributions when present', async () => {
      const dataWithPension = {
        ...mockExportData,
        results: {
          ...mockTaxResults,
          pensionContribution: {
            ...mockTaxResults.pensionContribution,
            annually: 5000,
          },
        },
      };

      await generatePDF(dataWithPension);

      // Should include pension in calculations
      expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
        'Pension Contribution:',
        expect.any(Number),
        expect.any(Number)
      );
    });

    test('should handle jsPDF import failure', async () => {
      // Mock import to throw error
      const _mockImport = jest.fn().mockRejectedValue(new Error('Failed to import jsPDF'));
      jest.doMock('jspdf', () => {
        throw new Error('Import failed');
      });

      await expect(generatePDF(mockExportData)).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('PDF generation failed:', expect.any(Error));
    });

    test('should handle PDF generation errors gracefully', async () => {
      mockJsPDFInstance.save.mockImplementationOnce(() => {
        throw new Error('Save failed');
      });

      await expect(generatePDF(mockExportData)).rejects.toThrow('Save failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('PDF generation failed:', expect.any(Error));
    });

    test('should handle all PDF drawing operations', async () => {
      await generatePDF(mockExportData);

      // Verify all major drawing operations were called
      expect(mockJsPDFInstance.setFillColor).toHaveBeenCalled();
      expect(mockJsPDFInstance.rect).toHaveBeenCalled();
      expect(mockJsPDFInstance.setTextColor).toHaveBeenCalled();
      expect(mockJsPDFInstance.setFontSize).toHaveBeenCalled();
      expect(mockJsPDFInstance.setFont).toHaveBeenCalled();
      expect(mockJsPDFInstance.text).toHaveBeenCalled();
      expect(mockJsPDFInstance.line).toHaveBeenCalled();
      expect(mockJsPDFInstance.save).toHaveBeenCalled();
    });

    test('should handle various period calculations', async () => {
      await generatePDF(mockExportData);

      // Check that different periods are properly formatted
      const textCalls = mockJsPDFInstance.text.mock.calls.map((call) => call[0]);

      expect(textCalls).toContain('Annual');
      expect(textCalls).toContain('Monthly');
      expect(textCalls).toContain('Weekly');
      expect(textCalls).toContain('Daily');
    });
  });
});
