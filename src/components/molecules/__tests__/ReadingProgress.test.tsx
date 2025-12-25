// src/components/molecules/__tests__/ReadingProgress.test.tsx
import { render, screen } from '@testing-library/react';
import { ReadingProgress } from '../ReadingProgress';

describe('ReadingProgress', () => {
  it('renders progress bar', () => {
    render(<ReadingProgress />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<ReadingProgress />);
    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Reading progress');
  });

  it('applies custom className', () => {
    render(<ReadingProgress className='custom-class' />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom-class');
  });

  it('starts at 0 progress', () => {
    render(<ReadingProgress />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });
});
