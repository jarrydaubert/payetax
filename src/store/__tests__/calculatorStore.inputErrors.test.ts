import { clearFigures, rememberFigures } from '@/lib/figureStorage';
// src/store/__tests__/calculatorStore.inputErrors.test.ts
import { getBlockingInputErrors, incomeSourceAmountField } from '@/store/calculatorInputErrors';
import { useCalculatorStore } from '@/store/calculatorStore';

const rejected = { text: '-500', error: 'Enter an amount of £0 or more.' };

describe('calculatorStore rejected amount text', () => {
  beforeEach(() => {
    clearFigures();
    rememberFigures();
    useCalculatorStore.getState().reset();
  });

  const calculateFor = (salary: number) => {
    useCalculatorStore.getState().setSalary(salary);
    useCalculatorStore.getState().calculate();
  };

  it('does not persist or reconstruct a submitted result from saved figures', async () => {
    useCalculatorStore.getState().setInputError('salary', rejected);
    useCalculatorStore.getState().calculate();
    expect(useCalculatorStore.getState().calculatedInput).toBeNull();
    useCalculatorStore.getState().setInputError('salary', null);
    calculateFor(30000);
    const saved = JSON.parse(localStorage.getItem('tax-calculator-storage') ?? '{}');
    expect(saved.state).not.toHaveProperty('calculatedInput');
    expect(saved.state).not.toHaveProperty('results');
    useCalculatorStore.getState().reset();
    localStorage.setItem('tax-calculator-storage', JSON.stringify(saved));
    await useCalculatorStore.persist.rehydrate();
    expect(useCalculatorStore.getState().input.salary).toBe(30000);
    expect(useCalculatorStore.getState().calculatedInput).toBeNull();
    expect(useCalculatorStore.getState().results).toBeNull();
  });

  it('refuses to use a draft with rejected text and retains the submitted calculation until recovery', () => {
    calculateFor(30000);
    const submitted = useCalculatorStore.getState();
    submitted.setSalary(40000);
    submitted.setInputError('pensionContribution', rejected);
    expect(submitted.calculate()).toBe(rejected.error);

    const state = useCalculatorStore.getState();
    expect(state.inputErrors.pensionContribution).toEqual(rejected);
    expect(state.results).toBe(submitted.results);
    expect(state.previousYearResults).toBe(submitted.previousYearResults);
    expect(state.calculatedInput?.salary).toBe(30000);
    expect(state.input.salary).toBe(40000);

    state.setInputError('pensionContribution', null);
    state.calculate();
    expect(useCalculatorStore.getState().calculatedInput?.salary).toBe(40000);
    state.reset();
    expect(useCalculatorStore.getState().calculatedInput).toBeNull();
    expect(useCalculatorStore.getState().results).toBeNull();
  });

  it('calculates again once the rejected text is cleared', () => {
    useCalculatorStore.getState().setInputError('salary', rejected);
    useCalculatorStore.getState().setInputError('salary', null);

    calculateFor(30000);

    expect(useCalculatorStore.getState().inputErrors).toEqual({});
    expect(useCalculatorStore.getState().results?.grossSalary.annually).toBe(30000);
  });

  it('drops an income source’s rejected text when that source is removed', () => {
    useCalculatorStore.getState().addIncomeSource();
    const id = useCalculatorStore.getState().input.incomeSources[0]?.id ?? '';
    useCalculatorStore.getState().setInputError(incomeSourceAmountField(id), rejected);

    useCalculatorStore.getState().removeIncomeSource(id);

    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });

  it('discards a rejected partner wage when the partner field stops applying', () => {
    useCalculatorStore.getState().setIsMarried(true);
    useCalculatorStore.getState().setInputError('partnerGrossWage', rejected);

    useCalculatorStore.getState().setIsMarried(false);

    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });

  it('Reset clears all rejected text', () => {
    useCalculatorStore.getState().setInputError('salary', rejected);
    useCalculatorStore.getState().setInputError('allowancesDeductions', rejected);

    useCalculatorStore.getState().reset();

    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });

  it('Reset advances the input revision so fields discard their drafts', () => {
    const before = useCalculatorStore.getState().inputRevision;
    useCalculatorStore.getState().reset();
    expect(useCalculatorStore.getState().inputRevision).toBe(before + 1);
    expect(window.localStorage.getItem('tax-calculator-storage') ?? '').not.toContain(
      'inputRevision',
    );
  });

  it('does not persist rejected text', () => {
    useCalculatorStore.getState().setInputError('salary', rejected);
    const persisted = window.localStorage.getItem('tax-calculator-storage') ?? '';
    expect(persisted).not.toContain('inputErrors');
    expect(persisted).not.toContain(rejected.error);
  });
});

describe('getBlockingInputErrors', () => {
  const input = { isMarried: false, incomeSources: [{ id: 'a' }] };

  it('blocks on fields the calculation uses', () => {
    expect(
      getBlockingInputErrors({
        input,
        inputErrors: { salary: rejected, [incomeSourceAmountField('a')]: rejected },
      }).map(([field]) => field),
    ).toEqual(['salary', 'incomeSource:a']);
  });

  it('ignores a partner wage that does not apply and a removed income source', () => {
    expect(
      getBlockingInputErrors({
        input,
        inputErrors: { partnerGrossWage: rejected, [incomeSourceAmountField('gone')]: rejected },
      }),
    ).toEqual([]);
    expect(
      getBlockingInputErrors({
        input: { ...input, isMarried: true },
        inputErrors: { partnerGrossWage: rejected },
      }),
    ).toHaveLength(1);
  });
});

describe('Pension units and result currency', () => {
  beforeEach(() => useCalculatorStore.getState().reset());

  it.each([
    ['amount', 5000, 'percentage'],
    ['amount', 50, 'percentage'],
    ['percentage', 5, 'amount'],
    ['percentage', 100, 'amount'],
  ] as const)('clears %s %s when switching to %s', (from, value, to) => {
    const store = useCalculatorStore.getState();
    store.setSalary(30000);
    store.setPensionContributionType(from);
    store.setPensionContribution(value);
    store.calculate();
    const submitted = useCalculatorStore.getState();
    store.setPensionContributionType(to);
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(0);
    expect(useCalculatorStore.getState().input.pensionContributionType).toBe(to);
    expect(useCalculatorStore.getState().results).toBe(submitted.results);
    expect(useCalculatorStore.getState().previousYearResults).toBe(submitted.previousYearResults);
  });

  it('retains and reuses results for unchanged values, even if the draft object was replaced', () => {
    const store = useCalculatorStore.getState();
    store.setInput({ salary: 30000, studentLoanPlans: ['plan2'] });
    store.calculate();
    const submitted = useCalculatorStore.getState();
    store.setInput({ salary: 40000 });
    store.setInput({ salary: 30000, studentLoanPlans: ['plan2'] });
    expect(useCalculatorStore.getState().input).not.toBe(submitted.calculatedInput);
    store.calculate({ reuseCurrent: true });
    expect(useCalculatorStore.getState().results).toBe(submitted.results);
  });
});
