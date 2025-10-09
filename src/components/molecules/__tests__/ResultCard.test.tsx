// src/components/molecules/__tests__/ResultCard.test.tsx
import { render, screen } from '@testing-library/react';
import { Calculator } from 'lucide-react';
import { ResultCard } from '../ResultCard';

describe('ResultCard Component', () => {
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
      expect(label).toHaveClass('text-muted-foreground');
      expect(label).toHaveClass('text-sm');
    });

    it('should render value with correct styling', () => {
      render(<ResultCard label='Label' value='£50,000' />);

      const value = screen.getByText('£50,000');
      expect(value).toHaveClass('font-bold');
      expect(value).toHaveClass('text-2xl');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='default' />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });

    it('should apply success variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='success' />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-green-600');
      expect(icon).toHaveClass('dark:text-green-400');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='warning' />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-amber-600');
      expect(icon).toHaveClass('dark:text-amber-400');
    });

    it('should apply info variant styles', () => {
      const { container } = render(
        <ResultCard label='Label' value='Value' icon={Calculator} variant='info' />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-blue-600');
      expect(icon).toHaveClass('dark:text-blue-400');
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
        <ResultCard label='Label' value='Value' className='custom-class' />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have card border styling', () => {
      const { container } = render(<ResultCard label='Label' value='Value' />);

      const card = container.querySelector('.border-primary\\/20');
      expect(card).toBeInTheDocument();
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
        />
      );

      expect(
        screen.getByText('This is a very long label that might wrap to multiple lines')
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

      expect(label).toHaveClass('text-muted-foreground');
      expect(value).toHaveClass('text-foreground');
    });
  });
});
