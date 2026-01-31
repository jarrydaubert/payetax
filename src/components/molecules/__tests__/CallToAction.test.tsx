// src/components/ui/__tests__/CallToAction.test.tsx
import { render, screen } from '@testing-library/react';
import CallToAction from '../CallToAction';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CallToAction Component', () => {
  describe('Contact Variant', () => {
    it('should render contact variant with correct content', () => {
      render(<CallToAction variant='contact' />);

      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText(/Questions, suggestions/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Email Us/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Try Calculator/i })).toBeInTheDocument();
    });

    it('should have correct email href', () => {
      render(<CallToAction variant='contact' />);

      const emailLink = screen.getByRole('link', { name: /Email Us/i });
      expect(emailLink).toHaveAttribute(
        'href',
        expect.stringContaining('mailto:support@payetax.co.uk'),
      );
    });
  });

  describe('Newsletter Variant', () => {
    it('should render newsletter variant with correct content', () => {
      render(<CallToAction variant='newsletter' />);

      expect(screen.getByText('Stay Updated')).toBeInTheDocument();
      expect(screen.getByText(/Get the latest UK tax insights/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Try Tax Calculator/i })).toBeInTheDocument();
    });

    it('should have email input field', () => {
      render(<CallToAction variant='newsletter' />);

      const emailInput = screen.getByPlaceholderText(/Enter your email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });
  });

  describe('Calculator Variant', () => {
    it('should render calculator variant with correct content', () => {
      render(<CallToAction variant='calculator' />);

      expect(screen.getByText('Ready to Calculate?')).toBeInTheDocument();
      expect(screen.getByText(/Use our free UK tax calculator/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Start Calculating/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Learn More/i })).toBeInTheDocument();
    });

    it('should link to calculator page', () => {
      render(<CallToAction variant='calculator' />);

      const calculatorLink = screen.getByRole('link', { name: /Start Calculating/i });
      expect(calculatorLink).toHaveAttribute('href', '/');
    });

    it('should link to about page', () => {
      render(<CallToAction variant='calculator' />);

      const aboutLink = screen.getByRole('link', { name: /Learn More/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });
  });

  describe('Default Behavior', () => {
    it('should render contact variant by default', () => {
      render(<CallToAction />);

      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<CallToAction className='custom-cta' />);

      const cta = container.firstChild;
      expect(cta).toHaveClass('custom-cta');
    });

    it('should render without custom className', () => {
      const { container } = render(<CallToAction />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render variant icon', () => {
      const { container } = render(<CallToAction variant='contact' />);

      // Check for SVG icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render button icons', () => {
      render(<CallToAction variant='contact' />);

      // Both buttons should have icons (rendered as SVG)
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<CallToAction variant='contact' />);

      const heading = screen.getByText('Get in Touch');
      expect(heading.tagName).toMatch(/H[1-6]/);
    });

    it('should have accessible links', () => {
      render(<CallToAction variant='contact' />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link).toBeInTheDocument();
      }
    });
  });
});
