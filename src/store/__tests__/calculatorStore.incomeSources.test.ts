// src/store/__tests__/calculatorStore.incomeSources.test.ts

import { useCalculatorStore } from '../calculatorStore';

// Mock the tax calculator function
jest.mock('@/lib/taxCalculator', () => ({
  calculateTax: jest.fn().mockReturnValue({
    grossSalary: { annually: 50000, monthly: 4166.67, weekly: 961.54 },
    incomeTax: { annually: 7486, monthly: 623.83, weekly: 143.96 },
    nationalInsurance: { annually: 4464, monthly: 372, weekly: 85.85 },
    studentLoan: { annually: 0, monthly: 0, weekly: 0 },
    pensionContribution: { annually: 0, monthly: 0, weekly: 0 },
    totalDeductions: { annually: 11950, monthly: 995.83, weekly: 229.81 },
    netPay: { annually: 38050, monthly: 3170.83, weekly: 731.73 },
  }),
}));

describe('CalculatorStore - Income Sources Management', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCalculatorStore.getState().reset();
  });

  describe('addIncomeSource', () => {
    it('should add a new income source with default values', () => {
      const { addIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(1);
      expect(state.input.incomeSources[0]).toMatchObject({
        type: 'pension',
        amount: 0,
        period: 'annually',
      });
      expect(state.input.incomeSources[0].id).toBeDefined();
    });

    it('should add multiple income sources', () => {
      const { addIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      addIncomeSource();
      addIncomeSource();

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(3);

      // Each should have unique ID
      const ids = state.input.incomeSources.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should generate unique IDs for each income source', () => {
      const { addIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      addIncomeSource();

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0].id).not.toBe(state.input.incomeSources[1].id);
    });
  });

  describe('updateIncomeSource', () => {
    it('should update income source type', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0].id;

      updateIncomeSource(id, { type: 'rental' });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0].type).toBe('rental');
    });

    it('should update income source amount', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0].id;

      updateIncomeSource(id, { amount: 5000 });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0].amount).toBe(5000);
    });

    it('should update income source period', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0].id;

      updateIncomeSource(id, { period: 'monthly' });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0].period).toBe('monthly');
    });

    it('should update multiple properties at once', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0].id;

      updateIncomeSource(id, {
        type: 'employment',
        amount: 25000,
        period: 'monthly',
      });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0]).toMatchObject({
        type: 'employment',
        amount: 25000,
        period: 'monthly',
      });
    });

    it('should not affect other income sources when updating one', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      addIncomeSource();

      const ids = useCalculatorStore.getState().input.incomeSources.map((s) => s.id);

      updateIncomeSource(ids[0], { amount: 10000 });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0].amount).toBe(10000);
      expect(state.input.incomeSources[1].amount).toBe(0); // Still default
    });

    it('should do nothing if ID does not exist', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const originalState = useCalculatorStore.getState().input.incomeSources[0];

      updateIncomeSource('non-existent-id', { amount: 99999 });

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources[0]).toEqual(originalState);
    });
  });

  describe('removeIncomeSource', () => {
    it('should remove an income source by ID', () => {
      const { addIncomeSource, removeIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();
      const id = useCalculatorStore.getState().input.incomeSources[0].id;

      removeIncomeSource(id);

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(0);
    });

    it('should remove only the specified income source', () => {
      const { addIncomeSource, removeIncomeSource, updateIncomeSource } =
        useCalculatorStore.getState();

      addIncomeSource();
      addIncomeSource();
      addIncomeSource();

      const ids = useCalculatorStore.getState().input.incomeSources.map((s) => s.id);

      // Update to make them identifiable
      updateIncomeSource(ids[0], { amount: 1000 });
      updateIncomeSource(ids[1], { amount: 2000 });
      updateIncomeSource(ids[2], { amount: 3000 });

      // Remove the middle one
      removeIncomeSource(ids[1]);

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(2);
      expect(state.input.incomeSources[0].amount).toBe(1000);
      expect(state.input.incomeSources[1].amount).toBe(3000);
    });

    it('should do nothing if ID does not exist', () => {
      const { addIncomeSource, removeIncomeSource } = useCalculatorStore.getState();

      addIncomeSource();

      removeIncomeSource('non-existent-id');

      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(1); // Still has the original
    });
  });

  describe('Income Sources with Reset', () => {
    it('should clear all income sources on reset', () => {
      const { addIncomeSource, updateIncomeSource, reset } = useCalculatorStore.getState();

      // Add multiple income sources
      addIncomeSource();
      addIncomeSource();

      const ids = useCalculatorStore.getState().input.incomeSources.map((s) => s.id);
      updateIncomeSource(ids[0], { amount: 5000 });
      updateIncomeSource(ids[1], { amount: 10000 });

      // Verify they were added
      let state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(2);

      // Reset
      reset();

      // Verify they were cleared
      state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toHaveLength(0);
    });
  });

  describe('Income Sources Initialization', () => {
    it('should initialize with empty income sources array', () => {
      const state = useCalculatorStore.getState();
      expect(state.input.incomeSources).toEqual([]);
    });

    it('should handle undefined incomeSources gracefully', () => {
      const state = useCalculatorStore.getState();
      // The selector in IncomeSourceList uses || [] to handle this
      const incomeSources = state.input.incomeSources || [];
      expect(incomeSources).toEqual([]);
    });
  });

  describe('Income Sources Types', () => {
    it('should support all income source types', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      const types = ['pension', 'rental', 'investment', 'employment', 'other'] as const;

      for (const _type of types) {
        addIncomeSource();
      }

      const ids = useCalculatorStore.getState().input.incomeSources.map((s) => s.id);

      for (let index = 0; index < types.length; index++) {
        updateIncomeSource(ids[index], { type: types[index] });
      }

      const state = useCalculatorStore.getState();

      for (let index = 0; index < types.length; index++) {
        expect(state.input.incomeSources[index].type).toBe(types[index]);
      }
    });
  });

  describe('Income Sources Periods', () => {
    it('should support all pay periods', () => {
      const { addIncomeSource, updateIncomeSource } = useCalculatorStore.getState();

      const periods = ['annually', 'monthly', 'fourWeekly', 'fortnightly', 'weekly'] as const;

      for (const _period of periods) {
        addIncomeSource();
      }

      const ids = useCalculatorStore.getState().input.incomeSources.map((s) => s.id);

      for (let index = 0; index < periods.length; index++) {
        updateIncomeSource(ids[index], { period: periods[index] });
      }

      const state = useCalculatorStore.getState();

      for (let index = 0; index < periods.length; index++) {
        expect(state.input.incomeSources[index].period).toBe(periods[index]);
      }
    });
  });
});
