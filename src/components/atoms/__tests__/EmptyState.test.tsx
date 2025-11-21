/**
 * EmptyState Component Tests
 * Phase 4: Fix coverage threshold violations
 *
 * Tests all EmptyState compound components:
 * - Empty (container)
 * - EmptyHeader
 * - EmptyMedia (with variants)
 * - EmptyTitle
 * - EmptyDescription
 * - EmptyContent
 */

import { render, screen } from '@testing-library/react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../EmptyState';

describe('EmptyState Components', () => {
  describe('Empty', () => {
    it('should render with default styles', () => {
      render(<Empty>Empty content</Empty>);

      const element = screen.getByText('Empty content');
      expect(element).toHaveAttribute('data-slot', 'empty');
      expect(element).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should apply custom className', () => {
      render(<Empty className='custom-class'>Content</Empty>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('custom-class');
    });

    it('should pass through additional props', () => {
      render(<Empty data-testid='empty-container'>Content</Empty>);

      expect(screen.getByTestId('empty-container')).toBeInTheDocument();
    });
  });

  describe('EmptyHeader', () => {
    it('should render with default styles', () => {
      render(<EmptyHeader>Header content</EmptyHeader>);

      const element = screen.getByText('Header content');
      expect(element).toHaveAttribute('data-slot', 'empty-header');
      expect(element).toHaveClass('flex', 'flex-col', 'items-center', 'text-center');
    });

    it('should apply custom className', () => {
      render(<EmptyHeader className='header-custom'>Header</EmptyHeader>);

      const element = screen.getByText('Header');
      expect(element).toHaveClass('header-custom');
    });
  });

  describe('EmptyMedia', () => {
    it('should render with default variant', () => {
      render(<EmptyMedia>Icon</EmptyMedia>);

      const element = screen.getByText('Icon');
      expect(element).toHaveAttribute('data-slot', 'empty-icon');
      expect(element).toHaveAttribute('data-variant', 'default');
      expect(element).toHaveClass('bg-transparent');
    });

    it('should render with icon variant', () => {
      render(<EmptyMedia variant='icon'>Icon</EmptyMedia>);

      const element = screen.getByText('Icon');
      expect(element).toHaveAttribute('data-variant', 'icon');
      expect(element).toHaveClass('bg-muted', 'rounded-lg');
    });

    it('should apply custom className', () => {
      render(<EmptyMedia className='media-custom'>Icon</EmptyMedia>);

      const element = screen.getByText('Icon');
      expect(element).toHaveClass('media-custom');
    });
  });

  describe('EmptyTitle', () => {
    it('should render with default styles', () => {
      render(<EmptyTitle>Title text</EmptyTitle>);

      const element = screen.getByText('Title text');
      expect(element).toHaveAttribute('data-slot', 'empty-title');
      expect(element).toHaveClass('font-medium', 'tracking-tight');
    });

    it('should apply custom className', () => {
      render(<EmptyTitle className='title-custom'>Title</EmptyTitle>);

      const element = screen.getByText('Title');
      expect(element).toHaveClass('title-custom');
    });
  });

  describe('EmptyDescription', () => {
    it('should render with default styles', () => {
      render(<EmptyDescription>Description text</EmptyDescription>);

      const element = screen.getByText('Description text');
      expect(element).toHaveAttribute('data-slot', 'empty-description');
      expect(element).toHaveClass('text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<EmptyDescription className='desc-custom'>Description</EmptyDescription>);

      const element = screen.getByText('Description');
      expect(element).toHaveClass('desc-custom');
    });
  });

  describe('EmptyContent', () => {
    it('should render with default styles', () => {
      render(<EmptyContent>Content area</EmptyContent>);

      const element = screen.getByText('Content area');
      expect(element).toHaveAttribute('data-slot', 'empty-content');
      expect(element).toHaveClass('flex', 'flex-col', 'items-center');
    });

    it('should apply custom className', () => {
      render(<EmptyContent className='content-custom'>Content</EmptyContent>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('content-custom');
    });
  });

  describe('Compound Component Usage', () => {
    it('should render complete empty state composition', () => {
      render(
        <Empty data-testid='empty-state'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <span data-testid='icon'>📭</span>
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filter to find what you&apos;re looking for.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <button type='button'>Clear filters</button>
          </EmptyContent>
        </Empty>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('should render minimal empty state', () => {
      render(
        <Empty>
          <EmptyTitle>Nothing here yet</EmptyTitle>
        </Empty>
      );

      expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
    });
  });
});
