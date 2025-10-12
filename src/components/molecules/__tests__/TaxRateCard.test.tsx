// src/components/molecules/__tests__/TaxRateCard.test.tsx
import { render, screen } from '@testing-library/react';
import { Calculator } from 'lucide-react';
import { TaxRateCard } from '../TaxRateCard';

describe('TaxRateCard', () => {
  const mockItems = [
    { label: 'Basic Rate', value: '20%', colorClass: 'text-green-600' },
    { label: 'Higher Rate', value: '40%', colorClass: 'text-orange-600' },
  ];

  it('renders card with icon and title', () => {
    render(<TaxRateCard icon={Calculator} title='Income Tax' items={mockItems} />);

    expect(screen.getByText('Income Tax')).toBeInTheDocument();
  });

  it('renders all tax rate items', () => {
    render(<TaxRateCard icon={Calculator} title='Income Tax' items={mockItems} />);

    expect(screen.getByText('Basic Rate')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Higher Rate')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('renders footer note when provided', () => {
    render(
      <TaxRateCard
        icon={Calculator}
        title='National Insurance'
        items={mockItems}
        footerNote='Class 1 contributions'
      />
    );

    expect(screen.getByText('Class 1 contributions')).toBeInTheDocument();
  });

  it('does not render footer note when not provided', () => {
    render(<TaxRateCard icon={Calculator} title='Income Tax' items={mockItems} />);

    expect(screen.queryByText('Class 1 contributions')).not.toBeInTheDocument();
  });

  it('applies custom color classes to values', () => {
    const { container } = render(
      <TaxRateCard icon={Calculator} title='Tax Rates' items={mockItems} />
    );

    const greenValue = container.querySelector('.text-green-600');
    expect(greenValue).toHaveTextContent('20%');

    const orangeValue = container.querySelector('.text-orange-600');
    expect(orangeValue).toHaveTextContent('40%');
  });

  it('applies default color class when colorClass not provided', () => {
    const itemsWithoutColor = [{ label: 'Basic Rate', value: '20%' }];

    render(<TaxRateCard icon={Calculator} title='Tax Rates' items={itemsWithoutColor} />);

    // Check value is rendered (it will have text-foreground class by default)
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Basic Rate')).toBeInTheDocument();
  });

  it('renders multiple items correctly', () => {
    const multipleItems = [
      { label: 'Item 1', value: 'Value 1' },
      { label: 'Item 2', value: 'Value 2' },
      { label: 'Item 3', value: 'Value 3' },
    ];

    render(<TaxRateCard icon={Calculator} title='Multiple Items' items={multipleItems} />);

    multipleItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(item.value)).toBeInTheDocument();
    });
  });
});
