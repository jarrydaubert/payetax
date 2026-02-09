/**
 * Inputs Panel - Left panel with all calculator inputs
 *
 * Based on DIRECTOR_CALCULATOR_BUILD.md spec.
 * Organized into: Core Inputs, Your Situation, Advanced Options.
 */
'use client';

import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useId, useState } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
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
import { CURRENT_TAX_YEAR, type StudentLoanPlan, TAX_RATES } from '@/constants/taxRates';
import { getAvailableDirectorStudentLoanPlans } from '@/lib/tax/studentLoanPlans';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';
import {
  useDirectorFormSlice,
  useDirectorGuideActions,
  type YearEndMonth,
} from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;
const rates = TAX_RATES[TAX_YEAR];
if (!rates) {
  throw new Error(`Tax rates not found for year: ${TAX_YEAR}`);
}

// Shared input styling
const INPUT_CLASS =
  'border-white/[0.08] bg-slate-800 font-mono text-slate-100 placeholder:text-slate-500 focus:border-cyan-500';

const getHintId = (id?: string) => (id ? `${id}-hint` : undefined);

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

const STUDENT_LOAN_PLAN_SHORT_LABELS: Record<StudentLoanPlan, string> = {
  plan1: 'Plan 1',
  plan2: 'Plan 2',
  plan4: 'Plan 4',
  plan5: 'Plan 5',
  postgrad: 'Postgrad',
};

export function InputsPanel({ onReset, className }: InputsPanelProps) {
  const baseId = useId();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const formData = useDirectorFormSlice((formData) => ({
    mode: formData.mode,
    region: formData.region,
    revenue: formData.revenue,
    includesVat: formData.includesVat,
    expenses: formData.expenses,
    ytdSalary: formData.ytdSalary,
    ytdDividends: formData.ytdDividends,
    ytdDrawings: formData.ytdDrawings,
    otherIncome: formData.otherIncome,
    hasOtherPAYEEmployment: formData.hasOtherPAYEEmployment,
    yearEndMonth: formData.yearEndMonth,
    studentLoanPlans: formData.studentLoanPlans,
    pensionContribution: formData.pensionContribution,
    isPensionAlreadyDeducted: formData.isPensionAlreadyDeducted,
    companyCarBIK: formData.companyCarBIK,
    hasEmploymentAllowance: formData.hasEmploymentAllowance,
    lossesBroughtForward: formData.lossesBroughtForward,
    minimumSalaryRequirement: formData.minimumSalaryRequirement,
    yourSetupSalary: formData.yourSetupSalary,
    yourSetupDividends: formData.yourSetupDividends,
    monthlyIncome: formData.monthlyIncome,
    monthlyExpenses: formData.monthlyExpenses,
    contractStartMonth: formData.contractStartMonth,
    cashInBank: formData.cashInBank,
    minimumMonthlyDraw: formData.minimumMonthlyDraw,
    runwayMonths: formData.runwayMonths,
  }));
  const actions = useDirectorGuideActions();
  const isMonthlyMode = formData.mode === 'monthly';

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

  const parseCurrencyOptional = (value: string): number | undefined => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num) : undefined;
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }
    actions.reset();
  };

  // Generate unique IDs for fields
  const ids = {
    mode: `${baseId}-mode`,
    revenue: `${baseId}-revenue`,
    monthlyIncome: `${baseId}-monthly-income`,
    monthlyExpenses: `${baseId}-monthly-expenses`,
    contractStartMonth: `${baseId}-contract-start-month`,
    cashInBank: `${baseId}-cash-in-bank`,
    minimumMonthlyDraw: `${baseId}-minimum-monthly-draw`,
    runwayMonths: `${baseId}-runway-months`,
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
      {/* Section: Mode */}
      <Section title='Mode'>
        <fieldset aria-labelledby={ids.mode}>
          <legend id={ids.mode} className='sr-only'>
            Input mode
          </legend>
          <div className='grid grid-cols-2 gap-2 rounded-lg border border-white/[0.04] bg-slate-950 p-1'>
            <button
              type='button'
              onClick={() => actions.setMode('annual')}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                !isMonthlyMode
                  ? 'bg-cyan-500/20 font-medium text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200',
              )}
              aria-pressed={!isMonthlyMode}
            >
              Annual
            </button>
            <button
              type='button'
              onClick={() => actions.setMode('monthly')}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                isMonthlyMode
                  ? 'bg-cyan-500/20 font-medium text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200',
              )}
              aria-pressed={isMonthlyMode}
            >
              Monthly
            </button>
          </div>
        </fieldset>
      </Section>

      {/* Section: Core Inputs */}
      <Section title='Your Company'>
        {isMonthlyMode ? (
          <>
            <Field
              label='Monthly Contract Income'
              hint='Typical gross invoicing per month'
              id={ids.monthlyIncome}
              tooltipFieldName='directorMonthlyIncome'
            >
              <Input
                id={ids.monthlyIncome}
                type='text'
                value={formatCurrency(formData.monthlyIncome)}
                onChange={(e) => actions.setMonthlyIncome(parseCurrencyOptional(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.monthlyIncome)}
              />
            </Field>

            <Field
              label='Monthly Business Expenses'
              hint='Excluding director salary'
              id={ids.monthlyExpenses}
              tooltipFieldName='directorMonthlyExpenses'
            >
              <Input
                id={ids.monthlyExpenses}
                type='text'
                value={formatCurrency(formData.monthlyExpenses)}
                onChange={(e) => actions.setMonthlyExpenses(parseCurrencyOptional(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.monthlyExpenses)}
              />
            </Field>

            <Field
              label='Contract Start Month'
              hint='Used to project months remaining in this tax year'
              id={ids.contractStartMonth}
              tooltipFieldName='directorContractStartMonth'
            >
              <Select
                value={String(formData.contractStartMonth)}
                onValueChange={(value) => actions.setContractStartMonth(Number(value))}
              >
                <SelectTrigger
                  id={ids.contractStartMonth}
                  className='border-white/[0.08] bg-slate-800 text-slate-100'
                  aria-describedby={getHintId(ids.contractStartMonth)}
                >
                  <SelectValue placeholder='Select month' />
                </SelectTrigger>
                <SelectContent className='border-slate-700 bg-slate-800'>
                  <SelectItem value='4'>April</SelectItem>
                  <SelectItem value='5'>May</SelectItem>
                  <SelectItem value='6'>June</SelectItem>
                  <SelectItem value='7'>July</SelectItem>
                  <SelectItem value='8'>August</SelectItem>
                  <SelectItem value='9'>September</SelectItem>
                  <SelectItem value='10'>October</SelectItem>
                  <SelectItem value='11'>November</SelectItem>
                  <SelectItem value='12'>December</SelectItem>
                  <SelectItem value='1'>January</SelectItem>
                  <SelectItem value='2'>February</SelectItem>
                  <SelectItem value='3'>March</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field
              label='Cash In Bank'
              hint='Current company cash available'
              id={ids.cashInBank}
              tooltipFieldName='directorCashInBank'
            >
              <Input
                id={ids.cashInBank}
                type='text'
                value={formatCurrency(formData.cashInBank)}
                onChange={(e) => actions.setCashInBank(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.cashInBank)}
              />
            </Field>

            <Field
              label='Minimum Monthly Draw'
              hint='Your personal monthly floor'
              id={ids.minimumMonthlyDraw}
              tooltipFieldName='directorMinimumMonthlyDraw'
            >
              <Input
                id={ids.minimumMonthlyDraw}
                type='text'
                value={formatCurrency(formData.minimumMonthlyDraw)}
                onChange={(e) => actions.setMinimumMonthlyDraw(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.minimumMonthlyDraw)}
              />
            </Field>

            <Field
              label='Runway Target (months)'
              hint='How long you want cash to last'
              id={ids.runwayMonths}
              tooltipFieldName='directorRunwayMonths'
            >
              <Input
                id={ids.runwayMonths}
                type='number'
                min={0}
                max={36}
                value={String(formData.runwayMonths)}
                onChange={(e) => actions.setRunwayMonths(Number(e.target.value))}
                placeholder='3'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.runwayMonths)}
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label='Annual Revenue'
              hint='Total invoiced before expenses'
              id={ids.revenue}
              tooltipFieldName='directorRevenue'
            >
              <Input
                id={ids.revenue}
                data-testid='director-revenue-input'
                type='text'
                value={formatCurrency(formData.revenue)}
                onChange={(e) => actions.setRevenue(parseCurrencyOptional(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.revenue)}
              />
            </Field>

            <Field
              label='Business Expenses'
              hint='Excluding your salary'
              id={ids.expenses}
              tooltipFieldName='directorExpenses'
            >
              <Input
                id={ids.expenses}
                data-testid='director-expenses-input'
                type='text'
                value={formatCurrency(formData.expenses)}
                onChange={(e) => actions.setExpenses(parseCurrencyOptional(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.expenses)}
              />
            </Field>
          </>
        )}

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
          <LabelTooltip fieldName='directorIncludesVat' />
        </div>

        <Field
          label='Income Tax Region'
          hint='Scotland has different tax bands'
          id={ids.region}
          tooltipFieldName='region'
        >
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
              aria-describedby={getHintId(ids.region)}
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

        <Field
          label='Company Year-End'
          hint='For key tax dates'
          id={ids.yearEnd}
          tooltipFieldName='directorYearEnd'
        >
          <Select
            value={formData.yearEndMonth}
            onValueChange={(v) => actions.setYearEndMonth(v as YearEndMonth)}
          >
            <SelectTrigger
              id={ids.yearEnd}
              className='border-white/[0.08] bg-slate-800 text-slate-100'
              aria-describedby={getHintId(ids.yearEnd)}
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
        <Field
          label='YTD Salary'
          hint='Gross salary via PAYE'
          id={ids.ytdSalary}
          tooltipFieldName='directorYtdSalary'
        >
          <Input
            id={ids.ytdSalary}
            type='text'
            value={formatCurrency(formData.ytdSalary)}
            onChange={(e) => actions.setYtdSalary(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
            aria-describedby={getHintId(ids.ytdSalary)}
          />
        </Field>

        <Field
          label='YTD Dividends'
          hint='Dividends declared'
          id={ids.ytdDividends}
          tooltipFieldName='directorYtdDividends'
        >
          <Input
            id={ids.ytdDividends}
            type='text'
            value={formatCurrency(formData.ytdDividends)}
            onChange={(e) => actions.setYtdDividends(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
            aria-describedby={getHintId(ids.ytdDividends)}
          />
        </Field>

        <Field
          label='Other Drawings'
          hint='Non-dividend withdrawals (e.g. director loan)'
          id={ids.ytdDrawings}
          tooltipFieldName='directorYtdDrawings'
        >
          <Input
            id={ids.ytdDrawings}
            type='text'
            value={formatCurrency(formData.ytdDrawings)}
            onChange={(e) => actions.setYtdDrawings(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
            aria-describedby={getHintId(ids.ytdDrawings)}
          />
        </Field>
      </Section>

      {/* Section: Your Situation */}
      <Section title='Your Situation'>
        <Field
          label='Other Personal Income'
          hint='Employment, rental, etc.'
          id={ids.otherIncome}
          tooltipFieldName='directorOtherIncome'
        >
          <Input
            id={ids.otherIncome}
            type='text'
            value={formatCurrency(formData.otherIncome)}
            onChange={(e) => actions.setOtherIncome(parseCurrency(e.target.value))}
            placeholder='£0'
            className={INPUT_CLASS}
            aria-describedby={getHintId(ids.otherIncome)}
          />
        </Field>

        {/* Other PAYE Employment */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Label htmlFor={ids.otherPaye} className='text-slate-400 text-sm'>
              Other PAYE employment?
            </Label>
            <LabelTooltip fieldName='directorOtherPAYE' />
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
                <LabelTooltip fieldName='directorEmploymentAllowance' />
              </div>
              <Switch
                id={ids.employmentAllowance}
                checked={formData.hasEmploymentAllowance}
                onCheckedChange={actions.setHasEmploymentAllowance}
                className='data-[state=checked]:bg-cyan-500'
              />
            </div>

            {/* Student Loans */}
            <fieldset className='space-y-2'>
              <legend className='flex items-center gap-2 text-slate-400 text-sm'>
                Student Loans
                <LabelTooltip fieldName='directorStudentLoans' />
              </legend>
              <div className='grid grid-cols-2 gap-2'>
                {getAvailableDirectorStudentLoanPlans(CURRENT_TAX_YEAR).map((plan) => {
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
                        {STUDENT_LOAN_PLAN_SHORT_LABELS[plan]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* Pension Contribution */}
            <Field
              label='Employer Pension'
              hint='Reduces taxable profit'
              id={ids.pension}
              tooltipFieldName='directorPension'
            >
              <Input
                id={ids.pension}
                type='text'
                value={formatCurrency(formData.pensionContribution)}
                onChange={(e) => actions.setPensionContribution(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.pension)}
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
                <LabelTooltip fieldName='directorPensionDeducted' />
              </div>
            )}

            {/* Company Car BIK */}
            <Field
              label='Company Car BIK'
              hint='Taxable benefit amount'
              id={ids.carBik}
              tooltipFieldName='directorCompanyCar'
            >
              <Input
                id={ids.carBik}
                type='text'
                value={formatCurrency(formData.companyCarBIK)}
                onChange={(e) => actions.setCompanyCarBIK(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.carBik)}
              />
            </Field>

            {/* Losses Brought Forward */}
            <Field
              label='Losses Brought Forward'
              hint='Trading losses from prior years'
              id={ids.losses}
              tooltipFieldName='directorLosses'
            >
              <Input
                id={ids.losses}
                type='text'
                value={formatCurrency(formData.lossesBroughtForward)}
                onChange={(e) => actions.setLossesBroughtForward(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.losses)}
              />
            </Field>

            {/* Minimum Salary Requirement */}
            <Field
              label='Minimum Salary'
              hint='Floor for mortgage or visa applications'
              id={ids.minSalary}
              tooltipFieldName='directorMinimumSalary'
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
                aria-describedby={getHintId(ids.minSalary)}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Section: Compare My Setup */}
      <Section title='Compare My Setup'>
        <p className='mb-3 text-slate-500 text-xs'>
          Enter your current salary and dividends to see how it compares to the baseline mix.
        </p>
        <Field
          label='Your Current Salary'
          hint='Annual gross salary'
          id={ids.yourSalary}
          tooltipFieldName='directorYourSalary'
        >
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
            aria-describedby={getHintId(ids.yourSalary)}
          />
        </Field>
        <Field
          label='Your Current Dividends'
          hint='Annual dividends'
          id={ids.yourDividends}
          tooltipFieldName='directorYourDividends'
        >
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
            aria-describedby={getHintId(ids.yourDividends)}
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
  tooltipFieldName,
  children,
}: {
  label: string;
  hint?: string;
  id?: string;
  tooltipFieldName?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? getHintId(id) : undefined;

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center gap-2'>
        <Label htmlFor={id} className='text-slate-400 text-sm'>
          {label}
        </Label>
        {tooltipFieldName && <LabelTooltip fieldName={tooltipFieldName} />}
      </div>
      {children}
      {hint && (
        <p id={hintId} className='text-slate-600 text-xs'>
          {hint}
        </p>
      )}
    </div>
  );
}
