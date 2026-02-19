import { render, screen } from '@testing-library/react';
import { AppToaster } from '../AppToaster';

jest.mock('sonner', () => ({
  Toaster: ({
    position,
    richColors,
    expand,
    closeButton,
  }: {
    position?: string;
    richColors?: boolean;
    expand?: boolean;
    closeButton?: boolean;
  }) => (
    <div
      data-testid='app-toaster'
      data-position={position}
      data-rich-colors={String(richColors)}
      data-expand={String(expand)}
      data-close-button={String(closeButton)}
    />
  ),
}));

describe('AppToaster', () => {
  it('renders Sonner toaster with expected defaults', () => {
    render(<AppToaster />);

    const toaster = screen.getByTestId('app-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-position', 'top-right');
    expect(toaster).toHaveAttribute('data-rich-colors', 'true');
    expect(toaster).toHaveAttribute('data-expand', 'true');
    expect(toaster).toHaveAttribute('data-close-button', 'true');
  });
});
