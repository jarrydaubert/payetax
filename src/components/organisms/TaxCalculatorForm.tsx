// src/components/organisms/TaxCalculatorForm.tsx
'use client';

import React from 'react';
import { PoundSterling, RotateCcw } from 'lucide-react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { cn } from '@/lib/utils';

interface TaxCalculatorFormProps {
  className?: string;
}

const STUDENT_LOAN_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'plan1', label: 'Plan 1' },
  { value: 'plan2', label: 'Plan 2' },
  { value: 'plan4', label: 'Plan 4 (Scotland)' },
  { value: 'plan5', label: 'Plan 5' },
  { value: 'postgrad', label: 'Postgraduate' },
];

const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({
  className,
}) => {
  const {
    input,
    setSalary,
    setTaxCode,
    setPensionContribution,
    setPensionContributionType,
    setStudentLoanPlans,
    setIsScottish,
    calculate,
    reset,
  } = useCalculatorStore();



  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setSalary(Number(value) || 0);
  };

  const handleTaxCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setTaxCode(code);
    setIsScottish(code.includes('S'));
  };

  const handlePensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setPensionContribution(value);
  };

  const handleStudentLoanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plan = e.target.value;
    setStudentLoanPlans(plan === 'none' ? ['none'] : [plan as any]);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className={cn('space-y-6', className)}>
      
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="salary" 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Annual Salary
          </label>
          <div className="relative">
            <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="salary"
              type="text"
              value={input.salary || ''}
              onChange={handleSalaryChange}
              placeholder="50000"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="taxCode" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Tax Code
            </label>
            <input
              id="taxCode"
              type="text"
              value={input.taxCode}
              onChange={handleTaxCodeChange}
              placeholder="1257L"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label 
              htmlFor="studentLoan" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Student Loan
            </label>
            <select
              id="studentLoan"
              value={input.studentLoanPlans[0] || 'none'}
              onChange={handleStudentLoanChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              {STUDENT_LOAN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="pensionType" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Pension Contribution
            </label>
            <select
              id="pensionType"
              value={input.pensionContributionType}
              onChange={(e) => setPensionContributionType(e.target.value as 'percentage' | 'amount')}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="percentage" className="bg-gray-800">Percentage (%)</option>
              <option value="amount" className="bg-gray-800">Amount (£)</option>
            </select>
          </div>

          <div>
            <label 
              htmlFor="pension" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {input.pensionContributionType === 'percentage' ? 'Percentage' : 'Amount'}
            </label>
            <div className="relative">
              {input.pensionContributionType === 'amount' && (
                <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
              <input
                id="pension"
                type="number"
                value={input.pensionContribution || ''}
                onChange={handlePensionChange}
                placeholder={input.pensionContributionType === 'percentage' ? '5' : '200'}
                min="0"
                max={input.pensionContributionType === 'percentage' ? '100' : undefined}
                className={cn(
                  "w-full py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                  input.pensionContributionType === 'amount' ? 'pl-10 pr-4' : 'px-4'
                )}
              />
              {input.pensionContributionType === 'percentage' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/20 rounded-lg">
            <input
              id="married"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="married" className="text-sm text-gray-300">
              Married
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/20 rounded-lg">
            <input
              id="blind"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="blind" className="text-sm text-gray-300">
              Blind
            </label>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/20 rounded-lg">
            <input
              id="noNI"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="noNI" className="text-sm text-gray-300">
              No NI
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={calculate}
          className="flex-1 btn btn-primary py-3 text-lg font-semibold"
        >
          Show me the Money! 💰
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-ghost px-6 py-3"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TaxCalculatorForm;
