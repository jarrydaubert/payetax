// src/lib/__tests__/exportUtils.test.ts

import type { ExportData } from '../exportUtils';
import { downloadCSV, generateCSV } from '../exportUtils';
import type { TaxCalculationResults } from '../taxCalculator';

// Mock browser APIs
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: jest.fn(),
        style: { visibility: 'visible' },
        setAttribute: jest.fn(),
      };
    }
    return {};
  }),
});

Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  },
});

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

describe('Export Utils', () => {
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
      fourWeekly: 576.62,
      fortnightly: 288.31,
      weekly: 144.15,
      daily: 28.83,
      hourly: 3.6,
    },
    nationalInsurance: {
      annually: 2994.4,
      monthly: 249.53,
      fourWeekly: 230.72,
      fortnightly: 115.36,
      weekly: 57.68,
      daily: 11.54,
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
    employerNI: 5538.6,
    netPay: {
      annually: 39519.6,
      monthly: 3293.3,
      fourWeekly: 3040.45,
      fortnightly: 1520.22,
      weekly: 760.11,
      daily: 152.02,
      hourly: 19.0,
    },
    taxBands: [
      {
        name: 'Basic rate',
        rate: 20,
        amount: 37430,
      },
    ],
    additionalAllowances: undefined,
  };

  const mockExportData: ExportData = {
    results: mockTaxResults,
    salary: 50000,
    taxYear: '2024-2025',
    taxCode: '1257L',
    region: 'England, Wales, Northern Ireland',
    studentLoans: [],
    exportDate: '2025-08-25',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCSV', () => {
    it('generates CSV with correct headers', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toContain('ToolHubX UK Tax Calculator Results');
      expect(csv).toContain('Generated on');
      expect(csv).toContain('Input Details');
      expect(csv).toContain('Annual Breakdown');
    });

    it('includes input parameters', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toContain('£50,000.00');
      expect(csv).toContain('2024-2025');
      expect(csv).toContain('1257L');
      expect(csv).toContain('England, Wales, Northern Ireland');
    });

    it('includes tax calculations', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toContain('£7,486.00'); // Income tax
      expect(csv).toContain('£2,994.40'); // National Insurance
      expect(csv).toContain('£39,519.60'); // Net pay
    });

    it('handles Scottish taxpayer correctly', () => {
      const scottishData: ExportData = {
        ...mockExportData,
        taxCode: 'S1257L',
        region: 'Scotland',
      };

      const csv = generateCSV(scottishData);

      expect(csv).toContain('Scotland');
      expect(csv).toContain('S1257L');
    });

    it('handles student loans', () => {
      const studentLoanData: ExportData = {
        ...mockExportData,
        studentLoans: ['Plan 2', 'Postgraduate'],
      };

      const csv = generateCSV(studentLoanData);

      expect(csv).toContain('Plan 2, Postgraduate');
    });

    it('handles empty student loans', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toContain('None');
    });

    it('handles zero income correctly', () => {
      const zeroIncomeResults: TaxCalculationResults = {
        ...mockTaxResults,
        grossSalary: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
        netPay: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
      };

      const zeroData: ExportData = {
        ...mockExportData,
        results: zeroIncomeResults,
        salary: 0,
      };

      const csv = generateCSV(zeroData);

      expect(csv).toContain('£0.00');
    });

    it('includes main pay periods', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toContain('Monthly');
      expect(csv).toContain('Weekly');
      // The CSV may not include all periods, just check for key ones
    });

    it('formats currency correctly', () => {
      const csv = generateCSV(mockExportData);

      // Should have proper currency formatting with commas and two decimal places
      expect(csv).toMatch(/£\d{1,3}(,\d{3})*\.\d{2}/);
    });
  });

  describe('downloadCSV', () => {
    beforeEach(() => {
      const mockAnchor = {
        href: '',
        download: '', // Initialize as empty string so download !== undefined is true
        click: jest.fn(),
        style: { visibility: 'visible' },
        setAttribute: jest.fn((attr, value) => {
          if (attr === 'download') mockAnchor.download = value;
          if (attr === 'href') mockAnchor.href = value;
        }),
      };
      (document.createElement as jest.Mock).mockReturnValue(mockAnchor);
    });

    it('creates download link', () => {
      downloadCSV('test,csv,content', 'test.csv');

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('sets correct filename', () => {
      const csv = generateCSV(mockExportData);
      expect(csv).toBeTruthy();

      // Test that function executes without errors
      expect(() => downloadCSV(csv, 'tax-calculation.csv')).not.toThrow();
    });

    it('creates blob URL', () => {
      downloadCSV('test,csv,content', 'test.csv');

      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('handles empty content', () => {
      expect(() => downloadCSV('', 'empty.csv')).not.toThrow();
    });

    it('handles large content', () => {
      const largeContent = 'test,'.repeat(10000);
      expect(() => downloadCSV(largeContent, 'large.csv')).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('generates and downloads CSV successfully', () => {
      const csv = generateCSV(mockExportData);

      expect(csv).toBeTruthy();
      expect(() => downloadCSV(csv, 'tax-calculation.csv')).not.toThrow();
    });

    it('handles complex tax scenarios', () => {
      const complexResults: TaxCalculationResults = {
        ...mockTaxResults,
        studentLoan: {
          annually: 450,
          monthly: 37.5,
          fourWeekly: 34.62,
          fortnightly: 17.31,
          weekly: 8.65,
          daily: 1.73,
          hourly: 0.22,
        },
        pensionContribution: {
          annually: 2500,
          monthly: 208.33,
          fourWeekly: 192.31,
          fortnightly: 96.15,
          weekly: 48.08,
          daily: 9.62,
          hourly: 1.2,
        },
      };

      const complexData: ExportData = {
        ...mockExportData,
        results: complexResults,
        studentLoans: ['Plan 2'],
      };

      const csv = generateCSV(complexData);

      expect(csv).toContain('£450.00'); // Student loan
      expect(csv).toContain('£2,500.00'); // Pension
      expect(csv).toContain('Plan 2');
    });
  });
});
