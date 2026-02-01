// src/components/organisms/SalaryComparison/SalaryComparisonSection.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/ui/button';
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
  // Generate stable IDs for accessibility - sanitize useId() colons for DOM compatibility
  const rawId = useId();
  const buttonId = `salary-compare-btn-${rawId.replace(/:/g, '')}`;
  const contentId = `salary-compare-content-${rawId.replace(/:/g, '')}`;

  const [isOpen, setIsOpen] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);

  // Stable callback - only recreate when currentInput changes
  const handleCompare = useCallback(
    (comparisonInput: ComparisonInput) => {
      try {
        const results = calculateComparison(currentInput, comparisonInput);
        if (!results) {
          toast.error('Comparison failed: Invalid input values');
          return;
        }
        setComparisonResults(results);
      } catch {
        // Error already logged by calculateComparison if needed
        toast.error('Comparison failed: Please check your input values');
      }
    },
    [currentInput],
  );

  // Handle toggle with optional results reset
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      // Optionally clear stale results when closing
      // Uncomment if you want fresh state on each open:
      // if (!next) setComparisonResults(null);
      return next;
    });
  }, []);

  return (
    <div className={cn(SPACING.SPACE_Y_4, className)}>
      {/* Toggle Button */}
      <Button
        id={buttonId}
        variant='outline'
        className='w-full justify-between'
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className={cn('flex items-center', SPACING.GAP_2)}>
          <ArrowLeftRight className={ICON_SIZES.SIZE_4} />
          Compare Salary Scenarios
        </span>
        <ChevronDown
          className={cn(
            ICON_SIZES.SIZE_4,
            'transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </Button>

      {/* Collapsible Content */}
      <AnimatePresence mode='wait'>
        {isOpen && (
          <motion.div
            id={contentId}
            role='region'
            aria-labelledby={buttonId}
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

            {/* Results - simpler animation without nested AnimatePresence */}
            {comparisonResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={SPACING.SPACE_Y_4}
              >
                <MarginalRateInsight
                  increase={comparisonResults.increase}
                  netDiff={comparisonResults.netDiff}
                />
                <ComparisonResultsTable results={comparisonResults} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
