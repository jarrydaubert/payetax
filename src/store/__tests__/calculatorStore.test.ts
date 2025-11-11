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

  it('should initialize with default values', () => {
    const state = useCalculatorStore.getState();

    expect(state.input.salary).toBe(0);
    expect(state.input.payPeriod).toBe('annually');
    expect(state.input.taxCode).toBe('1257L'); // Uses standard tax code (DEFAULT_TAX_CODE)
    expect(state.input.isScottish).toBe(false);
    expect(state.results).toBeNull();
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

  it('should reset state', () => {
    const { setSalary, setTaxCode, reset } = useCalculatorStore.getState();

    // Set some values
    setSalary(50000);
    setTaxCode('1250L');

    // Reset
    reset();

    const state = useCalculatorStore.getState();
    expect(state.input.salary).toBe(0);
    expect(state.input.taxCode).toBe('1257L'); // Uses standard tax code (DEFAULT_TAX_CODE)
    expect(state.results).toBeNull();
  });

  it('should clear previousYearResults on reset', () => {
    const { setSalary, calculate, calculatePreviousYear, reset } = useCalculatorStore.getState();

    // Set up calculation
    setSalary(50000);
    calculate();
    calculatePreviousYear();

    // Verify both results exist
    let state = useCalculatorStore.getState();
    expect(state.results).not.toBeNull();
    expect(state.previousYearResults).not.toBeNull();

    // Reset
    reset();

    // Verify both are cleared
    state = useCalculatorStore.getState();
    expect(state.results).toBeNull();
    expect(state.previousYearResults).toBeNull();
  });
});
