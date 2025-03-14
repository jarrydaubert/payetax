import React from 'react';
import { LtdTaxResult } from '@/lib/ltdTaxCalculator';

interface Props {
  result: LtdTaxResult | null;
  taxYear: string;
}

const ResultsTable: React.FC<Props> = ({ result, taxYear }) => {
  if (!result) return null;

  return (
    <div className="p-4 bg-gray-800 rounded overflow-x-auto shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl sticky top-0 bg-gray-800 z-10">
        <i className="fas fa-table mr-2 text-blue-500"></i>Tax Summary ({taxYear}/{parseInt(taxYear) + 1})
      </h2>
      <table className="w-full text-sm text-gray-100 border border-gray-600">
        <thead>
          <tr className="bg-gray-700 border-b border-gray-600 sticky top-8 z-10">
            <th className="p-2 text-left border-r border-gray-600">Category</th>
            <th className="p-2 text-right border-r border-gray-600">Yearly (£)</th>
            <th className="p-2 text-right">Monthly (£)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-money-bill-wave mr-2"></i>Profit Before Tax</td>
            <td className="p-2 text-right border-r border-gray-600">{result.profit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right">{(result.profit / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-hand-holding-usd mr-2"></i>Corporation Tax {result.profit <= 50000 ? `(${taxYear === '2024' ? '19' : '20'}%)` : result.profit <= 250000 ? '(Marginal Relief)' : `(${taxYear === '2024' ? '25' : '26'}%)`}</td>
            <td className="p-2 text-right border-r border-gray-600 text-red-400">{result.corpTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-red-400">{(result.corpTax / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-id-card mr-2"></i>Employer NI ({taxYear === '2024' ? '13.8%' : '15%'} above £{taxYear === '2024' ? '9,100' : '5,000'})</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{result.employerNI.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-yellow-400">{(result.employerNI / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          {result.vat > 0 && (
            <tr className="border-b border-gray-600">
              <td className="p-2 border-r border-gray-600"><i className="fas fa-receipt mr-2"></i>VAT</td>
              <td className="p-2 text-right border-r border-gray-600 text-orange-400">{result.vat.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right text-orange-400">{(result.vat / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-bold"><i className="fas fa-money-check-alt mr-2"></i>Dividend Tax Breakdown</td>
            <td className="p-2 text-right border-r border-gray-600"></td>
            <td className="p-2 text-right"></td>
          </tr>
          {result.dividendTaxBreakdown.map((band, index) => (
            <tr key={index} className="border-b border-gray-600">
              <td className="p-2 pl-6 border-r border-gray-600">{band.band} ({band.rate}%)</td>
              <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{band.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right text-yellow-400">{(band.amount / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600"><i className="fas fa-money-check-alt mr-2"></i>Total Dividend Tax</td>
            <td className="p-2 text-right border-r border-gray-600 text-yellow-400">{result.dividendTax.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-yellow-400">{(result.dividendTax / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr className="border-b border-gray-600">
            <td className="p-2 border-r border-gray-600 font-bold"><i className="fas fa-wallet mr-2"></i>Net Profit After Tax</td>
            <td className="p-2 text-right border-r border-gray-600 text-green-400 font-bold">{result.netProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="p-2 text-right text-green-400 font-bold">{(result.netProfit / 12).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;