// src/components/ui/__tests__/PageContainer.test.tsx
import { render, screen } from '@testing-library/react';
import PageContainer from '../PageContainer';

describe('PageContainer Component', () => {
  describe('Basic Rendering', () => {
    it('should render children content', () => {
      render(
        <PageContainer>
          <div>Page content</div>
        </PageContainer>
      );

      expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <PageContainer>
          <header>Header</header>
          <main>Main content</main>
          <footer>Footer</footer>
        </PageContainer>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PageContainer className='custom-container'>
          <div>Content</div>
        </PageContainer>
      );

      const pageContainer = container.firstChild;
      expect(pageContainer).toHaveClass('custom-container');
    });

    it('should render without className', () => {
      const { container } = render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Layout Variations', () => {
    it('should handle full-width layout', () => {
      render(
        <PageContainer fullWidth>
          <div>Full width content</div>
        </PageContainer>
      );

      expect(screen.getByText('Full width content')).toBeInTheDocument();
    });

    it('should handle narrow layout', () => {
      render(
        <PageContainer narrow>
          <div>Narrow content</div>
        </PageContainer>
      );

      expect(screen.getByText('Narrow content')).toBeInTheDocument();
    });
  });

  describe('Semantic Structure', () => {
    it('should use div as default container', () => {
      const { container } = render(
        <PageContainer>
          <div>Content</div>
        </PageContainer>
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Complex Layouts', () => {
    it('should handle nested layouts', () => {
      render(
        <PageContainer>
          <div>
            <section>
              <h1>Page Title</h1>
              <article>
                <p>Article content</p>
              </article>
            </section>
          </div>
        </PageContainer>
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Article content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should allow proper semantic markup', () => {
      render(
        <PageContainer>
          <main>
            <h1>Accessible Page</h1>
            <p>Content</p>
          </main>
        </PageContainer>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Accessible Page');
    });
  });
});
