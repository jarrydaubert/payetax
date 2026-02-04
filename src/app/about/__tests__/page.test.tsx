import { render, screen } from '@testing-library/react';
import AboutPage from '../page';

describe('AboutPage', () => {
  it('renders key about content and CTA', () => {
    render(<AboutPage />);

    expect(screen.getByText("Hey, I'm Jarryd")).toBeInTheDocument();
    expect(screen.getByText('Try the Calculator')).toBeInTheDocument();
  });
});
