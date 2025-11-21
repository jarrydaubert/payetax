// src/components/organisms/__tests__/SimpleHero.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import SimpleHero from '../SimpleHero';

describe('SimpleHero Component', () => {
  const mockOnScrollToCalculator = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the hero section', () => {
      const { container } = render(<SimpleHero />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render main heading', () => {
      render(<SimpleHero />);

      // Heading contains a line break, so we check for parts of the text
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Free UK PAYE Tax');
      expect(heading.textContent).toContain('Calculator 2025-2026');
    });

    it('should render description text', () => {
      render(<SimpleHero />);

      expect(screen.getByText(/Calculate your take-home pay instantly/i)).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      render(<SimpleHero />);

      expect(screen.getByRole('button', { name: /Calculate My Salary/i })).toBeInTheDocument();
    });

    it('should render all feature items', () => {
      render(<SimpleHero />);

      expect(screen.getByText('Accurate Calculations')).toBeInTheDocument();
      expect(screen.getByText('2025-2026 Tax Year')).toBeInTheDocument();
      expect(screen.getByText('Scottish Tax Support')).toBeInTheDocument();
      expect(screen.getByText('Instant Results')).toBeInTheDocument();
    });
  });

  describe('Button Interaction', () => {
    it('should call onScrollToCalculator when button is clicked', () => {
      render(<SimpleHero onScrollToCalculator={mockOnScrollToCalculator} />);

      const button = screen.getByRole('button', { name: /Calculate My Salary/i });
      fireEvent.click(button);

      expect(mockOnScrollToCalculator).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when onScrollToCalculator is not provided', () => {
      render(<SimpleHero />);

      const button = screen.getByRole('button', { name: /Calculate My Salary/i });

      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should render button with arrow icon', () => {
      render(<SimpleHero />);

      const button = screen.getByRole('button', { name: /Calculate My Salary/i });
      const icon = button.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<SimpleHero className='custom-class' />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      const { container } = render(<SimpleHero />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('relative');
      expect(section).toHaveClass('flex');
    });

    it('should have text-gradient class on year text', () => {
      const { container } = render(<SimpleHero />);

      const gradientText = container.querySelector('.text-gradient');
      expect(gradientText).toBeInTheDocument();
      expect(gradientText?.textContent).toBe('Calculator 2025-2026');
    });
  });

  describe('Accessibility', () => {
    it('should have section element', () => {
      render(<SimpleHero />);

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<SimpleHero />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible button', () => {
      render(<SimpleHero />);

      const button = screen.getByRole('button', { name: /Calculate My Salary/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should render with Framer Motion components', () => {
      const { container } = render(<SimpleHero />);

      // Check that component renders without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not throw errors when unmounting', () => {
      const { unmount } = render(<SimpleHero />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Parallax Feature', () => {
    it('should render with parallax enabled by default', () => {
      const { container } = render(<SimpleHero />);
      // Component renders with default enableParallax=true
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render with parallax explicitly disabled', () => {
      const { container } = render(<SimpleHero enableParallax={false} />);
      // Component still renders when parallax is disabled
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render with parallax explicitly enabled', () => {
      const { container } = render(<SimpleHero enableParallax={true} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display correct year in heading', () => {
      render(<SimpleHero />);

      const yearTexts = screen.getAllByText(/2025-2026/i);
      expect(yearTexts.length).toBeGreaterThan(0);
    });

    it('should mention key features in description', () => {
      render(<SimpleHero />);

      const description = screen.getByText(/Calculate your take-home pay instantly/i);
      expect(description).toHaveTextContent('income tax');
      expect(description).toHaveTextContent('National Insurance');
      expect(description).toHaveTextContent('student loans');
      expect(description).toHaveTextContent('pension contributions');
    });

    it('should display feature bullets', () => {
      const { container } = render(<SimpleHero />);

      // Check for bullet points (small circles)
      const bullets = container.querySelectorAll('.h-1\\.5');
      expect(bullets.length).toBe(4);
    });
  });
});
