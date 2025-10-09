// src/components/ui/__tests__/ContentSection.test.tsx
import { render, screen } from '@testing-library/react';
import ContentSection from '../ContentSection';

describe('ContentSection Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(
        <ContentSection>
          <p>Test content</p>
        </ContentSection>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ContentSection>
          <h2>Title</h2>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </ContentSection>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ContentSection className="custom-section">
          <p>Content</p>
        </ContentSection>
      );

      const section = container.firstChild;
      expect(section).toHaveClass('custom-section');
    });

    it('should render as section element', () => {
      const { container } = render(
        <ContentSection>
          <p>Content</p>
        </ContentSection>
      );

      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Layout Props', () => {
    it('should render with optional title', () => {
      render(
        <ContentSection title="Section Title">
          <p>Content</p>
        </ContentSection>
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(
        <ContentSection>
          <p>Content</p>
        </ContentSection>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic section element', () => {
      const { container } = render(
        <ContentSection>
          <p>Content</p>
        </ContentSection>
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should be accessible with heading', () => {
      render(
        <ContentSection title="Accessible Section">
          <p>Content</p>
        </ContentSection>
      );

      expect(screen.getByText('Accessible Section')).toBeInTheDocument();
    });
  });

  describe('Complex Content', () => {
    it('should handle nested components', () => {
      render(
        <ContentSection>
          <div>
            <h3>Nested Title</h3>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </ContentSection>
      );

      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
