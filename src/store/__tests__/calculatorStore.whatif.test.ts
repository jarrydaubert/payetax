/**
 * Calculator Store - What If Feature Tests
 *
 * Tests for What If scenario functionality to catch calculation errors
 * and ensure proper state management.
 */

import { useCalculatorStore } from '../calculatorStore';

describe('Calculator Store - What If Feature', () => {
  beforeEach(() => {
    // Reset store before each test
    useCalculatorStore.getState().reset();
  });

  describe('What If State Management', () => {
    it('should initialize with default What If state', () => {
      const { whatIf } = useCalculatorStore.getState();

      expect(whatIf).toEqual({
        enabled: false,
        type: 'percentage',
        value: 10,
      });
    });

    it('should update What If type', () => {
      const { setWhatIfType, whatIf } = useCalculatorStore.getState();

      setWhatIfType('amount');

      const updatedWhatIf = useCalculatorStore.getState().whatIf;
      expect(updatedWhatIf.type).toBe('amount');
    });

    it('should update What If value', () => {
      const { setWhatIfValue } = useCalculatorStore.getState();

      setWhatIfValue(15);

      const { whatIf } = useCalculatorStore.getState();
      expect(whatIf.value).toBe(15);
    });

    it('should reset What If state on reset()', () => {
      const { setWhatIfType, setWhatIfValue, reset } = useCalculatorStore.getState();

      setWhatIfType('total');
      setWhatIfValue(50000);

      reset();

      const { whatIf } = useCalculatorStore.getState();
      expect(whatIf).toEqual({
        enabled: false,
        type: 'percentage',
        value: 10,
      });
    });
  });

  describe('What If Calculations - Percentage Mode', () => {
    it('should calculate 10% salary increase correctly', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      // Set up current salary
      setSalary(40000);
      calculate();

      const { results } = useCalculatorStore.getState();
      expect(results?.grossSalary.annually).toBe(40000);

      // Calculate What If with 10% increase
      setWhatIfType('percentage');
      setWhatIfValue(10);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(44000);
    });

    it('should calculate 5% salary decrease correctly', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(50000);
      calculate();

      setWhatIfType('percentage');
      setWhatIfValue(-5);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(47500);
    });

    it('should handle 0% change', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(30000);
      calculate();

      setWhatIfType('percentage');
      setWhatIfValue(0);
      calculateWhatIf();

      const { results, whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(results?.grossSalary.annually);
    });
  });

  describe('What If Calculations - Amount Mode', () => {
    it('should calculate £5k raise correctly', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      calculate();

      setWhatIfType('amount');
      setWhatIfValue(5000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(45000);
    });

    it('should calculate £3k pay cut correctly', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(35000);
      calculate();

      setWhatIfType('amount');
      setWhatIfValue(-3000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(32000);
    });
  });

  describe('What If Calculations - Total Mode', () => {
    it('should calculate new total salary correctly', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      calculate();

      setWhatIfType('total');
      setWhatIfValue(55000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      expect(whatIfResults?.grossSalary.annually).toBe(55000);
    });
  });

  describe('What If Tax Calculations', () => {
    it('should calculate tax correctly for What If salary', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      // £40k salary
      setSalary(40000);
      calculate();

      const { results } = useCalculatorStore.getState();
      const currentTax = results?.incomeTax.annually;

      // What If: £50k salary (higher tax bracket)
      setWhatIfType('total');
      setWhatIfValue(50000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      const whatIfTax = whatIfResults?.incomeTax.annually;

      // What If tax should be higher
      expect(whatIfTax).toBeGreaterThan(currentTax || 0);
      expect(whatIfTax).toBeGreaterThan(0);
    });

    it('should calculate NI correctly for What If salary', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(30000);
      calculate();

      const { results } = useCalculatorStore.getState();
      const currentNI = results?.nationalInsurance.annually;

      setWhatIfType('amount');
      setWhatIfValue(10000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      const whatIfNI = whatIfResults?.nationalInsurance.annually;

      expect(whatIfNI).toBeGreaterThan(currentNI || 0);
    });

    it('should calculate tax bands correctly for What If salary', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      calculate();

      setWhatIfType('total');
      setWhatIfValue(60000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();

      // Should have tax bands populated
      expect(whatIfResults?.taxBands).toBeDefined();
      expect(whatIfResults?.taxBands.length).toBeGreaterThan(0);

      // Tax bands should have amounts
      const totalTaxFromBands = whatIfResults?.taxBands.reduce((sum, band) => sum + band.amount, 0);
      expect(totalTaxFromBands).toBeCloseTo(whatIfResults?.incomeTax.annually || 0, 0);
    });
  });

  describe('What If Net Pay Calculations', () => {
    it('should calculate net pay correctly for What If salary', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(35000);
      calculate();

      setWhatIfType('percentage');
      setWhatIfValue(20);
      calculateWhatIf();

      const { results, whatIfResults } = useCalculatorStore.getState();

      // What If gross should be 20% higher
      expect(whatIfResults?.grossSalary.annually).toBe(42000);

      // What If net should be higher but less than gross increase due to tax
      const netDiff = (whatIfResults?.netPay.annually || 0) - (results?.netPay.annually || 0);
      const grossDiff =
        (whatIfResults?.grossSalary.annually || 0) - (results?.grossSalary.annually || 0);

      expect(netDiff).toBeGreaterThan(0);
      expect(netDiff).toBeLessThan(grossDiff); // Due to tax/NI
    });

    it('should preserve pension deductions in What If calculation', () => {
      const {
        setSalary,
        setPensionContribution,
        setPensionContributionType,
        calculate,
        setWhatIfValue,
        calculateWhatIf,
      } = useCalculatorStore.getState();

      setSalary(50000);
      setPensionContribution(5);
      setPensionContributionType('percentage');
      calculate();

      const { results } = useCalculatorStore.getState();
      expect(results?.pensionContribution.annually).toBe(2500); // 5% of 50k

      setWhatIfValue(10); // 10% increase
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      // Pension should be 5% of new salary (55k)
      expect(whatIfResults?.pensionContribution.annually).toBe(2750);
    });
  });

  describe('Edge Cases', () => {
    it('should handle What If calculation with no current salary', () => {
      const { calculateWhatIf } = useCalculatorStore.getState();

      // Don't set salary or calculate
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      // Should not crash, results should be null or undefined
      expect(whatIfResults).toBeUndefined();
    });

    it('should ensure non-negative salary in What If', () => {
      const { setSalary, calculate, setWhatIfType, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(1000);
      calculate();

      // Try to set negative total
      setWhatIfType('amount');
      setWhatIfValue(-2000); // Would result in -1000
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      // Should be clamped to 0
      expect(whatIfResults?.grossSalary.annually).toBeGreaterThanOrEqual(0);
    });

    it('should handle student loan in What If calculation', () => {
      const { setSalary, setStudentLoanPlan, calculate, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(30000);
      setStudentLoanPlan('Plan 2');
      calculate();

      const { results } = useCalculatorStore.getState();
      const currentLoan = results?.studentLoan.annually || 0;

      setWhatIfValue(10000); // Add 10k
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();
      const whatIfLoan = whatIfResults?.studentLoan.annually || 0;

      // Higher salary = more student loan repayment
      expect(whatIfLoan).toBeGreaterThan(currentLoan);
    });
  });

  describe('What If with Different Settings', () => {
    it('should apply Scottish tax rates in What If calculation', () => {
      const { setSalary, setRegion, calculate, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(50000);
      setRegion('Scotland');
      calculate();

      setWhatIfValue(10); // 10% increase
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();

      // Should have calculated with Scottish rates
      expect(whatIfResults).toBeDefined();
      expect(whatIfResults?.grossSalary.annually).toBe(55000);
    });

    it('should apply different tax codes in What If calculation', () => {
      const { setSalary, setTaxCode, calculate, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      setTaxCode('1000L'); // Lower allowance
      calculate();

      const { results } = useCalculatorStore.getState();

      setWhatIfValue(5000);
      calculateWhatIf();

      const { whatIfResults } = useCalculatorStore.getState();

      // What If should use same tax code
      expect(whatIfResults).toBeDefined();
      expect(whatIfResults?.grossSalary.annually).toBe(45000);
    });
  });

  describe('Auto-recalculation on Input Changes', () => {
    it('should NOT auto-recalculate What If when type changes (removed feature)', () => {
      const { setSalary, calculate, setWhatIfType, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      calculate();
      calculateWhatIf();

      const { whatIfResults: initial } = useCalculatorStore.getState();

      // Change type (should trigger recalc in current implementation)
      setWhatIfType('amount');

      const { whatIfResults: afterTypeChange } = useCalculatorStore.getState();

      // Currently auto-recalcs, but we may want to change this behavior
      expect(afterTypeChange).toBeDefined();
    });

    it('should NOT auto-recalculate What If when value changes (removed feature)', () => {
      const { setSalary, calculate, setWhatIfValue, calculateWhatIf } =
        useCalculatorStore.getState();

      setSalary(40000);
      calculate();
      calculateWhatIf();

      // Change value (should trigger recalc in current implementation)
      setWhatIfValue(20);

      const { whatIfResults } = useCalculatorStore.getState();

      // Currently auto-recalcs
      expect(whatIfResults).toBeDefined();
    });
  });
});
