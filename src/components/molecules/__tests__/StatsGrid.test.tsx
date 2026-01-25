/**
 * Tests for StatsGrid Component
 */

import { render, screen } from '@testing-library/react';
import { Award, Calculator, Lock, Zap } from 'lucide-react';
import { type Stat, StatsGrid } from '../StatsGrid';

describe('StatsGrid', () => {
  const mockStats: Stat[] = [
    {
      icon: Calculator,
      value: '100%',
      label: 'Free Forever',
      description: 'Always free, no hidden costs',
      color: 'from-primary to-accent',
    },
    {
      icon: Lock,
      value: '0',
      label: 'Data Stored',
      description: 'Zero data collection',
    },
    {
      icon: Zap,
      value: '<300kB',
      label: 'Bundle Size',
    },
  ];

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<StatsGrid stats={mockStats} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should render all stats', () => {
      render(<StatsGrid stats={mockStats} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('<300kB')).toBeInTheDocument();
    });

    it('should render labels', () => {
      render(<StatsGrid stats={mockStats} />);

      expect(screen.getByText('Free Forever')).toBeInTheDocument();
      expect(screen.getByText('Data Stored')).toBeInTheDocument();
      expect(screen.getByText('Bundle Size')).toBeInTheDocument();
    });

    it('should render descriptions when provided', () => {
      render(<StatsGrid stats={mockStats} />);

      expect(screen.getByText('Always free, no hidden costs')).toBeInTheDocument();
      expect(screen.getByText('Zero data collection')).toBeInTheDocument();
      expect(screen.queryByText('No description')).not.toBeInTheDocument();
    });

    it('should handle numeric values', () => {
      const numericStats: Stat[] = [{ icon: Award, value: 2025, label: 'Year' }];

      render(<StatsGrid stats={numericStats} />);
      expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('should handle empty stats array', () => {
      render(<StatsGrid stats={[]} />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list).toBeEmptyDOMElement();
    });
  });

  describe('Columns', () => {
    it('should apply 2 column grid classes', () => {
      const { container } = render(<StatsGrid stats={mockStats} columns={2} />);
      const grid = container.querySelector('ul');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should apply 3 column grid classes (default)', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);
      const grid = container.querySelector('ul');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should apply 4 column grid classes', () => {
      const { container } = render(<StatsGrid stats={mockStats} columns={4} />);
      const grid = container.querySelector('ul');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      const { container } = render(<StatsGrid stats={mockStats} variant='default' />);
      const cards = container.querySelectorAll('[class*="bg-card"]');
      expect(cards[0]).toHaveClass('bg-card/50', 'backdrop-blur-sm');
    });

    it('should apply elevated variant classes', () => {
      const { container } = render(<StatsGrid stats={mockStats} variant='elevated' />);
      const cards = container.querySelectorAll('[class*="hover:shadow-lg"]');
      expect(cards[0]).toHaveClass('hover:shadow-lg');
    });

    it('should apply bordered variant classes', () => {
      const { container } = render(<StatsGrid stats={mockStats} variant='bordered' />);
      const cards = container.querySelectorAll('[class*="border-2"]');
      expect(cards[0]).toHaveClass('border-2');
    });
  });

  describe('Custom Classes', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<StatsGrid stats={mockStats} className='custom-class' />);
      const grid = container.querySelector('ul');
      expect(grid).toHaveClass('custom-class');
    });

    it('should preserve grid classes with custom className', () => {
      const { container } = render(
        <StatsGrid stats={mockStats} columns={3} className='custom-class' />
      );
      const grid = container.querySelector('ul');
      expect(grid).toHaveClass('custom-class', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      const list = container.querySelector('ul[aria-label="Statistics"]');
      expect(list).toBeInTheDocument();
    });

    it('should render cards as list items', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('should display values as visible text', () => {
      render(<StatsGrid stats={mockStats} />);

      // Values are visible text, no aria-label needed (avoids redundancy)
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('<300kB')).toBeInTheDocument();
    });

    it('should mark icons as decorative', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      const iconContainers = container.querySelectorAll('[aria-hidden="true"]');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Design Tokens', () => {
    it('should use design tokens for spacing', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      // Check for design token classes
      const content = container.querySelector('.p-6');
      expect(content).toBeInTheDocument();
    });

    it('should use design tokens for typography', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      // Check for typography classes
      const value = container.querySelector('.text-3xl');
      expect(value).toBeInTheDocument();
    });
  });

  describe('Icon Colors', () => {
    it('should apply custom gradient color', () => {
      const { container } = render(<StatsGrid stats={mockStats} />);

      const iconContainer = container.querySelector('.from-primary.to-accent');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use default gradient when no color specified', () => {
      const statsWithoutColor: Stat[] = [{ icon: Calculator, value: '100%', label: 'Test' }];

      const { container } = render(<StatsGrid stats={statsWithoutColor} />);
      const iconContainer = container.querySelector('.from-primary.to-accent');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Unique Keys', () => {
    it('should generate unique keys for stats', () => {
      const duplicateLabelStats: Stat[] = [
        { icon: Calculator, value: '100', label: 'Same Label' },
        { icon: Lock, value: '200', label: 'Same Label' },
      ];

      const { container } = render(<StatsGrid stats={duplicateLabelStats} />);
      const cards = container.querySelectorAll('li');
      expect(cards).toHaveLength(2);
    });
  });
});
