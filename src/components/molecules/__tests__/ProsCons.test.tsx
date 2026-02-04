import { render, screen } from '@/test/testing-library';

import { AdvantagesList, ProsCons } from '../ProsCons';

describe('ProsCons', () => {
  it('renders pros and cons lists with custom titles', () => {
    render(
      <ProsCons
        pros={['Fast', 'Clear']}
        cons={['Limited']}
        prosTitle='What works'
        consTitle="What doesn't"
      />,
    );

    expect(screen.getByText('What works')).toBeInTheDocument();
    expect(screen.getByText("What doesn't")).toBeInTheDocument();
    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Limited')).toBeInTheDocument();
  });

  it('renders advantages list', () => {
    render(<AdvantagesList items={['Advantage A', 'Advantage B']} />);

    expect(screen.getByText('Why PayeTax is Better')).toBeInTheDocument();
    expect(screen.getByText('Advantage A')).toBeInTheDocument();
  });
});
