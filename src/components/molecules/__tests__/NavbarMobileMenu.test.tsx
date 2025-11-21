/**
 * NavbarMobileMenu Component Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for the mobile navigation menu:
 * - Open/closed states
 * - Link rendering and active states
 * - Click handlers
 * - Backdrop functionality
 * - Utilities slot
 */

import { fireEvent, render, screen } from '@testing-library/react';
import type { Route } from 'next';
import { NavbarMobileMenu } from '../NavbarMobileMenu';

const mockLinks = [
  { href: '/' as Route, label: 'Calculator' },
  { href: '/blog' as Route, label: 'TaxInsights' },
  { href: '/about' as Route, label: 'About' },
] as const;

describe('NavbarMobileMenu', () => {
  const mockOnLinkClick = jest.fn();
  const mockOnBackdropClick = jest.fn();

  const defaultProps = {
    isOpen: true,
    links: mockLinks,
    pathname: '/',
    onLinkClick: mockOnLinkClick,
    onBackdropClick: mockOnBackdropClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
    });

    it('should not render navigation when isOpen is false', () => {
      render(<NavbarMobileMenu {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Calculator' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'TaxInsights' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    it('should render utilities when provided', () => {
      render(
        <NavbarMobileMenu {...defaultProps} utilities={<button type='button'>Feedback</button>} />
      );
      expect(screen.getByRole('button', { name: 'Feedback' })).toBeInTheDocument();
    });

    it('should not render utilities section when not provided', () => {
      const { container } = render(<NavbarMobileMenu {...defaultProps} />);
      // The utilities div with mt-4 class should not exist
      expect(container.querySelector('.mt-4')).not.toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should mark Calculator as active when pathname is /', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/' />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      expect(calculatorLink).toHaveClass('text-primary');
    });

    it('should mark TaxInsights as active when pathname starts with /blog', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/blog' />);
      const blogLink = screen.getByRole('link', { name: 'TaxInsights' });
      expect(blogLink).toHaveClass('text-primary');
    });

    it('should mark TaxInsights as active for blog sub-pages', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/blog/some-article' />);
      const blogLink = screen.getByRole('link', { name: 'TaxInsights' });
      expect(blogLink).toHaveClass('text-primary');
    });

    it('should mark link as active when pathname matches exactly', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/about' />);
      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveClass('text-primary');
    });

    it('should not mark non-matching links as active', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/about' />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      expect(calculatorLink).not.toHaveClass('text-primary');
      expect(calculatorLink).toHaveClass('text-muted-foreground');
    });
  });

  describe('Click Handlers', () => {
    it('should call onLinkClick when a link is clicked', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      fireEvent.click(calculatorLink);
      expect(mockOnLinkClick).toHaveBeenCalledWith('Calculator');
    });

    it('should call onLinkClick with correct label for each link', () => {
      render(<NavbarMobileMenu {...defaultProps} />);

      fireEvent.click(screen.getByRole('link', { name: 'Calculator' }));
      expect(mockOnLinkClick).toHaveBeenCalledWith('Calculator');

      fireEvent.click(screen.getByRole('link', { name: 'TaxInsights' }));
      expect(mockOnLinkClick).toHaveBeenCalledWith('TaxInsights');

      fireEvent.click(screen.getByRole('link', { name: 'About' }));
      expect(mockOnLinkClick).toHaveBeenCalledWith('About');
    });

    it('should call onBackdropClick when backdrop is clicked', () => {
      const { container } = render(<NavbarMobileMenu {...defaultProps} />);
      // The backdrop has the fixed inset-0 class
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnBackdropClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on navigation', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Mobile navigation menu'
      );
    });

    it('should have correct link href attributes', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Calculator' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'TaxInsights' })).toHaveAttribute('href', '/blog');
      expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    });
  });

  describe('Styling', () => {
    it('should have correct base classes on links', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveClass('block', 'rounded-lg', 'font-medium');
    });

    it('should apply active styling to active links', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/' />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      expect(calculatorLink).toHaveClass('bg-primary/10', 'text-primary');
    });

    it('should apply inactive styling to inactive links', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/' />);
      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveClass('text-muted-foreground');
    });
  });

  describe('Animation', () => {
    it('should render without errors when opening', () => {
      const { rerender } = render(<NavbarMobileMenu {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

      rerender(<NavbarMobileMenu {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render without errors when closing', () => {
      const { rerender } = render(<NavbarMobileMenu {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      rerender(<NavbarMobileMenu {...defaultProps} isOpen={false} />);
      // AnimatePresence handles exit animation, navigation may still be in DOM briefly
    });
  });
});
