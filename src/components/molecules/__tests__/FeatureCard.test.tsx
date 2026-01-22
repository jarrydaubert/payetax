/**
 * Tests for FeatureCard Component
 */

import { render, screen } from '@testing-library/react';
import { Rocket, Shield, Zap } from 'lucide-react';
import { type Feature, FeatureCard } from '../FeatureCard';

describe('FeatureCard', () => {
  const mockFeature: Feature = {
    icon: Rocket,
    title: 'Blazing Fast',
    description: 'Sub-second page loads with optimized rendering and caching',
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<FeatureCard feature={mockFeature} />);
      expect(screen.getByText('Blazing Fast')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(<FeatureCard feature={mockFeature} />);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Blazing Fast');
    });

    it('should render description', () => {
      render(<FeatureCard feature={mockFeature} />);
      expect(screen.getByText(/Sub-second page loads/)).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Metric', () => {
    it('should render metric when provided', () => {
      const featureWithMetric: Feature = {
        ...mockFeature,
        metric: '<1.5s',
      };
      render(<FeatureCard feature={featureWithMetric} />);
      expect(screen.getByText('<1.5s')).toBeInTheDocument();
    });

    it('should not render metric when not provided', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);
      const metric = container.querySelector('[class*="font-mono"]');
      expect(metric).not.toBeInTheDocument();
    });

    it('should style metric correctly', () => {
      const featureWithMetric: Feature = {
        ...mockFeature,
        metric: '95+',
      };
      render(<FeatureCard feature={featureWithMetric} />);
      const metric = screen.getByText('95+');
      expect(metric).toHaveClass('font-mono', 'font-semibold');
    });
  });

  describe('Link', () => {
    it('should render link when provided', () => {
      const featureWithLink: Feature = {
        ...mockFeature,
        link: {
          text: 'Learn More',
          href: 'https://example.com',
        },
      };
      render(<FeatureCard feature={featureWithLink} />);
      expect(screen.getByRole('link', { name: /Learn More/ })).toBeInTheDocument();
    });

    it('should not render link when not provided', () => {
      render(<FeatureCard feature={mockFeature} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render link with correct href', () => {
      const featureWithLink: Feature = {
        ...mockFeature,
        link: {
          text: 'Documentation',
          href: '/docs/performance',
        },
      };
      render(<FeatureCard feature={featureWithLink} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/docs/performance');
    });

    it('should render link with arrow icon', () => {
      const featureWithLink: Feature = {
        ...mockFeature,
        link: {
          text: 'Read More',
          href: '/blog',
        },
      };
      render(<FeatureCard feature={featureWithLink} />);
      const link = screen.getByRole('link');
      const arrow = link.querySelector('svg');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      const { container } = render(<FeatureCard feature={mockFeature} variant='default' />);
      const card = container.querySelector('[class*="bg-card"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply showcase variant classes', () => {
      const { container } = render(<FeatureCard feature={mockFeature} variant='showcase' />);
      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply simple variant classes', () => {
      const { container } = render(<FeatureCard feature={mockFeature} variant='simple' />);
      const card = container.querySelector('[class*="border-none"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Gradient', () => {
    it('should apply gradient background', () => {
      const featureWithGradient: Feature = {
        ...mockFeature,
        gradient: {
          bg: 'from-cyan-500/10 to-emerald-500/10',
          icon: 'text-cyan-500',
          border: 'border-cyan-500/20',
        },
      };
      const { container } = render(<FeatureCard feature={featureWithGradient} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('from-cyan-500/10', 'to-emerald-500/10');
    });

    it('should apply gradient icon color', () => {
      const featureWithGradient: Feature = {
        ...mockFeature,
        gradient: {
          bg: 'from-yellow-500/10 to-orange-500/10',
          icon: 'text-yellow-500',
          border: 'border-yellow-500/20',
        },
      };
      const { container } = render(<FeatureCard feature={featureWithGradient} />);
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toHaveClass('text-yellow-500');
    });

    it('should apply gradient border', () => {
      const featureWithGradient: Feature = {
        ...mockFeature,
        gradient: {
          bg: 'from-green-500/10 to-emerald-500/10',
          icon: 'text-green-500',
          border: 'border-green-500/20',
        },
      };
      const { container } = render(<FeatureCard feature={featureWithGradient} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-green-500/20');
    });

    it('should use default icon color when no gradient', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toHaveClass('text-primary');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<FeatureCard feature={mockFeature} className='custom-class' />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      const { container } = render(<FeatureCard feature={mockFeature} className='custom-class' />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class', 'h-full', 'transition-all');
    });
  });

  describe('Typography', () => {
    it('should use correct typography for title', () => {
      render(<FeatureCard feature={mockFeature} />);
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });

    it('should use correct typography for description', () => {
      render(<FeatureCard feature={mockFeature} />);
      const description = screen.getByText(/Sub-second page loads/);
      expect(description).toHaveClass('text-base', 'text-muted-foreground');
    });

    it('should use correct typography for link', () => {
      const featureWithLink: Feature = {
        ...mockFeature,
        link: { text: 'Link', href: '/test' },
      };
      render(<FeatureCard feature={featureWithLink} />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('text-sm', 'font-semibold');
    });
  });

  describe('Accessibility', () => {
    it('should mark icon container as decorative', () => {
      const { container } = render(<FeatureCard feature={mockFeature} />);
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should use proper heading level', () => {
      render(<FeatureCard feature={mockFeature} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible link when provided', () => {
      const featureWithLink: Feature = {
        ...mockFeature,
        link: { text: 'Learn More', href: '/docs' },
      };
      render(<FeatureCard feature={featureWithLink} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName(/Learn More/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longFeature: Feature = {
        ...mockFeature,
        title: 'A'.repeat(100),
      };
      render(<FeatureCard feature={longFeature} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longFeature: Feature = {
        ...mockFeature,
        description: 'B'.repeat(500),
      };
      render(<FeatureCard feature={longFeature} />);
      expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
    });

    it('should handle all props together', () => {
      const fullFeature: Feature = {
        icon: Zap,
        title: 'Full Feature',
        description: 'Complete feature with all options',
        metric: '100%',
        link: { text: 'Details', href: '/details' },
        gradient: {
          bg: 'from-purple-500/10 to-pink-500/10',
          icon: 'text-purple-500',
          border: 'border-purple-500/20',
        },
      };
      render(<FeatureCard feature={fullFeature} variant='showcase' className='extra-class' />);

      expect(screen.getByText('Full Feature')).toBeInTheDocument();
      expect(screen.getByText('Complete feature with all options')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should handle different icons', () => {
      const icons = [Rocket, Shield, Zap];

      for (const icon of icons) {
        const feature: Feature = { ...mockFeature, icon };
        const { unmount } = render(<FeatureCard feature={feature} />);
        expect(screen.getByText('Blazing Fast')).toBeInTheDocument();
        unmount();
      }
    });
  });
});
