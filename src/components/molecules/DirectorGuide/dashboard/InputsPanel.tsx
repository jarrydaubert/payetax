// src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx
/**
 * Inputs Panel - Left panel with all calculator inputs
 *
 * Based on DIRECTOR_CALCULATOR_BUILD.md spec.
 * Organized into: Core Inputs, Your Situation, Advanced Options.
 */
'use client';

import {
  ChevronDown,
  ChevronUp,
  Crown,
  FileDown,
  HelpCircle,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type StudentLoanPlan, TAX_RATES } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  type YearEndMonth,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';
const EMPLOYMENT_ALLOWANCE = TAX_RATES[TAX_YEAR].nationalInsurance.employmentAllowance;

interface InputsPanelProps {
  onReset?: () => void;
  className?: string;
}

// Map country selection to region code
type Country = 'england' | 'wales' | 'ni' | 'scotland';
const countryToRegion: Record<Country, Region> = {
  england: 'rUK',
  wales: 'rUK',
  ni: 'rUK',
  scotland: 'scotland',
};

export function InputsPanel({ onReset, className }: InputsPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | ''>('');
  const formData = useDirectorFormData();
  const {
    setRegion,
    setRevenue,
    setIncludesVat,
    setExpenses,
    setAlreadyTaken,
    setOtherIncome,
    setYearEndMonth,
    setHasEmploymentAllowance,
    toggleStudentLoanPlan,
    setPensionContribution,
    setCompanyCarBIK,
    reset,
  } = useDirectorGuideActions();

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === 0) return '';
    return `£${value.toLocaleString('en-GB')}`;
  };

  const parseCurrency = (value: string): number => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num) : 0;
  };

  const handleReset = () => {
    setSelectedCountry('');
    reset();
    onReset?.();
  };

  return (
    <aside className={cn('flex h-full flex-col overflow-y-auto bg-[#0f172a] p-5', className)}>
      {/* Section: Core Inputs */}
      <Section title='Your Company'>
        <Field label='Annual Revenue' hint='Total invoiced before expenses'>
          <Input
            type='text'
            value={formatCurrency(formData.revenue)}
            onChange={(e) => setRevenue(parseCurrency(e.target.value))}
            placeholder='£0'
            className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
          />
        </Field>

        <div className='flex items-center gap-2'>
          <Checkbox
            id='includesVat'
            checked={formData.includesVat}
            onCheckedChange={(checked) => setIncludesVat(checked === true)}
            className='border-white/20 data-[state=checked]:bg-cyan-500'
          />
          <Label htmlFor='includesVat' className='cursor-pointer text-slate-400 text-sm'>
            Revenue includes VAT
          </Label>
          <Tip content='If checked, we divide by 1.2 to get net revenue' />
        </div>

        <Field label='Business Expenses' hint='Excluding your salary'>
          <Input
            type='text'
            value={formatCurrency(formData.expenses)}
            onChange={(e) => setExpenses(parseCurrency(e.target.value))}
            placeholder='£0'
            className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
          />
        </Field>

        <Field label='Where do you live?' hint='Scotland has different tax bands'>
          <Select
            value={selectedCountry}
            onValueChange={(v) => {
              const country = v as Country;
              setSelectedCountry(country);
              setRegion(countryToRegion[country]);
            }}
          >
            <SelectTrigger className='border-white/[0.08] bg-[#1e293b] text-slate-100'>
              <SelectValue placeholder='Select region' />
            </SelectTrigger>
            <SelectContent className='border-slate-700 bg-[#1e293b]'>
              <SelectItem value='england'>England</SelectItem>
              <SelectItem value='wales'>Wales</SelectItem>
              <SelectItem value='ni'>Northern Ireland</SelectItem>
              <SelectItem value='scotland'>Scotland</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label='Company Year-End' hint='For key tax dates'>
          <Select
            value={formData.yearEndMonth}
            onValueChange={(v) => setYearEndMonth(v as YearEndMonth)}
          >
            <SelectTrigger className='border-white/[0.08] bg-[#1e293b] text-slate-100'>
              <SelectValue placeholder='Select year-end' />
            </SelectTrigger>
            <SelectContent className='border-slate-700 bg-[#1e293b]'>
              <SelectItem value='03'>31 March</SelectItem>
              <SelectItem value='12'>31 December</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
              <SelectItem value='unknown'>Not sure</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* Section: Your Situation */}
      <Section title='Your Situation'>
        <Field label='Already Taken This Year' hint='YTD withdrawals from company'>
          <Input
            type='text'
            value={formatCurrency(formData.alreadyTaken)}
            onChange={(e) => setAlreadyTaken(parseCurrency(e.target.value))}
            placeholder='£0'
            className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
          />
        </Field>

        <Field label='Other Personal Income' hint='Employment, rental, etc.'>
          <Input
            type='text'
            value={formatCurrency(formData.otherIncome)}
            onChange={(e) => setOtherIncome(parseCurrency(e.target.value))}
            placeholder='£0'
            className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
          />
        </Field>
      </Section>

      {/* Section: Advanced (collapsible) */}
      <div className='mt-4'>
        <button
          type='button'
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className='flex w-full items-center justify-between rounded-lg border border-white/[0.04] bg-[#1e293b] px-4 py-3 text-left text-slate-400 text-sm transition-all hover:border-white/[0.08] hover:bg-[#273548]'
        >
          <span className='font-medium'>Advanced Options</span>
          {advancedOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
        </button>

        {advancedOpen && (
          <div className='mt-3 space-y-4 rounded-lg border border-white/[0.04] bg-[#0c1222] p-4'>
            {/* Employment Allowance */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Label className='text-slate-400 text-sm'>Employment Allowance</Label>
                <Tip
                  content={`£${EMPLOYMENT_ALLOWANCE.toLocaleString()} offset. Not available if you are the only employee/director.`}
                />
              </div>
              <Switch
                checked={formData.hasEmploymentAllowance}
                onCheckedChange={setHasEmploymentAllowance}
                className='data-[state=checked]:bg-cyan-500'
              />
            </div>

            {/* Student Loans */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Label className='text-slate-400 text-sm'>Student Loans</Label>
                <Tip content='Applied to total income (salary + dividends) via Self Assessment' />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                {(['plan1', 'plan2', 'plan4', 'postgrad'] as StudentLoanPlan[]).map((plan) => (
                  <div key={plan} className='flex items-center gap-2'>
                    <Checkbox
                      id={plan}
                      checked={formData.studentLoanPlans.includes(plan)}
                      onCheckedChange={() => toggleStudentLoanPlan(plan)}
                      className='border-white/20 data-[state=checked]:bg-cyan-500'
                    />
                    <Label htmlFor={plan} className='cursor-pointer text-slate-500 text-xs'>
                      {plan === 'plan1' && 'Plan 1'}
                      {plan === 'plan2' && 'Plan 2'}
                      {plan === 'plan4' && 'Plan 4'}
                      {plan === 'postgrad' && 'Postgrad'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pension Contribution */}
            <Field label='Employer Pension' hint='Reduces taxable profit'>
              <Input
                type='text'
                value={formatCurrency(formData.pensionContribution)}
                onChange={(e) => setPensionContribution(parseCurrency(e.target.value))}
                placeholder='£0'
                className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
              />
            </Field>

            {/* Company Car BIK */}
            <Field label='Company Car BIK' hint='Taxable benefit amount'>
              <Input
                type='text'
                value={formatCurrency(formData.companyCarBIK)}
                onChange={(e) => setCompanyCarBIK(parseCurrency(e.target.value))}
                placeholder='£0'
                className='border-white/[0.08] bg-[#1e293b] font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500'
              />
            </Field>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Quick Actions */}
      <div className='mt-6 space-y-2'>
        <QuickAction icon={RotateCcw} label='Reset' onClick={handleReset} />
        <QuickAction icon={FileDown} label='Export PDF' disabled isPro />
        <QuickAction icon={Share2} label='Share' disabled isPro />
      </div>
    </aside>
  );
}

/* Helper Components */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='mb-5'>
      <h3 className='mb-3 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
        {title}
      </h3>
      <div className='space-y-4'>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-slate-400 text-sm'>{label}</Label>
      {children}
      {hint && <p className='text-slate-600 text-xs'>{hint}</p>}
    </div>
  );
}

function Tip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className='size-3.5 cursor-help text-slate-600' />
      </TooltipTrigger>
      <TooltipContent className='max-w-xs bg-slate-800 text-slate-200'>
        <p className='text-xs'>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  isPro,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  isPro?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-white/[0.04] bg-[#1e293b] px-3 py-2 text-left text-slate-400 text-sm transition-all',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-white/[0.08] hover:bg-[#273548] hover:text-slate-200'
      )}
    >
      <Icon className='size-4 text-cyan-500' />
      <span className='flex-1'>{label}</span>
      {isPro && <Crown className='size-3 text-amber-500' />}
    </button>
  );
}
