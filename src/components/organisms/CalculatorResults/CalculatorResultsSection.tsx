// src/components/organisms/CalculatorResults/CalculatorResultsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { FileDown, Printer, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportToCSV, printResults } from '@/lib/exportUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { ResultsSummaryCards } from './ResultsSummaryCards';
import { ResultsTable } from './ResultsTable';

interface CalculatorResultsSectionProps {
  results: TaxCalculationResults;
}

export function CalculatorResultsSection({ results }: CalculatorResultsSectionProps) {
  const handleExport = () => {
    try {
      exportToCSV(results);
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const handlePrint = () => {
    try {
      printResults(results);
    } catch {
      toast.error('Failed to open print dialog');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className='space-y-6'
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='flex items-center justify-between'
      >
        <div>
          <h2 className='mb-2 flex items-center gap-2 font-bold text-2xl'>
            <TrendingUp className='size-6 text-primary' />
            Your Results
          </h2>
          <p className='text-muted-foreground'>Complete breakdown of your tax and take-home pay</p>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handlePrint}>
            <Printer className='mr-2 size-4' />
            Print
          </Button>
          <Button variant='outline' size='sm' onClick={handleExport}>
            <FileDown className='mr-2 size-4' />
            Export
          </Button>
        </div>
      </motion.div>

      <ResultsSummaryCards results={results} />
      <ResultsTable results={results} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className='rounded-lg border p-4'
      >
        <p className='text-sm'>
          <strong>💡 Tip:</strong> Tax calculations are based on official HMRC rates for{' '}
          {results.grossSalary.annually > 0 && 'the current tax year'}. These figures are estimates
          - your actual take-home may vary based on other factors.
        </p>
      </motion.div>
    </motion.div>
  );
}
