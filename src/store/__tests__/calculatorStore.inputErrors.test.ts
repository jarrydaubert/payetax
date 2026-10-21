// src/store/__tests__/calculatorStore.inputErrors.test.ts
import { getBlockingInputErrors, incomeSourceAmountField } from '@/store/calculatorInputErrors';
import { useCalculatorStore } from '@/store/calculatorStore';

const rejected = { text: '-500', error: 'Enter an amount of £0 or more.' };

describe('calculatorStore rejected amount text', () => {
  beforeEach(() => {
    useCalculatorStore.getState().reset();
  });

  const calculateFor = (salary: number) => {
    useCalculatorStore.getState().setSalary(salary);
    useCalculatorStore.getState().calculate();
    useCalculatorStore.getState().calculatePreviousYear();
  };

  it('clears every result when a field holds rejected text', () => {
    calculateFor(30000);
    expect(useCalculatorStore.getState().results).not.toBeNull();

    useCalculatorStore.getState().setInputError('salary', rejected);

    const state = useCalculatorStore.getState();
    expect(state.inputErrors.salary).toEqual(rejected);
    expect(state.results).toBeNull();
    expect(state.previousYearResults).toBeNull();
    expect(state.whatIfResults).toBeNull();
    // The previously committed amount is kept, not replaced by another amount.
    expect(state.input.salary).toBe(30000);
  });

  it('refuses to calculate from the previous amount while rejected text is held', () => {
    calculateFor(30000);
    useCalculatorStore.getState().setInputError('pensionContribution', rejected);

    useCalculatorStore.getState().calculate();
    useCalculatorStore.getState().calculatePreviousYear();

    expect(useCalculatorStore.getState().results).toBeNull();
    expect(useCalculatorStore.getState().previousYearResults).toBeNull();
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
