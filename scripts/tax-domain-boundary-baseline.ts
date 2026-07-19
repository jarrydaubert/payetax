/**
 * Temporary direct-import debt that predates the supported `@/lib/tax` boundary.
 *
 * Entries are exact: changing the imported bindings or adding another internal
 * import is a new violation. Remove entries as later migration slices move their
 * consumers through the public interface.
 */
const BASELINE_ENTRIES = [
  [
    'scripts/audit-blog-content.ts',
    '../src/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'formatTaxYearDisplay'],
  ],
  [
    'scripts/check-rate-freshness.ts',
    '../src/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'TAX_YEAR_SOURCES'],
  ],
  [
    'src/app/api/og/route.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'formatTaxYearDisplay'],
  ],
  ['src/app/layout.tsx', '@/constants/taxRates', ['CURRENT_TAX_YEAR']],
  [
    'src/app/llms.txt/route.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'formatTaxYearDisplay'],
  ],
  [
    'src/app/tools/marriage-allowance-calculator/MarriageAllowanceClient.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/app/tools/marriage-allowance-calculator/MarriageAllowanceClient.tsx',
    '@/lib/tax/marriageAllowance',
    ['calculateMarriageAllowanceNetSaving'],
  ],
  [
    'src/app/tools/national-insurance-calculator/NICalculatorClient.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:NICategory'],
  ],
  [
    'src/app/tools/tax-code-decoder/TaxCodeDecoderClient.tsx',
    '@/lib/taxCodeDecoder',
    ['decodeTaxCode', 'formatAllowance', 'type:TaxCodeDecoded'],
  ],
  ['src/components/atoms/TaxYearSelect.tsx', '@/constants/taxRates', ['TAX_YEARS', 'type:TaxYear']],
  [
    'src/components/molecules/DirectorGuide/calculator/PensionGapWarning.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/components/molecules/DirectorGuide/calculator/SalarySlider.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx',
    '@/lib/tax/strategyComparison',
    ['type:YourSetupResult'],
  ],
  [
    'src/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR'],
  ],
  [
    'src/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario.ts',
    '@/lib/tax/strategyComparison',
    [
      'calculateSalaryScenario',
      'calculateStrategyComparison',
      'type:SalaryScenarioResult',
      'type:StrategyComparison',
    ],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/DetailCards.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'CURRENT_TAX_YEAR_DISPLAY', 'TAX_RATES'],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx',
    '@/lib/tax/businessThresholds',
    ['DIRECTOR_GUIDE_BUSINESS_THRESHOLDS'],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:StudentLoanPlan'],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx',
    '@/lib/tax/studentLoanPlans',
    ['getAvailableDirectorStudentLoanPlans'],
  ],
  [
    'src/components/molecules/DirectorGuide/dashboard/SurvivalModePanel.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/components/molecules/DirectorGuide/EmailResultsDialog.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR'],
  ],
  [
    'src/components/molecules/DirectorGuide/EmailResultsDialog.tsx',
    '@/lib/tax/strategyComparison',
    ['type:StrategyComparison'],
  ],
  [
    'src/components/molecules/DirectorGuide/inputs/EmploymentAllowanceInput.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR_DISPLAY'],
  ],
  [
    'src/components/molecules/DirectorGuide/inputs/StudentLoanInputs.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:StudentLoanPlan'],
  ],
  [
    'src/components/molecules/DirectorGuide/inputs/StudentLoanInputs.tsx',
    '@/lib/tax/studentLoanPlans',
    ['getAvailableDirectorStudentLoanPlans'],
  ],
  [
    'src/components/molecules/MarriageAllowanceAlert.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'type:TaxYear'],
  ],
  [
    'src/components/molecules/MarriageAllowanceAlert.tsx',
    '@/lib/tax/marriageAllowance',
    ['calculateMarriageAllowanceNetSaving'],
  ],
  ['src/components/molecules/ResultTableRow.tsx', '@/constants/taxRates', ['type:PayPeriod']],
  [
    'src/components/molecules/SalaryComparisonTable.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR'],
  ],
  ['src/components/molecules/SalaryComparisonTable.tsx', '@/lib/taxCalculator', ['calculateTax']],
  [
    'src/components/molecules/SalaryQuickResults.tsx',
    '@/lib/taxCalculator',
    ['type:TaxCalculationResults'],
  ],
  [
    'src/components/molecules/ServerHero.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'formatTaxYearDisplay'],
  ],
  [
    'src/components/molecules/TaxRatesOverview.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'formatTaxYearDisplay'],
  ],
  ['src/components/molecules/TaxRatesOverview.tsx', '@/lib/taxCalculator', ['calculateTax']],
  [
    'src/components/molecules/TaxTrapInlineAlert.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:TaxYear'],
  ],
  [
    'src/components/organisms/CalculatorContent.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  ['src/components/organisms/CalculatorContent.tsx', '@/lib/taxCalculator', ['calculateTax']],
  [
    'src/components/organisms/CalculatorInputs/BasicInputs.tsx',
    '@/constants/taxRates',
    ['PERIODS', 'type:StudentLoanPlan'],
  ],
  [
    'src/components/organisms/CalculatorResults/ResultsSummaryCards.tsx',
    '@/constants/taxRates',
    ['TAX_YEARS', 'type:TaxYear'],
  ],
  [
    'src/components/organisms/CalculatorResults/ResultsTable.tsx',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:TaxYear'],
  ],
  [
    'src/components/organisms/DirectorGuide/DirectorDashboard.tsx',
    '@/lib/tax/variableIncome',
    ['resolveAnnualFinancials'],
  ],
  ['src/components/organisms/IncomeSourceList.tsx', '@/constants/taxRates', ['PERIODS']],
  [
    'src/components/organisms/SalaryComparison/SalaryComparisonSection.tsx',
    '@/lib/taxCalculator',
    ['type:TaxCalculationInput', 'type:TaxCalculationResults'],
  ],
  [
    'src/constants/freshness.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_YEAR_SOURCES', 'formatTaxYearDisplay'],
  ],
  [
    'src/lib/calculatorMarginalTax.ts',
    '@/constants/taxRates',
    ['TAX_RATES', 'TAX_YEARS', 'type:TaxYear'],
  ],
  ['src/lib/calculatorMarginalTax.ts', '@/lib/taxCalculator', ['calculateTax']],
  ['src/lib/calculatorResultsPresenter.ts', '@/constants/taxRates', ['type:PayPeriod']],
  [
    'src/lib/chartUtils.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'SCOTTISH_TAX_RATES', 'TAX_RATES'],
  ],
  ['src/lib/email/directorResultsEmail.ts', '@/constants/taxRates', ['type:TaxYear']],
  [
    'src/lib/email/directorResultsEmail.ts',
    '@/constants/taxRates',
    ['CT_RATES', 'CURRENT_TAX_YEAR', 'TAX_RATES'],
  ],
  [
    'src/lib/email/outboundResultsDelivery.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'type:PayPeriod', 'type:TaxYear'],
  ],
  [
    'src/lib/email/outboundResultsDelivery.ts',
    '@/lib/tax/strategyComparison',
    ['calculateStrategyComparison'],
  ],
  ['src/lib/email/outboundResultsDelivery.ts', '@/lib/taxCalculator', ['calculateTax']],
  ['src/lib/email/payeResultsEmail.ts', '@/lib/taxCalculator', ['type:TaxCalculationResults']],
  ['src/lib/metadata.ts', '@/constants/taxRates', ['CURRENT_TAX_YEAR']],
  [
    'src/lib/pensionOptimizer.ts',
    '@/constants/taxRates',
    ['TAX_RATES', 'TAX_YEARS', 'type:TaxYear'],
  ],
  [
    'src/lib/periodCalculator.ts',
    '@/constants/taxRates',
    ['DEFAULT_HOURS_PER_WEEK', 'PERIODS', 'type:PayPeriod'],
  ],
  ['src/lib/salaryComparison.ts', './taxCalculator', ['calculateTax']],
  [
    'src/lib/taxRateDescriptions.ts',
    '@/constants/taxRates',
    ['CURRENT_TAX_YEAR', 'TAX_RATES', 'type:TaxYear'],
  ],
  [
    'src/lib/types/calculator.ts',
    '@/constants/taxRates',
    ['PERIODS', 'type:NICategory', 'type:PayPeriod', 'type:StudentLoanSelection', 'type:TaxYear'],
  ],
  ['src/lib/validation.ts', '@/constants/taxRates', ['PERIODS', 'TAX_YEARS', 'type:PayPeriod']],
  ['src/lib/validation/atomsValidation.ts', '@/constants/taxRates', ['TAX_YEARS']],
  [
    'src/lib/validation/directorValidation.ts',
    '@/constants/taxRates',
    ['TAX_YEARS', 'type:StudentLoanPlan', 'type:TaxYear'],
  ],
  [
    'src/lib/validation/directorValidation.ts',
    '@/lib/tax/studentLoanPlans',
    ['DIRECTOR_SUPPORTED_STUDENT_LOAN_PLANS', 'getAvailableDirectorStudentLoanPlans'],
  ],
  ['src/lib/validation/directorValidation.ts', '@/lib/tax/warnings', ['DIRECTOR_WARNING_TYPES']],
  ['src/lib/validation/emailValidation.ts', '@/constants/taxRates', ['PERIODS', 'TAX_YEARS']],
  [
    'src/store/calculatorStore.ts',
    '@/constants/taxRates',
    [
      'PERIODS',
      'TAX_RATES',
      'type:NICategory',
      'type:PayPeriod',
      'type:StudentLoanPlan',
      'type:StudentLoanSelection',
      'type:TaxYear',
    ],
  ],
  ['src/store/calculatorStore.ts', '@/lib/taxCalculator', ['calculateTax']],
  ['src/store/directorGuideStore.ts', '@/constants/taxRates', ['type:StudentLoanPlan']],
  [
    'src/store/directorGuideStore.ts',
    '@/lib/tax/directorCalculator',
    ['calculateDirectorScenario'],
  ],
  [
    'src/store/directorGuideStore.ts',
    '@/lib/tax/strategyComparison',
    ['calculateStrategyComparison', 'type:StrategyComparison'],
  ],
  [
    'src/store/directorGuideStore.ts',
    '@/lib/tax/studentLoanPlans',
    ['isDirectorStudentLoanPlanAvailable', 'sanitizeDirectorStudentLoanPlans'],
  ],
  [
    'src/store/directorGuideStore.ts',
    '@/lib/tax/variableIncome',
    ['calculateSafeMonthlyDraw', 'resolveAnnualFinancials', 'type:SafeDrawResult'],
  ],
] as const;

export const TAX_IMPORT_BOUNDARY_BASELINE = BASELINE_ENTRIES.map(([file, specifier, imports]) => ({
  file,
  specifier,
  imports,
}));
