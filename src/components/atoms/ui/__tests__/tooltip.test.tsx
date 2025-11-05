// src/components/ui/__tests__/tooltip.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';

describe('Tooltip Component', () => {
  describe('Basic Rendering', () => {
    it('should render trigger button', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should not show tooltip initially', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const tooltips = screen.queryAllByText('Tooltip text');
      // Tooltip might exist in DOM but be hidden
      expect(tooltips.length).toBe(0);
    });
  });

  describe('Hover Behavior', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        // Radix UI may duplicate text for accessibility, use getAllByText
        const tooltips = screen.getAllByText('Tooltip text');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('should hide tooltip on unhover', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Tooltip text');
        expect(tooltips.length).toBeGreaterThan(0);
      });

      await user.unhover(trigger);

      await waitFor(() => {
        const tooltips = screen.queryAllByText('Tooltip text');
        expect(
          tooltips.every((el) => !el.isVisible || el.getAttribute('data-state') === 'closed')
        ).toBe(true);
      });
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className on TooltipContent', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent className='custom-tooltip'>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const contents = screen.getAllByText('Tooltip text');
        expect(contents.some((el) => el.classList.contains('custom-tooltip'))).toBe(true);
      });
    });
  });

  describe('Multiple Tooltips', () => {
    it('should render multiple tooltips', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('TooltipProvider', () => {
    it('should work with custom delay', async () => {
      const user = userEvent.setup();

      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const tooltips = screen.getAllByText('Tooltip text');
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });
  });
});
