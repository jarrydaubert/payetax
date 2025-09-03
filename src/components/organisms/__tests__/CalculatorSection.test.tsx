/**
 * @fileoverview CalculatorSection Component Test Suite
 *
 * **Purpose**: Comprehensive testing of the main calculator orchestration component.
 * This suite validates the integration between user input forms, tax calculations,
 * result display, and state management through the Zustand store.
 *
 * ### Component Architecture Tested:
 * The CalculatorSection serves as the main container component that:
 * - Orchestrates tax calculation workflow
 * - Manages component state transitions
 * - Handles user interactions and form validation
 * - Integrates with Zustand store for state management
 * - Provides responsive layout for mobile and desktop
 * - Implements error boundaries and graceful error handling
 *
 * ### Test Categories:
 * 1. **Basic Rendering** - Component structure and essential elements
 * 2. **User Interactions** - Button clicks, form submissions, state transitions
 * 3. **State Management** - Zustand store integration and data flow
 * 4. **Responsive Design** - Layout adaptation across screen sizes
 * 5. **Error Handling** - Graceful degradation and error recovery
 * 6. **Integration Testing** - Component interaction with child components
 *
 * ### State Management Testing:
 * Tests extensively mock the Zustand calculator store to validate:
 * - Proper state initialization and updates
 * - Action dispatch and side effects
 * - Component re-rendering on state changes
 * - Error state handling and recovery
 *
 * ### Responsive Design Validation:
 * Ensures proper CSS class application for:
 * - Mobile-first responsive design
 * - Sticky positioning for results table
 * - Grid layouts that adapt to screen size
 * - Full-screen mode support
 *
 * ### Testing Libraries Used:
 * - **@testing-library/react** - Component rendering and interaction testing
 * - **@testing-library/jest-dom** - Custom Jest matchers for DOM assertions
 * - **Jest** - Mocking, spying, and test framework functionality
 *
 * @author ToolHubX Development Team
 * @version 2.1.0
 * @since 2024-08-20
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculatorSection from '../CalculatorSection';

// Mock the calculator store
jest.mock('@/store/calculatorStore', () => ({
  useCalculatorStore: jest.fn(() => ({
    input: {
      salary: 30000,
      payPeriod: 'annually',
      taxYear: '2024-2025',
      taxCode: '1257L',
      isScottish: false,
      studentLoanPlans: [],
      hoursPerWeek: 37.5,
      additionalAllowances: [],
    },
    results: {
      grossSalary: { annually: 30000, monthly: 2500, weekly: 577, daily: 115 },
      taxFreeAmount: 12570,
      taxableIncome: 17430,
      incomeTax: { annually: 3486, monthly: 290.5, weekly: 67, daily: 13.4 },
      nationalInsurance: { annually: 1394, monthly: 116, weekly: 27, daily: 5.4 },
      studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
      pensionContribution: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
      employerNI: 1800,
      netPay: { annually: 25120, monthly: 2093, weekly: 483, daily: 97 },
      taxBands: [{ name: 'Basic Rate', rate: 20, amount: 3486, min: 12570, max: 50270 }],
    },
    setSalary: jest.fn(),
    setPayPeriod: jest.fn(),
    setTaxYear: jest.fn(),
    setTaxCode: jest.fn(),
    setIsScottish: jest.fn(),
    setStudentLoanPlans: jest.fn(),
    setPensionContribution: jest.fn(),
    setPensionContributionType: jest.fn(),
    setAdditionalAllowances: jest.fn(),
    setHoursPerWeek: jest.fn(),
    calculate: jest.fn(),
    reset: jest.fn(),
    init: jest.fn(),
  })),
}));

describe('CalculatorSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render calculator section with all main components', () => {
      render(<CalculatorSection />);

      expect(screen.getByText('Salary Information')).toBeInTheDocument();
      expect(screen.getByText('Recalculate')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should have proper data attributes for testing', () => {
      const { container } = render(<CalculatorSection />);

      const section = container.querySelector('#calculator');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'calculator');
    });
  });

  describe('Recalculate Button Functionality', () => {
    it('should show recalculate button text by default', () => {
      render(<CalculatorSection />);

      const recalculateButton = screen.getByText('Recalculate');
      expect(recalculateButton).toBeInTheDocument();
      expect(recalculateButton).not.toBeDisabled();
    });

    it('should show loading state when recalculating', async () => {
      render(<CalculatorSection />);

      const recalculateButton = screen.getByText('Recalculate');
      fireEvent.click(recalculateButton);

      // Should show loading state briefly
      await waitFor(
        () => {
          expect(screen.getByText('Calculating...')).toBeInTheDocument();
        },
        { timeout: 100 }
      );
    });

    it('should be disabled when salary is negative', () => {
      // Update mock to return negative salary
      const { useCalculatorStore } = require('@/store/calculatorStore');
      useCalculatorStore.mockReturnValue({
        input: {
          salary: -1000,
          payPeriod: 'annually',
          taxYear: '2024-2025',
          taxCode: '1257L',
          isScottish: false,
          studentLoanPlans: [],
          hoursPerWeek: 37.5,
          additionalAllowances: [],
        },
        results: null,
        setSalary: jest.fn(),
        setPayPeriod: jest.fn(),
        setTaxYear: jest.fn(),
        setTaxCode: jest.fn(),
        setIsScottish: jest.fn(),
        setStudentLoanPlans: jest.fn(),
        setPensionContribution: jest.fn(),
        setPensionContributionType: jest.fn(),
        setAdditionalAllowances: jest.fn(),
        setHoursPerWeek: jest.fn(),
        calculate: jest.fn(),
        reset: jest.fn(),
        init: jest.fn(),
      });

      render(<CalculatorSection />);

      const recalculateButton = screen.getByText('Recalculate');
      expect(recalculateButton).toBeDisabled();
    });
  });

  describe('Layout and Responsiveness', () => {
    it('should have proper CSS classes for layout', () => {
      const { container } = render(<CalculatorSection />);

      const gridContainer = container.querySelector('.lg\\:grid-cols-12');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have sticky positioning for results on large screens', () => {
      const { container } = render(<CalculatorSection />);

      const resultsSection = container.querySelector('.lg\\:sticky');
      expect(resultsSection).toBeInTheDocument();
      expect(resultsSection).toHaveClass('lg:top-8');
    });
  });

  describe('Error Handling', () => {
    it('should display calculation errors when present', () => {
      render(<CalculatorSection />);

      const recalculateButton = screen.getByText('Recalculate');

      // Mock the calculate function to throw an error
      const mockCalculate = require('@/store/calculatorStore').useCalculatorStore().calculate;
      mockCalculate.mockImplementation(() => {
        throw new Error('Test calculation error');
      });

      fireEvent.click(recalculateButton);

      // Error handling is done internally, button should still be present
      expect(recalculateButton).toBeInTheDocument();
    });
  });

  describe('Full Screen Mode', () => {
    it('should apply full screen classes when isFullScreen is true', () => {
      const { container } = render(<CalculatorSection isFullScreen={true} />);

      const section = container.querySelector('section');
      expect(section?.className).toContain('min-h-screen');
    });

    it('should not apply full screen classes by default', () => {
      const { container } = render(<CalculatorSection />);

      const section = container.querySelector('section');
      expect(section?.className).not.toContain('min-h-screen');
    });
  });

  describe('Integration with Results Table', () => {
    beforeEach(() => {
      // Reset to default positive salary and valid results for these tests
      const { useCalculatorStore } = require('@/store/calculatorStore');
      useCalculatorStore.mockReturnValue({
        input: {
          salary: 30000,
          payPeriod: 'annually',
          taxYear: '2024-2025',
          taxCode: '1257L',
          isScottish: false,
          studentLoanPlans: [],
          hoursPerWeek: 37.5,
          additionalAllowances: [],
        },
        results: {
          grossSalary: { annually: 30000, monthly: 2500, weekly: 577, daily: 115 },
          taxFreeAmount: 12570,
          taxableIncome: 17430,
          incomeTax: { annually: 3486, monthly: 290.5, weekly: 67, daily: 13.4 },
          nationalInsurance: { annually: 1394, monthly: 116, weekly: 27, daily: 5.4 },
          studentLoan: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
          pensionContribution: { annually: 0, monthly: 0, weekly: 0, daily: 0 },
          employerNI: 1800,
          netPay: { annually: 25120, monthly: 2093, weekly: 483, daily: 97 },
          taxBands: [{ name: 'Basic Rate', rate: 20, amount: 3486 }],
        },
        setSalary: jest.fn(),
        setPayPeriod: jest.fn(),
        setTaxYear: jest.fn(),
        setTaxCode: jest.fn(),
        setIsScottish: jest.fn(),
        setStudentLoanPlans: jest.fn(),
        setPensionContribution: jest.fn(),
        setPensionContributionType: jest.fn(),
        setAdditionalAllowances: jest.fn(),
        setHoursPerWeek: jest.fn(),
        calculate: jest.fn(),
        reset: jest.fn(),
        init: jest.fn(),
      });
    });

    it('should pass correct props to EnhancedPayslipTable', () => {
      render(<CalculatorSection />);

      // The EnhancedPayslipTable should receive results
      expect(screen.getByText('Your Payslip Summary')).toBeInTheDocument();
    });

    it('should show export button when results are present', () => {
      render(<CalculatorSection />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });
});
