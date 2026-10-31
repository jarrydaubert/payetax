// src/components/molecules/__tests__/ResultCard.test.tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calculator } from 'lucide-react';
import { ResultCard } from '../ResultCard';

describe('ResultCard Component', () => {
  describe('Pointer capabilities', () => {
    const originalMatchMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('renders touch content without a tooltip trigger, hidden button or tab stop', () => {
      const { container } = render(
        <ResultCard
          label='Annual Take-Home'
          value='£30,000'
          tooltip='Your yearly take-home pay.'
        />,
      );
      expect(window.matchMedia).toHaveBeenCalledWith('(hover: hover) and (pointer: fine)');
      expect(container.querySelector('button, [tabindex], [role="button"], [title]')).toBeNull();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(screen.getByText('£30,000')).toBeInTheDocument();
    });

    it('removes desktop focus access and an open tooltip when pointer capabilities change', async () => {
      const query = '(hover: hover) and (pointer: fine)';
      const capabilities = new EventTarget();
      window.matchMedia = jest.fn((media) =>
        media === query
          ? {
              ...originalMatchMedia(media),
              matches: true,
              addEventListener: capabilities.addEventListener.bind(capabilities),
              removeEventListener: capabilities.removeEventListener.bind(capabilities),
            }
          : originalMatchMedia(media),
      );
      const { container } = render(
        <ResultCard
          label='Annual Take-Home'
          value='£30,000'
          tooltip='Your yearly take-home pay.'
        />,
      );
      expect(screen.getByRole('button', { name: /Annual Take-Home/ })).toBeInTheDocument();
      await userEvent.setup().tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Your yearly take-home pay.');
      fireEvent.scroll(document);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      act(() => {
        capabilities.dispatchEvent(
          Object.assign(new Event('change'), { matches: false, media: query }),
        );
      });
      expect(container.querySelector('button, [tabindex], [role="button"]')).toBeNull();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(screen.getByText('£30,000')).toBeInTheDocument();
      act(() => {
        capabilities.dispatchEvent(
          Object.assign(new Event('change'), { matches: true, media: query }),
        );
      });
      expect(screen.getByRole('button', { name: /Annual Take-Home/ })).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('should render with label and value', () => {
      render(<ResultCard label='Net Income' value='£30,000' />);

      expect(screen.getByText('Net Income')).toBeInTheDocument();
      expect(screen.getByText('£30,000')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const { container } = render(<ResultCard label='Tax' value='£10,000' icon={Calculator} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render without icon', () => {
      const { container } = render(<ResultCard label='Tax' value='£10,000' />);

      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should render label with correct styling', () => {
      render(<ResultCard label='Label Text' value='Value' />);

      const label = screen.getByText('Label Text');
      expect(label).toHaveClass('text-foreground/80'); // Updated for WCAG AA compliance
      expect(label).toHaveClass('text-sm');
    });

    it('should render value with correct styling', () => {
      render(<ResultCard label='Label' value='£50,000' />);

      const value = screen.getByText('£50,000');
      expect(value).toHaveClass('font-mono');
      expect(value).toHaveClass('font-semibold');
      expect(value).toHaveClass('text-2xl');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='default' />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });

    it('should apply success variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='success' />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-success');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='warning' />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-warning');
    });

    it('should apply info variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='info' />,
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });

    it('should default to default variant when not specified', () => {
      const { container } = render(<ResultCard label='Label' value='Value' icon={Calculator} />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' className='custom-class' />,
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have card border styling', () => {
      const { container } = render(<ResultCard label='Label' value='Value' />);

      const card = container.querySelector('.border');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-border');
    });

    it('should have card padding', () => {
      const { container } = render(<ResultCard label='Label' value='Value' />);

      const card = container.querySelector('.p-4');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should support delay prop', () => {
      render(<ResultCard label='Label' value='Value' delay={0.5} />);

      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('should render with default delay of 0', () => {
      render(<ResultCard label='Label' value='Value' />);

      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('should animate in with Framer Motion', () => {
      const { container } = render(<ResultCard label='Label' value='Value' />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have flex layout for label and icon', () => {
      render(<ResultCard label='Label' value='Value' icon={Calculator} />);

      const labelRow = screen.getByText('Label').parentElement;
      expect(labelRow).toHaveClass('flex');
      expect(labelRow).toHaveClass('items-center');
      expect(labelRow).toHaveClass('justify-between');
    });

    it('should have vertical spacing', () => {
      const { container } = render(<ResultCard label='Label' value='Value' />);

      const content = container.querySelector('.space-y-2');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long label text', () => {
      render(
        <ResultCard
          label='This is a very long label that might wrap to multiple lines'
          value='£100,000'
        />,
      );

      expect(
        screen.getByText('This is a very long label that might wrap to multiple lines'),
      ).toBeInTheDocument();
    });

    it('should handle very large value', () => {
      render(<ResultCard label='Label' value='£999,999,999.99' />);

      expect(screen.getByText('£999,999,999.99')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      render(<ResultCard label='Loss' value='-£5,000' />);

      expect(screen.getByText('-£5,000')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<ResultCard label='Tax' value='£0' />);

      expect(screen.getByText('£0')).toBeInTheDocument();
    });

    it('should handle unmounting', () => {
      const { unmount } = render(<ResultCard label='Label' value='Value' />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML', () => {
      render(<ResultCard label='Net Income' value='£30,000' />);

      const label = screen.getByText('Net Income');
      const value = screen.getByText('£30,000');

      expect(label.tagName).toBe('P');
      expect(value.tagName).toBe('P');
    });

    it('should have appropriate text contrast classes', () => {
      render(<ResultCard label='Label' value='Value' />);

      const label = screen.getByText('Label');
      const value = screen.getByText('Value');

      expect(label).toHaveClass('text-foreground/80'); // Updated for WCAG AA compliance
      expect(value).toHaveClass('text-foreground');
    });
  });
});
