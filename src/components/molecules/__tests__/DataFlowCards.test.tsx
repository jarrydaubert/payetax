/**
 * Tests for DataFlowCards Component
 */

import { render, screen } from '@testing-library/react';
import { Database, FileText, Server } from 'lucide-react';
import { type DataFlowCard, DataFlowCards } from '../DataFlowCards';

describe('DataFlowCards', () => {
  const mockCards: DataFlowCard[] = [
    {
      icon: Database,
      iconColor: 'bg-primary',
      title: 'Your Device',
      description: 'All calculations happen here. Your data never leaves this device.',
    },
    {
      icon: Server,
      iconColor: 'bg-primary/80',
      title: 'Our Servers',
      description: 'Only serve the website code. No tax data stored.',
    },
    {
      icon: FileText,
      iconColor: 'bg-primary/60',
      title: 'Analytics',
      description: 'Privacy-focused analytics with no personal data.',
    },
  ];

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<DataFlowCards cards={mockCards} />);
      expect(screen.getByText('Your Device')).toBeInTheDocument();
    });

    it('should render all cards', () => {
      render(<DataFlowCards cards={mockCards} />);

      expect(screen.getByText('Your Device')).toBeInTheDocument();
      expect(screen.getByText('Our Servers')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should render all descriptions', () => {
      render(<DataFlowCards cards={mockCards} />);

      expect(screen.getByText(/All calculations happen here/)).toBeInTheDocument();
      expect(screen.getByText(/Only serve the website code/)).toBeInTheDocument();
      expect(screen.getByText(/Privacy-focused analytics/)).toBeInTheDocument();
    });

    it('should handle empty cards array', () => {
      const { container } = render(<DataFlowCards cards={[]} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeEmptyDOMElement();
    });
  });

  describe('Columns', () => {
    it('should apply 3 column grid by default', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('should apply 2 column grid when specified', () => {
      const { container } = render(<DataFlowCards cards={mockCards} columns={2} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Icon Colors', () => {
    it('should apply custom icon colors', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const primaryIcon = container.querySelector('.bg-primary');
      expect(primaryIcon).toBeInTheDocument();
    });

    it('should use default bg-primary when no color specified', () => {
      const cardsWithoutColor: DataFlowCard[] = [
        {
          icon: Database,
          title: 'Test',
          description: 'Test description',
        },
      ];

      const { container } = render(<DataFlowCards cards={cardsWithoutColor} />);

      const icon = container.querySelector('.bg-primary');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use grid layout', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid');
    });

    it('should center content in cards', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const cards = container.querySelectorAll('.text-center');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<DataFlowCards cards={mockCards} className='custom-class' />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      const { container } = render(<DataFlowCards cards={mockCards} className='custom-class' />);

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-class', 'grid');
    });
  });

  describe('Typography', () => {
    it('should use correct typography for titles', () => {
      render(<DataFlowCards cards={mockCards} />);

      const titles = screen.getAllByRole('heading', { level: 3 });
      for (const title of titles) {
        expect(title).toHaveClass('text-xl', 'font-bold');
      }
    });

    it('should apply muted color to descriptions', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const descriptions = container.querySelectorAll('.text-muted-foreground');
      expect(descriptions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should use proper heading levels', () => {
      render(<DataFlowCards cards={mockCards} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    it('should mark icons as decorative', () => {
      const { container } = render(<DataFlowCards cards={mockCards} />);

      const decorativeIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single card', () => {
      render(<DataFlowCards cards={[mockCards[0]]} />);

      expect(screen.getByText('Your Device')).toBeInTheDocument();
      expect(screen.queryByText('Our Servers')).not.toBeInTheDocument();
    });

    it('should handle many cards', () => {
      const manyCards: DataFlowCard[] = Array.from({ length: 6 }, (_, i) => ({
        icon: Database,
        title: `Stage ${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      render(<DataFlowCards cards={manyCards} />);

      expect(screen.getByText('Stage 1')).toBeInTheDocument();
      expect(screen.getByText('Stage 6')).toBeInTheDocument();
    });

    it('should generate unique keys', () => {
      const duplicateTitles: DataFlowCard[] = [
        { icon: Database, title: 'Same', description: 'First' },
        { icon: Server, title: 'Same', description: 'Second' },
      ];

      const { container } = render(<DataFlowCards cards={duplicateTitles} />);

      const cards = container.querySelectorAll('.text-center');
      expect(cards).toHaveLength(2);
    });
  });
});
