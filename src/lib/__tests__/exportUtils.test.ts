// src/lib/__tests__/exportUtils.test.ts
import { exportToCSV, printResults } from '../exportUtils';
import type { TaxCalculationResults } from '../taxCalculator';

describe('exportUtils', () => {
  // Mock result data
  const mockResults: TaxCalculationResults = {
    grossSalary: {
      annually: 50000,
      monthly: 4166.67,
      fourWeekly: 3846.15,
      fortnightly: 1923.08,
      weekly: 961.54,
      daily: 192.31,
      hourly: 25.64,
    },
    taxFreeAmount: 12570,
    taxableIncome: 37430,
    incomeTax: {
      annually: 7486,
      monthly: 623.83,
      fourWeekly: 575.85,
      fortnightly: 287.92,
      weekly: 143.96,
      daily: 28.79,
      hourly: 3.84,
    },
    nationalInsurance: {
      annually: 4182.16,
      monthly: 348.51,
      fourWeekly: 321.71,
      fortnightly: 160.85,
      weekly: 80.43,
      daily: 16.09,
      hourly: 2.14,
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
      annually: 2500,
      monthly: 208.33,
      fourWeekly: 192.31,
      fortnightly: 96.15,
      weekly: 48.08,
      daily: 9.62,
      hourly: 1.28,
    },
    netPay: {
      annually: 35831.84,
      monthly: 2985.99,
      fourWeekly: 2756.29,
      fortnightly: 1378.15,
      weekly: 689.07,
      daily: 137.81,
      hourly: 18.38,
    },
    effectiveTaxRate: 14.97,
    takeHomePercentage: 71.66,
    taxBands: [{ name: 'Basic rate', rate: 20, threshold: 50270, amount: 7486 }],
    taxCode: '1257L',
    isScottish: false,
    pensionReliefAtSource: 0,
  };

  describe('exportToCSV', () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: { href: string; download: string; click: jest.Mock };
    let createObjectURLMock: jest.Mock;
    let revokeObjectURLMock: jest.Mock;

    beforeEach(() => {
      // Mock link element
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink as unknown as HTMLElement);

      // Mock URL methods
      createObjectURLMock = jest.fn().mockReturnValue('blob:mock-url');
      revokeObjectURLMock = jest.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      // Mock Blob
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options,
      })) as unknown as typeof Blob;
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('generates CSV with correct headers', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain(
        'Category,Yearly,Monthly,4-Weekly,Fortnightly,Weekly,Daily,Hourly'
      );
    });

    it('includes gross pay in CSV', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Gross Pay');
      expect(blobContent).toContain('£50,000.00');
    });

    it('includes tax-free allowance', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Tax-Free Allowance');
      expect(blobContent).toContain('£12,570.00');
    });

    it('includes taxable income', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Total Taxable');
      expect(blobContent).toContain('£37,430.00');
    });

    it('includes total tax with negative sign', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Total Tax Due');
      expect(blobContent).toContain('-£7,486.00');
    });

    it('includes tax bands breakdown', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('20% Rate');
      expect(blobContent).toContain('-£7,486.00');
    });

    it('includes National Insurance', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('National Insurance');
      expect(blobContent).toContain('-£4,182.16');
    });

    it('includes pension contribution when present', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Pension [You]');
      expect(blobContent).toContain('-£2,500.00');
    });

    it('skips pension contribution when zero', () => {
      const resultsNoPension = {
        ...mockResults,
        pensionContribution: {
          annually: 0,
          monthly: 0,
          fourWeekly: 0,
          fortnightly: 0,
          weekly: 0,
          daily: 0,
          hourly: 0,
        },
      };

      exportToCSV(resultsNoPension);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      const lines = blobContent.split('\n');
      const pensionLine = lines.find((line: string) => line.startsWith('Pension [You]'));
      expect(pensionLine).toBeUndefined();
    });

    it('includes student loan when present', () => {
      const resultsWithLoan = {
        ...mockResults,
        studentLoan: {
          annually: 1200,
          monthly: 100,
          fourWeekly: 92.31,
          fortnightly: 46.15,
          weekly: 23.08,
          daily: 4.62,
          hourly: 0.62,
        },
      };

      exportToCSV(resultsWithLoan);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Student Loan');
      expect(blobContent).toContain('-£1,200.00');
    });

    it('skips student loan when zero', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      const lines = blobContent.split('\n');
      const studentLoanLine = lines.find((line: string) => line.startsWith('Student Loan'));
      expect(studentLoanLine).toBeUndefined();
    });

    it('includes net pay', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('Net Pay');
      expect(blobContent).toContain('£35,831.84');
    });

    it('calculates all periods correctly', () => {
      exportToCSV(mockResults);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      const lines = blobContent.split('\n');
      const grossPayLine = lines.find((line: string) => line.startsWith('Gross Pay'));

      expect(grossPayLine).toContain('£50,000.00'); // Yearly
      expect(grossPayLine).toContain('£4,166.67'); // Monthly (50000/12)
      expect(grossPayLine).toContain('£3,846.15'); // 4-Weekly (50000/13)
      expect(grossPayLine).toContain('£1,923.08'); // Fortnightly (50000/26)
      expect(grossPayLine).toContain('£961.54'); // Weekly (50000/52)
    });

    it('creates blob with correct MIME type', () => {
      exportToCSV(mockResults);

      expect(global.Blob).toHaveBeenCalledWith(expect.any(Array), {
        type: 'text/csv;charset=utf-8;',
      });
    });

    it('creates download link with correct filename format', () => {
      const mockDate = '2024-01-15';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(`${mockDate}T12:00:00.000Z`);

      exportToCSV(mockResults);

      expect(mockLink.download).toBe(`tax-calculation-${mockDate}.csv`);
    });

    it('triggers download by clicking link', () => {
      exportToCSV(mockResults);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('revokes object URL after download', () => {
      exportToCSV(mockResults);

      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });

    it('returns true on success', () => {
      const result = exportToCSV(mockResults);

      expect(result).toBe(true);
    });

    it('handles multiple tax bands correctly', () => {
      const resultsMultipleBands = {
        ...mockResults,
        taxBands: [
          { name: 'Basic rate', rate: 20, threshold: 50270, amount: 5000 },
          { name: 'Higher rate', rate: 40, threshold: 125140, amount: 3000 },
        ],
      };

      exportToCSV(resultsMultipleBands);

      const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
      expect(blobContent).toContain('20% Rate');
      expect(blobContent).toContain('40% Rate');
      expect(blobContent).toContain('-£5,000.00');
      expect(blobContent).toContain('-£3,000.00');
    });
  });

  describe('printResults', () => {
    let mockIframe: {
      style: Partial<CSSStyleDeclaration>;
      contentWindow: {
        document: { write: jest.Mock; close: jest.Mock };
        focus: jest.Mock;
        print: jest.Mock;
      } | null;
      parentNode: Node | null;
    };
    let mockContentWindow: {
      document: { write: jest.Mock; close: jest.Mock };
      focus: jest.Mock;
      print: jest.Mock;
    };
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();

      mockContentWindow = {
        document: {
          write: jest.fn(),
          close: jest.fn(),
        },
        focus: jest.fn(),
        print: jest.fn(),
      };

      mockIframe = {
        style: {},
        contentWindow: mockContentWindow,
        parentNode: document.body,
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockIframe);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
    });

    afterEach(() => {
      jest.useRealTimers();
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('creates hidden iframe for printing', () => {
      printResults({ results: mockResults });

      expect(createElementSpy).toHaveBeenCalledWith('iframe');
      expect(mockIframe.style.position).toBe('absolute');
      expect(mockIframe.style.width).toBe('0px');
      expect(mockIframe.style.height).toBe('0px');
      expect(mockIframe.style.border).toBe('none');
    });

    it('appends iframe to document body', () => {
      printResults({ results: mockResults });

      expect(appendChildSpy).toHaveBeenCalledWith(mockIframe);
    });

    it('handles missing contentWindow gracefully', () => {
      mockIframe.contentWindow = null;

      expect(() => printResults({ results: mockResults })).not.toThrow();
      expect(removeChildSpy).toHaveBeenCalledWith(mockIframe);
    });

    it('generates HTML with correct title', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('<title>Tax Calculation - PayeTax</title>');
    });

    it('includes salary in header', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('£50,000.00');
    });

    it('includes only visible periods in table', () => {
      printResults({ results: mockResults, visiblePeriods: ['Yearly', 'Monthly'] });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Yearly');
      expect(htmlContent).toContain('Monthly');
      expect(htmlContent).not.toContain('Weekly');
    });

    it('uses default visible periods when not specified', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Yearly');
      expect(htmlContent).toContain('Monthly');
      expect(htmlContent).toContain('Weekly');
    });

    it('includes gross pay row', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Gross Pay');
    });

    it('includes net pay row', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Net Pay');
    });

    it('includes tax bands', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('20% Rate');
    });

    it('skips student loan when zero', () => {
      printResults({ results: mockResults, studentLoans: [] });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      // Student loan row should not be rendered (results in empty string)
      const studentLoanCount = (htmlContent.match(/Student Loan/g) || []).length;
      expect(studentLoanCount).toBe(0);
    });

    it('includes student loan when present', () => {
      const resultsWithLoan = {
        ...mockResults,
        studentLoan: {
          ...mockResults.studentLoan,
          annually: 1200,
        },
      };

      printResults({ results: resultsWithLoan, studentLoans: ['Plan1'] });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Student Loan');
    });

    it('skips pension when zero', () => {
      const resultsNoPension = {
        ...mockResults,
        pensionContribution: {
          ...mockResults.pensionContribution,
          annually: 0,
        },
      };

      printResults({ results: resultsNoPension });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      const pensionCount = (htmlContent.match(/Pension \[You\]/g) || []).length;
      expect(pensionCount).toBe(0);
    });

    it('includes pension when present', () => {
      printResults({ results: mockResults });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('Pension');
    });

    it('closes document after writing', () => {
      printResults({ results: mockResults });

      expect(mockContentWindow.document.close).toHaveBeenCalled();
    });

    it('focuses print window', () => {
      printResults({ results: mockResults });

      expect(mockContentWindow.focus).toHaveBeenCalled();
    });

    it('triggers print after delay', () => {
      printResults({ results: mockResults });

      jest.advanceTimersByTime(250);

      expect(mockContentWindow.print).toHaveBeenCalled();
    });

    it('removes iframe after printing completes', () => {
      printResults({ results: mockResults });

      jest.advanceTimersByTime(250); // Print delay
      jest.advanceTimersByTime(1000); // Removal delay

      expect(removeChildSpy).toHaveBeenCalledWith(mockIframe);
    });

    it('does not remove iframe if already removed', () => {
      mockIframe.parentNode = null;

      printResults({ results: mockResults });

      jest.advanceTimersByTime(1250);

      expect(removeChildSpy).not.toHaveBeenCalled();
    });

    it('formats currency values correctly', () => {
      printResults({ results: mockResults, visiblePeriods: ['Yearly'] });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      expect(htmlContent).toContain('£50,000.00');
      expect(htmlContent).toContain('£35,831.84');
    });

    it('calculates period values correctly', () => {
      printResults({ results: mockResults, visiblePeriods: ['Monthly', 'Weekly'] });

      const htmlContent = mockContentWindow.document.write.mock.calls[0][0];
      // Monthly: 50000/12 = 4166.67
      expect(htmlContent).toContain('£4,166.67');
      // Weekly: 50000/52 = 961.54
      expect(htmlContent).toContain('£961.54');
    });
  });
});
