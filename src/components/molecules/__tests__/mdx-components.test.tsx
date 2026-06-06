/**
 * MDX Components Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for all MDX blog post rendering components:
 * - Headings (h1-h6) with anchor links
 * - Paragraphs, lists, and text formatting
 * - Links (internal and external)
 * - Code blocks and inline code
 * - Blockquotes, tables, and images
 * - Helper function: generateId
 */

import { render, screen } from '@testing-library/react';
import { mdxComponents } from '../mdx-components';

// Extract components for testing
const {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  a: A,
  strong: Strong,
  em: Em,
  code: Code,
  blockquote: Blockquote,
  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,
  hr: HR,
  img: Img,
} = mdxComponents;

describe('mdx-components', () => {
  describe('Headings with Anchor Links', () => {
    describe('H1', () => {
      it('should render h1 with text content', () => {
        render(<H1>Main Title</H1>);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      });

      it('should generate id from text', () => {
        render(<H1>Hello World</H1>);
        expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'hello-world');
      });

      it('should include anchor link', () => {
        render(<H1>Test Heading</H1>);
        const link = screen.getByRole('link', { name: /link to this heading/i });
        expect(link).toHaveAttribute('href', '#test-heading');
      });

      it('should handle special characters in id generation', () => {
        render(<H1>What's New in 2024?</H1>);
        expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute(
          'id',
          'what-s-new-in-2024',
        );
      });

      it('should handle non-string children', () => {
        render(
          <H1>
            <span>Complex</span> Content
          </H1>,
        );
        // getNodeText() recursively extracts text from React nodes
        expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'complex-content');
      });

      it('should have correct styling classes', () => {
        render(<H1>Styled Heading</H1>);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('font-display', 'font-semibold', 'text-foreground', 'group');
      });
    });

    describe('H2', () => {
      it('should render h2 with anchor link', () => {
        render(<H2>Section Title</H2>);
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title');
        expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'section-title');
      });

      it('should include anchor link with correct href', () => {
        render(<H2>My Section</H2>);
        const link = screen.getByRole('link', { name: /link to this heading/i });
        expect(link).toHaveAttribute('href', '#my-section');
      });
    });

    describe('H3', () => {
      it('should render h3 with anchor link', () => {
        render(<H3>Subsection Title</H3>);
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title');
        expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('id', 'subsection-title');
      });
    });

    describe('H4', () => {
      it('should render h4 without anchor link', () => {
        render(<H4>Minor Heading</H4>);
        expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Minor Heading');
        // H4 doesn't have anchor links
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });

      it('should have correct styling', () => {
        render(<H4>Styled H4</H4>);
        expect(screen.getByRole('heading', { level: 4 })).toHaveClass('font-semibold');
      });
    });

    describe('H5', () => {
      it('should render h5 correctly', () => {
        render(<H5>Small Heading</H5>);
        expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Small Heading');
      });
    });

    describe('H6', () => {
      it('should render h6 correctly', () => {
        render(<H6>Smallest Heading</H6>);
        expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Smallest Heading');
      });
    });
  });

  describe('Text Elements', () => {
    describe('Paragraph', () => {
      it('should render paragraph with content', () => {
        render(<P>This is a paragraph of text.</P>);
        expect(screen.getByText('This is a paragraph of text.')).toBeInTheDocument();
      });

      it('should have correct styling classes', () => {
        render(<P>Styled paragraph</P>);
        const p = screen.getByText('Styled paragraph');
        expect(p).toHaveClass('text-foreground/90', 'text-base');
      });
    });

    describe('Strong', () => {
      it('should render bold text', () => {
        render(<Strong>Bold text</Strong>);
        expect(screen.getByText('Bold text')).toHaveClass('font-bold');
      });
    });

    describe('Em (Emphasis)', () => {
      it('should render italic text', () => {
        render(<Em>Emphasized text</Em>);
        expect(screen.getByText('Emphasized text')).toHaveClass('italic');
      });
    });
  });

  describe('Lists', () => {
    describe('Unordered List', () => {
      it('should render ul with items', () => {
        render(
          <UL>
            <LI>Item 1</LI>
            <LI>Item 2</LI>
          </UL>,
        );
        expect(screen.getByRole('list')).toHaveClass('list-disc');
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
      });
    });

    describe('Ordered List', () => {
      it('should render ol with items', () => {
        render(
          <OL>
            <LI>First</LI>
            <LI>Second</LI>
            <LI>Third</LI>
          </OL>,
        );
        expect(screen.getByRole('list')).toHaveClass('list-decimal');
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
      });
    });

    describe('List Item', () => {
      it('should render list item with correct styling', () => {
        render(
          <UL>
            <LI>List item content</LI>
          </UL>,
        );
        expect(screen.getByText('List item content')).toHaveClass('leading-relaxed');
      });
    });
  });

  describe('Links', () => {
    describe('Internal Links', () => {
      it('should render internal link without external indicator', () => {
        render(<A href='/about'>About Us</A>);
        const link = screen.getByRole('link', { name: 'About Us' });
        expect(link).toHaveAttribute('href', '/about');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
      });

      it('should have correct styling', () => {
        render(<A href='/contact'>Contact</A>);
        const link = screen.getByRole('link', { name: 'Contact' });
        expect(link).toHaveClass('text-primary', 'underline');
      });
    });

    describe('External Links', () => {
      it('should render external link with target="_blank"', () => {
        render(<A href='https://example.com'>External Site</A>);
        const link = screen.getByRole('link', { name: /external site/i });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('should show external link icon', () => {
        render(<A href='https://gov.uk'>HMRC</A>);
        // External links have an ExternalLink icon
        const link = screen.getByRole('link');
        expect(link.querySelector('svg')).toBeInTheDocument();
      });
    });

    describe('Undefined href', () => {
      it('should handle undefined href gracefully', () => {
        render(<A href={undefined}>No href link</A>);
        // With undefined href, it still renders as an anchor element
        expect(screen.getByText('No href link')).toBeInTheDocument();
      });
    });
  });

  describe('Code', () => {
    describe('Inline Code', () => {
      it('should render inline code', () => {
        render(<Code>const x = 1</Code>);
        expect(screen.getByText('const x = 1')).toHaveClass('font-mono', 'rounded');
      });

      it('should have correct background styling', () => {
        render(<Code>npm install</Code>);
        expect(screen.getByText('npm install')).toHaveClass('bg-foreground/10');
      });
    });
  });

  describe('Blockquote', () => {
    it('should render blockquote with content', () => {
      render(<Blockquote>This is a quote</Blockquote>);
      expect(screen.getByText('This is a quote')).toBeInTheDocument();
    });

    it('should have left border styling', () => {
      render(<Blockquote>Styled quote</Blockquote>);
      const blockquote = screen.getByRole('blockquote');
      expect(blockquote).toHaveClass('border-l', 'border-primary/50');
    });

    it('should use flat Ledger quote styling', () => {
      render(<Blockquote>Glass quote</Blockquote>);
      const blockquote = screen.getByRole('blockquote');
      expect(blockquote).toHaveClass('my-8', 'border-l');
      expect(blockquote).not.toHaveClass('bg-card/80', 'backdrop-blur-sm');
    });
  });

  describe('Tables', () => {
    const renderTable = () =>
      render(
        <Table>
          <THead>
            <TR>
              <TH>Header 1</TH>
              <TH>Header 2</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TD>Cell 1</TD>
              <TD>Cell 2</TD>
            </TR>
            <TR>
              <TD>Cell 3</TD>
              <TD>Cell 4</TD>
            </TR>
          </TBody>
        </Table>,
      );

    it('should render table with all parts', () => {
      renderTable();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('cell')).toHaveLength(4);
    });

    it('should have flat card styling on table', () => {
      renderTable();
      const table = screen.getByRole('table');
      expect(table).toHaveClass('bg-card');
      expect(table).not.toHaveClass('bg-card/80', 'backdrop-blur-sm');
      expect(table.parentElement).toHaveClass('border', 'border-border', 'bg-card');
    });

    it('should style table headers', () => {
      renderTable();
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveClass('font-semibold', 'uppercase', 'tracking-[0.2em]');
    });

    it('should style table rows with hover', () => {
      renderTable();
      const rows = screen.getAllByRole('row');
      // Body rows should have hover styling
      expect(rows[1]).toHaveClass('hover:bg-muted/35');
    });

    it('should wrap table in scrollable container', () => {
      renderTable();
      const table = screen.getByRole('table');
      expect(table.parentElement).toHaveClass('overflow-x-auto');
    });
  });

  describe('Horizontal Rule', () => {
    it('should render hr element', () => {
      const { container } = render(<HR />);
      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });

    it('should have flat rule styling', () => {
      const { container } = render(<HR />);
      const hr = container.querySelector('hr');
      expect(hr).toHaveClass('border-t', 'border-border');
      expect(hr).not.toHaveClass('bg-gradient-to-r');
    });
  });

  describe('Image', () => {
    it('should render image with src and alt', () => {
      render(<Img src='/test-image.jpg' alt='Test image description' />);
      const img = screen.getByRole('img', { name: 'Test image description' });
      expect(img).toBeInTheDocument();
    });

    it('should display alt text as caption', () => {
      render(<Img src='/photo.jpg' alt='A beautiful sunset' />);
      // Caption should be shown below image
      expect(screen.getByText('A beautiful sunset')).toBeInTheDocument();
    });

    it('should handle missing alt text', () => {
      render(<Img src='/photo.jpg' alt='' />);
      // Image with empty alt is treated as decorative (role="presentation")
      const img = screen.getByRole('presentation');
      expect(img).toBeInTheDocument();
    });

    it('should handle undefined src', () => {
      const { container } = render(<Img src={undefined} alt='No source' />);
      // Returns null for invalid/empty src to prevent next/image errors
      expect(container.querySelector('figure')).not.toBeInTheDocument();
    });

    it('should have correct image styling', () => {
      render(<Img src='/styled.jpg' alt='Styled image' />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('border', 'border-border');
      expect(img).not.toHaveClass('rounded-lg', 'shadow-lg');
    });
  });

  describe('generateId Helper', () => {
    // Test the id generation indirectly through headings
    it('should convert spaces to hyphens', () => {
      render(<H1>Hello World Test</H1>);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hello-world-test');
    });

    it('should convert to lowercase', () => {
      render(<H1>UPPERCASE Title</H1>);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'uppercase-title');
    });

    it('should remove special characters', () => {
      render(<H1>What's the Deal?</H1>);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'what-s-the-deal');
    });

    it('should handle numbers', () => {
      render(<H1>Tax Year 2024-2025</H1>);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'tax-year-2024-2025');
    });

    it('should trim leading/trailing hyphens', () => {
      render(<H1>---Title---</H1>);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'title');
    });

    it('should handle empty string', () => {
      render(<H1>{''}</H1>);
      // Empty text returns undefined id (no id attribute) to avoid invalid HTML
      expect(screen.getByRole('heading')).not.toHaveAttribute('id');
    });
  });

  describe('mdxComponents Export', () => {
    it('should export all required components', () => {
      expect(mdxComponents).toHaveProperty('h1');
      expect(mdxComponents).toHaveProperty('h2');
      expect(mdxComponents).toHaveProperty('h3');
      expect(mdxComponents).toHaveProperty('h4');
      expect(mdxComponents).toHaveProperty('h5');
      expect(mdxComponents).toHaveProperty('h6');
      expect(mdxComponents).toHaveProperty('p');
      expect(mdxComponents).toHaveProperty('ul');
      expect(mdxComponents).toHaveProperty('ol');
      expect(mdxComponents).toHaveProperty('li');
      expect(mdxComponents).toHaveProperty('a');
      expect(mdxComponents).toHaveProperty('strong');
      expect(mdxComponents).toHaveProperty('em');
      expect(mdxComponents).toHaveProperty('code');
      expect(mdxComponents).toHaveProperty('blockquote');
      expect(mdxComponents).toHaveProperty('Callout');
      expect(mdxComponents).toHaveProperty('table');
      expect(mdxComponents).toHaveProperty('thead');
      expect(mdxComponents).toHaveProperty('tbody');
      expect(mdxComponents).toHaveProperty('tr');
      expect(mdxComponents).toHaveProperty('th');
      expect(mdxComponents).toHaveProperty('td');
      expect(mdxComponents).toHaveProperty('hr');
      expect(mdxComponents).toHaveProperty('img');
    });

    it('should have 25 components total', () => {
      // 25 components: h1-h6, p, ul, ol, li, a, strong, em, code, blockquote,
      // Callout, table, thead, tbody, tr, th, td, hr, img, caption
      expect(Object.keys(mdxComponents)).toHaveLength(25);
    });
  });
});
