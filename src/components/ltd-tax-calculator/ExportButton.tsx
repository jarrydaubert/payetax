import React from 'react';
import ExcelJS from 'exceljs';
import { LtdTaxResult } from '@/lib/ltdTaxCalculator';

interface Props {
  result: LtdTaxResult | null;
  taxYear: string;
}

const ExportButton: React.FC<Props> = ({ result, taxYear }) => {
  const exportToExcel = async () => {
    if (!result) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ltd Tax Summary');

    worksheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Yearly (£)', key: 'yearly', width: 15 },
      { header: 'Monthly (£)', key: 'monthly', width: 15 },
    ];

    worksheet.addRows([
      ['Profit Before Tax', result.profit, result.profit / 12],
      [`Corporation Tax ${result.profit <= 50000 ? `(${taxYear === '2024' ? '19' : '20'}%)` : result.profit <= 250000 ? '(Marginal Relief)' : `(${taxYear === '2024' ? '25' : '26'}%)`}`, result.corpTax, result.corpTax / 12],
      [`Employer NI (${taxYear === '2024' ? '13.8%' : '15%'} above £${taxYear === '2024' ? '9,100' : '5,000'})`, result.employerNI, result.employerNI / 12],
      ...(result.vat > 0 ? [['VAT', result.vat, result.vat / 12]] : []),
      ...result.dividendTaxBreakdown.map(band => [`${band.band} Dividend Tax (${band.rate}%)`, band.amount, band.amount / 12]),
      ['Total Dividend Tax', result.dividendTax, result.dividendTax / 12],
      ['Net Profit After Tax', result.netProfit, result.netProfit / 12],
    ]);

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell(2).numFmt = '#,##0.00'; // Thousands separator
        row.getCell(3).numFmt = '#,##0.00'; // Thousands separator
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ToolHubX_Ltd_Tax_Summary.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return result ? (
    <button
      onClick={exportToExcel}
      className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      aria-label="Download Excel"
    >
      <i className="fas fa-file-excel mr-2"></i>Download Excel
    </button>
  ) : null;
};

export default ExportButton;