import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { useDirectorEmailUnavailableReason } from '@/components/molecules/DirectorGuide/useDirectorEmailUnavailableReason';
import { DirectorDashboard } from '@/components/organisms/DirectorGuide/DirectorDashboard';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { formatCurrency } from '@/lib/utils';
import {
  type DirectorEmailInput,
  SendDirectorResultsRequestSchema,
} from '@/lib/validation/emailValidation';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { DIRECTOR_EMAIL_AUDIT_CASES } from '@/test/directorEmailAuditCases';
import { type OutboundEmailMessage, sendOutboundEmail } from '../emailDelivery';
import { sendDirectorResultsEmail } from '../outboundResultsDelivery';

jest.mock('../emailDelivery', () => ({
  sendOutboundEmail: jest.fn().mockResolvedValue({ ok: true }),
}));
jest.mock('@/lib/directorGuideAnalytics', () => ({
  trackGuideStarted: jest.fn(),
  trackResultsShown: jest.fn(),
  trackCalculationRun: jest.fn(),
  trackModeChanged: jest.fn(),
  trackSafeDrawCalculated: jest.fn(),
}));

// Keep dashboard payload assembly and real display hooks; omit layout/interactive children.
jest.mock('@/components/molecules/DirectorGuide/calculator', () => ({
  KeyDates: () => null,
  PensionGapWarning: () => null,
  SalarySlider: () => null,
  StrategyComparisonTable: () => null,
  TaxPots: () => null,
}));
jest.mock('@/components/molecules/DirectorGuide/dashboard', () => ({
  DashboardLayout: ({ main }: { main: ReactNode }) => <>{main}</>,
  DetailCards: () => null,
  EducationPanel: () => null,
  InputsPanel: () => null,
  MoneyFlowChart: () => null,
  RecommendationHero: () => null,
  SidebarNav: () => null,
  SummaryCards: () => null,
  SurvivalModePanel: () => null,
}));
let mockEmailInput: DirectorEmailInput | null;
jest.mock('@/components/molecules/DirectorGuide/EmailResultsDialog', () => ({
  EmailResultsDialog: ({ emailInput }: { emailInput: DirectorEmailInput | null }) => {
    mockEmailInput = emailInput;
    return null;
  },
}));

function row(html: string, label: string): string | undefined {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('tr')]
    .find((tr) => tr.cells[0]?.textContent?.trim() === label)
    ?.cells[1]?.textContent?.trim();
}

describe('Director display → email payload → server → HTML/text audit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDirectorGuideStore.getState().clearStaleState();
    mockEmailInput = null;
  });

  it.each(
    DIRECTOR_EMAIL_AUDIT_CASES,
  )('$id preserves the actual payload and characterises export parity', async (sample) => {
    const state = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      formData: {
        ...state.formData,
        region: 'rUK',
        revenue: 100000,
        expenses: 20000,
        ...sample.form,
      },
    });
    state.calculate();
    const comparison = useDirectorGuideStore.getState().strategyComparison;
    if (!comparison) throw new Error('Expected audit comparison');
    state.setSelectedStrategy(sample.selectedStrategy ?? 'optimalMix');
    if (comparison.grossProfit > 0) {
      state.setSliderSalary(sample.salary ?? comparison.strategies.optimalMix.salary);
    }
    state.setProfitWhatIfPercent(sample.profitPercent ?? 0);
    state.setObjective(sample.objective ?? 'maximizeTakeHome');
    const { result } = renderHook(() => ({
      display: useActiveDirectorScenario(),
      reason: useDirectorEmailUnavailableReason(),
    }));
    render(<DirectorDashboard />);
    if (!mockEmailInput) throw new Error('Expected dashboard email payload');

    // Exercise JSON transport plus the exact schema used by POST, not a handcrafted email input.
    const request = SendDirectorResultsRequestSchema.parse(
      JSON.parse(
        JSON.stringify({
          email: 'audit@example.com',
          input: mockEmailInput,
          taxYear: CURRENT_TAX_YEAR,
        }),
      ),
    );
    const current = useDirectorGuideStore.getState().formData;
    expect(request.input.region).toBe(current.region);
    expect(request.input.pensionContribution).toBe(
      current.isPensionAlreadyDeducted ? 0 : current.pensionContribution,
    );
    expect(request.input.employmentAllowance).toBe(current.hasEmploymentAllowance);
    expect(request.input.associatedCompaniesCount).toBe(current.associatedCompaniesCount);
    expect(request.input.studentLoanPlans).toEqual(current.studentLoanPlans);
    expect(request.input.ytdDrawings).toBe(current.ytdDrawings);
    expect(request.input.yourSetupSalary).toBe(current.yourSetupSalary);
    expect(request.input).not.toHaveProperty('sliderSalary');
    expect(request.input).not.toHaveProperty('profitWhatIfPercent');
    expect(request.input).not.toHaveProperty('selectedStrategy');
    expect(request.input).not.toHaveProperty('objective');
    expect(request.input).not.toHaveProperty('yearEndCustom');
    if (sample.id === 'monthly') {
      expect(request.input.revenue).toBe(72000);
      expect(request.input.expenses).toBe(12000);
      expect(request.input.cashInBank).toBe(10000);
    } else {
      expect(request.input.revenue).toBe(current.revenue);
      expect(request.input.expenses).toBe(current.expenses);
    }

    expect(result.current.reason !== null).toBe(sample.blocked);
    // For blocked cases this is a counterfactual server inspection, NOT a UI send.
    await expect(sendDirectorResultsEmail(request)).resolves.toEqual({ ok: true });
    const provider = jest.mocked(sendOutboundEmail);
    expect(provider).toHaveBeenCalledTimes(1);
    const message: OutboundEmailMessage = provider.mock.calls[0][0];
    const reported = comparison.strategies[comparison.recommended];
    expect(message.subject).toContain(formatCurrency(reported.takeHome));
    expect(row(message.html, 'Salary')).toBe(formatCurrency(reported.salary));
    expect(row(message.html, 'Dividends')).toBe(formatCurrency(reported.dividends));
    expect(row(message.html, 'Employer pension')).toBe(formatCurrency(reported.pension));
    expect(row(message.html, 'Corporation Tax')).toBe(formatCurrency(reported.corporationTax));
    expect(row(message.html, 'Personal tax')).toBe(formatCurrency(reported.totalPersonalTax));
    expect(row(message.html, 'Take-home pay')).toBe(formatCurrency(reported.takeHome));
    expect(row(message.html, 'Company tax pot')).toBe(
      formatCurrency(reported.corporationTax + reported.employerNI),
    );
    const displayPot = reported.incomeTax + reported.dividendTax + reported.studentLoan;
    expect(row(message.html, 'Personal tax pot')).toBe(formatCurrency(displayPot));
    for (const [label, value] of [
      ['Monthly Take-Home', reported.takeHome / 12],
      ['Annual Take-Home', reported.takeHome],
      ['Total Company Cost', reported.companyCost],
      ['Salary', reported.salary],
      ['Dividends', reported.dividends],
      ['Pension', reported.pension],
      ['Income Tax', reported.incomeTax],
      ['Employee NI', reported.employeeNI],
      ['Dividend Tax', reported.dividendTax],
      ['Student Loan', reported.studentLoan],
      ['Corporation Tax', reported.corporationTax],
      ['Employer NI', reported.employerNI],
    ] as const)
      expect(message.text.split('\n')).toContain(`${label}: ${formatCurrency(value)}`);
    expect(message.html).toContain('2026-27');
    expect(message.text).toContain('2026-27');
    expect(message.html).not.toMatch(/NaN|undefined|Infinity/);
    expect(message.text).not.toMatch(/NaN|undefined|Infinity/);
    if (!sample.blocked) {
      expect(result.current.display.activeScenario).toEqual(
        expect.objectContaining({
          salary: reported.salary,
          dividends: reported.dividends,
          takeHome: reported.takeHome,
          incomeTax: reported.incomeTax,
          employeeNI: reported.employeeNI,
          corporationTax: reported.corporationTax,
        }),
      );
    }
    if (
      sample.id === 'salary-what-if' ||
      sample.id === 'profit-what-if' ||
      sample.id === 'selected-dividends'
    ) {
      expect(result.current.display.activeScenario?.takeHome).not.toBe(reported.takeHome);
    }
    if (sample.id === 'minimum-salary') {
      expect(reported.employeeNI).toBeGreaterThan(0);
      expect(row(message.html, 'Personal tax pot')).not.toBe(
        formatCurrency(reported.totalPersonalTax),
      );
    }
  });
});
