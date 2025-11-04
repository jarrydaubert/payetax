// src/components/organisms/SalaryComparison/SalaryComparisonSection.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import {
  type ComparisonInput,
  type ComparisonResults,
  calculateComparison,
} from '@/lib/salaryComparison';
import type { TaxCalculationInput, TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';
import { ComparisonInputs } from './ComparisonInputs';
import { ComparisonResultsTable } from './ComparisonResultsTable';
import { MarginalRateInsight } from './MarginalRateInsight';

interface SalaryComparisonSectionProps {
  currentInput: TaxCalculationInput;
  currentResults: TaxCalculationResults;
  className?: string;
}

export function SalaryComparisonSection({
  currentInput,
  currentResults,
  className,
}: SalaryComparisonSectionProps) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);

  const handleCompare = (comparisonInput: ComparisonInput) => {
    try {
      const results = calculateComparison(currentInput, comparisonInput);
      if (!results) {
        toast.error('Comparison failed: Invalid input values');
        return;
      }
      setComparisonResults(results);
    } catch (error) {
      console.error('[SalaryComparisonSection] Comparison error:', error);
      toast.error('Comparison failed: Please check your input values');
    }
  };

  return (
    <div className={cn(SPACING.SPACE_Y_4, className)}>
      {/* Toggle Button */}
      <Button
        variant='outline'
        className='w-full justify-between'
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={!currentResults}
      >
        <span className={cn('flex items-center', SPACING.GAP_2)}>
          <ArrowLeftRight className={ICON_SIZES.SIZE_4} />
          Compare Salary Scenarios
        </span>
        <ChevronDown
          className={cn(
            ICON_SIZES.SIZE_4,
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Collapsible Content */}
      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('overflow-hidden', SPACING.SPACE_Y_4)}
          >
            {/* Comparison Inputs */}
            <ComparisonInputs
              currentSalary={currentResults.grossSalary.annually}
              onCompare={handleCompare}
            />

            {/* Results */}
            {comparisonResults && (
              <AnimatePresence mode='wait'>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={SPACING.SPACE_Y_4}
                >
                  <MarginalRateInsight
                    increase={comparisonResults.increase}
                    netDiff={comparisonResults.netDiff}
                    marginalRate={comparisonResults.marginalRate}
                    effectiveRate={comparisonResults.effectiveRate}
                  />
                  <ComparisonResultsTable results={comparisonResults} />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
