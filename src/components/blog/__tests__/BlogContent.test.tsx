/**
 * @jest-environment jsdom
 */
// src/components/blog/__tests__/BlogContent.test.tsx

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogContent from '../BlogContent';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // biome-ignore lint/a11y/useAltText: Test mock
    return <img {...props} />;
  },
}));

// Store the components for test access
let storedComponents: any = null;

// Mock next-contentlayer2/hooks
jest.mock('next-contentlayer2/hooks', () => ({
  useMDXComponent: (code: string) => {
    return ({ components }: any) => {
      storedComponents = components;
      const H1 = components.h1;
      const H2 = components.h2;
      const P = components.p;
      const Ul = components.ul;
      const Li = components.li;
      const A = components.a;
      const Code = components.code;

      return (
        <div data-testid='mdx-content'>
          <H1>Test Heading 1</H1>
          <H2>Test Heading 2</H2>
          <P>Test paragraph content</P>
          <Ul>
            <Li>List item</Li>
          </Ul>
          <A href='https://example.com'>External Link</A>
          <Code className='language-typescript'>const test = true;</Code>
        </div>
      );
    };
  },
}));

// Mock navigator.clipboard
const mockWriteText = jest.fn(() => Promise.resolve());
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe('BlogContent Component', () => {
  const mockBody = {
    code: 'mock-mdx-code',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render MDX content', () => {
      render(<BlogContent body={mockBody as any} />);

      const content = screen.getByTestId('mdx-content');
      expect(content).toBeInTheDocument();
    });

    it('should apply prose classes to wrapper', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const proseDiv = container.querySelector('.prose');
      expect(proseDiv).toBeInTheDocument();
      expect(proseDiv).toHaveClass('prose-lg', 'max-w-none');
    });
  });

  describe('Headings with Anchor Links', () => {
    it('should render h1 with anchor link', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const h1 = container.querySelector('h1#test-heading-1');
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toContain('Test Heading 1');

      const link = h1?.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('#test-heading-1');
    });

    it('should render h2 with anchor link', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const h2 = container.querySelector('h2#test-heading-2');
      expect(h2).toBeInTheDocument();
      expect(h2?.textContent).toContain('Test Heading 2');

      const link = h2?.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('#test-heading-2');
    });

    it('should generate proper IDs from heading text', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const h1 = container.querySelector('h1');
      expect(h1?.id).toBe('test-heading-1');
    });

    it('should apply scroll-mt-20 class for offset anchors', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('scroll-mt-20');
    });

    it('should show hash icon on group hover', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const h1 = container.querySelector('h1');
      expect(h1).toHaveClass('group');

      const link = h1?.querySelector('a');
      expect(link).toHaveClass('opacity-0', 'group-hover:opacity-100');
    });
  });

  describe('Links', () => {
    it('should render external links with indicator icon', () => {
      render(<BlogContent body={mockBody as any} />);

      const link = screen.getByText('External Link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not add target="_blank" for internal links', () => {
      const mockBodyInternal = {
        code: 'mock-code',
      };

      // Mock the useMDXComponent to return internal link
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const A = components.a;
          return (
            <div data-testid='mdx-content'>
              <A href='/internal-page'>Internal Link</A>
            </div>
          );
        });

      render(<BlogContent body={mockBodyInternal as any} />);

      const link = screen.getByText('Internal Link');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');

      spy.mockRestore();
    });
  });

  describe('Code Blocks', () => {
    it('should render code block with language label', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      // Language label is in a span with uppercase class
      const languageLabel = container.querySelector('.uppercase');
      expect(languageLabel).toBeInTheDocument();
      expect(languageLabel?.textContent).toBe('typescript');
    });

    it('should render code block with copy button', () => {
      render(<BlogContent body={mockBody as any} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy');
    });

    it('should render code content within pre element', () => {
      const { container } = render(<BlogContent body={mockBody as any} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toContain('const test = true;');
    });
  });

  describe('Inline Code', () => {
    it('should render inline code without copy button', () => {
      // Mock inline code (no language class)
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const Code = components.code;
          return (
            <div data-testid='mdx-content'>
              <Code>inline code</Code>
            </div>
          );
        });

      render(<BlogContent body={mockBody as any} />);

      const code = screen.getByText('inline code');
      expect(code.tagName).toBe('CODE');

      // Should not have a parent with copy button
      const copyButton = screen.queryByRole('button', { name: /copy/i });
      expect(copyButton).not.toBeInTheDocument();

      spy.mockRestore();
    });
  });

  describe('Lists', () => {
    it('should render unordered list with proper styling', () => {
      render(<BlogContent body={mockBody as any} />);

      const listItem = screen.getByText('List item');
      expect(listItem).toBeInTheDocument();
      expect(listItem.tagName).toBe('LI');
    });
  });

  describe('Paragraphs', () => {
    it('should render paragraphs with proper styling', () => {
      render(<BlogContent body={mockBody as any} />);

      const paragraph = screen.getByText('Test paragraph content');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');
    });
  });

  describe('Images', () => {
    it('should render images with Next.js Image component', () => {
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const Img = components.img;
          return (
            <div data-testid='mdx-content'>
              <Img src='/test-image.jpg' alt='Test image description' />
            </div>
          );
        });

      render(<BlogContent body={mockBody as any} />);

      const image = screen.getByAltText('Test image description');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');

      spy.mockRestore();
    });

    it('should render image caption when alt text provided', () => {
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const Img = components.img;
          return (
            <div data-testid='mdx-content'>
              <Img src='/test-image.jpg' alt='Test image description' />
            </div>
          );
        });

      render(<BlogContent body={mockBody as any} />);

      const caption = screen.getByText('Test image description');
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('P');
      expect(caption).toHaveClass('italic');

      spy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty MDX body', () => {
      const emptyBody = { code: '' };

      expect(() => render(<BlogContent body={emptyBody as any} />)).not.toThrow();
    });

    it('should handle missing children in components', () => {
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const P = components.p;
          return (
            <div data-testid='mdx-content'>
              <P />
            </div>
          );
        });

      expect(() => render(<BlogContent body={mockBody as any} />)).not.toThrow();

      spy.mockRestore();
    });

    it('should sanitize heading IDs with special characters', () => {
      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const H1 = components.h1;
          return (
            <div data-testid='mdx-content'>
              <H1>Test & Special! Characters?</H1>
            </div>
          );
        });

      const { container } = render(<BlogContent body={mockBody as any} />);

      const h1 = container.querySelector('h1');
      expect(h1?.id).toBe('test-special-characters');

      spy.mockRestore();
    });

    it('should handle very long code blocks', () => {
      const longCode = 'a'.repeat(10000);

      const spy = jest
        .spyOn(require('next-contentlayer2/hooks'), 'useMDXComponent')
        .mockImplementationOnce(() => ({ components }: any) => {
          const Code = components.code;
          return (
            <div data-testid='mdx-content'>
              <Code className='language-js'>{longCode}</Code>
            </div>
          );
        });

      expect(() => render(<BlogContent body={mockBody as any} />)).not.toThrow();

      spy.mockRestore();
    });
  });
});
