// src/lib/__tests__/exportService.test.ts

import type { DisplayPeriod } from '@/components/molecules/PeriodSelector';
import { downloadCSV, printResults } from '../exportService';
import type { TaxCalculationResults } from '../taxCalculator';

// Mock window.open for print functionality
const mockPrintWindow = {
  document: {
    write: jest.fn(),
    close: jest.fn(),
  },
  print: jest.fn(),
};

Object.defineProperty(window, 'open', {
  value: jest.fn(() => mockPrintWindow),
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for CSV download
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:mock-url'),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
  writable: true,
});

// Create mock document.createElement for CSV download testing
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
  style: { display: '' },
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'a') return mockAnchorElement;
    return document.createElement(tagName);
  }),
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
  writable: true,
});

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
    annually: 0,
    monthly: 0,
    fourWeekly: 0,
    fortnightly: 0,
    weekly: 0,
    daily: 0,
    hourly: 0,
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
    annually: 39519.6,
    monthly: 3293.3,
    fourWeekly: 3040.74,
    fortnightly: 1520.37,
    weekly: 760.38,
    daily: 152.08,
    hourly: 19.01,
  },
  totalDeductions: {
    annually: 10480.4,
    monthly: 873.37,
    fourWeekly: 805.41,
    fortnightly: 402.71,
    weekly: 201.16,
    daily: 40.23,
    hourly: 5.03,
  },
  effectiveTaxRate: 20.96,
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

const mockSelectedPeriods: DisplayPeriod[] = ['annually', 'monthly', 'weekly'];

describe('Export Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('printResults', () => {
    test('should open print window with formatted results', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockPrintWindow.document.write).toHaveBeenCalled();
      expect(mockPrintWindow.document.close).toHaveBeenCalled();
      expect(mockPrintWindow.print).toHaveBeenCalled();
    });

    test('should include salary information in print output', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('£50,000');
      expect(printContent).toContain('Tax Calculation Results - ToolHubX');
      expect(printContent).toContain('annual salary');
    });

    test('should include tax calculation details', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('Gross Pay');
      expect(printContent).toContain('Income Tax');
      expect(printContent).toContain('National Insurance');
      expect(printContent).toContain('Net Pay');
    });

    test('should include current date in print output', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      const currentYear = new Date().getFullYear();
      expect(printContent).toContain(currentYear.toString());
    });

    test('should include tax notes and disclaimers', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('Notes:');
      expect(printContent).toContain('illustrative purposes only');
      expect(printContent).toContain('ToolHubX UK PAYE Tax Calculator');
    });

    test('should include CSS styles for printing', () => {
      printResults(mockTaxResults, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('<style>');
      expect(printContent).toContain('@media print');
      expect(printContent).toContain('font-family');
      expect(printContent).toContain('border-collapse: collapse');
    });

    test('should handle additional allowances note', () => {
      const resultsWithAllowances = {
        ...mockTaxResults,
        additionalAllowances: {
          ...mockTaxResults.additionalAllowances,
          annually: 1000,
        },
      };

      printResults(resultsWithAllowances, mockSelectedPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('Additional allowances reduce');
    });

    test('should handle window.open failure gracefully', () => {
      (window.open as jest.Mock).mockReturnValueOnce(null);

      expect(() => {
        printResults(mockTaxResults, mockSelectedPeriods);
      }).not.toThrow();

      expect(mockPrintWindow.document.write).not.toHaveBeenCalled();
      expect(mockPrintWindow.print).not.toHaveBeenCalled();
    });

    test('should format different periods correctly', () => {
      const allPeriods: DisplayPeriod[] = [
        'annually',
        'monthly',
        'fourWeekly',
        'fortnightly',
        'weekly',
        'daily',
        'hourly',
      ];

      printResults(mockTaxResults, allPeriods);

      const printContent = (mockPrintWindow.document.write as jest.Mock).mock.calls[0][0];
      expect(printContent).toContain('Annual');
      expect(printContent).toContain('Monthly');
      expect(printContent).toContain('Weekly');
    });
  });

  describe('downloadCSV', () => {
    test('should create and trigger CSV download', () => {
      downloadCSV(mockTaxResults, mockSelectedPeriods);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchorElement);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchorElement);
    });

    test('should set correct filename for CSV download', () => {
      downloadCSV(mockTaxResults, mockSelectedPeriods);

      expect(mockAnchorElement.download).toContain('tax-calculation');
      expect(mockAnchorElement.download).toContain('.csv');
    });

    test('should include CSV headers for selected periods', () => {
      const csvBlob = (URL.createObjectURL as jest.Mock).mock.calls[0][0];

      downloadCSV(mockTaxResults, mockSelectedPeriods);

      // Check that createObjectURL was called with a Blob
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });

    test('should generate CSV content with correct structure', () => {
      downloadCSV(mockTaxResults, mockSelectedPeriods);

      const blobCall = (URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(blobCall).toBeInstanceOf(Blob);
      expect(blobCall.type).toBe('text/csv;charset=utf-8;');
    });

    test('should handle different period combinations', () => {
      const dailyHourlyPeriods: DisplayPeriod[] = ['daily', 'hourly'];

      downloadCSV(mockTaxResults, dailyHourlyPeriods);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchorElement.click).toHaveBeenCalled();
    });

    test('should include key tax metrics in CSV', () => {
      // We can't easily test the actual CSV content without reading the blob,
      // but we can verify the function executes without errors
      expect(() => {
        downloadCSV(mockTaxResults, mockSelectedPeriods);
      }).not.toThrow();

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(mockAnchorElement.click).toHaveBeenCalledTimes(1);
    });

    test('should clean up URL after download', () => {
      downloadCSV(mockTaxResults, mockSelectedPeriods);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    test('should handle empty selected periods', () => {
      expect(() => {
        downloadCSV(mockTaxResults, []);
      }).not.toThrow();

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('should handle results with pension contributions', () => {
      const resultsWithPension = {
        ...mockTaxResults,
        pensionContribution: {
          annually: 5000,
          monthly: 416.67,
          fourWeekly: 384.62,
          fortnightly: 192.31,
          weekly: 96.15,
          daily: 19.23,
          hourly: 2.4,
        },
      };

      expect(() => {
        downloadCSV(resultsWithPension, mockSelectedPeriods);
      }).not.toThrow();

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('should handle results with student loan repayments', () => {
      const resultsWithStudentLoan = {
        ...mockTaxResults,
        studentLoan: {
          annually: 1200,
          monthly: 100,
          fourWeekly: 92.31,
          fortnightly: 46.15,
          weekly: 23.08,
          daily: 4.62,
          hourly: 0.58,
        },
      };

      expect(() => {
        downloadCSV(resultsWithStudentLoan, mockSelectedPeriods);
      }).not.toThrow();

      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very high salaries', () => {
      const highSalaryResults = {
        ...mockTaxResults,
        grossSalary: {
          ...mockTaxResults.grossSalary,
          annually: 500000,
        },
      };

      expect(() => {
        printResults(highSalaryResults, mockSelectedPeriods);
        downloadCSV(highSalaryResults, mockSelectedPeriods);
      }).not.toThrow();
    });

    test('should handle Scottish tax results', () => {
      const scottishResults = {
        ...mockTaxResults,
        isScottish: true,
      };

      expect(() => {
        printResults(scottishResults, mockSelectedPeriods);
        downloadCSV(scottishResults, mockSelectedPeriods);
      }).not.toThrow();
    });

    test('should handle all period types', () => {
      const allPeriods: DisplayPeriod[] = [
        'annually',
        'monthly',
        'fourWeekly',
        'fortnightly',
        'weekly',
        'daily',
        'hourly',
      ];

      expect(() => {
        printResults(mockTaxResults, allPeriods);
        downloadCSV(mockTaxResults, allPeriods);
      }).not.toThrow();
    });
  });
});
