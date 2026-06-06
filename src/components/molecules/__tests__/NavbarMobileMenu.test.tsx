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
  { href: '/#tax-calculator' as Route, label: 'Calculator' },
  { href: '/blog' as Route, label: 'Blog' },
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
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
    });

    it('should not render navigation when isOpen is false', () => {
      render(<NavbarMobileMenu {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should render all navigation links', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Calculator' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    it('should render utilities when provided', () => {
      render(
        <NavbarMobileMenu {...defaultProps} utilities={<button type='button'>Utility</button>} />,
      );
      expect(screen.getByRole('button', { name: 'Utility' })).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should mark Calculator as active when pathname is /', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/' />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      // Active state uses Tailwind class
      expect(calculatorLink).toHaveClass('text-primary');
    });

    it('should mark Blog as active when pathname starts with /blog', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/blog' />);
      const blogLink = screen.getByRole('link', { name: 'Blog' });
      expect(blogLink).toHaveClass('text-primary');
    });

    it('should mark Blog as active for blog sub-pages', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/blog/some-article' />);
      const blogLink = screen.getByRole('link', { name: 'Blog' });
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
      // Inactive state uses secondary text class
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

      fireEvent.click(screen.getByRole('link', { name: 'Blog' }));
      expect(mockOnLinkClick).toHaveBeenCalledWith('Blog');

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
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Mobile navigation menu');
    });

    it('should have correct link href attributes', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Calculator' })).toHaveAttribute(
        'href',
        '/#tax-calculator',
      );
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
      expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    });
  });

  describe('Styling', () => {
    it('applies standalone safe-area top offset below navbar', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveClass(
        'top-[calc(4rem+var(--pwa-safe-area-top,0px))]',
      );
    });

    it('should have correct base classes on links', () => {
      render(<NavbarMobileMenu {...defaultProps} />);
      const aboutLink = screen.getByRole('link', { name: 'About' });
      expect(aboutLink).toHaveClass('block', 'rounded-lg', 'font-medium');
    });

    it('should apply active styling to active links', () => {
      render(<NavbarMobileMenu {...defaultProps} pathname='/' />);
      const calculatorLink = screen.getByRole('link', { name: 'Calculator' });
      // New design uses Tailwind classes for active state
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
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(<NavbarMobileMenu {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render without errors when closing', () => {
      const { rerender } = render(<NavbarMobileMenu {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      rerender(<NavbarMobileMenu {...defaultProps} isOpen={false} />);
      // AnimatePresence handles exit animation, dialog may still be in DOM briefly
    });
  });
});
