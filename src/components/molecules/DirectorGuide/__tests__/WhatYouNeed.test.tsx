// src/components/molecules/DirectorGuide/__tests__/WhatYouNeed.test.tsx
import { render, screen } from '@testing-library/react';
import { WhatYouNeed } from '../WhatYouNeed';

describe('WhatYouNeed Component', () => {
  it('should render the title', () => {
    render(<WhatYouNeed />);
    expect(screen.getByText("What you'll need")).toBeInTheDocument();
  });

  it('should render all required items', () => {
    render(<WhatYouNeed />);

    expect(screen.getByText('Where you live (Scotland or rest of UK)')).toBeInTheDocument();
    expect(screen.getByText('Rough annual revenue')).toBeInTheDocument();
    expect(screen.getByText('Business expenses')).toBeInTheDocument();
    expect(screen.getByText("Any money you've already taken")).toBeInTheDocument();
  });

  it('should render the time estimate', () => {
    render(<WhatYouNeed />);
    expect(screen.getByText('Takes about 2 minutes.')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<WhatYouNeed className='custom-class' />);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
