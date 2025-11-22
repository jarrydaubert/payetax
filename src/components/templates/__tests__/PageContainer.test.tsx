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

  describe('MaxWidth Variations', () => {
    it('should apply sm max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='sm'>
          <div>Small content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-sm');
    });

    it('should apply md max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='md'>
          <div>Medium content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-md');
    });

    it('should apply lg max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='lg'>
          <div>Large content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-lg');
    });

    it('should apply xl max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='xl'>
          <div>XL content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-xl');
    });

    it('should apply 2xl max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='2xl'>
          <div>2XL content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-2xl');
    });

    it('should apply 4xl max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='4xl'>
          <div>4XL content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-4xl');
    });

    it('should apply 5xl max-width by default', () => {
      const { container } = render(
        <PageContainer>
          <div>Default content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-5xl');
    });

    it('should apply 6xl max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='6xl'>
          <div>6XL content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-6xl');
    });

    it('should apply 7xl max-width', () => {
      const { container } = render(
        <PageContainer maxWidth='7xl'>
          <div>7XL content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('max-w-7xl');
    });
  });

  describe('Glass Styling', () => {
    it('should render with glass styling by default', () => {
      const { container } = render(
        <PageContainer>
          <div>Glass content</div>
        </PageContainer>
      );
      expect(container.querySelector('.glass-card')).toBeInTheDocument();
      expect(container.querySelector('.glass-card-inner')).toBeInTheDocument();
    });

    it('should render without glass styling when glass=false', () => {
      const { container } = render(
        <PageContainer glass={false}>
          <div>Non-glass content</div>
        </PageContainer>
      );
      expect(container.querySelector('.glass-card')).not.toBeInTheDocument();
      expect(screen.getByText('Non-glass content')).toBeInTheDocument();
    });
  });

  describe('Navbar Spacing', () => {
    it('should include navbar spacing by default', () => {
      const { container } = render(
        <PageContainer>
          <div>Spaced content</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('pt-24');
    });

    it('should exclude navbar spacing when includeNavbarSpacing=false', () => {
      const { container } = render(
        <PageContainer includeNavbarSpacing={false}>
          <div>No navbar spacing</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveClass('py-8');
      expect(container.firstChild).not.toHaveClass('pt-24');
    });
  });

  describe('ID Prop', () => {
    it('should apply id when provided', () => {
      const testId = 'test-main-content';
      const { container } = render(
        <PageContainer id={testId}>
          <div>Content with ID</div>
        </PageContainer>
      );
      expect(container.firstChild).toHaveAttribute('id', testId);
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
