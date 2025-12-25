// src/components/molecules/__tests__/BlogSearch.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type { BlogPost } from '@/types/blog';

// Mock lucide-react icons
jest.mock('lucide-react/dist/esm/icons/clock.js', () => ({
  __esModule: true,
  default: () => <span data-testid='clock-icon' />,
}));
jest.mock('lucide-react/dist/esm/icons/search.js', () => ({
  __esModule: true,
  default: () => <span data-testid='search-icon' />,
}));
jest.mock('lucide-react/dist/esm/icons/x.js', () => ({
  __esModule: true,
  default: () => <span data-testid='x-icon' />,
}));

// Import after mocks
import { BlogSearch } from '../BlogSearch';

const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'This is a test excerpt',
    publishedAt: '2025-01-01',
    category: 'tax-basics',
    content: '',
    readTime: '5 min',
    tags: ['tax', 'guide'],
  },
  {
    id: '2',
    slug: 'another-post',
    title: 'Another Post',
    excerpt: 'Another excerpt here',
    publishedAt: '2025-01-02',
    category: 'tax-tips',
    content: '',
    readTime: '3 min',
    tags: ['tips'],
  },
];

describe('BlogSearch', () => {
  it('renders search input', () => {
    render(<BlogSearch posts={mockPosts} />);
    expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
  });

  it('shows results when typing', () => {
    render(<BlogSearch posts={mockPosts} />);
    const input = screen.getByPlaceholderText('Search articles...');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.focus(input);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('shows no results message for non-matching query', () => {
    render(<BlogSearch posts={mockPosts} />);
    const input = screen.getByPlaceholderText('Search articles...');

    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.focus(input);

    expect(screen.getByText(/No results found/)).toBeInTheDocument();
  });

  it('clears search when clear button clicked', () => {
    render(<BlogSearch posts={mockPosts} />);
    const input = screen.getByPlaceholderText('Search articles...');

    fireEvent.change(input, { target: { value: 'Test' } });
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('applies custom className', () => {
    const { container } = render(<BlogSearch posts={mockPosts} className='custom-class' />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
