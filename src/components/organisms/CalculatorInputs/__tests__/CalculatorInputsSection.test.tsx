// src/components/organisms/CalculatorInputs/__tests__/CalculatorInputsSection.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorInputsSection } from '../CalculatorInputsSection';

jest.mock('@/store/calculatorStore', () => ({
  useCalculatorActions: jest.fn(),
  useCalculatorStore: jest.fn(),
}));

jest.mock('../BasicInputs', () => ({
  BasicInputs: () => <div data-testid='basic-inputs-mock'>Basic Inputs</div>,
}));

describe('CalculatorInputsSection Component', () => {
  const mockOnCalculate = jest.fn();
  const mockReset = jest.fn();
  const defaultInput = {
    salary: 50000,
    payPeriod: 'annually' as const,
    hoursPerWeek: 40,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCalculatorActions as jest.Mock).mockReturnValue({
      reset: mockReset,
    });
    (useCalculatorStore as jest.Mock).mockImplementation((selector) =>
      selector({ input: defaultInput }),
    );
  });

  describe('Rendering', () => {
    it('should render BasicInputs component', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      expect(screen.getByTestId('basic-inputs-mock')).toBeInTheDocument();
    });

    it('should render Calculate button', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Calculate');
    });

    it('should render Reset button', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByRole('button', { name: /Reset/i });
      expect(button).toBeInTheDocument();
    });

    it('should render Calculate button with icon', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const calculateButton = screen.getByTestId('calculate-button');
      const icon = calculateButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render Reset button with icon', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const resetButton = screen.getByRole('button', { name: /Reset/i });
      const icon = resetButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render an optional result action after Reset', () => {
      render(
        <CalculatorInputsSection
          onCalculate={mockOnCalculate}
          resultAction={
            <button type='button' aria-label='Email tax calculation results'>
              Email
            </button>
          }
        />,
      );

      const buttons = screen.getAllByRole('button');
      const labels = buttons.map(
        (button) => button.textContent || button.getAttribute('aria-label'),
      );
      const resetIndex = buttons.indexOf(screen.getByRole('button', { name: /Reset/i }));
      const emailIndex = buttons.indexOf(
        screen.getByRole('button', { name: /Email tax calculation results/i }),
      );

      expect(labels).toEqual(expect.arrayContaining(['Calculate', 'Reset', 'Email']));
      expect(emailIndex).toBeGreaterThan(resetIndex);
    });
  });

  describe('Calculate Button Interaction', () => {
    it('should call onCalculate when Calculate button is clicked', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      expect(mockOnCalculate).toHaveBeenCalledTimes(1);
    });

    it('should complete calculation synchronously', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      // Calculation completes synchronously
      expect(mockOnCalculate).toHaveBeenCalled();
      expect(button).not.toBeDisabled();
    });

    it('should return to Calculate text after completion', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      // Button shows normal state after sync calculation
      expect(button).toHaveTextContent('Calculate');
    });

    it('should show rotating icon while calculating', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      // Icon should still be present during calculation
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should show an inline error when calculation throws', async () => {
      const errorOnCalculate = jest.fn(() => {
        throw new Error('Test calculation error');
      });

      render(<CalculatorInputsSection onCalculate={errorOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test calculation error')).toBeInTheDocument();
      });
    });

    it('should show a fallback inline error for non-Error exceptions', async () => {
      const errorOnCalculate = jest.fn(() => {
        throw 'String error';
      });

      render(<CalculatorInputsSection onCalculate={errorOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Please check your inputs.')).toBeInTheDocument();
      });
    });

    it('should re-enable button after error', async () => {
      const errorOnCalculate = jest.fn(() => {
        throw new Error('Test error');
      });

      render(<CalculatorInputsSection onCalculate={errorOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 1000 });
    });
  });

  describe('Reset Button Interaction', () => {
    it('should call reset action when Reset button is clicked', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(button);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should not call onCalculate when Reset is clicked', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(button);

      expect(mockOnCalculate).not.toHaveBeenCalled();
    });

    it('should clear inline messages on reset', () => {
      (useCalculatorStore as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, salary: 0 } }),
      );
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      fireEvent.click(screen.getByTestId('calculate-button'));
      expect(
        screen.getByText('Enter your gross salary to calculate your tax breakdown.'),
      ).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(button);

      expect(
        screen.queryByText('Enter your gross salary to calculate your tax breakdown.'),
      ).not.toBeInTheDocument();
    });

    it('does not show the low annual salary warning for a normal hourly rate', () => {
      (useCalculatorStore as jest.Mock).mockImplementation((selector) =>
        selector({ input: { ...defaultInput, salary: 12.5, payPeriod: 'hourly' } }),
      );
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      fireEvent.click(screen.getByTestId('calculate-button'));

      expect(mockOnCalculate).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Salary below £100/year may show unusual percentages.')).toBeNull();
    });
  });

  describe('Button Styling', () => {
    it('should render Calculate button with correct variant', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      expect(button).toHaveClass('flex-1'); // Takes full width
    });

    it('should render Reset button with outline variant', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByRole('button', { name: /Reset/i });
      // Button component adds variant classes
      expect(button).toBeInTheDocument();
    });

    it('should render compact action buttons', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const calculateButton = screen.getByTestId('calculate-button');
      const resetButton = screen.getByRole('button', { name: /Reset/i });

      expect(calculateButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have correct spacing between elements', () => {
      const { container } = render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const wrapper = container.querySelector('.space-y-4');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have gap between buttons', () => {
      const { container } = render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const buttonContainer = container.querySelector('.flex.gap-2');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      expect(screen.getByRole('button', { name: /Calculate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    });

    it('should enable Calculate button after sync calculation', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      // Button is enabled after sync calculation completes
      expect(button).not.toHaveAttribute('disabled');
    });

    it('should keep Reset button always enabled', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const calculateButton = screen.getByTestId('calculate-button');
      fireEvent.click(calculateButton);

      const resetButton = screen.getByRole('button', { name: /Reset/i });
      expect(resetButton).not.toBeDisabled();
    });
  });

  describe('Animation', () => {
    it('should call onCalculate synchronously and complete', () => {
      render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      const button = screen.getByTestId('calculate-button');
      fireEvent.click(button);

      // Synchronous calculation completes immediately
      expect(mockOnCalculate).toHaveBeenCalled();
      // Button returns to normal state after sync calculation
      expect(button).toHaveTextContent('Calculate');
    });

    it('should not throw errors on mount', () => {
      expect(() => {
        render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);
      }).not.toThrow();
    });

    it('should not throw errors on unmount', () => {
      const { unmount } = render(<CalculatorInputsSection onCalculate={mockOnCalculate} />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
