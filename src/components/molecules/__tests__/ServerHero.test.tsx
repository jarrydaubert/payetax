import { render, screen } from '@testing-library/react';
import ServerHero from '../ServerHero';

describe('Calculator introduction', () => {
  it('identifies the calculator and current HMRC-rate year without a second entry action', () => {
    render(<ServerHero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UK PAYE tax calculator');
    expect(screen.getByText(/HMRC rates/)).toBeInTheDocument();
    expect(screen.getByText(/Understand your take-home pay/)).toBeInTheDocument();
  });
});
