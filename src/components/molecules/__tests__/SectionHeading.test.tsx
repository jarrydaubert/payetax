/**
 * Tests for SectionHeading Component
 */

import { render, screen } from '@testing-library/react';
import { Rocket, Sparkles } from 'lucide-react';
import { SectionHeading } from '../SectionHeading';

describe('SectionHeading', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<SectionHeading title='Test Title' />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render title as h2 by default', () => {
      render(<SectionHeading title='Test Title' />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Title');
    });

    it('should render title as h3 when specified', () => {
      render(<SectionHeading title='Test Title' level='h3' />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Title');
    });

    it('should render subtitle when provided', () => {
      render(<SectionHeading title='Title' subtitle='This is a subtitle' />);
      expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      const { container } = render(<SectionHeading title='Title' />);
      const paragraph = container.querySelector('p');
      expect(paragraph).not.toBeInTheDocument();
    });

    it('should render React node as title', () => {
      render(
        <SectionHeading
          title={
            <>
              <span>Bold</span> Text
            </>
          }
        />,
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText(/Text/)).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('should render badge when provided', () => {
      render(<SectionHeading title='Title' badge={{ text: 'New' }} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should not render badge when not provided', () => {
      const { container } = render(<SectionHeading title='Title' />);
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).not.toBeInTheDocument();
    });

    it('should render badge with icon', () => {
      const { container } = render(
        <SectionHeading title='Title' badge={{ icon: Sparkles, text: 'New Feature' }} />,
      );
      expect(screen.getByText('New Feature')).toBeInTheDocument();
      // Icon should have aria-hidden
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should render badge without icon', () => {
      render(<SectionHeading title='Title' badge={{ text: 'Important' }} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('should apply badge variant', () => {
      render(<SectionHeading title='Title' badge={{ text: 'Test', variant: 'secondary' }} />);
      const badge = screen.getByText('Test').closest('div');
      expect(badge).toHaveClass('bg-secondary');
    });

    it('should use outline variant by default', () => {
      render(<SectionHeading title='Title' badge={{ text: 'Test' }} />);
      const badge = screen.getByText('Test').closest('div');
      // Outline variant doesn't have bg-primary class
      expect(badge).not.toHaveClass('bg-primary');
    });
  });

  describe('Alignment', () => {
    it('should align left by default', () => {
      render(<SectionHeading title='Title' />);
      const heading = screen.getByText('Title');
      expect(heading).toHaveClass('text-left');
    });

    it('should align center when specified', () => {
      render(<SectionHeading title='Title' align='center' />);
      const heading = screen.getByText('Title');
      expect(heading).toHaveClass('text-center');
    });

    it('should center subtitle when align is center', () => {
      render(<SectionHeading title='Title' subtitle='Subtitle' align='center' />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('text-center', 'mx-auto');
    });

    it('should center badge when align is center', () => {
      render(<SectionHeading title='Title' badge={{ text: 'Badge' }} align='center' />);
      const badgeContainer = screen.getByText('Badge').closest('div')?.parentElement;
      expect(badgeContainer).toHaveClass('justify-center');
    });
  });

  describe('ID Attribute', () => {
    it('should apply id when provided', () => {
      const testId = `test-section-${Date.now()}`;
      const { container } = render(<SectionHeading title='Title' id={testId} />);
      const section = container.querySelector(`#${testId}`);
      expect(section).toBeInTheDocument();
    });

    it('should not have id when not provided', () => {
      const { container } = render(<SectionHeading title='Title' />);
      const divs = container.querySelectorAll('div');
      for (const div of divs) {
        expect(div).not.toHaveAttribute('id');
      }
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<SectionHeading title='Title' className='custom-class' />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      const { container } = render(<SectionHeading title='Title' className='custom-class' />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class', 'mb-8');
    });
  });

  describe('Typography', () => {
    it('should use correct typography for h2', () => {
      render(<SectionHeading title='Title' level='h2' />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-4xl');
    });

    it('should use correct typography for h3', () => {
      render(<SectionHeading title='Title' level='h3' />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('text-3xl');
    });

    it('should apply font-bold to title', () => {
      render(<SectionHeading title='Title' />);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-bold');
    });

    it('should apply muted color to subtitle', () => {
      render(<SectionHeading title='Title' subtitle='Subtitle' />);
      const subtitle = screen.getByText('Subtitle');
      expect(subtitle).toHaveClass('text-muted-foreground');
    });
  });

  describe('Design Tokens', () => {
    it('should use design tokens for spacing', () => {
      render(<SectionHeading title='Title' badge={{ icon: Rocket, text: 'Test' }} />);
      const badge = screen.getByText('Test').closest('div');
      expect(badge).toHaveClass('gap-2');
    });

    it('should render icon with correct size class', () => {
      const { container } = render(
        <SectionHeading title='Title' badge={{ icon: Sparkles, text: 'Test' }} />,
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      // Lucide icons use size-4 class
      expect(icon).toHaveClass('size-4');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { rerender } = render(<SectionHeading title='Title' level='h2' />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      rerender(<SectionHeading title='Title' level='h3' />);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should mark badge icons as decorative', () => {
      const { container } = render(
        <SectionHeading title='Title' badge={{ icon: Sparkles, text: 'Test' }} />,
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should support subtitle for screen readers', () => {
      render(<SectionHeading title='Title' subtitle='Additional context' />);
      const subtitle = screen.getByText('Additional context');
      expect(subtitle.tagName).toBe('P');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      render(<SectionHeading title='' />);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<SectionHeading title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long subtitle', () => {
      const longSubtitle = 'B'.repeat(500);
      render(<SectionHeading title='Title' subtitle={longSubtitle} />);
      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('should handle badge with all variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      for (const variant of variants) {
        const { unmount } = render(
          <SectionHeading title='Title' badge={{ text: variant, variant }} />,
        );
        expect(screen.getByText(variant)).toBeInTheDocument();
        unmount();
      }
    });
  });
});
