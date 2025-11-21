/**
 * Kbd Component Tests
 * Phase 4: Fix coverage threshold violations
 *
 * Tests keyboard shortcut display components:
 * - Kbd - Individual key display
 * - KbdGroup - Group of keys
 */

import { render, screen } from '@testing-library/react';
import { Kbd, KbdGroup } from '../kbd';

describe('Kbd Components', () => {
  describe('Kbd', () => {
    it('should render with default styles', () => {
      render(<Kbd>K</Kbd>);

      const element = screen.getByText('K');
      expect(element).toHaveAttribute('data-slot', 'kbd');
      expect(element).toHaveClass('inline-flex', 'items-center', 'justify-center');
      expect(element).toHaveClass('bg-muted', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<Kbd className='custom-kbd'>⌘</Kbd>);

      const element = screen.getByText('⌘');
      expect(element).toHaveClass('custom-kbd');
    });

    it('should render with keyboard symbols', () => {
      render(<Kbd>⌘</Kbd>);

      expect(screen.getByText('⌘')).toBeInTheDocument();
    });

    it('should render with text keys', () => {
      render(<Kbd>Enter</Kbd>);

      expect(screen.getByText('Enter')).toBeInTheDocument();
    });

    it('should render with children elements', () => {
      render(
        <Kbd>
          <span data-testid='child'>Ctrl</span>
        </Kbd>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Kbd data-testid='kbd-element' title='Command key'>
          ⌘
        </Kbd>
      );

      const element = screen.getByTestId('kbd-element');
      expect(element).toHaveAttribute('title', 'Command key');
    });

    it('should have pointer-events-none for non-interactive display', () => {
      render(<Kbd>K</Kbd>);

      const element = screen.getByText('K');
      expect(element).toHaveClass('pointer-events-none');
    });

    it('should have select-none to prevent text selection', () => {
      render(<Kbd>K</Kbd>);

      const element = screen.getByText('K');
      expect(element).toHaveClass('select-none');
    });
  });

  describe('KbdGroup', () => {
    it('should render with default styles', () => {
      render(<KbdGroup data-testid='kbd-group'>Group content</KbdGroup>);

      const element = screen.getByTestId('kbd-group');
      expect(element).toHaveAttribute('data-slot', 'kbd-group');
      expect(element).toHaveClass('inline-flex', 'items-center');
    });

    it('should apply custom className', () => {
      render(
        <KbdGroup className='custom-group' data-testid='kbd-group'>
          Content
        </KbdGroup>
      );

      const element = screen.getByTestId('kbd-group');
      expect(element).toHaveClass('custom-group');
    });

    it('should render multiple Kbd children', () => {
      render(
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      );

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <KbdGroup data-testid='group' title='Keyboard shortcut'>
          <Kbd>Ctrl</Kbd>
        </KbdGroup>
      );

      const element = screen.getByTestId('group');
      expect(element).toHaveAttribute('title', 'Keyboard shortcut');
    });
  });

  describe('Usage Patterns', () => {
    it('should render common shortcut ⌘K', () => {
      render(
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      );

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('should render Ctrl+Shift+P shortcut', () => {
      render(
        <KbdGroup data-testid='shortcut'>
          <Kbd>Ctrl</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      );

      const group = screen.getByTestId('shortcut');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should render arrow key', () => {
      render(<Kbd>↑</Kbd>);

      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should render Escape key', () => {
      render(<Kbd>Esc</Kbd>);

      expect(screen.getByText('Esc')).toBeInTheDocument();
    });

    it('should render Tab key', () => {
      render(<Kbd>Tab</Kbd>);

      expect(screen.getByText('Tab')).toBeInTheDocument();
    });
  });
});
