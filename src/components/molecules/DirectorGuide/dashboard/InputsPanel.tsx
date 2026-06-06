/**
 * Inputs Panel - Left panel with all calculator inputs
 *
 * Based on the Director Intelligence product spec.
 * Organized into: Core Inputs, Your Situation, Advanced Options.
 */
'use client';

import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
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
  'border-border/40 bg-card font-mono text-foreground placeholder:text-muted-foreground focus:border-primary';
const SECTION_HEADING_CLASS =
  'mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-[0.08em]';

const getHintId = (id?: string) => (id ? `${id}-hint` : undefined);
const formatCurrencyInput = (value: number | undefined) =>
  value === undefined ? '' : `£${value.toLocaleString('en-GB')}`;

interface InputsPanelProps {
  onReset?: () => void;
  className?: string;
}

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
  const [quickStartMode, setQuickStartMode] = useState(true);
  const [yourSetupDraftSalary, setYourSetupDraftSalary] = useState('');
  const [yourSetupDraftDividends, setYourSetupDraftDividends] = useState('');

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
    yearEndCustom: formData.yearEndCustom,
    studentLoanPlans: formData.studentLoanPlans,
    pensionContribution: formData.pensionContribution,
    isPensionAlreadyDeducted: formData.isPensionAlreadyDeducted,
    companyCarBIK: formData.companyCarBIK,
    associatedCompaniesCount: formData.associatedCompaniesCount,
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
  const selectedRegion = formData.region ?? '';

  const parseCurrency = (value: string): number => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num) : 0;
  };

  const parseCurrencyOptional = (value: string): number | undefined => {
    const num = value.replace(/[^0-9]/g, '');
    return num ? Number(num) : undefined;
  };

  useEffect(() => {
    setYourSetupDraftSalary(formatCurrencyInput(formData.yourSetupSalary));
    setYourSetupDraftDividends(formatCurrencyInput(formData.yourSetupDividends));
  }, [formData.yourSetupSalary, formData.yourSetupDividends]);

  const draftYourSetupSalary = parseCurrencyOptional(yourSetupDraftSalary);
  const draftYourSetupDividends = parseCurrencyOptional(yourSetupDraftDividends);
  const hasYourSetupDraftChanges =
    draftYourSetupSalary !== formData.yourSetupSalary ||
    draftYourSetupDividends !== formData.yourSetupDividends;
  const canClearYourSetup =
    draftYourSetupSalary !== undefined ||
    draftYourSetupDividends !== undefined ||
    formData.yourSetupSalary !== undefined ||
    formData.yourSetupDividends !== undefined;

  const handleApplyYourSetup = () => {
    actions.setYourSetupSalary(draftYourSetupSalary);
    actions.setYourSetupDividends(draftYourSetupDividends);
  };

  const handleResetYourSetupDraft = () => {
    setYourSetupDraftSalary(formatCurrencyInput(formData.yourSetupSalary));
    setYourSetupDraftDividends(formatCurrencyInput(formData.yourSetupDividends));
  };

  const handleClearYourSetup = () => {
    setYourSetupDraftSalary('');
    setYourSetupDraftDividends('');
    actions.setYourSetupSalary(undefined);
    actions.setYourSetupDividends(undefined);
  };

  const hiddenDetailLabels = [
    formData.ytdSalary > 0 ? 'YTD salary' : null,
    formData.ytdDividends > 0 ? 'YTD dividends' : null,
    formData.ytdDrawings > 0 ? 'other drawings' : null,
    formData.otherIncome > 0 ? 'other income' : null,
    formData.hasOtherPAYEEmployment ? 'other PAYE employment' : null,
    formData.studentLoanPlans.length > 0 ? 'student loans' : null,
    formData.pensionContribution > 0 ? 'pension' : null,
    formData.companyCarBIK > 0 ? 'company car BIK' : null,
    formData.associatedCompaniesCount !== 1 ? 'associated companies' : null,
    formData.hasEmploymentAllowance ? 'Employment Allowance' : null,
    formData.lossesBroughtForward > 0 ? 'losses brought forward' : null,
    formData.minimumSalaryRequirement !== undefined ? 'minimum salary' : null,
    formData.yourSetupSalary !== undefined || formData.yourSetupDividends !== undefined
      ? 'your setup comparison'
      : null,
  ].filter((label): label is string => Boolean(label));
  const hasHiddenDetails = quickStartMode && hiddenDetailLabels.length > 0;
  const hiddenDetailSummary = hiddenDetailLabels.slice(0, 3).join(', ');

  const handleReviewHiddenDetails = () => {
    setQuickStartMode(false);
    setAdvancedOpen(true);
  };

  const handleClearHiddenDetails = () => {
    actions.setYtdSalary(0);
    actions.setYtdDividends(0);
    actions.setYtdDrawings(0);
    actions.setOtherIncome(0);
    actions.setHasOtherPAYEEmployment(false);
    actions.setStudentLoanPlans([]);
    actions.setPensionContribution(0);
    actions.setIsPensionAlreadyDeducted(false);
    actions.setCompanyCarBIK(0);
    actions.setAssociatedCompaniesCount(1);
    actions.setHasEmploymentAllowance(false);
    actions.setLossesBroughtForward(0);
    actions.setMinimumSalaryRequirement(undefined);
    handleClearYourSetup();
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
    yearEndCustom: `${baseId}-year-end-custom`,
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
    associatedCompanies: `${baseId}-associated-companies`,
    losses: `${baseId}-losses`,
    minSalary: `${baseId}-min-salary`,
    yourSalary: `${baseId}-your-salary`,
    yourDividends: `${baseId}-your-dividends`,
  };

  return (
    <aside className={cn('flex h-full flex-col bg-background px-5 py-6', className)}>
      {/* Section: Mode */}
      <Section title='Mode'>
        <fieldset aria-labelledby={ids.mode}>
          <legend id={ids.mode} className='sr-only'>
            Input mode
          </legend>
          <div className='grid grid-cols-2 gap-2 rounded-sm border border-border/40 bg-background p-1'>
            <button
              type='button'
              onClick={() => actions.setMode('annual')}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                !isMonthlyMode
                  ? 'bg-primary/20 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
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
                  ? 'bg-primary/20 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={isMonthlyMode}
            >
              Monthly
            </button>
          </div>
        </fieldset>
      </Section>

      <Section title='Input Path'>
        <fieldset aria-label='Input path'>
          <div className='grid grid-cols-2 gap-2 rounded-sm border border-border/40 bg-background p-1'>
            <button
              type='button'
              onClick={() => setQuickStartMode(true)}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                quickStartMode
                  ? 'bg-primary/20 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={quickStartMode}
            >
              Quick Start
            </button>
            <button
              type='button'
              onClick={() => setQuickStartMode(false)}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                !quickStartMode
                  ? 'bg-primary/20 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={!quickStartMode}
            >
              Full Inputs
            </button>
          </div>
        </fieldset>
        <p className='text-muted-foreground text-xs'>
          Quick Start shows minimum fields first. Full Inputs unlocks YTD, personal, and advanced
          detail.
        </p>
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
                value={formatCurrencyInput(formData.monthlyIncome)}
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
                value={formatCurrencyInput(formData.monthlyExpenses)}
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
                  className='border-border/40 bg-card text-foreground'
                  aria-describedby={getHintId(ids.contractStartMonth)}
                >
                  <SelectValue placeholder='Select month' />
                </SelectTrigger>
                <SelectContent className='border-border bg-card'>
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
                value={formatCurrencyInput(formData.cashInBank)}
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
                value={formatCurrencyInput(formData.minimumMonthlyDraw)}
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
                value={formatCurrencyInput(formData.revenue)}
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
                value={formatCurrencyInput(formData.expenses)}
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
            className='border-border data-[state=checked]:bg-primary'
          />
          <Label htmlFor={ids.includesVat} className='cursor-pointer text-muted-foreground text-sm'>
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
          <Select value={selectedRegion} onValueChange={(v) => actions.setRegion(v as Region)}>
            <SelectTrigger
              id={ids.region}
              data-testid='director-region-select'
              className='border-border/40 bg-card text-foreground'
              aria-describedby={getHintId(ids.region)}
            >
              <SelectValue placeholder='Select region' />
            </SelectTrigger>
            <SelectContent className='border-border bg-card'>
              <SelectItem value='rUK'>England, Wales, or Northern Ireland</SelectItem>
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
            onValueChange={(v) => {
              const yearEndMonth = v as YearEndMonth;
              actions.setYearEndMonth(yearEndMonth);
              if (yearEndMonth !== 'other') {
                actions.setYearEndCustom('');
              }
            }}
          >
            <SelectTrigger
              id={ids.yearEnd}
              className='border-border/40 bg-card text-foreground'
              aria-describedby={getHintId(ids.yearEnd)}
            >
              <SelectValue placeholder='Select year-end' />
            </SelectTrigger>
            <SelectContent className='border-border bg-card'>
              <SelectItem value='03'>31 March</SelectItem>
              <SelectItem value='12'>31 December</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
              <SelectItem value='unknown'>Not sure</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {formData.yearEndMonth === 'other' ? (
          <Field
            label='Custom Year-End Date'
            hint='Use MM-DD, for example 06-30'
            id={ids.yearEndCustom}
            tooltipFieldName='directorYearEnd'
          >
            <Input
              id={ids.yearEndCustom}
              type='text'
              inputMode='numeric'
              value={formData.yearEndCustom}
              onChange={(e) => actions.setYearEndCustom(e.target.value)}
              placeholder='06-30'
              className={INPUT_CLASS}
              aria-describedby={getHintId(ids.yearEndCustom)}
            />
          </Field>
        ) : null}
      </Section>

      {quickStartMode ? (
        <div className='mb-5 rounded-sm border border-primary/20 bg-primary/5 p-4'>
          <p className='text-primary text-xs'>
            You can calculate with just company inputs + region. Add more detail any time for better
            accuracy.
          </p>
          <button
            type='button'
            onClick={() => setQuickStartMode(false)}
            className='mt-3 whitespace-nowrap rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary text-xs transition-colors hover:bg-primary/20'
          >
            Add More Detail
          </button>
          {hasHiddenDetails ? (
            <div className='mt-4 border-primary/20 border-t pt-4'>
              <p className='text-primary text-xs'>
                Saved detailed inputs are still active while hidden:{' '}
                <span className='font-medium'>
                  {hiddenDetailSummary}
                  {hiddenDetailLabels.length > 3 ? ` +${hiddenDetailLabels.length - 3} more` : ''}
                </span>
                .
              </p>
              <div className='mt-3 grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={handleReviewHiddenDetails}
                  className='rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary text-xs transition-colors hover:bg-primary/20'
                >
                  Review Details
                </button>
                <button
                  type='button'
                  onClick={handleClearHiddenDetails}
                  className='rounded-md border border-border/60 bg-background px-3 py-2 text-muted-foreground text-xs transition-colors hover:border-primary/40 hover:text-primary'
                >
                  Clear Details
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!quickStartMode ? (
        <>
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
                value={formatCurrencyInput(formData.ytdSalary)}
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
                value={formatCurrencyInput(formData.ytdDividends)}
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
                value={formatCurrencyInput(formData.ytdDrawings)}
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
                value={formatCurrencyInput(formData.otherIncome)}
                onChange={(e) => actions.setOtherIncome(parseCurrency(e.target.value))}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.otherIncome)}
              />
            </Field>

            {/* Other PAYE Employment */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Label htmlFor={ids.otherPaye} className='text-muted-foreground text-sm'>
                  Other PAYE employment?
                </Label>
                <LabelTooltip fieldName='directorOtherPAYE' />
              </div>
              <Switch
                id={ids.otherPaye}
                checked={formData.hasOtherPAYEEmployment}
                onCheckedChange={actions.setHasOtherPAYEEmployment}
                className='data-[state=checked]:bg-primary'
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
              className='flex w-full items-center justify-between rounded-sm border border-border/40 bg-card px-4 py-3 text-left text-muted-foreground text-sm transition-colors hover:border-border/40 hover:bg-accent/30'
            >
              <span className='font-medium'>Advanced Options</span>
              {advancedOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
            </button>

            {advancedOpen && (
              <div
                id={ids.advancedPanel}
                className='mt-3 space-y-4 rounded-sm border border-border/40 bg-background p-4'
              >
                {/* Employment Allowance */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Label
                      htmlFor={ids.employmentAllowance}
                      className='text-muted-foreground text-sm'
                    >
                      Employment Allowance
                    </Label>
                    <LabelTooltip fieldName='directorEmploymentAllowance' />
                  </div>
                  <Switch
                    id={ids.employmentAllowance}
                    checked={formData.hasEmploymentAllowance}
                    onCheckedChange={actions.setHasEmploymentAllowance}
                    className='data-[state=checked]:bg-primary'
                  />
                </div>

                {/* Student Loans */}
                <fieldset className='space-y-2'>
                  <legend className='flex items-center gap-2 text-muted-foreground text-sm'>
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
                            className='border-border data-[state=checked]:bg-primary'
                          />
                          <Label
                            htmlFor={checkboxId}
                            className='cursor-pointer text-muted-foreground text-xs'
                          >
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
                    value={formatCurrencyInput(formData.pensionContribution)}
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
                      className='border-border data-[state=checked]:bg-primary'
                    />
                    <Label
                      htmlFor={ids.pensionDeducted}
                      className='cursor-pointer text-muted-foreground text-sm'
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
                    value={formatCurrencyInput(formData.companyCarBIK)}
                    onChange={(e) => actions.setCompanyCarBIK(parseCurrency(e.target.value))}
                    placeholder='£0'
                    className={INPUT_CLASS}
                    aria-describedby={getHintId(ids.carBik)}
                  />
                </Field>

                <Field
                  label='Associated Companies'
                  hint='Total associated companies including this one (affects CT thresholds)'
                  id={ids.associatedCompanies}
                >
                  <Input
                    id={ids.associatedCompanies}
                    type='number'
                    min={1}
                    max={50}
                    value={String(formData.associatedCompaniesCount)}
                    onChange={(e) => actions.setAssociatedCompaniesCount(Number(e.target.value))}
                    placeholder='1'
                    className={INPUT_CLASS}
                    aria-describedby={getHintId(ids.associatedCompanies)}
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
                    value={formatCurrencyInput(formData.lossesBroughtForward)}
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
                    value={formatCurrencyInput(formData.minimumSalaryRequirement)}
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
            <p className='mb-3 text-muted-foreground text-xs'>
              Edit values first, then apply. Your setup is only compared when you click Apply.
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
                value={yourSetupDraftSalary}
                onChange={(e) => {
                  const value = parseCurrencyOptional(e.target.value);
                  setYourSetupDraftSalary(value === undefined ? '' : formatCurrencyInput(value));
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
                value={yourSetupDraftDividends}
                onChange={(e) => {
                  const value = parseCurrencyOptional(e.target.value);
                  setYourSetupDraftDividends(value === undefined ? '' : formatCurrencyInput(value));
                }}
                placeholder='£0'
                className={INPUT_CLASS}
                aria-describedby={getHintId(ids.yourDividends)}
              />
            </Field>
            <div className='space-y-2 pt-1'>
              <div className='grid grid-cols-3 gap-2'>
                <button
                  type='button'
                  onClick={handleApplyYourSetup}
                  disabled={!hasYourSetupDraftChanges}
                  className={cn(
                    'rounded-md px-3 py-2 text-xs transition-colors',
                    hasYourSetupDraftChanges
                      ? 'bg-primary/20 font-medium text-primary hover:bg-primary/30'
                      : 'cursor-not-allowed bg-card text-muted-foreground',
                  )}
                >
                  Apply
                </button>
                <button
                  type='button'
                  onClick={handleResetYourSetupDraft}
                  disabled={!hasYourSetupDraftChanges}
                  className={cn(
                    'rounded-md border border-border/40 px-3 py-2 text-xs transition-colors',
                    hasYourSetupDraftChanges
                      ? 'text-foreground/90 hover:border-border/70 hover:bg-card'
                      : 'cursor-not-allowed text-muted-foreground',
                  )}
                >
                  Reset Draft
                </button>
                <button
                  type='button'
                  onClick={handleClearYourSetup}
                  disabled={!canClearYourSetup}
                  className={cn(
                    'rounded-md border border-border/40 px-3 py-2 text-xs transition-colors',
                    canClearYourSetup
                      ? 'text-foreground/90 hover:border-border/70 hover:bg-card'
                      : 'cursor-not-allowed text-muted-foreground',
                  )}
                >
                  Clear
                </button>
              </div>
              <p className='text-muted-foreground/80 text-xs'>
                Applied setup:{' '}
                <span className='text-muted-foreground'>
                  Salary {formatCurrencyInput(formData.yourSetupSalary) || 'Not set'} / Dividends{' '}
                  {formatCurrencyInput(formData.yourSetupDividends) || 'Not set'}
                </span>
              </p>
            </div>
          </Section>
        </>
      ) : null}

      {/* Spacer */}
      <div className='flex-1' />

      {/* Reset Button */}
      <div className='mt-6'>
        <button
          type='button'
          onClick={handleReset}
          className='flex w-full items-center gap-3 rounded-sm border border-border/40 bg-card px-3 py-2 text-left text-muted-foreground text-sm transition-colors hover:border-border/40 hover:bg-accent/30 hover:text-foreground'
        >
          <RotateCcw className='size-4 text-primary' />
          <span className='flex-1'>Reset</span>
        </button>
      </div>
    </aside>
  );
}

/* Helper Components */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='mb-6 rounded-sm border border-border/50 bg-card p-4'>
      <h3 className={SECTION_HEADING_CLASS}>{title}</h3>
      <div className='space-y-4'>{children}</div>
    </section>
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
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Label htmlFor={id} className='text-muted-foreground text-sm leading-none'>
          {label}
        </Label>
        {tooltipFieldName && <LabelTooltip fieldName={tooltipFieldName} />}
      </div>
      {children}
      {hint && (
        <p id={hintId} className='text-muted-foreground/80 text-xs leading-relaxed'>
          {hint}
        </p>
      )}
    </div>
  );
}
