// src/components/molecules/__tests__/TableOfContents.test.tsx
import { render, screen } from '@testing-library/react';

// Mock lucide-react icons
jest.mock('lucide-react/dist/esm/icons/list.js', () => ({
  __esModule: true,
  default: () => <span data-testid='list-icon' />,
}));

// Import after mocks
import { TableOfContents } from '../TableOfContents';

const mockContent = `
## First Heading
Some content here.

## Second Heading
More content.

### Nested Heading
Nested content.

## Third Heading
Final content.
`;

describe('TableOfContents', () => {
  it('renders heading "On this page"', () => {
    render(<TableOfContents content={mockContent} />);
    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('extracts and displays only h2 headings', () => {
    render(<TableOfContents content={mockContent} />);

    expect(screen.getByText('First Heading')).toBeInTheDocument();
    expect(screen.getByText('Second Heading')).toBeInTheDocument();
    expect(screen.getByText('Third Heading')).toBeInTheDocument();
    // h3 headings should NOT be included
    expect(screen.queryByText('Nested Heading')).not.toBeInTheDocument();
  });

  it('returns null when less than 2 headings', () => {
    const { container } = render(<TableOfContents content='## Only One Heading' />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TableOfContents content={mockContent} className='custom-class' />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('creates correct anchor links', () => {
    render(<TableOfContents content={mockContent} />);

    const firstLink = screen.getByText('First Heading').closest('a');
    expect(firstLink).toHaveAttribute('href', '#first-heading');
  });
});
