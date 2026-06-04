// src/components/molecules/__tests__/Footer.test.tsx
// Tests for the simplified Ledger footer

import { fireEvent, render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer content in a div (molecule pattern)', () => {
      const { container } = render(<Footer />);

      // Footer is a MOLECULE - it uses <div>, not <footer>
      // The parent template (Layout.tsx) wraps it in <footer>
      const footerDiv = container.firstChild;
      expect(footerDiv).toBeInTheDocument();
      expect(footerDiv).toHaveClass('footer-new');
    });

    it('should render brand name', () => {
      const { container } = render(<Footer />);

      const brand = container.querySelector('.footer-brand');
      expect(brand).toBeInTheDocument();
      expect(brand).toHaveTextContent('payetax');
    });

    it('should render copyright notice', () => {
      render(<Footer />);

      expect(screen.getByText(/© 2026 PayeTax/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render Blog link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Blog/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/blog');
    });

    it('should render About link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /About/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should render Privacy link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Privacy/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('should render Cookie Settings button', () => {
      render(<Footer />);
      expect(screen.getByRole('button', { name: /Cookie Settings/i })).toBeInTheDocument();
    });

    it('should render Compliance link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Compliance/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/compliance');
    });

    it('should render Support email link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Support/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'mailto:support@payetax.co.uk');
    });

    it('should render Tools link', () => {
      render(<Footer />);

      // Strip-back consolidated the individual tool links into one /tools entry.
      const link = screen.getByRole('link', { name: /Tools/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/tools');
    });

    it('should render Install App link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: /Install App/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/install');
    });

    it('should have navigation links', () => {
      render(<Footer />);

      const links = screen.getAllByRole('link');
      // Brand + Blog, Tools, Install, About, Privacy, Compliance, Support
      // (Cookie Settings is a button, not a link). Exact count guards against link creep.
      expect(links).toHaveLength(8);
    });
  });

  describe('Styling', () => {
    it('should apply custom className to root div', () => {
      const { container } = render(<Footer className='custom-class' />);

      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv).toHaveClass('custom-class');
    });

    it('should have footer-new class', () => {
      const { container } = render(<Footer />);

      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv).toHaveClass('footer-new');
    });

    it('should have footer-content-new wrapper', () => {
      const { container } = render(<Footer />);

      const content = container.querySelector('.footer-content-new');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use div element (molecule pattern - template owns <footer>)', () => {
      const { container } = render(<Footer />);

      const footerDiv = container.firstChild as HTMLElement;
      expect(footerDiv.tagName).toBe('DIV');
    });

    it('should have nav element with aria-label', () => {
      render(<Footer />);

      const nav = screen.getByRole('navigation', { name: /footer/i });
      expect(nav).toBeInTheDocument();
    });

    it('dispatches openCookiePreferences when cookie settings is clicked', () => {
      const listener = jest.fn();
      document.addEventListener('openCookiePreferences', listener);

      render(<Footer />);
      fireEvent.click(screen.getByRole('button', { name: /Cookie Settings/i }));

      expect(listener).toHaveBeenCalledTimes(1);
      document.removeEventListener('openCookiePreferences', listener);
    });
  });

  describe('Content', () => {
    it('should display current year in copyright', () => {
      render(<Footer />);

      expect(screen.getByText(/2026/i)).toBeInTheDocument();
    });

    it('should have footer-brand class on brand', () => {
      const { container } = render(<Footer />);

      const brand = container.querySelector('.footer-brand');
      expect(brand).toBeInTheDocument();
    });

    it('should have footer-copy class on copyright', () => {
      const { container } = render(<Footer />);

      const copy = container.querySelector('.footer-copy');
      expect(copy).toBeInTheDocument();
    });
  });
});
