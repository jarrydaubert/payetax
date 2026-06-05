/**
 * PageHero Component Tests
 *
 * @module components/molecules/__tests__/PageHero
 */

import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { PageHero } from '../PageHero';

describe('PageHero', () => {
  describe('Basic Rendering', () => {
    it('renders title correctly', () => {
      render(<PageHero title='Test Title' />);
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<PageHero title='Title' subtitle='Test subtitle' />);
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('renders multiple subtitles as separate paragraphs', () => {
      render(<PageHero title='Title' subtitle={['First subtitle', 'Second subtitle']} />);
      expect(screen.getByText('First subtitle')).toBeInTheDocument();
      expect(screen.getByText('Second subtitle')).toBeInTheDocument();
    });

    it('renders without subtitle', () => {
      const { container } = render(<PageHero title='Title' />);
      expect(container.querySelector('p')).not.toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('renders badge when provided', () => {
      render(<PageHero title='Title' badge={{ text: 'Badge Text' }} />);
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });

    it('renders badge with icon', () => {
      render(<PageHero title='Title' badge={{ icon: Sparkles, text: 'Badge' }} />);
      const badge = screen.getByText('Badge');
      expect(badge).toBeInTheDocument();
      // Icon should be in the DOM (aria-hidden)
      const svg = badge.parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not render badge when not provided', () => {
      const { container } = render(<PageHero title='Title' />);
      // Badge component wraps in a specific element
      const badge = container.querySelector('.badge, [class*="badge"]');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Alignment', () => {
    it('centers content by default', () => {
      const { container } = render(<PageHero title='Title' />);
      const contentDiv = container.querySelector('.text-center');
      expect(contentDiv).toBeInTheDocument();
    });

    it('left-aligns content when align="left"', () => {
      const { container } = render(<PageHero title='Title' align='left' />);
      const contentDiv = container.querySelector('.text-left');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies the Ledger grid background by default', () => {
      const { container } = render(<PageHero title='Title' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-ledger-grid');
      expect(section).not.toHaveClass('bg-gradient-to-br');
    });

    it('keeps variant="gradient" on the Ledger background for migration compatibility', () => {
      const { container } = render(<PageHero title='Title' variant='gradient' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-ledger-grid');
      expect(section).not.toHaveClass('bg-gradient-to-br');
    });

    it('does not apply the Ledger grid when variant="simple"', () => {
      const { container } = render(<PageHero title='Title' variant='simple' />);
      const section = container.querySelector('section');
      expect(section).not.toHaveClass('bg-ledger-grid');
    });
  });

  describe('React Nodes', () => {
    it('supports React nodes as title', () => {
      render(
        <PageHero
          title={
            <>
              <span>Styled</span> Regular Text
            </>
          }
        />,
      );
      expect(screen.getByText(/Styled/)).toBeInTheDocument();
      expect(screen.getByText(/Regular Text/)).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to section', () => {
      const { container } = render(<PageHero title='Title' className='custom-class' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading element', () => {
      render(<PageHero title='Accessible Title' />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Accessible Title');
    });

    it('marks icon as aria-hidden when present in badge', () => {
      render(<PageHero title='Title' badge={{ icon: Sparkles, text: 'Badge' }} />);
      const svg = screen.getByText('Badge').parentElement?.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Responsive Design', () => {
    it('includes responsive padding classes', () => {
      const { container } = render(<PageHero title='Title' />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('pt-20');
      expect(section).toHaveClass('md:pt-32');
    });
  });
});
