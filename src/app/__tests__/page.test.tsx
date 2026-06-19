import { render, screen } from '@testing-library/react';
import { getCrawlableTaxFacts } from '@/lib/crawlableTaxFacts';
import HomePage, { metadata } from '../page';

describe('HomePage', () => {
  it('renders the homepage calculator shell in the initial document', () => {
    const { container } = render(<HomePage />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toBeInTheDocument();
    expect(calculatorSection).toHaveAttribute('data-testid', 'homepage-calculator');
    expect(screen.getByTestId('homepage-hero')).toBeInTheDocument();
  });

  it('renders crawlable PAYE facts and take-home examples in the initial document', () => {
    const facts = getCrawlableTaxFacts();
    const salary30k = facts.salaryExamples.find((example) => example.salary === 30_000);

    render(<HomePage />);

    expect(screen.getByTestId('crawlable-tax-facts')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'PAYE rates and take-home examples' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('crawlable-tax-facts')).toHaveTextContent(facts.assumptions);
    expect(screen.getByText(salary30k?.annualTakeHomeLabel ?? '')).toBeInTheDocument();
    expect(screen.getAllByText('Employee NI category A primary rate')[0]).toBeInTheDocument();
  });

  it('keeps query-parameter calculator presets canonical to the homepage', () => {
    expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/');
  });
});
