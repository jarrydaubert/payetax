import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LtdTaxResult } from '@/lib/ltdTaxCalculator';

interface Props {
  result: LtdTaxResult | null;
}

const ChartDisplay: React.FC<Props> = ({ result }) => {
  const getChartData = () => {
    if (!result) return [];
    return [
      { name: 'Corporation Tax', value: result.corpTax, fill: '#f87171' },
      { name: 'Employer NI', value: result.employerNI, fill: '#facc15' },
      { name: 'VAT', value: result.vat, fill: '#fb923c' },
      { name: 'Dividend Tax', value: result.dividendTax, fill: '#a78bfa' },
      { name: 'Net Profit', value: result.netProfit, fill: '#4ade80' },
    ].filter(item => item.value > 0);
  };

  if (!result) return null;

  return (
    <div className="p-4 bg-gray-800 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-100 md:text-xl">
        <i className="fas fa-chart-pie mr-2 text-blue-500"></i>Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={getChartData()}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={50} // Reduced further to avoid overlap
            label={({ name, value }) => `${name}: £${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            labelLine={true}
          >
            <Cell key="Corporation Tax" fill="#f87171" />
            <Cell key="Employer NI" fill="#facc15" />
            <Cell key="VAT" fill="#fb923c" />
            <Cell key="Dividend Tax" fill="#a78bfa" />
            <Cell key="Net Profit" fill="#4ade80" />
          </Pie>
          <Tooltip formatter={(value) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartDisplay;