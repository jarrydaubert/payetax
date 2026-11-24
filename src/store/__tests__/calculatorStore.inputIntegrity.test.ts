import { useCalculatorStore } from '../calculatorStore';

describe('MC-03 explicit calculation', () => {
  beforeEach(() => {
    const store = useCalculatorStore.getState();
    store.reset();
    store.setSalary(30000);
    store.calculate();
    store.calculateWhatIf();
    expect(useCalculatorStore.getState().results).not.toBeNull();
    expect(useCalculatorStore.getState().previousYearResults).not.toBeNull();
    expect(useCalculatorStore.getState().whatIfResults).not.toBeNull();
  });

  const edits = {
    salary: () => useCalculatorStore.getState().setSalary(40000),
    period: () => useCalculatorStore.getState().setPayPeriod('monthly'),
    year: () => useCalculatorStore.getState().setTaxYear('2025-2026'),
    region: () => useCalculatorStore.getState().setRegion('Scotland'),
    scottish: () => useCalculatorStore.getState().setIsScottish(true),
    code: () => useCalculatorStore.getState().setTaxCode('BR'),
    marriage: () => useCalculatorStore.getState().setIsMarried(true),
    partner: () => useCalculatorStore.getState().setPartnerGrossWage(10000),
    blind: () => useCalculatorStore.getState().setIsBlind(true),
    statePensionAge: () => useCalculatorStore.getState().setReachedStatePensionAge(true),
    niExempt: () => useCalculatorStore.getState().setPayNoNI(true),
    loans: () => useCalculatorStore.getState().setStudentLoanPlans(['plan2']),
    toggleLoan: () => useCalculatorStore.getState().toggleStudentLoan('plan2'),
    pension: () => useCalculatorStore.getState().setPensionContribution(5),
    pensionMethod: () => useCalculatorStore.getState().setInput({ pensionMethod: 'net-pay' }),
    pensionUnit: () => useCalculatorStore.getState().setPensionContributionType('amount'),
    niCategory: () => useCalculatorStore.getState().setNiCategory('C'),
    hours: () => useCalculatorStore.getState().setHoursPerWeek(20),
    allowances: () => useCalculatorStore.getState().setAllowancesDeductions(100),
    bulkInput: () => useCalculatorStore.getState().setInput({ salary: 40000 }),
    addSource: () => useCalculatorStore.getState().addIncomeSource(),
    updateSource: () => {
      const store = useCalculatorStore.getState();
      store.addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0]?.id;
      if (!id) throw new Error('Missing source');
      store.updateIncomeSource(id, { amount: 1000 });
    },
    removeSource: () => {
      const store = useCalculatorStore.getState();
      store.addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0]?.id;
      if (!id) throw new Error('Missing source');
      store.removeIncomeSource(id);
    },
    invalidDraft: () =>
      useCalculatorStore.getState().setInputError('salary', {
        text: 'abc',
        error: 'Enter a valid amount.',
      }),
  };

  it.each(Object.entries(edits))(
    '%s preserves all submitted results until Calculate',
    (_name, edit) => {
      const submitted = useCalculatorStore.getState();
      edit();
      const draft = useCalculatorStore.getState();
      expect(draft.results).toBe(submitted.results);
      expect(draft.calculatedInput).toBe(submitted.calculatedInput);
      expect(draft.previousYearResults).toBe(submitted.previousYearResults);
      expect(draft.whatIfResults).toBe(submitted.whatIfResults);
      draft.setInputError('salary', null);
      draft.calculate();
      expect(useCalculatorStore.getState().calculatedInput).toBe(draft.input);
      expect(useCalculatorStore.getState().results).not.toBe(submitted.results);
    },
  );

  it('publishes the primary, comparison and scenario in one store update', () => {
    const store = useCalculatorStore.getState();
    store.setInput({ salary: 40000, taxYear: '2025-2026' });
    const updates: number[] = [];
    const unsubscribe = useCalculatorStore.subscribe((state) => {
      expect(state.calculatedInput?.salary).toBe(40000);
      expect(state.results?.grossSalary.annually).toBe(40000);
      expect(state.previousYearResults?.grossSalary.annually).toBe(40000);
      expect(state.whatIfResults).toBeNull();
      updates.push(state.results?.grossSalary.annually ?? 0);
    });
    try {
      store.calculate();
      expect(updates).toEqual([40000]);
    } finally {
      unsubscribe();
    }
  });

  it('rejects an unaffordable net-pay contribution and retains the submitted results', () => {
    const store = useCalculatorStore.getState();
    store.setInput({
      salary: 2000,
      payPeriod: 'monthly',
      pensionMethod: 'net-pay',
      pensionContribution: 100,
    });
    expect(store.calculate()).toMatch(/Reduce the net-pay pension contribution/);
    const state = useCalculatorStore.getState();
    expect(state.input.pensionContribution).toBe(100);
    expect(state.results).toBe(store.results);
    expect(state.previousYearResults).toBe(store.previousYearResults);
    expect(state.whatIfResults).toBe(store.whatIfResults);

    store.setPensionContribution(5);
    expect(store.calculate()).toBeUndefined();
    expect(useCalculatorStore.getState().results?.pensionMethod).toBe('net-pay');
  });

  it('comparison controls reuse the current primary calculation', () => {
    const result = useCalculatorStore.getState().results;
    const store = useCalculatorStore.getState();
    store.setSalary(70000);
    store.setWhatIfType('amount');
    store.setWhatIfValue(5000);
    store.calculateWhatIf();
    expect(useCalculatorStore.getState().results).toBe(result);
    expect(useCalculatorStore.getState().whatIfResults?.grossSalary.annually).toBe(35000);
  });
});
