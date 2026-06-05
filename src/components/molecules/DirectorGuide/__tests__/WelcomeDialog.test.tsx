import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DirectorGuideWelcomeDialog } from '../WelcomeDialog';

const DISMISS_KEY = 'directorGuideWelcome:dismissed:v1';

describe('DirectorGuideWelcomeDialog', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens for first-time visitors and exposes mobile-safe dismiss affordances', async () => {
    render(<DirectorGuideWelcomeDialog />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to the Director Pay Calculator')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-h-[calc(100dvh-env(safe-area-inset-top,0px)-1rem)]');
    expect(dialog).not.toHaveClass('top-2');
    expect(dialog).toHaveClass('shadow-none');
    expect(dialog).not.toHaveClass('shadow-2xl', 'backdrop-blur-xl');

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toHaveClass('h-11', 'w-11');

    const primaryCta = screen.getByRole('button', { name: "Got it, let's start" });
    expect(primaryCta).toHaveClass('w-full');
  });

  it('persists dismissal when user opts out', async () => {
    render(<DirectorGuideWelcomeDialog />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to the Director Pay Calculator')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/don't show again/i));
    fireEvent.click(screen.getByRole('button', { name: "Got it, let's start" }));

    await waitFor(() => {
      expect(screen.queryByText('Welcome to the Director Pay Calculator')).not.toBeInTheDocument();
    });

    expect(window.localStorage.getItem(DISMISS_KEY)).toBe('true');
  });

  it('stays closed when dismissal preference already exists', async () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    render(<DirectorGuideWelcomeDialog />);

    await waitFor(() => {
      expect(screen.queryByText('Welcome to the Director Pay Calculator')).not.toBeInTheDocument();
    });
  });
});
