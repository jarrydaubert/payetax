// src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DirectorCalculationResult } from '@/lib/validation/directorValidation';
import { isNormalMode } from '@/lib/validation/directorValidation';

interface EducationPanelProps {
  result: DirectorCalculationResult | null;
  revenue?: number;
  region?: 'scotland' | 'rUK';
  hasOtherIncome?: boolean;
  alreadyTaken?: number;
  alreadyTakenViaPayroll?: boolean | null;
  className?: string;
}

/**
 * Right education panel with learn cards, warnings, and assumptions
 */
export function EducationPanel({
  result,
  revenue = 0,
  region = 'rUK',
  hasOtherIncome,
  alreadyTaken = 0,
  alreadyTakenViaPayroll,
  className,
}: EducationPanelProps) {
  const isNormal = result && isNormalMode(result);

  // Determine which warnings to show
  const showVATWarning = isNormal && revenue >= 85000 && revenue <= 95000;
  // Any dividends typically require Self Assessment for directors
  const showSelfAssessmentWarning = isNormal && result.dividendsAvailable > 0;
  const showOtherIncomeWarning = hasOtherIncome === true;
  const showDLAWarning = alreadyTaken > 0 && alreadyTakenViaPayroll === false;
  // High profit complexity warning
  const showComplexityWarning = isNormal && result.grossProfit > 250000;
  // Overdrawn warning - taken more than safe
  const showOverdrawnWarning = isNormal && alreadyTaken > result.annualTakeHome;

  return (
    <aside
      className={cn('flex h-full flex-col border-l border-white/5 bg-slate-900 p-6', className)}
    >
      {/* Learn Section */}
      <section className='mb-8'>
        <h3 className='mb-4 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Learn
        </h3>
        <div className='space-y-3'>
          <LearnCard
            title='Why £12,570 Salary?'
            description='This is the Personal Allowance - earn below this and pay zero income tax and employee NI.'
          />
          <LearnCard
            title='What Are Dividends?'
            description='Payments from company profits to shareholders, taxed at lower rates than salary.'
          />
          <LearnCard
            title='Corporation Tax Explained'
            description='19% on profits up to £50,000, marginal relief between £50k-£250k.'
          />
        </div>
      </section>

      {/* Warnings Section */}
      {(showVATWarning ||
        showSelfAssessmentWarning ||
        showOtherIncomeWarning ||
        showDLAWarning ||
        showComplexityWarning ||
        showOverdrawnWarning) && (
        <section className='mb-8'>
          <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
            Warnings
          </h3>
          <div className='space-y-3'>
            {showOverdrawnWarning && (
              <WarningCard
                title='Already Taken Too Much'
                description='You may have taken more than is safe this year. Speak to your accountant about options.'
              />
            )}
            {showComplexityWarning && (
              <WarningCard
                title='High Profit Complexity'
                description='At this profit level, an accountant could save you serious money with advanced strategies.'
              />
            )}
            {showVATWarning && (
              <WarningCard
                title='VAT Threshold'
                description='Revenue approaching £90,000 VAT threshold. Consider registration.'
              />
            )}
            {showSelfAssessmentWarning && (
              <WarningCard
                title='Self Assessment Required'
                description='Directors taking dividends need to file a Self Assessment. Deadline: 31 Jan.'
              />
            )}
            {showOtherIncomeWarning && (
              <WarningCard
                title='Other Income'
                description='Your other income may affect your tax bands. Consider speaking to an accountant.'
              />
            )}
            {showDLAWarning && (
              <WarningCard
                title="Director's Loan"
                description="Money taken without payroll may create a Director's Loan. Speak to your accountant."
              />
            )}
          </div>
        </section>
      )}

      {/* Assumptions Section */}
      <section>
        <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Assumptions
        </h3>
        <div className='rounded-[10px] border border-white/5 bg-slate-800 p-4'>
          <AssumptionRow label='Tax Year' value='2025/26' />
          <AssumptionRow
            label='Main Home'
            value={region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}
          />
          <AssumptionRow label='Trading Period' value='Full Year' />
          <AssumptionRow
            label='Other Income'
            value={hasOtherIncome ? 'Yes (estimates may differ)' : 'None'}
          />
          <AssumptionRow label='Employment Allowance' value='Not claimed' isLast />
        </div>
      </section>
    </aside>
  );
}

interface LearnCardProps {
  title: string;
  description: string;
}

function LearnCard({ title, description }: LearnCardProps) {
  return (
    <div className='rounded-[10px] border border-white/5 bg-slate-800 p-4'>
      <div className='mb-1 font-medium text-slate-100 text-sm'>{title}</div>
      <div className='text-slate-500 text-xs leading-relaxed'>{description}</div>
    </div>
  );
}

interface WarningCardProps {
  title: string;
  description: string;
}

function WarningCard({ title, description }: WarningCardProps) {
  return (
    <div className='rounded-[10px] border border-amber-500/20 bg-amber-500/10 p-4'>
      <div className='mb-2 flex items-center gap-2'>
        <AlertTriangle className='size-4 text-amber-500' />
        <span className='font-semibold text-amber-500 text-sm'>{title}</span>
      </div>
      <div className='text-slate-400 text-xs leading-relaxed'>{description}</div>
    </div>
  );
}

interface AssumptionRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function AssumptionRow({ label, value, isLast }: AssumptionRowProps) {
  return (
    <div
      className={cn('flex justify-between py-1.5 text-xs', !isLast && 'border-b border-white/5')}
    >
      <span className='text-slate-500'>{label}</span>
      <span className='text-slate-400'>{value}</span>
    </div>
  );
}
