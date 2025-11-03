// src/components/organisms/__tests__/IncomeSourceList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';
import { IncomeSourceList } from '../IncomeSourceList';

// Mock the store
jest.mock('@/store/calculatorStore');

describe('IncomeSourceList Component', () => {
  const mockAddIncomeSource = jest.fn();
  const mockUpdateIncomeSource = jest.fn();
  const mockRemoveIncomeSource = jest.fn();

  const defaultInput = {
    incomeSources: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ input: defaultInput })
    );

    (useCalculatorActions as jest.Mock).mockReturnValue({
      addIncomeSource: mockAddIncomeSource,
      updateIncomeSource: mockUpdateIncomeSource,
      removeIncomeSource: mockRemoveIncomeSource,
    });
  });

  describe('Rendering - Initial State', () => {
    it('should render collapsed by default', () => {
      render(<IncomeSourceList />);
      expect(screen.getByText('Additional Income Sources')).toBeInTheDocument();

      // The empty state message should not be in the document when collapsed
      expect(
        screen.queryByText('Add pension income, rental income, or other sources')
      ).not.toBeInTheDocument();
    });

    it('should show collapsible trigger with chevron icon', () => {
      render(<IncomeSourceList />);
      // Note: CollapsibleTrigger doesn't render as a button role by default
      // We need to check for the text content
      const trigger = screen.getByText('Additional Income Sources');
      expect(trigger).toBeInTheDocument();
    });

    it('should NOT show badge when no income sources', () => {
      render(<IncomeSourceList />);
      // Badge should not exist when incomeSources is empty
      const badge = screen.queryByText('0');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Collapsible Behavior', () => {
    it('should expand when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      // Find the trigger by text content (CollapsibleTrigger may not have button role)
      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // After expansion, the empty state message should be in the document
      expect(
        screen.getByText('Add pension income, rental income, or other sources')
      ).toBeInTheDocument();
    });

    it('should show "Add Income Source" button when expanded', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Find the button by its text content
      expect(screen.getByText('Add Income Source')).toBeInTheDocument();
      // Also verify it's actually a button
      const addButton = screen.getByText('Add Income Source').closest('button');
      expect(addButton).toBeInTheDocument();
    });

    it('should collapse when trigger is clicked again', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');

      // Expand
      await user.click(trigger);
      expect(
        screen.getByText('Add pension income, rental income, or other sources')
      ).toBeInTheDocument();

      // Collapse
      await user.click(trigger);
      // After collapse, content should not be in the document
      expect(
        screen.queryByText('Add pension income, rental income, or other sources')
      ).not.toBeInTheDocument();
    });
  });

  describe('Adding Income Sources', () => {
    it('should call addIncomeSource when "Add Income Source" button is clicked', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      // Expand collapsible
      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Click add button by finding the button element
      const addButton = screen.getByText('Add Income Source').closest('button');
      expect(addButton).toBeInTheDocument();

      if (addButton) {
        await user.click(addButton);
        expect(mockAddIncomeSource).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Displaying Income Sources', () => {
    const mockIncomeSources = [
      {
        id: 'source-1',
        type: 'pension' as const,
        amount: 10000,
        period: 'annually' as const,
      },
      {
        id: 'source-2',
        type: 'rental' as const,
        amount: 500,
        period: 'monthly' as const,
      },
    ];

    beforeEach(() => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: mockIncomeSources } })
      );
    });

    it('should display badge with count when income sources exist', () => {
      render(<IncomeSourceList />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display all income sources when expanded', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Verify there are 2 income source containers by counting remove buttons
      const removeButtons = screen.getAllByRole('button', { name: /remove income source/i });
      expect(removeButtons).toHaveLength(2);

      // Verify numbered badge for first item exists
      const badge1 = screen.getByText('1');
      expect(badge1).toBeInTheDocument();

      // For "2", there will be multiple: count badge + item badge
      const allTwos = screen.getAllByText('2');
      expect(allTwos.length).toBeGreaterThanOrEqual(1);
    });

    it('should display numbered badges for each income source', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // More robust test: verify by counting remove buttons = number of items
      const removeButtons = screen.getAllByRole('button', { name: /remove income source/i });
      expect(removeButtons).toHaveLength(2);

      // Verify badge 1 exists
      expect(screen.getByText('1')).toBeInTheDocument();

      // Verify "2" appears at least twice (count + item badge)
      const badge2Elements = screen.getAllByText('2');
      expect(badge2Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should NOT show empty state message when sources exist', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Empty state message should not appear when income sources exist
      expect(
        screen.queryByText('Add pension income, rental income, or other sources')
      ).not.toBeInTheDocument();
    });
  });

  describe('Removing Income Sources', () => {
    const mockIncomeSource = {
      id: 'source-1',
      type: 'pension' as const,
      amount: 10000,
      period: 'annually' as const,
    };

    beforeEach(() => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [mockIncomeSource] } })
      );
    });

    it('should call removeIncomeSource when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      // Expand collapsible
      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Click remove button
      const removeButton = screen.getByRole('button', { name: /remove income source/i });
      await user.click(removeButton);

      expect(mockRemoveIncomeSource).toHaveBeenCalledWith('source-1');
      expect(mockRemoveIncomeSource).toHaveBeenCalledTimes(1);
    });

    it('should display remove button for each income source', async () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({
          input: {
            incomeSources: [
              mockIncomeSource,
              { id: 'source-2', type: 'rental' as const, amount: 500, period: 'monthly' as const },
            ],
          },
        })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      const removeButtons = screen.getAllByRole('button', { name: /remove income source/i });
      expect(removeButtons).toHaveLength(2);
    });
  });

  describe('Maximum Income Sources Limit', () => {
    it('should disable "Add Income Source" button when limit (10) is reached', async () => {
      const maxIncomeSources = Array.from({ length: 10 }, (_, i) => ({
        id: `source-${i}`,
        type: 'pension' as const,
        amount: 1000,
        period: 'annually' as const,
      }));

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: maxIncomeSources } })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      const addButton = screen.getByText('Add Income Source').closest('button');
      expect(addButton).toBeDisabled();
    });

    it('should show maximum limit message when limit is reached', async () => {
      const maxIncomeSources = Array.from({ length: 10 }, (_, i) => ({
        id: `source-${i}`,
        type: 'pension' as const,
        amount: 1000,
        period: 'annually' as const,
      }));

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: maxIncomeSources } })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      expect(screen.getByText('Maximum 10 income sources reached')).toBeInTheDocument();
    });

    it('should NOT show maximum limit message when under limit', async () => {
      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      expect(screen.queryByText('Maximum 10 income sources reached')).not.toBeInTheDocument();
    });

    it('should enable "Add Income Source" button when under limit', async () => {
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({
          input: {
            incomeSources: [
              {
                id: 'source-1',
                type: 'pension' as const,
                amount: 1000,
                period: 'annually' as const,
              },
            ],
          },
        })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      const addButton = screen.getByText('Add Income Source').closest('button');
      expect(addButton).not.toBeDisabled();
    });
  });

  describe('Auto-collapse on Reset', () => {
    it('should collapse when income sources are cleared', () => {
      const mockIncomeSource = {
        id: 'source-1',
        type: 'pension' as const,
        amount: 10000,
        period: 'annually' as const,
      };

      // Initial render with income sources
      const { rerender } = render(<IncomeSourceList />);
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [mockIncomeSource] } })
      );

      // Re-render to simulate sources being added
      rerender(<IncomeSourceList />);

      // Clear income sources
      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [] } })
      );

      // Re-render to simulate reset
      rerender(<IncomeSourceList />);

      // Should be collapsed (empty state message not in the document)
      expect(
        screen.queryByText('Add pension income, rental income, or other sources')
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on income type select', async () => {
      const mockIncomeSource = {
        id: 'source-1',
        type: 'pension' as const,
        amount: 10000,
        period: 'annually' as const,
      };

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [mockIncomeSource] } })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Check for aria-label attribute on the select trigger
      const selectTriggers = screen.getAllByLabelText(/select income type/i);
      expect(selectTriggers.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels on period select', async () => {
      const mockIncomeSource = {
        id: 'source-1',
        type: 'pension' as const,
        amount: 10000,
        period: 'annually' as const,
      };

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [mockIncomeSource] } })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      // Check for aria-label attribute on the period select trigger
      const selectTriggers = screen.getAllByLabelText(/select pay period/i);
      expect(selectTriggers.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA label on remove button', async () => {
      const mockIncomeSource = {
        id: 'source-1',
        type: 'pension' as const,
        amount: 10000,
        period: 'annually' as const,
      };

      (useCalculatorStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ input: { incomeSources: [mockIncomeSource] } })
      );

      const user = userEvent.setup();
      render(<IncomeSourceList />);

      const trigger = screen.getByText('Additional Income Sources');
      await user.click(trigger);

      expect(screen.getByRole('button', { name: /remove income source/i })).toBeInTheDocument();
    });
  });
});
