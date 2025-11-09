// src/components/molecules/__tests__/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock ThemeToggle
jest.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid='theme-toggle'>Theme Toggle</div>,
}));

// Mock theme hook
jest.mock('@/lib/theme', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}));

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer content in a div (molecule pattern)', () => {
      const { container } = render(<Footer />);

      // Footer is a MOLECULE - it uses <div>, not <footer>
      // The parent template (Layout.tsx) wraps it in <footer>
      const footerDiv = container.firstChild;
      expect(footerDiv).toBeInTheDocument();
      expect(footerDiv).toHaveClass('mt-auto');
    });

    it('should render brand name', () => {
      render(<Footer />);

      expect(screen.getByText('PayeTax')).toBeInTheDocument();
    });

    it('should render copyright notice', () => {
      render(<Footer />);

      expect(screen.getByText(/© 2025 PayeTax/i)).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      render(<Footer />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render About link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /About/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should render Blog link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Blog/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/blog');
    });

    it('should render Compliance link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Compliance/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/compliance');
    });

    it('should render Privacy link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Privacy/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('should render Contact email link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Contact/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'mailto:support@payetax.co.uk');
    });

    it('should render X/Twitter link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /X: @PayeTaxUK/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://x.com/PayeTaxUK');
    });

    it('should have all links visible', () => {
      render(<Footer />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('External Links', () => {
    it('should have target="_blank" on X link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /X: @PayeTaxUK/i });
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should have rel="noopener noreferrer" on X link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /X: @PayeTaxUK/i });
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Styling', () => {
    it('should apply custom className to root div', () => {
      const { container } = render(<Footer className='custom-class' />);

      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv).toHaveClass('custom-class');
    });

    it('should have mt-auto class for flexbox layout', () => {
      const { container } = render(<Footer />);

      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv).toHaveClass('mt-auto');
    });

    it('should have glass effect on content', () => {
      const { container } = render(<Footer />);

      const glassDiv = container.querySelector('.glass');
      expect(glassDiv).toBeInTheDocument();
    });

    it('should have gradient separator line', () => {
      const { container } = render(<Footer />);

      const separator = container.querySelector('.bg-gradient-to-r');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have responsive flexbox layout', () => {
      const { container } = render(<Footer />);

      const contentDiv = container.querySelector('.flex.flex-col');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have container with max-width', () => {
      const { container } = render(<Footer />);

      const container_div = container.querySelector('.container.max-w-7xl');
      expect(container_div).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use div element (molecule pattern - template owns <footer>)', () => {
      const { container } = render(<Footer />);

      // Molecule uses <div>, template wraps in <footer>
      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv.tagName).toBe('DIV');
    });

    it('should have aria-label on X link', () => {
      render(<Footer />);

      const link = screen.getByLabelText('X: @PayeTaxUK');
      expect(link).toBeInTheDocument();
    });

    it('should render Twitter icon', () => {
      render(<Footer />);

      const xLink = screen.getByRole('link', { name: /X: @PayeTaxUK/i });
      const icon = xLink.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display current year in copyright', () => {
      render(<Footer />);

      expect(screen.getByText(/2025/i)).toBeInTheDocument();
    });

    it('should display PayeTax brand name', () => {
      render(<Footer />);

      const brandName = screen.getByText('PayeTax');
      expect(brandName).toBeInTheDocument();
      expect(brandName).toHaveClass('font-bold');
    });

    it('should display X handle', () => {
      render(<Footer />);

      expect(screen.getByText(/@PayeTaxUK/i)).toBeInTheDocument();
    });
  });
});
