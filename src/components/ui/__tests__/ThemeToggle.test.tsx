// src/components/ui/__tests__/ThemeToggle.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '@/lib/theme';
import { ThemeToggle } from '../ThemeToggle';

// Mock the theme hook
jest.mock('@/lib/theme');

describe('ThemeToggle Component', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  describe('Rendering', () => {
    it('should render all three theme buttons', () => {
      render(<ThemeToggle />);

      expect(screen.getByLabelText('Switch to Light mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to Dark mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to System mode')).toBeInTheDocument();
    });

    it('should render button group', () => {
      const { container } = render(<ThemeToggle />);

      const buttonGroup = container.querySelector('.inline-flex');
      expect(buttonGroup).toBeInTheDocument();
    });

    it('should render icons for each theme', () => {
      const { container } = render(<ThemeToggle />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(3);
    });
  });

  describe('Theme Switching', () => {
    it('should call setTheme with "light" when light button is clicked', () => {
      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Switch to Light mode');
      fireEvent.click(lightButton);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should call setTheme with "dark" when dark button is clicked', () => {
      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Switch to Dark mode');
      fireEvent.click(darkButton);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should call setTheme with "system" when system button is clicked', () => {
      render(<ThemeToggle />);

      const systemButton = screen.getByLabelText('Switch to System mode');
      fireEvent.click(systemButton);

      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('Active State', () => {
    it('should mark light button as pressed when theme is light', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Switch to Light mode');
      expect(lightButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should mark dark button as pressed when theme is dark', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Switch to Dark mode');
      expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should mark system button as pressed when theme is system', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'system',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const systemButton = screen.getByLabelText('Switch to System mode');
      expect(systemButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should only mark one button as pressed at a time', () => {
      render(<ThemeToggle />);

      const buttons = [
        screen.getByLabelText('Switch to Light mode'),
        screen.getByLabelText('Switch to Dark mode'),
        screen.getByLabelText('Switch to System mode'),
      ];

      const pressedButtons = buttons.filter(
        (button) => button.getAttribute('aria-pressed') === 'true'
      );

      expect(pressedButtons.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      render(<ThemeToggle />);

      expect(screen.getByLabelText('Switch to Light mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to Dark mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to System mode')).toBeInTheDocument();
    });

    it('should have screen reader text', () => {
      render(<ThemeToggle />);

      expect(screen.getByText('Light mode')).toHaveClass('sr-only');
      expect(screen.getByText('Dark mode')).toHaveClass('sr-only');
      expect(screen.getByText('System mode')).toHaveClass('sr-only');
    });

    it('should have proper button roles', () => {
      render(<ThemeToggle />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });

    it('should have aria-pressed attribute', () => {
      render(<ThemeToggle />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });
  });

  describe('Styling', () => {
    it('should apply active styling to current theme', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Switch to Light mode');
      expect(lightButton).toHaveClass('bg-background');
      expect(lightButton).toHaveClass('shadow-sm');
    });

    it('should apply inactive styling to other themes', () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Switch to Dark mode');
      expect(darkButton).toHaveClass('text-muted-foreground');
    });

    it('should have rounded border', () => {
      const { container } = render(<ThemeToggle />);

      const buttonGroup = container.querySelector('.inline-flex');
      expect(buttonGroup).toHaveClass('rounded-lg');
      expect(buttonGroup).toHaveClass('border');
    });
  });

  describe('Theme Changes', () => {
    it('should update active state when theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      // Initially light
      expect(screen.getByLabelText('Switch to Light mode')).toHaveAttribute('aria-pressed', 'true');

      // Change to dark
      (useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      });

      rerender(<ThemeToggle />);

      expect(screen.getByLabelText('Switch to Dark mode')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('Switch to Light mode')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });
  });

  describe('Icons', () => {
    it('should render Sun icon for light mode', () => {
      render(<ThemeToggle />);

      const lightButton = screen.getByLabelText('Switch to Light mode');
      const icon = lightButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('should render Moon icon for dark mode', () => {
      render(<ThemeToggle />);

      const darkButton = screen.getByLabelText('Switch to Dark mode');
      const icon = darkButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });

    it('should render Monitor icon for system mode', () => {
      render(<ThemeToggle />);

      const systemButton = screen.getByLabelText('Switch to System mode');
      const icon = systemButton.querySelector('svg');

      expect(icon).toBeInTheDocument();
    });
  });
});
