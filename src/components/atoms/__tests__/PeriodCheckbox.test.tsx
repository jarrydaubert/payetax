// src/components/atoms/__tests__/PeriodCheckbox.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeriodCheckbox } from '../PeriodCheckbox';

describe('PeriodCheckbox', () => {
  describe('Rendering', () => {
    it('renders checkbox with correct period label', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      expect(screen.getByRole('checkbox', { name: /weekly/i })).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
    });

    it('renders with checked state', () => {
      render(<PeriodCheckbox period='Monthly' checked={true} onCheckedChange={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox', { name: /monthly/i });
      expect(checkbox).toBeChecked();
    });

    it('renders with unchecked state', () => {
      render(<PeriodCheckbox period='Yearly' checked={false} onCheckedChange={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox', { name: /yearly/i });
      expect(checkbox).not.toBeChecked();
    });

    it('generates correct id for checkbox', () => {
      render(
        <PeriodCheckbox period='4-Weekly' checked={false} onCheckedChange={jest.fn()} />,
      );

      const checkbox = screen.getByRole('checkbox', { name: '4-Weekly' });
      expect(checkbox).toHaveAttribute('id');
      expect(checkbox.getAttribute('id')).toMatch(/period-4-weekly$/);
    });

    it('links label to checkbox via htmlFor', () => {
      render(<PeriodCheckbox period='Daily' checked={false} onCheckedChange={jest.fn()} />);

      const label = screen.getByText('Daily');
      const checkbox = screen.getByRole('checkbox', { name: 'Daily' });
      const forId = label.getAttribute('for');

      expect(forId).toBeTruthy();
      expect(checkbox.getAttribute('id')).toBe(forId);
    });
  });

  describe('Interactions', () => {
    it('calls onCheckedChange when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox', { name: /weekly/i });
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onCheckedChange when label is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<PeriodCheckbox period='Monthly' checked={false} onCheckedChange={handleChange} />);

      const label = screen.getByText('Monthly');
      await user.click(label);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onCheckedChange when toggling from checked to unchecked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<PeriodCheckbox period='Yearly' checked={true} onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox', { name: /yearly/i });
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox', { name: /weekly/i });
      checkbox.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    // Note: Enter key doesn't trigger checkboxes - only Space does (correct ARIA behavior)
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('has correct ARIA checked state when checked', () => {
      render(<PeriodCheckbox period='Weekly' checked={true} onCheckedChange={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('has correct ARIA checked state when unchecked', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('is keyboard focusable', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });

    it('label has cursor-pointer class for better UX', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      const label = screen.getByText('Weekly');
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('handles periods with hyphens correctly', () => {
      render(<PeriodCheckbox period='4-Weekly' checked={false} onCheckedChange={jest.fn()} />);

      expect(screen.getByText('4-Weekly')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: '4-Weekly' }).getAttribute('id')).toMatch(
        /period-4-weekly$/,
      );
    });

    it('handles empty onCheckedChange callback', async () => {
      const user = userEvent.setup();

      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={() => {}} />);

      const checkbox = screen.getByRole('checkbox');
      await expect(user.click(checkbox)).resolves.not.toThrow();
    });

    it('handles rapid clicks correctly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.tripleClick(checkbox);

      // Should be called 3 times (one per click)
      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('maintains state consistency when parent re-renders', () => {
      const { rerender } = render(
        <PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />,
      );

      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(<PeriodCheckbox period='Weekly' checked={true} onCheckedChange={jest.fn()} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });

  describe('Visual Styling', () => {
    it('applies correct layout classes', () => {
      const { container } = render(
        <PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />,
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('applies correct font size to label', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      const label = screen.getByText('Weekly');
      expect(label).toHaveClass('text-sm');
    });

    it('applies font-normal to label', () => {
      render(<PeriodCheckbox period='Weekly' checked={false} onCheckedChange={jest.fn()} />);

      const label = screen.getByText('Weekly');
      expect(label).toHaveClass('font-normal');
    });
  });
});
