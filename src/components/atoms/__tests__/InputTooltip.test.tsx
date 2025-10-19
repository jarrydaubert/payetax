/**
 * InputTooltip Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputTooltip } from '../InputTooltip';

describe('InputTooltip Component', () => {
  describe('Rendering', () => {
    it('should render children without tooltip when fieldName not found', () => {
      render(
        <InputTooltip fieldName='nonexistent'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      expect(screen.getByTestId('test-input')).toBeInTheDocument();
      expect(screen.queryByTestId('tooltip-trigger-nonexistent')).not.toBeInTheDocument();
    });

    it('should render help icon when tooltip content exists', () => {
      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      expect(screen.getByTestId('test-input')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger-salary')).toBeInTheDocument();
    });

    it('should render input and help icon side by side', () => {
      const { container } = render(
        <InputTooltip fieldName='taxCode'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const wrapper = container.querySelector('.flex.items-center.gap-2');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Tooltip Content', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();

      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        // Use getByTestId to target specific tooltip content
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent).toHaveTextContent('Gross Salary');
      });
    });

    it('should display all tooltip content parts', async () => {
      const user = userEvent.setup();

      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        // Title
        expect(tooltipContent).toHaveTextContent('Gross Salary');
        // Description
        expect(tooltipContent).toHaveTextContent(/total earnings before tax/i);
        // HMRC guidance
        expect(tooltipContent).toHaveTextContent(/Include salary, bonuses/i);
      });
    });

    it('should handle multiline HMRC content', async () => {
      const user = userEvent.setup();

      render(
        <InputTooltip fieldName='studentLoanPlan'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-studentLoanPlan');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-studentLoanPlan');
        expect(tooltipContent).toHaveTextContent(/Plan 1:/i);
        expect(tooltipContent).toHaveTextContent(/Plan 2:/i);
      });
    });
  });

  describe('Custom Content', () => {
    it('should use custom content when provided', async () => {
      const user = userEvent.setup();
      const customContent = {
        title: 'Custom Title',
        description: 'Custom description',
        hmrc: 'Custom HMRC guidance',
      };

      render(
        <InputTooltip fieldName='salary' customContent={customContent}>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        const titles = screen.getAllByText('Custom Title');
        expect(titles.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for help button', () => {
      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByLabelText('Help for Gross Salary');
      expect(trigger).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');

      // Tab to help button
      await user.tab();
      await user.tab(); // Assuming input gets focus first

      expect(trigger).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(
        <InputTooltip fieldName='salary'>
          <input data-testid='test-input' />
        </InputTooltip>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveClass('focus:ring-2');
    });
  });

  describe('Tooltip Config Integration', () => {
    it('should load content for all common fields', () => {
      const fields = ['salary', 'taxCode', 'region', 'pensionContribution', 'studentLoanPlan'];

      for (const fieldName of fields) {
        const { container } = render(
          <InputTooltip fieldName={fieldName}>
            <input />
          </InputTooltip>
        );

        const trigger = screen.getByTestId(`tooltip-trigger-${fieldName}`);
        expect(trigger).toBeInTheDocument();

        container.remove();
      }
    });
  });

  describe('Warning Logs', () => {
    it('should warn when field not found in config', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <InputTooltip fieldName='unknownField'>
          <input />
        </InputTooltip>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No tooltip content found for field: unknownField')
      );

      consoleSpy.mockRestore();
    });
  });
});
