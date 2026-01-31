/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/CategoryFilter.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import type { BlogCategory } from '@/types/blog';
import { CategoryFilter } from '../CategoryFilter';

describe('CategoryFilter', () => {
  const mockCategories: BlogCategory[] = [
    { slug: 'tax-basics', name: 'Tax Basics', count: 5 },
    { slug: 'tax-tips', name: 'Tax Tips', count: 3 },
    { slug: 'tax-changes', name: 'Tax Changes', count: 2 },
    { slug: 'empty-category', name: 'Empty Category', count: 0 },
  ];

  const mockCallback = jest.fn();

  beforeEach(() => {
    mockCallback.mockClear();
  });

  describe('Rendering', () => {
    it('should render the component with heading', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByText('Browse Topics')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Browse Topics' })).toBeInTheDocument();
    });

    it('should render "All Posts" button', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /All Posts 10/i })).toBeInTheDocument();
    });

    it('should render all categories with counts > 0', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /Tax Basics 5/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tax Tips 3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tax Changes 2/i })).toBeInTheDocument();
    });

    it('should NOT render categories with count = 0', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.queryByRole('button', { name: /Empty Category/i })).not.toBeInTheDocument();
    });

    it('should display correct post counts in badges', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByText('10')).toBeInTheDocument(); // All posts count
      expect(screen.getByText('5')).toBeInTheDocument(); // Tax Basics
      expect(screen.getByText('3')).toBeInTheDocument(); // Tax Tips
      expect(screen.getByText('2')).toBeInTheDocument(); // Tax Changes
    });
  });

  describe('Active State - No Category Selected', () => {
    it('should highlight "All Posts" button when no category selected', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory={undefined}
          onCategoryClick={mockCallback}
        />,
      );

      const allPostsButton = screen.getByRole('button', { name: /All Posts 10/i });
      expect(allPostsButton).toHaveClass('bg-primary');
      expect(allPostsButton).toHaveClass('text-primary-foreground');
    });

    it('should not highlight category buttons when no category selected', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory={undefined}
          onCategoryClick={mockCallback}
        />,
      );

      const taxBasicsButton = screen.getByRole('button', { name: /Tax Basics 5/i });
      expect(taxBasicsButton).not.toHaveClass('bg-primary');
    });
  });

  describe('Active State - Category Selected', () => {
    it('should highlight selected category button', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const taxBasicsButton = screen.getByRole('button', { name: /Tax Basics 5/i });
      expect(taxBasicsButton).toHaveClass('bg-primary');
      expect(taxBasicsButton).toHaveClass('text-primary-foreground');
    });

    it('should not highlight "All Posts" when category is selected', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const allPostsButton = screen.getByRole('button', { name: /All Posts 10/i });
      expect(allPostsButton).not.toHaveClass('bg-primary');
      expect(allPostsButton).toHaveClass('border');
    });

    it('should not highlight non-selected categories', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const taxTipsButton = screen.getByRole('button', { name: /Tax Tips 3/i });
      expect(taxTipsButton).not.toHaveClass('bg-primary');
    });
  });

  describe('Click Interactions', () => {
    it('should call onCategoryClick with undefined when "All Posts" clicked', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const allPostsButton = screen.getByRole('button', { name: /All Posts 10/i });
      fireEvent.click(allPostsButton);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith();
    });

    it('should call onCategoryClick with category slug when category clicked', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const taxBasicsButton = screen.getByRole('button', { name: /Tax Basics 5/i });
      fireEvent.click(taxBasicsButton);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('tax-basics');
    });

    it('should call onCategoryClick with different slugs for different categories', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const taxTipsButton = screen.getByRole('button', { name: /Tax Tips 3/i });
      fireEvent.click(taxTipsButton);

      expect(mockCallback).toHaveBeenCalledWith('tax-tips');

      const taxChangesButton = screen.getByRole('button', { name: /Tax Changes 2/i });
      fireEvent.click(taxChangesButton);

      expect(mockCallback).toHaveBeenCalledWith('tax-changes');
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('should allow clicking the same category multiple times', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const taxBasicsButton = screen.getByRole('button', { name: /Tax Basics 5/i });
      fireEvent.click(taxBasicsButton);
      fireEvent.click(taxBasicsButton);
      fireEvent.click(taxBasicsButton);

      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenCalledWith('tax-basics');
    });
  });

  describe('Empty States', () => {
    it('should render when no categories provided', () => {
      render(<CategoryFilter categories={[]} allPostsCount={10} onCategoryClick={mockCallback} />);

      expect(screen.getByText('Browse Topics')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All Posts 10/i })).toBeInTheDocument();
    });

    it('should render when all categories have count = 0', () => {
      const emptyCategories: BlogCategory[] = [
        { slug: 'cat1', name: 'Category 1', count: 0 },
        { slug: 'cat2', name: 'Category 2', count: 0 },
      ];

      render(
        <CategoryFilter
          categories={emptyCategories}
          allPostsCount={0}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /All Posts 0/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Category 1/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Category 2/i })).not.toBeInTheDocument();
    });

    it('should handle allPostsCount = 0', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={0}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Large Numbers', () => {
    it('should handle large post counts', () => {
      const largeCategories: BlogCategory[] = [{ slug: 'popular', name: 'Popular', count: 999 }];

      render(
        <CategoryFilter
          categories={largeCategories}
          allPostsCount={1234}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('should handle many categories', () => {
      const manyCategories: BlogCategory[] = Array.from({ length: 20 }, (_, i) => ({
        slug: `category-${i}`,
        name: `Category ${i}`,
        count: i + 1,
      }));

      render(
        <CategoryFilter
          categories={manyCategories}
          allPostsCount={100}
          onCategoryClick={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /Category 0 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Category 19 20/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Browse Topics');
    });

    it('should have unique heading ID for aria-labelledby', () => {
      const { container } = render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const heading = screen.getByRole('heading', { level: 2 });
      const headingId = heading.id;
      expect(headingId).toBeTruthy();

      const labeledElement = container.querySelector(`[aria-labelledby="${headingId}"]`);
      expect(labeledElement).toBeInTheDocument();
    });

    it('should use button elements for interactivity', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // All Posts + 3 categories
    });
  });

  describe('Styling and Layout', () => {
    it('should apply primary styling to active buttons', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const taxBasicsButton = screen.getByRole('button', { name: /Tax Basics 5/i });
      expect(taxBasicsButton).toHaveClass('bg-primary');
      expect(taxBasicsButton).toHaveClass('text-primary-foreground');
    });

    it('should apply outline styling to inactive buttons', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          selectedCategory='tax-basics'
          onCategoryClick={mockCallback}
        />,
      );

      const allPostsButton = screen.getByRole('button', { name: /All Posts 10/i });
      expect(allPostsButton).toHaveClass('border');
    });

    it('should use small button size', () => {
      render(
        <CategoryFilter
          categories={mockCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const allPostsButton = screen.getByRole('button', { name: /All Posts 10/i });
      expect(allPostsButton).toHaveClass('h-8');
    });
  });

  describe('Edge Cases', () => {
    it('should handle category with undefined count', () => {
      const categoriesWithUndefined: BlogCategory[] = [
        { slug: 'test', name: 'Test', count: undefined as unknown as number },
      ];

      render(
        <CategoryFilter
          categories={categoriesWithUndefined}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      // Should not render category with undefined count (filtered out by count > 0)
      expect(screen.queryByRole('button', { name: /Test/i })).not.toBeInTheDocument();
    });

    it('should handle very long category names', () => {
      const longCategories: BlogCategory[] = [
        {
          slug: 'long',
          name: 'This is a Very Long Category Name That Should Wrap Properly',
          count: 5,
        },
      ];

      render(
        <CategoryFilter
          categories={longCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: /This is a Very Long Category Name That Should Wrap Properly/i,
        }),
      ).toBeInTheDocument();
    });

    it('should handle category slug with special characters', () => {
      const specialCategories: BlogCategory[] = [
        { slug: 'tax-&-finance', name: 'Tax & Finance', count: 3 },
      ];

      render(
        <CategoryFilter
          categories={specialCategories}
          allPostsCount={10}
          onCategoryClick={mockCallback}
        />,
      );

      const button = screen.getByRole('button', { name: /Tax & Finance/i });
      fireEvent.click(button);

      expect(mockCallback).toHaveBeenCalledWith('tax-&-finance');
    });
  });
});
