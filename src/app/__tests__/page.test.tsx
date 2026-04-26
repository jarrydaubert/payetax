import { render, screen } from '@testing-library/react';
import HomePage, { metadata } from '../page';

describe('HomePage', () => {
  it('renders the homepage calculator shell in the initial document', () => {
    const { container } = render(<HomePage />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toBeInTheDocument();
    expect(calculatorSection).toHaveAttribute('data-testid', 'homepage-calculator');
    expect(screen.getByTestId('homepage-hero')).toBeInTheDocument();
  });

  it('keeps query-parameter calculator presets canonical to the homepage', () => {
    expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/');
  });
});
