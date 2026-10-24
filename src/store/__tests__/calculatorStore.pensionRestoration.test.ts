import { useCalculatorStore } from '@/store/calculatorStore';

const storageKey = 'tax-calculator-storage';
const percentageError = 'Enter a percentage no more than 100%.';

async function restore(
  pensionContribution: number,
  pensionContributionType: 'percentage' | 'amount' = 'percentage',
  metadata: { _savedAt?: number; _taxYear?: string } = {},
) {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      state: {
        input: { salary: 60000, pensionContribution, pensionContributionType },
        ...metadata,
      },
      version: 0,
    }),
  );
  await useCalculatorStore.persist.rehydrate();
}

describe('Pension restoration integrity', () => {
  beforeEach(() => useCalculatorStore.getState().reset());

  it.each([
    ['percentage', 0],
    ['percentage', 5.25],
    ['percentage', 100],
    ['amount', 5000.25],
    ['amount', 10000000],
  ] as const)('restores valid %s %s without changing the contribution', async (type, value) => {
    await restore(value, type);
    const state = useCalculatorStore.getState();
    expect(state.input.pensionContribution).toBe(value);
    expect(state.input.pensionContributionType).toBe(type);
    expect(state.inputErrors.pensionContribution).toBeUndefined();
    expect(state.results).toBeNull();
    state.calculate();
    expect(useCalculatorStore.getState().results).not.toBeNull();
  });

  it.each([
    ['percentage', 5000, percentageError],
    ['percentage', 100.01, percentageError],
    ['percentage', -5, 'Enter a percentage of 0% or more.'],
    ['percentage', 5.123, 'Enter a percentage with no more than 2 decimal places'],
    ['amount', -5000, 'Enter an amount of £0 or more.'],
    ['amount', 10000000.01, 'Enter an amount no more than'],
  ] as const)('preserves invalid restored %s %s with a blocking field error', async (type, value, error) => {
    await restore(value, type);
    const state = useCalculatorStore.getState();
    expect(state.input.salary).toBe(60000);
    expect(state.input.pensionContribution).toBe(value);
    expect(state.input.pensionContributionType).toBe(type);
    expect(state.inputErrors.pensionContribution?.text).toBe(String(value));
    expect(state.inputErrors.pensionContribution?.error).toContain(error);
    expect(() => {
      state.calculate();
      state.calculatePreviousYear();
      state.toggleWhatIf();
      state.calculateWhatIf();
    }).not.toThrow();
    const blocked = useCalculatorStore.getState();
    expect(blocked.results).toBeNull();
    expect(blocked.previousYearResults).toBeNull();
    expect(blocked.whatIfResults).toBeNull();
  });

  it('rebuilds the legacy error after unrelated edits and another restoration', async () => {
    await restore(5000);
    useCalculatorStore.getState().setSalary(70000);
    await useCalculatorStore.persist.rehydrate();
    const state = useCalculatorStore.getState();
    expect(state.input.salary).toBe(70000);
    expect(state.input.pensionContribution).toBe(5000);
    expect(state.inputErrors.pensionContribution?.error).toBe(percentageError);
    state.calculate();
    expect(useCalculatorStore.getState().results).toBeNull();
  });

  it.each([
    0, 5.25, 100,
  ])('recovers by explicitly correcting the percentage to %s', async (value) => {
    await restore(5000);
    useCalculatorStore.getState().setPensionContribution(value);
    expect(useCalculatorStore.getState().inputErrors.pensionContribution).toBeUndefined();
    expect(useCalculatorStore.getState().results).toBeNull();
    useCalculatorStore.getState().calculate();
    expect(useCalculatorStore.getState().results?.pensionContribution.annually).toBe(value * 600);
    await useCalculatorStore.persist.rehydrate();
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(value);
    expect(useCalculatorStore.getState().inputErrors.pensionContribution).toBeUndefined();
  });

  it('can recover by a deliberate unit switch and re-entry, without clearing storage', async () => {
    await restore(5000);
    const state = useCalculatorStore.getState();
    state.setPensionContributionType('percentage');
    expect(useCalculatorStore.getState().inputErrors.pensionContribution).toBeDefined();
    state.setPensionContributionType('amount');
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(0);
    expect(useCalculatorStore.getState().inputErrors.pensionContribution).toBeUndefined();
    state.setPensionContribution(5000);
    state.calculate();
    expect(useCalculatorStore.getState().results?.pensionContribution.annually).toBe(5000);
    expect(localStorage.getItem(storageKey)).toContain('5000');
  });

  it('keeps the existing expiry policy for a legacy snapshot', async () => {
    await restore(5000, 'percentage', { _savedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 - 1 });
    expect(useCalculatorStore.getState().input.salary).toBe(0);
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(0);
    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });

  it.each([
    5.25, 5000,
  ])('rolls over the tax year without changing saved pension %s', async (value) => {
    const currentYear = useCalculatorStore.getState().input.taxYear;
    const oldYear = currentYear === '2025-2026' ? '2024-2025' : '2025-2026';
    await restore(value, 'percentage', { _savedAt: Date.now(), _taxYear: oldYear });
    expect(useCalculatorStore.getState().input.taxYear).toBe(currentYear);
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(value);
    expect(Boolean(useCalculatorStore.getState().inputErrors.pensionContribution)).toBe(
      value > 100,
    );
  });
});
