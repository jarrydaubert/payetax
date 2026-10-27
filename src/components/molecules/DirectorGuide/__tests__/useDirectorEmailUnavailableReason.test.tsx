import { act, renderHook } from '@testing-library/react';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/lib/tax';
import { type DirectorFormData, useDirectorGuideStore } from '@/store/directorGuideStore';
import { useDirectorEmailUnavailableReason } from '../useDirectorEmailUnavailableReason';

function calculateCurrent() {
  const state = useDirectorGuideStore.getState();
  state.calculate();
  const comparison = useDirectorGuideStore.getState().strategyComparison;
  if (!comparison) throw new Error('Expected a valid comparison');
  state.setSelectedStrategy(comparison.recommended);
  return comparison;
}

describe('Director email interim guard', () => {
  beforeEach(() => {
    useDirectorGuideStore.getState().clearStaleState();
    const state = useDirectorGuideStore.getState();
    state.setRegion('rUK');
    state.setRevenue(100000);
    state.setExpenses(20000);
  });

  it('allows the recommended scenario, including the automatically initialized salary', () => {
    const comparison = calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    expect(result.current).toBeNull();
    act(() =>
      useDirectorGuideStore
        .getState()
        .setSliderSalary(comparison.strategies[comparison.recommended].salary),
    );
    expect(result.current).toBeNull();
  });

  it.each([
    ['salary', () => useDirectorGuideStore.getState().setSliderSalary(20000), /what-if salary/],
    [
      'profit',
      () => useDirectorGuideStore.getState().setProfitWhatIfPercent(10),
      /what-if company profit/,
    ],
    [
      'strategy',
      () => useDirectorGuideStore.getState().setSelectedStrategy('allSalary'),
      /recommended strategy/,
    ],
    [
      'objective',
      () => useDirectorGuideStore.getState().setObjective('minimizeNI'),
      /selected objective/,
    ],
  ] as const)('blocks a divergent %s and recovers after reset', (_name, change, reason) => {
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    act(change);
    expect(result.current).toMatch(reason);
    act(() => {
      const state = useDirectorGuideStore.getState();
      state.setProfitWhatIfPercent(0);
      state.setObjective('maximizeTakeHome');
      state.setSelectedStrategy(state.strategyComparison?.recommended ?? 'optimalMix');
    });
    expect(result.current).toBeNull();
  });

  it.each([
    ['revenue', () => useDirectorGuideStore.getState().setRevenue(110000)],
    ['expenses', () => useDirectorGuideStore.getState().setExpenses(25000)],
    ['other income', () => useDirectorGuideStore.getState().setOtherIncome(5000)],
    ['pension', () => useDirectorGuideStore.getState().setPensionContribution(5000)],
    ['YTD drawings', () => useDirectorGuideStore.getState().setYtdDrawings(1000)],
    ['year end', () => useDirectorGuideStore.getState().setYearEndMonth('12')],
  ] as const)('pauses immediately when %s changes until calculation completes', (_name, change) => {
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    act(change);
    expect(result.current).toMatch(/results have updated/);
    act(() => {
      calculateCurrent();
    });
    expect(result.current).toBeNull();
  });

  it('blocks invalid amounts even before the dashboard clears the comparison', () => {
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    act(() =>
      useDirectorGuideStore
        .getState()
        .setInputError('expenses', { text: 'bad', error: 'Invalid amount' }),
    );
    expect(result.current).toMatch(/valid inputs/);
  });

  it('keeps email available when an edit parses to the same numeric value', () => {
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    const calculated = useDirectorGuideStore.getState().calculatedFormData;
    act(() => useDirectorGuideStore.getState().setRevenue(100000));
    expect(useDirectorGuideStore.getState().formData).not.toBe(calculated);
    expect(result.current).toBeNull();
    act(() => useDirectorGuideStore.getState().setExpenses(20000));
    expect(result.current).toBeNull();
  });

  it.each([
    { pensionContribution: 6000 },
    { studentLoanPlans: ['plan2', 'postgrad'] },
    { companyCarBIK: 5000 },
    { lossesBroughtForward: 10000 },
    { minimumSalaryRequirement: 20000 },
    { revenue: 30000 },
    { otherIncome: 20000 },
    { region: 'scotland' },
  ] satisfies Partial<DirectorFormData>[])('allows a matching baseline salary with advanced inputs %j', (fields) => {
    const state = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({ formData: { ...state.formData, ...fields } });
    const comparison = calculateCurrent();
    state.setSliderSalary(comparison.strategies[comparison.recommended].salary);
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    expect(result.current).toBeNull();
  });

  it.each([
    { revenue: 500000, expenses: 0 },
    { hasEmploymentAllowance: true },
  ] satisfies Partial<DirectorFormData>[])('fails closed when All Salary is recommended but salary controls produce another result %j', (fields) => {
    const state = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({ formData: { ...state.formData, ...fields } });
    const comparison = calculateCurrent();
    expect(comparison.recommended).toBe('allSalary');
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    expect(result.current).toBeNull();
    act(() => state.setSelectedStrategy('optimalMix'));
    expect(result.current).toMatch(/unavailable for this setup/);
    act(() => {
      state.setSelectedStrategy('allSalary');
      state.setSliderSalary(
        Math.min(
          TAX_RATES[CURRENT_TAX_YEAR].nationalInsurance.employee.A.upper.threshold,
          comparison.strategies.allSalary.salary,
        ),
      );
    });
    expect(result.current).toMatch(/unavailable for this setup/);
    act(() => state.setSliderSalary(null));
    expect(result.current).toBeNull();
  });

  it('blocks monthly projections because the email cannot reproduce the cash-aware draw', () => {
    const state = useDirectorGuideStore.getState();
    state.setMonthlyIncome(10000);
    state.setMonthlyExpenses(2000);
    state.setMode('monthly');
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    expect(result.current).toMatch(/cash-aware monthly draw/);
    act(() => {
      state.setMode('annual');
      calculateCurrent();
    });
    expect(result.current).toBeNull();
  });

  it('blocks survival results and failed calculations', () => {
    useDirectorGuideStore.getState().setRevenue(10000);
    calculateCurrent();
    const { result } = renderHook(useDirectorEmailUnavailableReason);
    expect(result.current).toMatch(/survival plan/);
    act(() => {
      const state = useDirectorGuideStore.getState();
      state.setObjective('minimizeNI');
      state.setProfitWhatIfPercent(10);
    });
    expect(result.current).toMatch(/survival plan/);
    act(() => useDirectorGuideStore.setState({ error: 'Calculation failed' }));
    expect(result.current).toMatch(/results have updated/);
  });

  it('does not persist the calculation reference or objective', () => {
    calculateCurrent();
    useDirectorGuideStore.getState().setObjective('minimizeNI');
    const saved = JSON.parse(localStorage.getItem('director-guide-storage') ?? '{}').state;
    expect(saved).not.toHaveProperty('calculatedFormData');
    expect(saved).not.toHaveProperty('objective');
    useDirectorGuideStore.getState().clearStaleState();
    expect(useDirectorGuideStore.getState().calculatedFormData).toBeNull();
    expect(useDirectorGuideStore.getState().objective).toBe('maximizeTakeHome');
  });
});
