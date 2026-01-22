/**
 * @jest-environment jsdom
 */
// src/components/templates/__tests__/Layout.test.tsx

import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';

// Mock child components
jest.mock('@/components/molecules/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid='mock-footer'>Footer</footer>,
}));

jest.mock('@/components/organisms/SimpleNavbar', () => ({
  __esModule: true,
  default: () => <nav data-testid='mock-navbar'>Navbar</nav>,
}));

jest.mock('@/components/atoms/CookieBanner', () => ({
  __esModule: true,
  default: () => <div data-testid='mock-cookie-banner'>Cookie Banner</div>,
}));

describe('Layout Component', () => {
  it('should render children content', () => {
    render(
      <Layout>
        <div data-testid='test-content'>Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render navbar in header', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const navbar = screen.getByTestId('mock-navbar');
    expect(navbar).toBeInTheDocument();
    expect(navbar.closest('header')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const footer = screen.getByTestId('mock-footer');
    expect(footer).toBeInTheDocument();
    expect(footer.closest('footer')).toBeInTheDocument();
  });

  it('should render cookie banner', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('mock-cookie-banner')).toBeInTheDocument();
  });

  it('should have skip-to-content link for accessibility', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.tagName).toBe('A');
    expect(skipLink).toHaveClass('skip-link');
  });

  it('should link skip-to-content to main content ID', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const skipLink = screen.getByText('Skip to main content');
    const href = skipLink.getAttribute('href');
    expect(href).toMatch(/^#/);

    // Check that main element has matching ID
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.id).toBeTruthy();
    expect(href).toBe(`#${main?.id}`);
  });

  it('should have accessible main content landmark', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('aria-label', 'Main Content');
  });

  it('should use flex layout with min-h-screen', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'min-h-screen', 'flex-col');
  });

  it('should set main content as flex-1', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-1');
  });

  it('should render all components in correct order', () => {
    const { container } = render(
      <Layout>
        <div data-testid='test-content'>Content</div>
      </Layout>
    );

    const wrapper = container.firstChild as HTMLElement;
    const children = Array.from(wrapper.children);

    // Order: background elements, skip link, header (navbar), main (content), footer, suspense (cookie banner)
    expect(children[0].tagName).toBe('DIV'); // Background elements
    expect(children[1].tagName).toBe('A'); // Skip link
    expect(children[2].tagName).toBe('HEADER'); // Navbar
    expect(children[3].tagName).toBe('MAIN'); // Main content
    expect(children[4].tagName).toBe('FOOTER'); // Footer
  });

  it('should handle multiple children in content area', () => {
    render(
      <Layout>
        <div data-testid='child-1'>Child 1</div>
        <div data-testid='child-2'>Child 2</div>
        <div data-testid='child-3'>Child 3</div>
      </Layout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});
