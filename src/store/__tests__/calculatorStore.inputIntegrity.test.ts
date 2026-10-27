import { useCalculatorStore } from '../calculatorStore';

describe('MC-03 explicit calculation', () => {
  beforeEach(() => {
    const store = useCalculatorStore.getState();
    store.reset();
    store.setSalary(30000);
    store.calculate();
    store.calculatePreviousYear();
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
    age: () => useCalculatorStore.getState().setAge(67),
    niExempt: () => useCalculatorStore.getState().setPayNoNI(true),
    loans: () => useCalculatorStore.getState().setStudentLoanPlans(['plan2']),
    toggleLoan: () => useCalculatorStore.getState().toggleStudentLoan('plan2'),
    pension: () => useCalculatorStore.getState().setPensionContribution(5),
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
      store.calculate();
      store.calculatePreviousYear();
      store.calculateWhatIf();
      store.updateIncomeSource(id, { amount: 1000 });
    },
    removeSource: () => {
      const store = useCalculatorStore.getState();
      store.addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0]?.id;
      if (!id) throw new Error('Missing source');
      store.calculate();
      store.calculatePreviousYear();
      store.calculateWhatIf();
      store.removeIncomeSource(id);
    },
    validDraft: () => useCalculatorStore.getState().invalidateResults(),
    invalidDraft: () =>
      useCalculatorStore.getState().setInputError('salary', {
        text: 'abc',
        error: 'Enter a valid amount.',
      }),
  };

  it.each(Object.entries(edits))('%s invalidates every variant until Calculate', (_name, edit) => {
    edit();
    const store = useCalculatorStore.getState();
    expect(store.results).toBeNull();
    expect(store.previousYearResults).toBeNull();
    expect(store.whatIfResults).toBeNull();
    // Neither a comparison toggle nor a stale comparison callback can bypass Calculate.
    store.toggleWhatIf();
    store.calculateWhatIf();
    store.calculatePreviousYear();
    expect(useCalculatorStore.getState().results).toBeNull();
    expect(useCalculatorStore.getState().previousYearResults).toBeNull();
    expect(useCalculatorStore.getState().whatIfResults).toBeNull();
    store.setInputError('salary', null);
    store.calculate();
    expect(useCalculatorStore.getState().results).not.toBeNull();
  });

  it('comparison controls reuse the current primary calculation', () => {
    const result = useCalculatorStore.getState().results;
    const store = useCalculatorStore.getState();
    store.setWhatIfType('amount');
    store.setWhatIfValue(5000);
    store.calculateWhatIf();
    store.calculatePreviousYear();
    expect(useCalculatorStore.getState().results).toBe(result);
    expect(useCalculatorStore.getState().whatIfResults?.grossSalary.annually).toBe(35000);
  });
});
