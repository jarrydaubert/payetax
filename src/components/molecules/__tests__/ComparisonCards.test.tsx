/**
 * Tests for ComparisonCards Component
 */

import { render, screen } from '@testing-library/react';
import { CheckCircle, X } from 'lucide-react';
import { ComparisonCards, type ComparisonItem } from '../ComparisonCards';

describe('ComparisonCards', () => {
  const mockLeft: ComparisonItem = {
    icon: X,
    title: "What We DON'T Do",
    items: ['Store your data', 'Track your usage', 'Sell your information'],
    variant: 'negative',
  };

  const mockRight: ComparisonItem = {
    icon: CheckCircle,
    title: 'What We DO',
    items: ['Respect privacy', 'Use official rates', 'Stay transparent'],
    variant: 'positive',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);
      expect(screen.getByText("What We DON'T Do")).toBeInTheDocument();
    });

    it('should render both cards', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);

      expect(screen.getByText("What We DON'T Do")).toBeInTheDocument();
      expect(screen.getByText('What We DO')).toBeInTheDocument();
    });

    it('should render all left items', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);

      expect(screen.getByText('Store your data')).toBeInTheDocument();
      expect(screen.getByText('Track your usage')).toBeInTheDocument();
      expect(screen.getByText('Sell your information')).toBeInTheDocument();
    });

    it('should render all right items', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);

      expect(screen.getByText('Respect privacy')).toBeInTheDocument();
      expect(screen.getByText('Use official rates')).toBeInTheDocument();
      expect(screen.getByText('Stay transparent')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply negative variant styling', () => {
      const { container } = render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const negativeCard = container.querySelector('.from-destructive\\/5');
      expect(negativeCard).toBeInTheDocument();
    });

    it('should apply positive variant styling', () => {
      const { container } = render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const positiveCard = container.querySelector('.from-primary\\/5');
      expect(positiveCard).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use grid layout', () => {
      const { container } = render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid');
    });

    it('should use 2-column grid on desktop', () => {
      const { container } = render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(
        <ComparisonCards left={mockLeft} right={mockRight} className='custom-class' />
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-class');
    });
  });

  describe('Typography', () => {
    it('should use correct typography for titles', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const titles = screen.getAllByRole('heading', { level: 3 });
      titles.forEach((title) => {
        expect(title).toHaveClass('text-2xl', 'font-bold');
      });
    });
  });

  describe('Accessibility', () => {
    it('should use proper heading levels', () => {
      render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2);
    });

    it('should mark icons as decorative', () => {
      const { container } = render(<ComparisonCards left={mockLeft} right={mockRight} />);

      const decorativeIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items arrays', () => {
      const emptyLeft: ComparisonItem = { ...mockLeft, items: [] };
      const emptyRight: ComparisonItem = { ...mockRight, items: [] };

      const { container } = render(<ComparisonCards left={emptyLeft} right={emptyRight} />);

      const lists = container.querySelectorAll('ul');
      lists.forEach((list) => {
        expect(list).toBeEmptyDOMElement();
      });
    });

    it('should handle single item', () => {
      const singleLeft: ComparisonItem = { ...mockLeft, items: ['Only one item'] };

      render(<ComparisonCards left={singleLeft} right={mockRight} />);

      expect(screen.getByText('Only one item')).toBeInTheDocument();
    });

    it('should handle many items', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);
      const manyLeft: ComparisonItem = { ...mockLeft, items: manyItems };

      render(<ComparisonCards left={manyLeft} right={mockRight} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 10')).toBeInTheDocument();
    });
  });
});
