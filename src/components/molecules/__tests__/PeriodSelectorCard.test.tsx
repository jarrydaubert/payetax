// src/components/molecules/__tests__/PeriodSelectorCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PeriodSelectorCard } from '../PeriodSelectorCard';

describe('PeriodSelectorCard', () => {
  const defaultPeriods = [
    'Yearly',
    'Monthly',
    '4-Weekly',
    'Fortnightly',
    'Weekly',
    'Daily',
    'Hourly',
  ];

  describe('Rendering', () => {
    it('renders the Display Periods title', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={['Monthly']}
          onPeriodToggle={jest.fn()}
        />,
      );

      expect(screen.getByText('Display Periods')).toBeInTheDocument();
    });

    it('renders all provided periods as checkboxes', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      for (const period of defaultPeriods) {
        // Use exact: true to avoid matching "4-Weekly" when looking for "Weekly"
        expect(screen.getByRole('checkbox', { name: period })).toBeInTheDocument();
      }
    });

    it('renders correct number of checkboxes', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(defaultPeriods.length);
    });

    it('marks visible periods as checked', () => {
      const visiblePeriods = ['Weekly', 'Monthly', 'Yearly'];

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={visiblePeriods}
          onPeriodToggle={jest.fn()}
        />,
      );

      for (const period of visiblePeriods) {
        const checkbox = screen.getByRole('checkbox', { name: period });
        expect(checkbox).toBeChecked();
      }
    });

    it('marks non-visible periods as unchecked', () => {
      const visiblePeriods = ['Weekly'];

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={visiblePeriods}
          onPeriodToggle={jest.fn()}
        />,
      );

      const nonVisiblePeriods = defaultPeriods.filter((p) => !visiblePeriods.includes(p));

      for (const period of nonVisiblePeriods) {
        const checkbox = screen.getByRole('checkbox', { name: period });
        expect(checkbox).not.toBeChecked();
      }
    });

    it('renders within a Card component', () => {
      const { container } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      // Card component should use the shared Card base styling
      const card = container.firstChild as HTMLElement | null;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border', 'border-border', 'bg-card');
    });
  });

  describe('Interactions', () => {
    it('calls onPeriodToggle with correct period when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const handleToggle = jest.fn();

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={handleToggle}
        />,
      );

      const weeklyCheckbox = screen.getByRole('checkbox', { name: 'Weekly' });
      await user.click(weeklyCheckbox);

      expect(handleToggle).toHaveBeenCalledWith('Weekly');
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onPeriodToggle for each period clicked', async () => {
      const user = userEvent.setup();
      const handleToggle = jest.fn();

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={handleToggle}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: 'Weekly' }));
      await user.click(screen.getByRole('checkbox', { name: 'Monthly' }));
      await user.click(screen.getByRole('checkbox', { name: 'Yearly' }));

      expect(handleToggle).toHaveBeenCalledTimes(3);
      expect(handleToggle).toHaveBeenNthCalledWith(1, 'Weekly');
      expect(handleToggle).toHaveBeenNthCalledWith(2, 'Monthly');
      expect(handleToggle).toHaveBeenNthCalledWith(3, 'Yearly');
    });

    it('calls onPeriodToggle when clicking label', async () => {
      const user = userEvent.setup();
      const handleToggle = jest.fn();

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={handleToggle}
        />,
      );

      const weeklyLabel = screen.getByText('Weekly');
      await user.click(weeklyLabel);

      expect(handleToggle).toHaveBeenCalledWith('Weekly');
    });

    it('handles toggling checked periods', async () => {
      const user = userEvent.setup();
      const handleToggle = jest.fn();

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={['Weekly']}
          onPeriodToggle={handleToggle}
        />,
      );

      const weeklyCheckbox = screen.getByRole('checkbox', { name: 'Weekly' });
      await user.click(weeklyCheckbox);

      expect(handleToggle).toHaveBeenCalledWith('Weekly');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleToggle = jest.fn();

      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={handleToggle}
        />,
      );

      const weeklyCheckbox = screen.getByRole('checkbox', { name: 'Weekly' });
      weeklyCheckbox.focus();
      await user.keyboard(' ');

      expect(handleToggle).toHaveBeenCalledWith('Weekly');
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct padding to card', () => {
      const { container } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const card = container.firstChild;
      // Updated to responsive padding
      expect(card).toHaveClass('p-2', 'sm:p-3', 'md:p-4');
    });

    it('applies correct title styling', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const title = screen.getByText('Display Periods');
      expect(title).toHaveClass(
        'shrink-0',
        'font-semibold',
        'text-foreground',
        'text-base',
        'sm:text-lg',
      );
    });

    it('uses flex-wrap for checkbox layout', () => {
      const { container } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxContainer = container.querySelector('.flex-wrap');
      expect(checkboxContainer).toBeInTheDocument();
    });

    it('applies correct gap between checkboxes', () => {
      const { container } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      // Updated to responsive gap
      const checkboxContainer = container.querySelector('.gap-2');
      expect(checkboxContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty periods array', () => {
      render(<PeriodSelectorCard periods={[]} visiblePeriods={[]} onPeriodToggle={jest.fn()} />);

      expect(screen.getByText('Display Periods')).toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('handles single period', () => {
      render(
        <PeriodSelectorCard periods={['Weekly']} visiblePeriods={[]} onPeriodToggle={jest.fn()} />,
      );

      expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    });

    it('handles all periods being visible', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={defaultPeriods}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        expect(checkbox).toBeChecked();
      }
    });

    it('handles no periods being visible', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        expect(checkbox).not.toBeChecked();
      }
    });

    it('handles periods with special characters', () => {
      const periodsWithHyphens = ['4-Weekly', 'Fortnightly'];

      render(
        <PeriodSelectorCard
          periods={periodsWithHyphens}
          visiblePeriods={['4-Weekly']}
          onPeriodToggle={jest.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: '4-Weekly' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Fortnightly' })).not.toBeChecked();
    });

    it('maintains correct state after re-render', () => {
      const { rerender } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={['Weekly']}
          onPeriodToggle={jest.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: 'Weekly' })).toBeChecked();

      rerender(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={['Monthly']}
          onPeriodToggle={jest.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: 'Weekly' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Monthly' })).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('all checkboxes have accessible names', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        expect(checkbox).toHaveAccessibleName();
      }
    });

    it('title provides context for checkboxes', () => {
      render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const title = screen.getByText('Display Periods');
      const checkboxContainer = title.nextElementSibling;

      expect(checkboxContainer).toContainElement(screen.getAllByRole('checkbox')[0]);
    });

    it('supports Tab navigation through all checkboxes', async () => {
      const user = userEvent.setup();

      render(
        <PeriodSelectorCard
          periods={['Weekly', 'Monthly', 'Yearly']}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      // Tab through checkboxes (they render in array order)
      await user.tab();
      expect(screen.getByRole('checkbox', { name: 'Weekly' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('checkbox', { name: 'Monthly' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('checkbox', { name: 'Yearly' })).toHaveFocus();
    });
  });

  describe('Integration with PeriodCheckbox', () => {
    it('renders PeriodCheckbox components with correct props', () => {
      render(
        <PeriodSelectorCard
          periods={['Weekly', 'Monthly']}
          visiblePeriods={['Weekly']}
          onPeriodToggle={jest.fn()}
        />,
      );

      // Verify Weekly is checked
      expect(screen.getByRole('checkbox', { name: 'Weekly' })).toBeChecked();

      // Verify Monthly is unchecked
      expect(screen.getByRole('checkbox', { name: 'Monthly' })).not.toBeChecked();
    });

    it('passes unique keys to each PeriodCheckbox', () => {
      const { container } = render(
        <PeriodSelectorCard
          periods={defaultPeriods}
          visiblePeriods={[]}
          onPeriodToggle={jest.fn()}
        />,
      );

      const checkboxes = container.querySelectorAll('[id^="period-"]');
      const ids = Array.from(checkboxes).map((cb) => cb.id);

      // All IDs should be unique
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
