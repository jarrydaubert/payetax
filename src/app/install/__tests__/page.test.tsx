import { render, screen } from '@/test/testing-library';
import InstallPage from '../page';

describe('/install page', () => {
  it('renders install instructions for key platforms', () => {
    render(<InstallPage />);

    expect(
      screen.getByRole('heading', { name: /Add PayeTax to your home screen/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/iPhone \/ iPad/i)).toBeInTheDocument();
    expect(screen.getByText(/Android/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Desktop \(Chrome\/Edge\)/i })).toBeInTheDocument();
  });

  it('renders calculator CTA', () => {
    render(<InstallPage />);

    expect(screen.getByRole('link', { name: /Open Calculator/i })).toHaveAttribute('href', '/');
  });
});
