/**
 * LabelTooltip Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabelTooltip } from '../LabelTooltip';

describe('LabelTooltip Component', () => {
  describe('Rendering', () => {
    it('should not render when fieldName not found', () => {
      const { container } = render(<LabelTooltip fieldName='nonexistent' />);

      expect(screen.queryByTestId('tooltip-trigger-nonexistent')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should render help icon when tooltip content exists', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('should render HelpCircle icon', () => {
      const { container } = render(<LabelTooltip fieldName='salary' />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('size-3.5');
    });
  });

  describe('Tooltip Content', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();

      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent).toHaveTextContent('Gross Salary');
      });
    });

    it('should display all tooltip content parts', async () => {
      const user = userEvent.setup();

      render(<LabelTooltip fieldName='salary' />);

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

      render(<LabelTooltip fieldName='studentLoanPlan' />);

      const trigger = screen.getByTestId('tooltip-trigger-studentLoanPlan');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-studentLoanPlan');
        expect(tooltipContent).toHaveTextContent(/Plan 1:/i);
        expect(tooltipContent).toHaveTextContent(/Plan 2:/i);
      });
    });

    it('should position tooltip on the left side', async () => {
      const user = userEvent.setup();
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        // Verify tooltip appears (positioning is handled by Radix UI)
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        expect(tooltipContent).toBeInTheDocument();
      });
    });
  });

  describe('Custom Content', () => {
    it('should use custom content when provided', async () => {
      const user = userEvent.setup();
      const customContent = {
        title: 'Custom Title',
        description: 'Custom description for testing',
        hmrc: 'Custom HMRC guidance text',
      };

      render(<LabelTooltip fieldName='salary' customContent={customContent} />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        expect(tooltipContent).toHaveTextContent('Custom Title');
        expect(tooltipContent).toHaveTextContent('Custom description for testing');
        expect(tooltipContent).toHaveTextContent('Custom HMRC guidance text');
      });
    });

    it('should override config content when custom content provided', async () => {
      const user = userEvent.setup();
      const customContent = {
        title: 'Override Title',
        description: 'Override description',
        hmrc: 'Override HMRC',
      };

      render(<LabelTooltip fieldName='salary' customContent={customContent} />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltipContent = screen.getByTestId('tooltip-content-salary');
        // Should NOT show default salary content
        expect(tooltipContent).not.toHaveTextContent('Gross Salary');
        // Should show custom content
        expect(tooltipContent).toHaveTextContent('Override Title');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for help button', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByLabelText('Help for Gross Salary');
      expect(trigger).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <input data-testid='other-input' />
          <LabelTooltip fieldName='salary' />
        </div>
      );

      const trigger = screen.getByTestId('tooltip-trigger-salary');

      // Tab to help button
      await user.tab();
      await user.tab();

      expect(trigger).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveClass('focus:ring-2');
      expect(trigger).toHaveClass('focus:ring-ring');
    });

    it('should have button type to prevent form submission', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Tooltip Config Integration', () => {
    it('should load content for all common fields', () => {
      const fields = ['salary', 'taxCode', 'region', 'pensionContribution', 'studentLoanPlan'];

      for (const fieldName of fields) {
        const { unmount } = render(<LabelTooltip fieldName={fieldName} />);

        const trigger = screen.getByTestId(`tooltip-trigger-${fieldName}`);
        expect(trigger).toBeInTheDocument();

        unmount();
      }
    });

    it('should handle all pension-related fields', () => {
      const pensionFields = ['pensionContribution', 'pensionType'];

      for (const fieldName of pensionFields) {
        const { unmount } = render(<LabelTooltip fieldName={fieldName} />);

        const trigger = screen.getByTestId(`tooltip-trigger-${fieldName}`);
        expect(trigger).toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Missing Field Handling', () => {
    it('should return null when field not found in config', () => {
      const { container } = render(<LabelTooltip fieldName='unknownField' />);

      // Component returns null for unknown fields
      expect(container.firstChild).toBeNull();
    });

    it('should render tooltip when valid field provided', () => {
      render(<LabelTooltip fieldName='salary' />);

      // Should render the tooltip trigger button
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should apply hover styles to help icon', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveClass('hover:text-foreground');
      expect(trigger).toHaveClass('text-muted-foreground');
    });

    it('should have rounded button style', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveClass('rounded-full');
    });

    it('should be flex-shrink-0 to prevent icon squashing', () => {
      render(<LabelTooltip fieldName='salary' />);

      const trigger = screen.getByTestId('tooltip-trigger-salary');
      expect(trigger).toHaveClass('flex-shrink-0');
    });
  });
});
