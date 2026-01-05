// src/lib/__tests__/theme.test.tsx
// Tests for dark-mode-only theme provider
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../theme';

describe('ThemeProvider (dark mode only)', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies dark theme to document on mount', async () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  it('removes light class if present', async () => {
    document.documentElement.classList.add('light');

    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
