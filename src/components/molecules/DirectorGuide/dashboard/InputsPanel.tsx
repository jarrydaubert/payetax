/**
 * Inputs Panel - Left panel with all calculator inputs
 *
 * Based on DIRECTOR_CALCULATOR_BUILD.md spec.
 * Organized into: Core Inputs, Your Situation, Advanced Options.
 */
'use client';

import { ChevronDown, ChevronUp, HelpCircle, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
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
import { type StudentLoanPlan, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  type YearEndMonth,
} from '@/store/directorGuideStore';

// Tax year configuration - should be centralized elsewhere
// TODO: Move to app config/store so all panels share the same year
const TAX_YEAR: TaxYear = '2025-2026';
const rates = TAX_RATES[TAX_YEAR];
if (!rates) {
  throw new Error(`Tax rates not found for year: ${TAX_YEAR}`);
}
const EMPLOYMENT_ALLOWANCE = rates.nationalInsurance.employmentAllowance;

// Shared input styling
const INPUT_CLASS =
  'border-white/[0.08] bg-slate-800 font-mono text-slate-100 placeholder:text-slate-500 focus:border-cyan-500';

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

// Reverse mapping for initializing select from store
const regionToCountry: Record<Region, Country> = {
  rUK: 'england', // Default to England for rUK
  scotland: 'scotland',
};

export function InputsPanel({ onReset, className }: InputsPanelProps) {
  const baseId = useId();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const formData = useDirectorFormData();
  const actions = useDirectorGuideActions();

  // Derive country selection from store region (single source of truth)
  const selectedCountry = formData.region ? regionToCountry[formData.region] : '';

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '';
    // Show 0 as "£0" for clarity, not empty string
    return `£${value.toLocaleString('en-GB')}`;
  };

  const parseCurrency = (value: string): number => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num) : 0;
  };

  const handleReset = () => {
    actions.reset();
    onReset?.();
  };

  // Generate unique IDs for fields
  const ids = {
    revenue: `${baseId}-revenue`,
    includesVat: `${baseId}-includes-vat`,
    expenses: `${baseId}-expenses`,
    region: `${baseId}-region`,
    yearEnd: `${baseId}-year-end`,
    ytdSalary: `${baseId}-ytd-salary`,
    ytdDividends: `${baseId}-ytd-dividends`,
    ytdDrawings: `${baseId}-ytd-drawings`,
    otherIncome: `${baseId}-other-income`,
    otherPaye: `${baseId}-other-paye`,
    advancedPanel: `${baseId}-advanced`,
    employmentAllowance: `${baseId}-ea`,
    pension: `${baseId}-pension`,
    pensionDeducted: `${baseId}-pension-deducted`,
    carBik: `${baseId}-car-bik`,
    losses: `${baseId}-losses`,
    minSalary: `${baseId}-min-salary`,
    yourSalary: `${baseId}-your-salary`,
    yourDividends: `${baseId}-your-dividends`,
  };

  return (
    <aside className={cn('flex h-full flex-col overflow-y-auto bg-slate-900 p-5', className)}>
      {/* Section: Core Inputs */}
      <Section title='Your Company'>
        <Field label='Annual Revenue' hint='Total invoiced before expenses' id={ids.revenue}>
          <Input
            id={ids.revenue}
            data-testid='director-revenue-input'
            type='text'
            value={formatCurrency(formData.revenue)}
            onChange={(e) => actions.setRevenue(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>

        <div className='flex items-center gap-2'>
          <Checkbox
            id={ids.includesVat}
            data-testid='director-includes-vat-checkbox'
            checked={formData.includesVat}
            onCheckedChange={(checked) => actions.setIncludesVat(checked === true)}
            className='border-white/20 data-[state=checked]:bg-cyan-500'
          />
          <Label htmlFor={ids.includesVat} className='cursor-pointer text-slate-400 text-sm'>
            Revenue includes VAT
          </Label>
          <Tip content='Used for VAT threshold warnings/education only. We do not adjust your revenue for tax calculations.' />
        </div>

        <Field label='Business Expenses' hint='Excluding your salary' id={ids.expenses}>
          <Input
            id={ids.expenses}
            data-testid='director-expenses-input'
            type='text'
            value={formatCurrency(formData.expenses)}
            onChange={(e) => actions.setExpenses(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>

        <Field label='Income Tax Region' hint='Scotland has different tax bands' id={ids.region}>
          <Select
            value={selectedCountry}
            onValueChange={(v) => {
              const country = v as Country;
              actions.setRegion(countryToRegion[country]);
            }}
          >
            <SelectTrigger
              id={ids.region}
              data-testid='director-region-select'
              className='border-white/[0.08] bg-slate-800 text-slate-100'
            >
              <SelectValue placeholder='Select region' />
            </SelectTrigger>
            <SelectContent className='border-slate-700 bg-slate-800'>
              <SelectItem value='england'>England</SelectItem>
              <SelectItem value='wales'>Wales</SelectItem>
              <SelectItem value='ni'>Northern Ireland</SelectItem>
              <SelectItem value='scotland'>Scotland</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label='Company Year-End' hint='For key tax dates' id={ids.yearEnd}>
          <Select
            value={formData.yearEndMonth}
            onValueChange={(v) => actions.setYearEndMonth(v as YearEndMonth)}
          >
            <SelectTrigger
              id={ids.yearEnd}
              className='border-white/[0.08] bg-slate-800 text-slate-100'
            >
              <SelectValue placeholder='Select year-end' />
            </SelectTrigger>
            <SelectContent className='border-slate-700 bg-slate-800'>
              <SelectItem value='03'>31 March</SelectItem>
              <SelectItem value='12'>31 December</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
              <SelectItem value='unknown'>Not sure</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Section>

      {/* Section: Already Taken */}
      <Section title='Already Taken This Year'>
        <Field label='YTD Salary' hint='Gross salary via PAYE' id={ids.ytdSalary}>
          <Input
            id={ids.ytdSalary}
            type='text'
            value={formatCurrency(formData.ytdSalary)}
            onChange={(e) => actions.setYtdSalary(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>

        <Field label='YTD Dividends' hint='Dividends declared' id={ids.ytdDividends}>
          <Input
            id={ids.ytdDividends}
            type='text'
            value={formatCurrency(formData.ytdDividends)}
            onChange={(e) => actions.setYtdDividends(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>

        <Field
          label='Other Drawings'
          hint='Non-dividend withdrawals (e.g. director loan)'
          id={ids.ytdDrawings}
        >
          <Input
            id={ids.ytdDrawings}
            type='text'
            value={formatCurrency(formData.ytdDrawings)}
            onChange={(e) => actions.setYtdDrawings(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* Section: Your Situation */}
      <Section title='Your Situation'>
        <Field label='Other Personal Income' hint='Employment, rental, etc.' id={ids.otherIncome}>
          <Input
            id={ids.otherIncome}
            type='text'
            value={formatCurrency(formData.otherIncome)}
            onChange={(e) => actions.setOtherIncome(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>

        {/* Other PAYE Employment */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Label htmlFor={ids.otherPaye} className='text-slate-400 text-sm'>
              Other PAYE employment?
            </Label>
            <Tip content='If yes, your NI calculations may differ from shown. We assume this is your only PAYE source.' />
          </div>
          <Switch
            id={ids.otherPaye}
            checked={formData.hasOtherPAYEEmployment}
            onCheckedChange={actions.setHasOtherPAYEEmployment}
            className='data-[state=checked]:bg-cyan-500'
          />
        </div>
      </Section>

      {/* Section: Advanced (collapsible) */}
      <div className='mt-4'>
        <button
          type='button'
          onClick={() => setAdvancedOpen(!advancedOpen)}
          aria-expanded={advancedOpen}
          aria-controls={ids.advancedPanel}
          className='flex w-full items-center justify-between rounded-lg border border-white/[0.04] bg-slate-800 px-4 py-3 text-left text-slate-400 text-sm transition-all hover:border-white/[0.08] hover:bg-slate-700'
        >
          <span className='font-medium'>Advanced Options</span>
          {advancedOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
        </button>

        {advancedOpen && (
          <div
            id={ids.advancedPanel}
            className='mt-3 space-y-4 rounded-lg border border-white/[0.04] bg-slate-950 p-4'
          >
            {/* Employment Allowance */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Label htmlFor={ids.employmentAllowance} className='text-slate-400 text-sm'>
                  Employment Allowance
                </Label>
                <Tip
                  content={`£${EMPLOYMENT_ALLOWANCE.toLocaleString()} offset. Not available if you are the only employee/director.`}
                />
              </div>
              <Switch
                id={ids.employmentAllowance}
                checked={formData.hasEmploymentAllowance}
                onCheckedChange={actions.setHasEmploymentAllowance}
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
                {(['plan1', 'plan2', 'plan4', 'postgrad'] as StudentLoanPlan[]).map((plan) => {
                  const checkboxId = `${baseId}-loan-${plan}`;
                  return (
                    <div key={plan} className='flex items-center gap-2'>
                      <Checkbox
                        id={checkboxId}
                        checked={formData.studentLoanPlans.includes(plan)}
                        onCheckedChange={() => actions.toggleStudentLoanPlan(plan)}
                        className='border-white/20 data-[state=checked]:bg-cyan-500'
                      />
                      <Label htmlFor={checkboxId} className='cursor-pointer text-slate-500 text-xs'>
                        {plan === 'plan1' && 'Plan 1'}
                        {plan === 'plan2' && 'Plan 2'}
                        {plan === 'plan4' && 'Plan 4'}
                        {plan === 'postgrad' && 'Postgrad'}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pension Contribution */}
            <Field label='Employer Pension' hint='Reduces taxable profit' id={ids.pension}>
              <Input
                id={ids.pension}
                type='text'
                value={formatCurrency(formData.pensionContribution)}
                onChange={(e) => actions.setPensionContribution(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
              />
            </Field>
            {formData.pensionContribution > 0 && (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id={ids.pensionDeducted}
                  checked={formData.isPensionAlreadyDeducted}
                  onCheckedChange={(checked) =>
                    actions.setIsPensionAlreadyDeducted(checked === true)
                  }
                  className='border-white/20 data-[state=checked]:bg-cyan-500'
                />
                <Label
                  htmlFor={ids.pensionDeducted}
                  className='cursor-pointer text-slate-400 text-sm'
                >
                  Already deducted from profit figure
                </Label>
                <Tip content="Check this if your profit figure already includes the pension deduction. We won't subtract it again." />
              </div>
            )}

            {/* Company Car BIK */}
            <Field label='Company Car BIK' hint='Taxable benefit amount' id={ids.carBik}>
              <Input
                id={ids.carBik}
                type='text'
                value={formatCurrency(formData.companyCarBIK)}
                onChange={(e) => actions.setCompanyCarBIK(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
              />
            </Field>

            {/* Losses Brought Forward */}
            <Field
              label='Losses Brought Forward'
              hint='Trading losses from prior years'
              id={ids.losses}
            >
              <Input
                id={ids.losses}
                type='text'
                value={formatCurrency(formData.lossesBroughtForward)}
                onChange={(e) => actions.setLossesBroughtForward(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
              />
            </Field>

            {/* Minimum Salary Requirement */}
            <Field
              label='Minimum Salary'
              hint='Floor for mortgage or visa applications'
              id={ids.minSalary}
            >
              <Input
                id={ids.minSalary}
                type='text'
                value={formatCurrency(formData.minimumSalaryRequirement)}
                onChange={(e) => {
                  const val = parseCurrency(e.target.value);
                  actions.setMinimumSalaryRequirement(val === 0 ? undefined : val);
                }}
                placeholder='£0'
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Section: Compare My Setup */}
      <Section title='Compare My Setup'>
        <p className='mb-3 text-slate-500 text-xs'>
          Enter your current salary and dividends to see how it compares to the optimal mix.
        </p>
        <Field label='Your Current Salary' hint='Annual gross salary' id={ids.yourSalary}>
          <Input
            id={ids.yourSalary}
            type='text'
            value={formatCurrency(formData.yourSetupSalary)}
            onChange={(e) => {
              const val = parseCurrency(e.target.value);
              actions.setYourSetupSalary(val === 0 ? undefined : val);
            }}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>
        <Field label='Your Current Dividends' hint='Annual dividends' id={ids.yourDividends}>
          <Input
            id={ids.yourDividends}
            type='text'
            value={formatCurrency(formData.yourSetupDividends)}
            onChange={(e) => {
              const val = parseCurrency(e.target.value);
              actions.setYourSetupDividends(val === 0 ? undefined : val);
            }}
            placeholder='£0'
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Reset Button */}
      <div className='mt-6'>
        <button
          type='button'
          onClick={handleReset}
          className='flex w-full items-center gap-3 rounded-lg border border-white/[0.04] bg-slate-800 px-3 py-2 text-left text-slate-400 text-sm transition-all hover:border-white/[0.08] hover:bg-slate-700 hover:text-slate-200'
        >
          <RotateCcw className='size-4 text-cyan-500' />
          <span className='flex-1'>Reset</span>
        </button>
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
  id,
  children,
}: {
  label: string;
  hint?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-slate-400 text-sm'>
        {label}
      </Label>
      {children}
      {hint && <p className='text-slate-600 text-xs'>{hint}</p>}
    </div>
  );
}

function Tip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900'
          aria-label='More information'
        >
          <HelpCircle className='size-3.5 cursor-help text-slate-600' />
        </button>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs bg-slate-800 text-slate-200'>
        <p className='text-xs'>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
