// src/store/__tests__/calculatorStore.test.ts

import { useCalculatorStore } from '../calculatorStore';

// Mock the tax calculator function
jest.mock('@/lib/taxCalculator', () => ({
  calculateTax: jest.fn().mockReturnValue({
    grossSalary: {
      annually: 50000,
      monthly: 4166.67,
      weekly: 961.54,
    },
    incomeTax: {
      annually: 7486,
      monthly: 623.83,
      weekly: 143.96,
    },
    nationalInsurance: {
      annually: 4464,
      monthly: 372,
      weekly: 85.85,
    },
    studentLoan: {
      annually: 0,
      monthly: 0,
      weekly: 0,
    },
    pensionContribution: {
      annually: 0,
      monthly: 0,
      weekly: 0,
    },
    totalDeductions: {
      annually: 11950,
      monthly: 995.83,
      weekly: 229.81,
    },
    netPay: {
      annually: 38050,
      monthly: 3170.83,
      weekly: 731.73,
    },
  }),
}));

describe('CalculatorStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCalculatorStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const state = useCalculatorStore.getState();

      expect(state.input.salary).toBe(0);
      expect(state.input.payPeriod).toBe('annually');
      expect(state.input.taxCode).toBe(''); // Empty by default - uses standard allowance
      expect(state.input.isScottish).toBe(false);
      expect(state.results).toBeNull();
    });

    it('should NOT auto-calculate on init', () => {
      const { init } = useCalculatorStore.getState();

      // Call init (simulates page load)
      init();

      const state = useCalculatorStore.getState();
      // Results should still be null - no auto-calculation
      expect(state.results).toBeNull();
      expect(state.previousYearResults).toBeNull();
      expect(state.whatIfResults).toBeNull();
    });

    it('should have empty results state after init', () => {
      const { init } = useCalculatorStore.getState();

      init();

      const state = useCalculatorStore.getState();
      expect(state.results).toBeNull();
      expect(state.previousYearResults).toBeNull();
    });
  });

  it('should update salary', () => {
    const { setSalary } = useCalculatorStore.getState();

    setSalary(50000);

    const state = useCalculatorStore.getState();
    expect(state.input.salary).toBe(50000);
  });

  it('should update pay period', () => {
    const { setPayPeriod } = useCalculatorStore.getState();

    setPayPeriod('monthly');

    const state = useCalculatorStore.getState();
    expect(state.input.payPeriod).toBe('monthly');
  });

  it('should update tax code', () => {
    const { setTaxCode } = useCalculatorStore.getState();

    setTaxCode('1250L');

    const state = useCalculatorStore.getState();
    expect(state.input.taxCode).toBe('1250L');
  });

  it('should calculate tax when calculate is called', () => {
    const { setSalary, calculate } = useCalculatorStore.getState();

    setSalary(50000);
    calculate();

    const state = useCalculatorStore.getState();
    expect(state.results).not.toBeNull();
    expect(state.results?.grossSalary.annually).toBe(50000);
  });

  describe('Reset Functionality', () => {
    it('should reset state to defaults', () => {
      const { setSalary, setTaxCode, reset } = useCalculatorStore.getState();

      // Set some values
      setSalary(50000);
      setTaxCode('1250L');

      // Reset
      reset();

      const state = useCalculatorStore.getState();
      expect(state.input.salary).toBe(0);
      expect(state.input.taxCode).toBe(''); // Empty by default - uses standard allowance
      expect(state.results).toBeNull();
    });

    it('should match initial state after reset', () => {
      const { setSalary, setTaxCode, calculate, reset } = useCalculatorStore.getState();

      // Capture initial state
      const initialState = useCalculatorStore.getState();

      // Make changes
      setSalary(50000);
      setTaxCode('1250L');
      calculate();

      // Reset
      reset();

      // State after reset should match initial state
      const resetState = useCalculatorStore.getState();
      expect(resetState.input).toEqual(initialState.input);
      expect(resetState.results).toBe(null);
      expect(resetState.previousYearResults).toBe(null);
      expect(resetState.whatIfResults).toBe(null);
    });

    it('should clear all calculated results on reset', () => {
      const { setSalary, calculate, calculatePreviousYear, reset } = useCalculatorStore.getState();

      // Set up calculation
      setSalary(50000);
      calculate();
      calculatePreviousYear();

      // Verify results exist
      let state = useCalculatorStore.getState();
      expect(state.results).not.toBeNull();
      expect(state.previousYearResults).not.toBeNull();

      // Reset
      reset();

      // Verify all results are cleared
      state = useCalculatorStore.getState();
      expect(state.results).toBeNull();
      expect(state.previousYearResults).toBeNull();
      expect(state.whatIfResults).toBeNull();
    });

    it('should reset What If scenario state', () => {
      const { toggleWhatIf, setWhatIfValue, reset } = useCalculatorStore.getState();

      // Enable What If and set custom value
      toggleWhatIf();
      setWhatIfValue(15);

      // Reset
      reset();

      const state = useCalculatorStore.getState();
      expect(state.whatIf.enabled).toBe(false);
      expect(state.whatIf.value).toBe(10); // Default value
      expect(state.whatIfResults).toBeNull();
    });
  });
});
