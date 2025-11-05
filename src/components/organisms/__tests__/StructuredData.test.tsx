// src/components/ui/__tests__/StructuredData.test.tsx
import { render } from '@testing-library/react';
import React from 'react';
import StructuredData from '../StructuredData';

// Mock Next.js Script component to render as regular script tag
jest.mock('next/script', () => {
  return {
    __esModule: true,
    default: function MockScript({
      id,
      type,
      children,
    }: {
      id: string;
      type: string;
      children: React.ReactNode;
    }) {
      // Children might be a string or ReactNode
      const content = typeof children === 'string' ? children : String(children);
      return React.createElement('script', {
        id,
        type,
        dangerouslySetInnerHTML: { __html: content },
      });
    },
  };
});

describe('StructuredData Component', () => {
  describe('Organization Schema', () => {
    it('should render organization JSON-LD script', () => {
      const { container } = render(<StructuredData type='organization' />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('Organization');
        expect(data.name).toBe('PayeTax');
      }
    });
  });

  describe('Website Schema', () => {
    it('should render website JSON-LD script', () => {
      const { container } = render(<StructuredData type='website' />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('WebSite');
      }
    });
  });

  describe('Calculator Schema', () => {
    it('should render software application JSON-LD script', () => {
      const { container } = render(<StructuredData type='calculator' />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('SoftwareApplication');
        expect(data.applicationCategory).toBe('FinanceApplication');
      }
    });
  });

  describe('Breadcrumb Schema', () => {
    it('should render breadcrumb JSON-LD with items', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://payetax.co.uk' },
        { name: 'Calculator', url: 'https://payetax.co.uk/calculator' },
      ];

      const { container } = render(<StructuredData type='breadcrumb' breadcrumbs={breadcrumbs} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('BreadcrumbList');
        expect(data.itemListElement).toHaveLength(2);
      }
    });
  });

  describe('FAQ Schema', () => {
    it('should render FAQ JSON-LD with questions', () => {
      const faqs = [
        { question: 'What is PAYE?', answer: 'Pay As You Earn' },
        { question: 'How to calculate tax?', answer: 'Use our calculator' },
      ];

      const { container } = render(<StructuredData type='faq' faqs={faqs} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('FAQPage');
        expect(data.mainEntity).toHaveLength(2);
      }
    });
  });

  describe('Article Schema', () => {
    it('should render article JSON-LD', () => {
      const articleData = {
        title: 'Tax Guide',
        description: 'A comprehensive guide',
        url: 'https://payetax.co.uk/article',
        imageUrl: 'https://payetax.co.uk/image.jpg',
        publishDate: '2024-01-01',
      };

      const { container } = render(<StructuredData type='article' articleData={articleData} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@type']).toBe('Article');
        expect(data.headline).toBe('Tax Guide');
      }
    });
  });

  describe('Schema Validation', () => {
    it('should generate valid JSON-LD', () => {
      const { container } = render(<StructuredData type='organization' />);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      if (script?.textContent) {
        expect(() => JSON.parse(script.textContent)).not.toThrow();
      }
    });

    it('should include @context for all schemas', () => {
      const { container } = render(<StructuredData type='website' />);

      const script = container.querySelector('script[type="application/ld+json"]');
      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data['@context']).toBe('https://schema.org');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid type gracefully', () => {
      // @ts-expect-error Testing invalid type
      const { container } = render(<StructuredData type='invalid' />);

      // Should not throw error
      expect(container).toBeInTheDocument();
    });

    it('should generate unique script IDs', () => {
      const { container: container1 } = render(<StructuredData type='organization' />);
      const { container: container2 } = render(<StructuredData type='website' />);

      const script1 = container1.querySelector('script');
      const script2 = container2.querySelector('script');

      expect(script1?.id).not.toBe(script2?.id);
    });
  });

  describe('Optional Props', () => {
    it('should handle article with optional props', () => {
      const articleData = {
        title: 'Test Article',
        description: 'Test description',
        url: 'https://payetax.co.uk/article',
        imageUrl: 'https://example.com/image.jpg',
        publishDate: '2024-01-01',
        modifiedDate: '2024-01-02',
        authorName: 'John Doe',
      };

      const { container } = render(<StructuredData type='article' articleData={articleData} />);

      const script = container.querySelector('script[type="application/ld+json"]');
      if (script?.textContent) {
        const data = JSON.parse(script.textContent);
        expect(data.author).toBeDefined();
        expect(data.image).toBeDefined();
      }
    });

    it('should return null for breadcrumb without items', () => {
      const { container } = render(<StructuredData type='breadcrumb' />);

      // Component returns null when breadcrumb items are missing
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeInTheDocument();
    });

    it('should return null for FAQ without questions', () => {
      const { container } = render(<StructuredData type='faq' />);

      // Component returns null when FAQ questions are missing
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeInTheDocument();
    });

    it('should return null for article without required data', () => {
      const { container } = render(<StructuredData type='article' />);

      // Component returns null when article data is missing
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeInTheDocument();
    });
  });
});
