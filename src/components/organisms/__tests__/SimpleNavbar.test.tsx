// src/components/organisms/__tests__/SimpleNavbar.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import SimpleNavbar from '../SimpleNavbar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock FeedbackDialog
jest.mock('@/components/organisms/FeedbackDialog', () => ({
  FeedbackDialog: () => <div data-testid='feedback-dialog'>Feedback</div>,
}));

describe('SimpleNavbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('should render navigation element', () => {
      const { container } = render(<SimpleNavbar />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should render logo link', () => {
      render(<SimpleNavbar />);

      const logo = screen.getByText('PayeTax');
      expect(logo).toBeInTheDocument();
    });

    it('should render skip-to-content link', () => {
      render(<SimpleNavbar />);

      const skipLink = screen.getByText('Skip to content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should render all navigation links', () => {
      render(<SimpleNavbar />);

      expect(screen.getAllByText('Calculator').length).toBeGreaterThan(0);
      expect(screen.getAllByText('TaxInsights').length).toBeGreaterThan(0);
      expect(screen.getAllByText('About').length).toBeGreaterThan(0);
    });

    it('should render feedback dialog', () => {
      render(<SimpleNavbar />);

      expect(screen.getAllByTestId('feedback-dialog').length).toBeGreaterThan(0);
    });

    it('should render mobile menu button', () => {
      render(<SimpleNavbar />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Logo', () => {
    it('should link to homepage', () => {
      render(<SimpleNavbar />);

      const logo = screen.getByText('PayeTax').closest('a');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('should have gradient styling', () => {
      const { container } = render(<SimpleNavbar />);

      const logo = container.querySelector('.bg-gradient-to-r');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Desktop Navigation', () => {
    it('should show desktop nav on larger screens', () => {
      const { container } = render(<SimpleNavbar />);

      const desktopNav = container.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should have Calculator link with hash', () => {
      render(<SimpleNavbar />);

      const links = screen.getAllByRole('link');
      const calculatorLink = links.find((link) =>
        link.getAttribute('href')?.includes('#tax-calculator')
      );

      expect(calculatorLink).toBeDefined();
    });

    it('should have Blog link', () => {
      render(<SimpleNavbar />);

      const links = screen.getAllByRole('link');
      const blogLink = links.find((link) => link.getAttribute('href') === '/blog');

      expect(blogLink).toBeDefined();
    });

    it('should have About link', () => {
      render(<SimpleNavbar />);

      const links = screen.getAllByRole('link');
      const aboutLink = links.find((link) => link.getAttribute('href') === '/about');

      expect(aboutLink).toBeDefined();
    });
  });

  describe('Active Link States', () => {
    it('should mark Calculator as active on homepage', () => {
      (usePathname as jest.Mock).mockReturnValue('/');

      render(<SimpleNavbar />);

      const calculatorLinks = screen.getAllByText('Calculator');
      const desktopLink = calculatorLinks[0];

      expect(desktopLink).toHaveClass('text-primary');
    });

    it('should mark TaxInsights as active on blog page', () => {
      (usePathname as jest.Mock).mockReturnValue('/blog');

      render(<SimpleNavbar />);

      const blogLinks = screen.getAllByText('TaxInsights');
      const desktopLink = blogLinks[0];

      expect(desktopLink).toHaveClass('text-primary');
    });

    it('should mark About as active on about page', () => {
      (usePathname as jest.Mock).mockReturnValue('/about');

      render(<SimpleNavbar />);

      const aboutLinks = screen.getAllByText('About');
      const desktopLink = aboutLinks[0];

      expect(desktopLink).toHaveClass('text-primary');
    });
  });

  describe('Mobile Menu', () => {
    it('should not show mobile menu by default', () => {
      const { container } = render(<SimpleNavbar />);

      const mobileMenu = container.querySelector('.md\\:hidden.space-y-2');
      expect(mobileMenu).not.toBeInTheDocument();
    });

    it('should toggle mobile menu when button clicked', () => {
      const { container } = render(<SimpleNavbar />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const mobileMenu = container.querySelector('.space-y-2');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should show Close menu label when open', () => {
      render(<SimpleNavbar />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });

    it('should close menu when backdrop is clicked', () => {
      const { container } = render(<SimpleNavbar />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Click backdrop
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Menu should close
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('should show X icon when menu is open', () => {
      render(<SimpleNavbar />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText('Close menu');
      const xIcon = closeButton.querySelector('svg');

      expect(xIcon).toBeInTheDocument();
    });

    it('should show Menu icon when menu is closed', () => {
      render(<SimpleNavbar />);

      const menuButton = screen.getByLabelText('Open menu');
      const menuIcon = menuButton.querySelector('svg');

      expect(menuIcon).toBeInTheDocument();
    });
  });

  describe('Blog Page Styling', () => {
    it('should apply special styling on blog pages', () => {
      (usePathname as jest.Mock).mockReturnValue('/blog');

      const { container } = render(<SimpleNavbar />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('border-b');
      expect(nav).toHaveClass('backdrop-blur-md');
    });

    it('should apply consistent styling on all pages', () => {
      (usePathname as jest.Mock).mockReturnValue('/');

      const { container } = render(<SimpleNavbar />);

      const nav = container.querySelector('nav');
      // Border is now applied consistently across all pages
      expect(nav).toHaveClass('border-b');
      expect(nav).toHaveClass('backdrop-blur-md');
    });
  });

  describe('Calculator Link Scroll Behavior', () => {
    beforeEach(() => {
      // Mock scrollIntoView
      Element.prototype.scrollIntoView = jest.fn();
      // Mock getElementById
      document.getElementById = jest.fn();
    });

    it('should scroll to calculator when on homepage', () => {
      (usePathname as jest.Mock).mockReturnValue('/');

      const mockElement = document.createElement('div');
      mockElement.id = 'tax-calculator';
      mockElement.scrollIntoView = jest.fn();
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);

      render(<SimpleNavbar />);

      const calculatorLinks = screen.getAllByText('Calculator');
      const desktopLink = calculatorLinks[0];

      fireEvent.click(desktopLink);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<SimpleNavbar className='custom-class' />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      const { container } = render(<SimpleNavbar />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('relative');
      expect(nav).toHaveClass('z-50');
    });

    it('should have container with max-width', () => {
      const { container } = render(<SimpleNavbar />);

      const containerDiv = container.querySelector('.container.max-w-7xl');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible skip link', () => {
      render(<SimpleNavbar />);

      const skipLink = screen.getByText('Skip to content');
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should have proper button labels', () => {
      render(<SimpleNavbar />);

      expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
    });

    it('should use nav semantic element', () => {
      const { container } = render(<SimpleNavbar />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should render with Framer Motion components', () => {
      const { container } = render(<SimpleNavbar />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should not throw errors when unmounting', () => {
      const { unmount } = render(<SimpleNavbar />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
