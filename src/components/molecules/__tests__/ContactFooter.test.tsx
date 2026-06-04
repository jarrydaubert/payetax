/**
 * Tests for ContactFooter Component
 */

import { render, screen } from '@testing-library/react';
import { ContactFooter, type ContactLink } from '../ContactFooter';

describe('ContactFooter', () => {
  const mockLinks: ContactLink[] = [
    {
      text: 'support@example.com',
      href: 'mailto:support@example.com',
      type: 'email',
    },
    {
      text: 'Privacy',
      href: '/privacy',
      type: 'link',
    },
  ];

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ContactFooter links={mockLinks} />);
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<ContactFooter links={mockLinks} />);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Get in Touch');
    });

    it('should render custom title', () => {
      render(<ContactFooter title='Have Questions?' links={mockLinks} />);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Have Questions?');
    });

    it('should render description when provided', () => {
      render(
        <ContactFooter links={mockLinks} description="We're here to help with your questions" />,
      );
      expect(screen.getByText("We're here to help with your questions")).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<ContactFooter links={mockLinks} />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('should render as section element', () => {
      const { container } = render(<ContactFooter links={mockLinks} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should render all contact links', () => {
      render(<ContactFooter links={mockLinks} />);

      expect(screen.getByRole('link', { name: 'support@example.com' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
    });

    it('should render correct href for email link', () => {
      render(<ContactFooter links={mockLinks} />);

      const emailLink = screen.getByRole('link', { name: 'support@example.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:support@example.com');
    });

    it('should render correct href for regular link', () => {
      render(<ContactFooter links={mockLinks} />);

      const regularLink = screen.getByRole('link', { name: 'Privacy' });
      expect(regularLink).toHaveAttribute('href', '/privacy');
    });

    it('should apply monospace font to email links', () => {
      render(<ContactFooter links={mockLinks} />);

      const emailLink = screen.getByRole('link', { name: 'support@example.com' });
      expect(emailLink).toHaveClass('font-mono');
    });

    it('should not apply monospace font to regular links', () => {
      render(<ContactFooter links={mockLinks} />);

      const regularLink = screen.getByRole('link', { name: 'Privacy' });
      expect(regularLink).not.toHaveClass('font-mono');
    });

    it('should handle empty links array', () => {
      const { container } = render(<ContactFooter links={[]} />);

      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(0);
    });

    it('should handle single link', () => {
      render(<ContactFooter links={[mockLinks[0]]} />);

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('should handle many links', () => {
      const manyLinks: ContactLink[] = Array.from({ length: 5 }, (_, i) => ({
        text: `Link ${i + 1}`,
        href: `/link-${i + 1}`,
      }));

      render(<ContactFooter links={manyLinks} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(5);
    });
  });

  describe('Separators', () => {
    it('should render separator bullets when centered', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={true} />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      // Should have 1 separator for 2 links (n-1)
      expect(separators.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render last separator', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={true} />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      // Should be n-1 separators for n links
      expect(separators.length).toBe(mockLinks.length - 1);
    });

    it('should render separators only when centered', () => {
      const { container: centeredContainer } = render(
        <ContactFooter links={mockLinks} centered={true} />,
      );
      const { container: notCenteredContainer } = render(
        <ContactFooter links={mockLinks} centered={false} />,
      );

      const centeredSeparators = centeredContainer.querySelectorAll('[aria-hidden="true"]');
      const notCenteredSeparators = notCenteredContainer.querySelectorAll('[aria-hidden="true"]');

      expect(centeredSeparators.length).toBeGreaterThan(0);
      expect(notCenteredSeparators.length).toBe(0);
    });
  });

  describe('Layout', () => {
    it('should center content by default', () => {
      const { container } = render(<ContactFooter links={mockLinks} />);

      const content = container.querySelector('.text-center');
      expect(content).toBeInTheDocument();
    });

    it('should allow non-centered layout', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={false} />);

      const content = container.querySelector('.text-center');
      expect(content).not.toBeInTheDocument();
    });

    it('should apply flex layout for links when centered', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={true} />);

      const linksContainer = container.querySelector('.flex-col');
      expect(linksContainer).toBeInTheDocument();
    });

    it('should apply flex-wrap for links when not centered', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={false} />);

      const linksContainer = container.querySelector('.flex-wrap');
      expect(linksContainer).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<ContactFooter links={mockLinks} className='custom-class' />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      const { container } = render(<ContactFooter links={mockLinks} className='custom-class' />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class', 'py-16');
    });
  });

  describe('Typography', () => {
    it('should use correct typography for title', () => {
      render(<ContactFooter links={mockLinks} />);

      const title = screen.getByRole('heading');
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });

    it('should use correct typography for description', () => {
      render(<ContactFooter links={mockLinks} description='Test description' />);

      const description = screen.getByText('Test description');
      expect(description).toHaveClass('text-base', 'text-muted-foreground');
    });

    it('should use correct typography for links', () => {
      render(<ContactFooter links={mockLinks} />);

      const link = screen.getByRole('link', { name: 'Privacy' });
      expect(link).toHaveClass('text-base');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading level', () => {
      render(<ContactFooter links={mockLinks} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should mark separators as decorative', () => {
      const { container } = render(<ContactFooter links={mockLinks} centered={true} />);

      const separators = container.querySelectorAll('[aria-hidden="true"]');
      for (const separator of separators) {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      }
    });

    it('should have accessible links', () => {
      render(<ContactFooter links={mockLinks} />);

      const links = screen.getAllByRole('link');
      for (const link of links) {
        expect(link).toHaveAccessibleName();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<ContactFooter title={longTitle} links={mockLinks} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<ContactFooter description={longDescription} links={mockLinks} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle links without type', () => {
      const linksWithoutType: ContactLink[] = [{ text: 'Contact', href: '/contact' }];

      render(<ContactFooter links={linksWithoutType} />);

      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should handle URL links', () => {
      const urlLinks: ContactLink[] = [{ text: 'Website', href: 'https://example.com' }];

      render(<ContactFooter links={urlLinks} />);

      const link = screen.getByRole('link', { name: 'Website' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should generate unique keys for links', () => {
      const duplicateTextLinks: ContactLink[] = [
        { text: 'Same', href: '/link1' },
        { text: 'Same', href: '/link2' },
      ];

      const { container } = render(<ContactFooter links={duplicateTextLinks} />);

      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(2);
    });
  });

  describe('Full Composition', () => {
    it('should render complete contact footer with all features', () => {
      render(
        <ContactFooter
          title='Contact Us Today'
          description="We're here to answer your questions"
          links={mockLinks}
          className='custom-footer'
          centered={true}
        />,
      );

      // Title
      expect(screen.getByRole('heading', { name: 'Contact Us Today' })).toBeInTheDocument();

      // Description
      expect(screen.getByText("We're here to answer your questions")).toBeInTheDocument();

      // Links
      expect(screen.getByRole('link', { name: 'support@example.com' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();

      // Custom class
      const section = screen.getByRole('heading').closest('section');
      expect(section).toHaveClass('custom-footer');
    });
  });
});
