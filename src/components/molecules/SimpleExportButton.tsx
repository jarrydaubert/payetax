// src/components/molecules/SimpleExportButton.tsx
'use client';

import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

interface SimpleExportButtonProps {
  result: TaxCalculationResults | null;
  visiblePeriods: string[];
  periodOptions: Record<string, number>;
  taxYear: string;
  allowancesDeductions?: string;
  studentLoans?: string[];
  className?: string;
}

const SimpleExportButton: React.FC<SimpleExportButtonProps> = ({
  result,
  visiblePeriods,
  periodOptions,
  taxYear,
  allowancesDeductions = '0',
  studentLoans = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!result) return null;

  // 📊 EXCEL EXPORT (Professional with landscape orientation)
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.default.Workbook();
      const worksheet = workbook.addWorksheet('Payslip Summary');

      // 📐 LANDSCAPE ORIENTATION & PROFESSIONAL SETUP
      worksheet.pageSetup.orientation = 'landscape';
      worksheet.pageSetup.fitToPage = true;
      worksheet.pageSetup.fitToWidth = 1;
      worksheet.pageSetup.margins = {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      };

      // Dynamic columns based on visible periods
      const columns = [
        { header: 'Category', key: 'category', width: 30 },
        { header: '%', key: 'percent', width: 12 },
        ...visiblePeriods.map((period) => ({
          header: `${period} (£)`,
          key: period.toLowerCase().replace(/[^a-z0-9]/g, ''),
          width: 18,
        })),
      ];
      worksheet.columns = columns;

      // 🎨 PROFESSIONAL HEADER STYLING
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1f2937' }, // Dark gray like our UI
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;

      // Data rows
      const rowData = [
        [
          'Gross Pay',
          '100%',
          ...visiblePeriods.map((period) => result.grossSalary.annually / periodOptions[period]),
        ],
        [
          'Tax-Free Allowance',
          `${((result.taxFreeAmount / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => result.taxFreeAmount / periodOptions[period]),
        ],
        [
          'Total Taxable',
          `${((result.taxableIncome / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => result.taxableIncome / periodOptions[period]),
        ],
        [
          'Total Tax Due',
          `${((result.incomeTax.annually / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => result.incomeTax.annually / periodOptions[period]),
        ],
        // Tax breakdown bands
        ...result.taxBands.map((band) => [
          `${band.rate}% Rate`,
          `${((band.amount / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => band.amount / periodOptions[period]),
        ]),
        // Student loans if applicable
        ...(studentLoans.length > 0
          ? [
              [
                `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
                `${((result.studentLoan.annually / result.grossSalary.annually) * 100).toFixed(1)}%`,
                ...visiblePeriods.map(
                  (period) => result.studentLoan.annually / periodOptions[period]
                ),
              ],
            ]
          : []),
        [
          'National Insurance',
          `${((result.nationalInsurance.annually / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map(
            (period) => result.nationalInsurance.annually / periodOptions[period]
          ),
        ],
        [
          'Pension [You]',
          `${((result.pensionContribution.annually / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map(
            (period) => result.pensionContribution.annually / periodOptions[period]
          ),
        ],
        [
          'Allowances/Deductions',
          `${((parseFloat(allowancesDeductions.replace(/,/g, '')) / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map(
            (period) => parseFloat(allowancesDeductions.replace(/,/g, '')) / periodOptions[period]
          ),
        ],
        [
          'Net Pay',
          `${((result.netPay.annually / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => result.netPay.annually / periodOptions[period]),
        ],
        [
          'Employers NI',
          `${((result.employerNI / result.grossSalary.annually) * 100).toFixed(1)}%`,
          ...visiblePeriods.map((period) => result.employerNI / periodOptions[period]),
        ],
      ];

      worksheet.addRows(rowData);

      // 💰 PROFESSIONAL FORMATTING
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Currency formatting for all period columns
          for (let i = 3; i <= columns.length; i++) {
            const cell = row.getCell(i);
            cell.numFmt = '£#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          }

          // Percentage column formatting
          const percentCell = row.getCell(2);
          percentCell.alignment = { horizontal: 'right', vertical: 'middle' };

          // Category column
          const categoryCell = row.getCell(1);
          categoryCell.alignment = { horizontal: 'left', vertical: 'middle' };

          // Alternate row colors for readability
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'f8fafc' }, // Very light gray
            };
          }

          // Highlight Net Pay row
          if (categoryCell.value === 'Net Pay') {
            row.font = { bold: true };
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'dcfce7' }, // Light green
            };
          }
        }

        // Borders for all cells
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'd1d5db' } },
            left: { style: 'thin', color: { argb: 'd1d5db' } },
            bottom: { style: 'thin', color: { argb: 'd1d5db' } },
            right: { style: 'thin', color: { argb: 'd1d5db' } },
          };
        });

        row.height = 20;
      });

      // 📊 ADD SUMMARY HEADER
      worksheet.spliceRows(1, 0, [
        [
          `ToolHubX Payslip Summary - ${taxYear}/${parseInt(taxYear, 10) + 1}`,
          '',
          ...visiblePeriods.map(() => ''),
        ],
        ['', '', ...visiblePeriods.map(() => '')], // Empty row
      ]);

      const titleRow = worksheet.getRow(1);
      titleRow.font = { bold: true, size: 16, color: { argb: '1f2937' } };
      titleRow.alignment = { horizontal: 'left', vertical: 'middle' };
      titleRow.height = 30;

      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ToolHubX_Payslip_Summary.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag?.('event', 'export_excel', { tool: 'uk-tax-calculator' });
      }
    } catch (error) {
      console.error('Excel export failed:', error);
      setExportError('Export failed. Please try again.');
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  // 🖨️ PRINT FUNCTION (Results table only)
  const handlePrint = () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const resultsTable = document.querySelector('[data-testid="results-table"]');
      if (resultsTable) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
          <html>
            <head>
              <title>ToolHubX - Tax Calculation Results</title>
              <style>
                @page { margin: 15mm; size: A4; }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  margin: 0; padding: 0; font-size: 12px; line-height: 1.4;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                .header { 
                  margin-bottom: 15px; padding-bottom: 10px; 
                  border-bottom: 2px solid #6366f1;
                }
                .logo { 
                  font-size: 20px; font-weight: bold; 
                  color: #6366f1 !important; margin-bottom: 5px;
                }
                h2 { margin: 5px 0; color: #1f2937; font-size: 16px; }
                .date { color: #6b7280; font-size: 11px; }
                table { 
                  border-collapse: collapse; width: 100%; 
                  font-size: 11px; margin-top: 10px;
                }
                th { 
                  background-color: #374151 !important; 
                  color: white !important; 
                  padding: 6px 8px; text-align: right; 
                  font-weight: 600; border: 1px solid #4b5563;
                }
                th:first-child { text-align: left; }
                td { 
                  padding: 5px 8px; text-align: right; 
                  border: 1px solid #d1d5db; white-space: nowrap;
                }
                td:first-child { text-align: left; }
                .text-red-400 { color: #f87171 !important; }
                .text-yellow-400 { color: #facc15 !important; }
                .text-green-400 { color: #4ade80 !important; }
                .text-purple-400 { color: #c084fc !important; }
                .text-blue-400 { color: #60a5fa !important; }
                .text-gray-400 { color: #9ca3af !important; }
                tr:nth-child(even) { background-color: #f9fafb; }
                .footer { margin-top: 15px; font-size: 10px; color: #6b7280; }
                svg { display: none; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">ToolHubX</div>
                <h2>UK Tax Calculation Results (${taxYear})</h2>
                <div class="date">Generated on ${new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</div>
              </div>
              ${resultsTable.outerHTML}
              <div class="footer">
                This calculation is provided for guidance only. Tax situations can be complex and individual circumstances vary.<br>
                Generated by ToolHubX - Free UK Tax Calculator • toolhubx.uk
              </div>
            </body>
          </html>
        `);
          printWindow.document.close();
          printWindow.print();
          printWindow.close();
        } else {
          throw new Error('Could not open print window');
        }
      } else {
        throw new Error('Could not find results table');
      }
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag?.('event', 'export_print', { tool: 'uk-tax-calculator' });
      }
    } catch (error) {
      console.error('Print failed:', error);
      setExportError('Print failed. Please try again.');
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Export Button */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className='glass group flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-all duration-300 hover:border-primary/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50'
        aria-label='Export payslip summary'
      >
        <Download
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'group-hover:scale-110'}`}
        />
        {isExporting ? (
          <>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
            <span>Exporting...</span>
          </>
        ) : (
          'Export'
        )}
      </button>

      {/* Export Options Dropdown */}
      {isOpen && !isExporting && (
        <div className='glass slide-in-from-top-2 absolute right-0 z-50 mt-3 min-w-64 animate-in rounded-xl border border-white/20 py-2 shadow-2xl backdrop-blur-xl duration-200 md:min-w-80'>
          <div className='border-white/10 border-b px-3 py-2 font-medium text-white/60 text-xs'>
            Export Options
          </div>

          <button
            type='button'
            data-testid='export-excel-button'
            onClick={exportToExcel}
            className='group flex w-full items-center gap-3 px-4 py-3 text-left text-white transition-all duration-200 hover:bg-white/10'
            role='menuitem'
          >
            <div className='rounded-lg bg-green-500/20 p-2 transition-colors group-hover:bg-green-500/30'>
              <FileSpreadsheet className='h-4 w-4 text-green-400' />
            </div>
            <div>
              <div className='font-medium'>Export to Excel</div>
              <div className='text-white/60 text-xs'>Professional spreadsheet format</div>
            </div>
          </button>

          <button
            type='button'
            onClick={handlePrint}
            className='group flex w-full items-center gap-3 px-4 py-3 text-left text-white transition-all duration-200 hover:bg-white/10'
            role='menuitem'
          >
            <div className='rounded-lg bg-blue-500/20 p-2 transition-colors group-hover:bg-blue-500/30'>
              <Printer className='h-4 w-4 text-blue-400' />
            </div>
            <div>
              <div className='font-medium'>Print Summary</div>
              <div className='text-white/60 text-xs'>Print-friendly format</div>
            </div>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} aria-hidden='true' />
      )}

      {/* Error Message */}
      {exportError && (
        <div className='absolute top-full right-0 z-50 mt-2 min-w-64 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-2 text-red-200 text-sm'>
          {exportError}
        </div>
      )}
    </div>
  );
};

export default SimpleExportButton;
