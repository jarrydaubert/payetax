/**
 * ComparisonInputs Component Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for salary comparison input form:
 * - Mode selection (percentage, amount, total)
 * - Value input and validation
 * - Error handling
 * - Compare button functionality
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonInputs } from '../ComparisonInputs';

describe('ComparisonInputs', () => {
  const mockOnCompare = jest.fn();
  const defaultProps = {
    currentSalary: 45000,
    onCompare: mockOnCompare,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<ComparisonInputs {...defaultProps} />);
      expect(screen.getByText('Compare Salary Scenarios')).toBeInTheDocument();
    });

    it('should display current salary', () => {
      render(<ComparisonInputs {...defaultProps} />);
      expect(screen.getByText(/£45,000/)).toBeInTheDocument();
    });

    it('should render all mode options', () => {
      render(<ComparisonInputs {...defaultProps} />);
      expect(screen.getByText('Percentage')).toBeInTheDocument();
      expect(screen.getByText('£ Amount')).toBeInTheDocument();
      expect(screen.getByText('New Total')).toBeInTheDocument();
    });

    it('should render compare button', () => {
      render(<ComparisonInputs {...defaultProps} />);
      expect(screen.getByRole('button', { name: /compare salaries/i })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<ComparisonInputs {...defaultProps} className='custom-class' />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Mode Selection', () => {
    it('should default to percentage mode', () => {
      render(<ComparisonInputs {...defaultProps} />);
      const percentageRadio = screen.getByRole('radio', { name: /percentage/i });
      expect(percentageRadio).toBeChecked();
    });

    it('should switch to amount mode', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const amountRadio = screen.getByRole('radio', { name: /amount/i });
      await user.click(amountRadio);

      expect(amountRadio).toBeChecked();
    });

    it('should switch to total mode', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const totalRadio = screen.getByRole('radio', { name: /new total/i });
      await user.click(totalRadio);

      expect(totalRadio).toBeChecked();
    });

    it('should update label when mode changes', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      expect(screen.getByText('Percentage Increase')).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /amount/i }));
      expect(screen.getByText('Amount Increase')).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /new total/i }));
      expect(screen.getByText('New Total Salary')).toBeInTheDocument();
    });

    it('should update placeholder when mode changes', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('placeholder', '10');

      await user.click(screen.getByRole('radio', { name: /amount/i }));
      expect(input).toHaveAttribute('placeholder', '5000');

      await user.click(screen.getByRole('radio', { name: /new total/i }));
      expect(input).toHaveAttribute('placeholder', '45000');
    });
  });

  describe('Input Handling', () => {
    it('should accept numeric input', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');

      expect(input).toHaveValue('10');
    });

    it('should clear error when user types new valid value', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      // First type invalid value that's out of range
      await user.type(input, '0.001');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      // Should show error for out of range
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Clear and type valid value
      await user.clear(input);
      await user.type(input, '10');

      // Error should be cleared after typing
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show error for out of range percentage', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '0.001');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 0\.01%/i);
    });

    it('should validate percentage range (0.01 - 1000)', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '0.001');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 0\.01%/i);
    });

    it('should validate amount range', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /amount/i }));

      const input = screen.getByRole('textbox');
      await user.type(input, '0');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(screen.getByRole('alert')).toHaveTextContent(/positive/i);
    });

    it('should validate total range', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /new total/i }));

      const input = screen.getByRole('textbox');
      await user.type(input, '0');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(screen.getByRole('alert')).toHaveTextContent(/positive/i);
    });

    it('should accept valid percentage', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(mockOnCompare).toHaveBeenCalledWith({
        mode: 'percentage',
        value: 10,
        currentSalary: 45000,
      });
    });

    it('should accept valid amount', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /amount/i }));

      const input = screen.getByRole('textbox');
      await user.type(input, '5000');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(mockOnCompare).toHaveBeenCalledWith({
        mode: 'amount',
        value: 5000,
        currentSalary: 45000,
      });
    });

    it('should accept valid total', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /new total/i }));

      const input = screen.getByRole('textbox');
      await user.type(input, '50000');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(mockOnCompare).toHaveBeenCalledWith({
        mode: 'total',
        value: 50000,
        currentSalary: 45000,
      });
    });
  });

  describe('Compare Button', () => {
    it('should be disabled when input is empty', () => {
      render(<ComparisonInputs {...defaultProps} />);
      const button = screen.getByRole('button', { name: /compare/i });
      expect(button).toBeDisabled();
    });

    it('should be enabled when input has value', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');

      const button = screen.getByRole('button', { name: /compare/i });
      expect(button).not.toBeDisabled();
    });

    it('should call onCompare with correct data', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '15');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(mockOnCompare).toHaveBeenCalledTimes(1);
      expect(mockOnCompare).toHaveBeenCalledWith({
        mode: 'percentage',
        value: 15,
        currentSalary: 45000,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have label for input', () => {
      render(<ComparisonInputs {...defaultProps} />);
      expect(screen.getByText(/percentage increase/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have aria-invalid on input when error exists', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '0.001');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error message', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '0.001');

      const button = screen.getByRole('button', { name: /compare/i });
      await user.click(button);

      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId as string)).toHaveTextContent(/at least 0\.01%/i);
    });
  });

  describe('Currency Symbol Display', () => {
    it('should show % symbol in percentage mode', () => {
      render(<ComparisonInputs {...defaultProps} />);
      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveTextContent('%');
    });

    it('should show £ symbol in amount mode', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /amount/i }));

      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveTextContent('£');
    });

    it('should show £ symbol in total mode', async () => {
      const user = userEvent.setup();
      render(<ComparisonInputs {...defaultProps} />);

      await user.click(screen.getByRole('radio', { name: /new total/i }));

      const container = screen.getByRole('textbox').parentElement;
      expect(container).toHaveTextContent('£');
    });
  });
});
