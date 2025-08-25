// src/store/__tests__/calculatorStore.test.ts

import { useCalculatorStore } from '../calculatorStore';

// Mock the tax calculator function
jest.mock('@/lib/taxCalculator', () => ({
  calculateTax: jest.fn().mockReturnValue({
    grossSalary: 50000,
    incomeTax: 7486,
    nationalInsurance: 4464,
    studentLoan: 0,
    pensionContribution: 0,
    totalDeductions: 11950,
    netSalary: 38050,
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
    expect(state.input.taxCode).toBe('1257L');
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
    expect(state.results?.grossSalary).toBe(50000);
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
    expect(state.input.taxCode).toBe('1257L');
    expect(state.results).toBeNull();
  });
});
