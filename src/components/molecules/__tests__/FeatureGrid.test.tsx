/**
 * Tests for FeatureGrid Component
 */

import { render, screen } from '@testing-library/react';
import { Rocket, Shield, Sparkles, Zap } from 'lucide-react';
import type { Feature } from '../FeatureCard';
import { FeatureGrid } from '../FeatureGrid';

describe('FeatureGrid', () => {
  const mockFeatures: Feature[] = [
    {
      icon: Rocket,
      title: 'Fast',
      description: 'Lightning fast performance',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Efficient',
      description: 'Optimized for speed',
    },
  ];

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<FeatureGrid features={mockFeatures} />);
      expect(screen.getByText('Fast')).toBeInTheDocument();
    });

    it('should render all features', () => {
      render(<FeatureGrid features={mockFeatures} />);

      expect(screen.getByText('Fast')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
      expect(screen.getByText('Efficient')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<FeatureGrid features={mockFeatures} />);

      expect(screen.getByText('Lightning fast performance')).toBeInTheDocument();
      expect(screen.getByText('Enterprise-grade security')).toBeInTheDocument();
      expect(screen.getByText('Optimized for speed')).toBeInTheDocument();
    });

    it('should render as section element', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Heading', () => {
    it('should render heading when provided', () => {
      render(
        <FeatureGrid
          heading={{
            title: 'Our Features',
            subtitle: 'What makes us special',
          }}
          features={mockFeatures}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Our Features' })).toBeInTheDocument();
      expect(screen.getByText('What makes us special')).toBeInTheDocument();
    });

    it('should not render heading when not provided', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} />);

      // Should only have h3 headings from features, no h2
      const h2Headings = container.querySelectorAll('h2');
      expect(h2Headings).toHaveLength(0);
    });

    it('should render heading with badge', () => {
      render(
        <FeatureGrid
          heading={{
            badge: { icon: Sparkles, text: 'New' },
            title: 'Latest Features',
          }}
          features={mockFeatures}
        />,
      );

      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Latest Features' })).toBeInTheDocument();
    });

    it('should pass all heading props correctly', () => {
      render(
        <FeatureGrid
          heading={{
            id: 'test-features',
            title: 'Test',
            subtitle: 'Subtitle',
            align: 'center',
            level: 'h2',
          }}
          features={mockFeatures}
        />,
      );

      const heading = screen.getByRole('heading', { name: 'Test', level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-center');
    });
  });

  describe('Columns', () => {
    it('should apply 2 column grid classes', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} columns={2} />);
      const grid = container.querySelector('.md\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });

    it('should apply 3 column grid classes (default)', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} />);
      const grid = container.querySelector('.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive single column on mobile', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} columns={3} />);
      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Variant', () => {
    it('should pass variant to feature cards', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} variant='showcase' />);

      // Showcase variant adds hover:shadow-lg class
      const cards = container.querySelectorAll('[class*="hover:shadow-lg"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should use default variant when not specified', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} />);

      // Default variant adds bg-card/50 class
      const cards = container.querySelectorAll('[class*="bg-card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should support simple variant', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} variant='simple' />);

      // Simple variant has border-none
      const cards = container.querySelectorAll('[class*="border-none"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className to grid', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} className='custom-grid' />);
      const grid = container.querySelector('.custom-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should preserve default grid classes with custom className', () => {
      const { container } = render(<FeatureGrid features={mockFeatures} className='custom-grid' />);
      const grid = container.querySelector('.custom-grid');
      expect(grid).toHaveClass('grid', 'gap-6');
    });
  });

  describe('Feature Composition', () => {
    it('should render features with metrics', () => {
      const featuresWithMetrics: Feature[] = [
        { ...mockFeatures[0], metric: '<1.5s' },
        { ...mockFeatures[1], metric: '100%' },
      ];

      render(<FeatureGrid features={featuresWithMetrics} />);

      expect(screen.getByText('<1.5s')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render features with links', () => {
      const featuresWithLinks: Feature[] = [
        {
          ...mockFeatures[0],
          link: { text: 'Learn More', href: '/docs' },
        },
      ];

      render(<FeatureGrid features={featuresWithLinks} />);

      expect(screen.getByRole('link', { name: /Learn More/ })).toBeInTheDocument();
    });

    it('should render features with gradients', () => {
      const featuresWithGradients: Feature[] = [
        {
          ...mockFeatures[0],
          gradient: {
            bg: 'from-cyan-500/10 to-emerald-500/10',
            icon: 'text-cyan-500',
            border: 'border-cyan-500/20',
          },
        },
      ];

      const { container } = render(<FeatureGrid features={featuresWithGradients} />);
      const card = container.querySelector('.from-cyan-500\\/10');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty features array', () => {
      const { container } = render(<FeatureGrid features={[]} />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children).toHaveLength(0);
    });

    it('should handle single feature', () => {
      render(<FeatureGrid features={[mockFeatures[0]]} />);
      expect(screen.getByText('Fast')).toBeInTheDocument();
      expect(screen.queryByText('Secure')).not.toBeInTheDocument();
    });

    it('should handle many features', () => {
      const manyFeatures: Feature[] = Array.from({ length: 10 }, (_, i) => ({
        icon: Rocket,
        title: `Feature ${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      render(<FeatureGrid features={manyFeatures} />);

      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 10')).toBeInTheDocument();
    });

    it('should generate unique keys for features', () => {
      const duplicateTitleFeatures: Feature[] = [
        { icon: Rocket, title: 'Same Title', description: 'First' },
        { icon: Shield, title: 'Same Title', description: 'Second' },
      ];

      const { container } = render(<FeatureGrid features={duplicateTitleFeatures} />);
      const descriptions = container.querySelectorAll('p');
      expect(descriptions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Full Composition', () => {
    it('should render complete grid with all features', () => {
      render(
        <FeatureGrid
          heading={{
            badge: { icon: Sparkles, text: 'Features' },
            title: 'Why Choose Us',
            subtitle: 'Everything you need in one place',
            align: 'center',
          }}
          features={mockFeatures}
          columns={3}
          variant='showcase'
          className='my-custom-class'
        />,
      );

      // Heading
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Why Choose Us' })).toBeInTheDocument();
      expect(screen.getByText('Everything you need in one place')).toBeInTheDocument();

      // Features
      expect(screen.getByText('Fast')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
      expect(screen.getByText('Efficient')).toBeInTheDocument();

      // Grid
      const grid = screen.getByText('Fast').closest('.grid');
      expect(grid).toHaveClass('my-custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <FeatureGrid heading={{ title: 'Features' }} features={mockFeatures} />,
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should maintain heading hierarchy', () => {
      render(
        <FeatureGrid heading={{ title: 'Main Heading', level: 'h2' }} features={mockFeatures} />,
      );

      // Should have one h2 (main) and multiple h3 (features)
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h2).toBeInTheDocument();
      expect(h3s).toHaveLength(3);
    });
  });
});
