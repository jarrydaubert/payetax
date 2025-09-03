import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogPage from '../page';

// Mock Next.js modules
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <div data-testid='next-image' data-src={src} data-alt={alt} {...props} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the blog functions
jest.mock('@/lib/blog', () => ({
  getBlogPosts: jest.fn().mockResolvedValue([
    {
      slug: 'test-post-1',
      title: 'Test Post 1',
      excerpt: 'This is a test post excerpt',
      category: 'Tax Tips',
      publishedAt: '2024-01-15',
      readTime: '5 min',
      image: '/test-image-1.jpg',
      imageAlt: 'Test image 1',
    },
    {
      slug: 'test-post-2',
      title: 'Test Post 2',
      excerpt: 'Another test post excerpt',
      category: 'Tax News',
      publishedAt: '2024-01-10',
      readTime: '3 min',
      image: '/test-image-2.jpg',
      imageAlt: 'Test image 2',
    },
  ]),
  getFeaturedPost: jest.fn().mockResolvedValue({
    slug: 'featured-post',
    title: 'Featured Post Title',
    excerpt: 'This is a featured post excerpt',
    category: 'Tax Basics',
    publishedAt: '2024-01-20',
    image: '/featured-image.jpg',
    imageAlt: 'Featured image',
  }),
  getBlogCategories: jest.fn().mockResolvedValue([
    { slug: 'tax-tips', name: 'Tax Tips', count: 5 },
    { slug: 'tax-news', name: 'Tax News', count: 3 },
    { slug: 'tax-basics', name: 'Tax Basics', count: 0 }, // Test zero count filtering
    { slug: 'guides', name: 'Guides', count: 2 },
  ]),
  getBlogPostsCount: jest.fn().mockResolvedValue(10),
}));

// Mock CallToAction component
jest.mock('@/components/ui/CallToAction', () => ({
  __esModule: true,
  default: () => <div data-testid='call-to-action'>Newsletter CTA</div>,
}));

describe('BlogPage', () => {
  const mockSearchParams = Promise.resolve({});

  describe('Basic Rendering', () => {
    it('should render blog page header', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('UK Tax Insights')).toBeInTheDocument();
      expect(screen.getByText('& Updates')).toBeInTheDocument();
      expect(screen.getByText('Back to Calculator')).toBeInTheDocument();
    });

    it('should display stats bar with correct information', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('10')).toBeInTheDocument(); // Total count
      expect(screen.getByText('Expert Articles')).toBeInTheDocument();
      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  describe('Category Filter Buttons', () => {
    it('should render category filter buttons with proper styling', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('All Posts')).toBeInTheDocument();
      expect(screen.getAllByText('Tax Tips')).toHaveLength(2); // One in filter, one in post
      expect(screen.getAllByText('Tax News')).toHaveLength(2); // One in filter, one in post
      expect(screen.getByText('Guides')).toBeInTheDocument();
    });

    it('should filter out categories with zero count', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      // Tax Basics has 0 count, so it should not be displayed
      expect(screen.queryByText('Tax Basics')).not.toBeInTheDocument();
    });

    it('should show correct post counts in category buttons', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('(10)')).toBeInTheDocument(); // All Posts count
      expect(screen.getByText('(5)')).toBeInTheDocument(); // Tax Tips count
      expect(screen.getByText('(3)')).toBeInTheDocument(); // Tax News count
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Guides count
    });

    it('should have consistent button sizing', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      const { container } = render(component);

      const buttons = container.querySelectorAll('a[href*="blog"]');
      const categoryButtons = Array.from(buttons).filter(
        (button) => button.textContent?.includes('(') // Buttons with counts
      );

      // All category buttons should have consistent padding and text size
      for (const button of categoryButtons) {
        expect(button.className).toContain('px-3 py-2');
        expect(button.className).toContain('text-sm');
        expect(button.className).toContain('rounded-lg');
      }
    });
  });

  describe('Selected Category State', () => {
    it('should highlight selected category button', async () => {
      const selectedSearchParams = Promise.resolve({ category: 'tax-tips' });
      const component = await BlogPage({ searchParams: selectedSearchParams });
      render(component);

      const taxTipsButtons = screen.getAllByText('Tax Tips');
      const categoryButton = taxTipsButtons.find((button) =>
        button.closest('a')?.href?.includes('category=tax-tips')
      );
      expect(categoryButton?.closest('a')?.className).toContain('from-purple-600 to-blue-600');
    });

    it('should show selected category indicator', async () => {
      const selectedSearchParams = Promise.resolve({ category: 'tax-tips' });
      const component = await BlogPage({ searchParams: selectedSearchParams });
      render(component);

      expect(screen.getByText('Category:')).toBeInTheDocument();
      expect(screen.getAllByText('Tax Tips')).toHaveLength(3); // One in filter, one in post, one in selected indicator
    });
  });

  describe('Featured Post', () => {
    it('should display featured post when no category is selected and on first page', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('Featured Article')).toBeInTheDocument();
      expect(screen.getByText('Featured Post Title')).toBeInTheDocument();
      expect(screen.getByText('FEATURED')).toBeInTheDocument();
    });

    it('should not display featured post when category is selected', async () => {
      const selectedSearchParams = Promise.resolve({ category: 'tax-tips' });
      const component = await BlogPage({ searchParams: selectedSearchParams });
      render(component);

      expect(screen.queryByText('Featured Article')).not.toBeInTheDocument();
    });
  });

  describe('Posts Grid', () => {
    it('should display blog posts in grid format', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
      expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
    });

    it('should display post metadata correctly', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('5 min read')).toBeInTheDocument();
      expect(screen.getByText('3 min read')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display no articles message when no posts found', async () => {
      // Mock empty posts
      const { getBlogPosts } = require('@/lib/blog');
      getBlogPosts.mockResolvedValueOnce([]);

      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('No Articles Found')).toBeInTheDocument();
      expect(screen.getByText('Browse All Posts')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display pagination when there are multiple pages', async () => {
      // Mock pagination data
      const { getBlogPostsCount } = require('@/lib/blog');
      getBlogPostsCount.mockResolvedValueOnce(20); // More than 9 posts per page

      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('Page')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('of 3')).toBeInTheDocument(); // 20 posts / 9 per page = 3 pages
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2 = screen.getByRole('heading', { level: 2, name: 'Browse by Topic' });
      expect(h2).toBeInTheDocument();
    });

    it('should have descriptive link text', async () => {
      const component = await BlogPage({ searchParams: mockSearchParams });
      render(component);

      expect(screen.getByText('Back to Calculator')).toBeInTheDocument();
      expect(screen.getAllByText('Read More')).toHaveLength(2); // One for each post
    });
  });
});
