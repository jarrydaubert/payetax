import { fireEvent, render, screen, waitFor } from '@/test/testing-library';

import { NewsletterCTA } from '../NewsletterCTA';

describe('NewsletterCTA', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('submits an email and shows success state', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    render(<NewsletterCTA />);

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'hello@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Subscribe/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thanks! Check your inbox/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hello@example.com' }),
    });
  });

  it('skips submit when honeypot is filled', async () => {
    global.fetch = jest.fn();

    const { container } = render(<NewsletterCTA />);

    const honeypot = container.querySelector('input[name="website"]') as HTMLInputElement;
    fireEvent.change(honeypot, { target: { value: 'bot' } });

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'hello@example.com' },
    });

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
