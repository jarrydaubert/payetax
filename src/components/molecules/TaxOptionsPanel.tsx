// src/components/molecules/TaxOptionsPanel.tsx
'use client';

import React from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TaxOptions {
  isPensionAge: boolean;
  isMarried: boolean;
  isBlind: boolean;
  noNationalInsurance: boolean;
  partnerIncome: number;
}

interface PensionContribution {
  amount: number;
  type: 'percentage' | 'amount';
  isBeforeTax: boolean;
}

interface TaxOptionsPanelProps {
  options: TaxOptions;
  pensionContribution: PensionContribution;
  onOptionsChange: (options: TaxOptions) => void;
  onPensionChange: (pension: PensionContribution) => void;
}

export default function TaxOptionsPanel({
  options,
  pensionContribution,
  onOptionsChange,
  onPensionChange,
}: TaxOptionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOptionChange = (key: keyof TaxOptions, value: boolean | number) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const handlePensionChange = (key: keyof PensionContribution, value: number | boolean | string) => {
    onPensionChange({ ...pensionContribution, [key]: value });
  };

  const formatPensionDisplay = (value: number, type: string): string => {
    if (value === 0) return '';
    if (type === 'amount') {
      return value.toLocaleString('en-GB', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return value.toString();
  };

  const handlePensionAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pensionContribution.type === 'amount') {
      // Apply comma formatting for fixed amounts
      const rawValue = e.target.value;
      const cleanValue = rawValue.replace(/[^0-9]/g, '');
      const numericValue = Number(cleanValue) || 0;
      handlePensionChange('amount', numericValue);
    } else {
      // For percentages, allow decimal values
      const numericValue = Number(e.target.value) || 0;
      handlePensionChange('amount', numericValue);
    }
  };

  return (
    <div className="glass-card">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-0 text-white hover:text-purple-300 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="tax-options-panel"
      >
        <div className="flex items-center">
          <Settings className="h-4 w-4 text-purple-400 mr-2" />
          <h3 className="text-base font-semibold">Advanced Options</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <div
        id="tax-options-panel"
        className={`mt-3 space-y-3 transition-all duration-200 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Personal Circumstances */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Personal Circumstances</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label 
                htmlFor="age-select"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Age
              </label>
              <select
                id="age-select"
                value={options.isPensionAge ? 'over65' : 'under65'}
                onChange={(e) => handleOptionChange('isPensionAge', e.target.value === 'over65')}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="under65">Under 65</option>
                <option value="over65">65 or over</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center space-x-2 p-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={options.isMarried}
                onChange={(e) => handleOptionChange('isMarried', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Married</span>
            </label>
            <label className="flex items-center space-x-2 p-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={options.isBlind}
                onChange={(e) => handleOptionChange('isBlind', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Blind</span>
            </label>
            <label className="flex items-center space-x-2 p-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={options.noNationalInsurance}
                onChange={(e) => handleOptionChange('noNationalInsurance', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">No NI</span>
            </label>
          </div>
        </div>

        {/* Pension Contribution */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Pension Contribution</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                htmlFor="pension-type"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Type
              </label>
              <select
                id="pension-type"
                value={pensionContribution.type}
                onChange={(e) => handlePensionChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label 
                htmlFor="pension-amount"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                {pensionContribution.type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}
              </label>
              <input
                id="pension-amount"
                type="text"
                value={formatPensionDisplay(pensionContribution.amount, pensionContribution.type)}
                onChange={handlePensionAmountChange}
                placeholder={pensionContribution.type === 'percentage' ? '5' : '200'}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <label className="flex items-center space-x-2 mt-2 p-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
            <input 
              type="checkbox" 
              checked={pensionContribution.isBeforeTax}
              onChange={(e) => handlePensionChange('isBeforeTax', e.target.checked)}
              className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-white">Salary sacrifice (before tax)</span>
          </label>
        </div>
      </div>
    </div>
  );
}