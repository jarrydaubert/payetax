// src/lib/__tests__/theme.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../theme';

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies the light-first theme to document on mount', async () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  it('preserves an explicit dark class', async () => {
    document.documentElement.classList.add('dark');

    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
