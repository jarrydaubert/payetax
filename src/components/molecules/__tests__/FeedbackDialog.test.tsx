// src/components/molecules/__tests__/FeedbackDialog.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackDialog } from '../FeedbackDialog';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('FeedbackDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Rendering', () => {
    it('should render feedback button', () => {
      render(<FeedbackDialog />);

      expect(screen.getByRole('button', { name: /feedback/i })).toBeInTheDocument();
    });

    it('should render button with icon', () => {
      render(<FeedbackDialog />);

      const button = screen.getByRole('button', { name: /feedback/i });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not show dialog initially', () => {
      render(<FeedbackDialog />);

      expect(screen.queryByText('Share Your Feedback')).not.toBeInTheDocument();
    });

    it('should show dialog when button is clicked', async () => {
      render(<FeedbackDialog />);

      const button = screen.getByRole('button', { name: /feedback/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
      });
    });

    it('should render dialog description', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByText(/Help us improve PayeTax/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Fields', () => {
    it('should render email input', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email \(optional\)/i)).toBeInTheDocument();
      });
    });

    it('should render message textarea', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });
    });

    it('should render submit button', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
      });
    });

    it('should have placeholder text in email input', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('your@email.com');
        expect(emailInput).toBeInTheDocument();
      });
    });

    it('should have placeholder text in message textarea', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/What worked/i);
        expect(messageInput).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when message is too short', async () => {
      const user = userEvent.setup();
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Short');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Message must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.change(messageInput, {
        target: { value: 'This is a valid message with enough characters' },
      });

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      const form = submitButton.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email', async () => {
      const user = userEvent.setup();
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'valid@email.com');

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'This is a valid message with enough characters');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should allow submission without email', async () => {
      const user = userEvent.setup();
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'This is a valid message with enough characters');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call API with correct data', async () => {
      const user = userEvent.setup();
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'This is my feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/feedback',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('test@example.com'),
          })
        );
      });
    });

    it('should show success toast on successful submission', async () => {
      const user = userEvent.setup();
      const { toast } = require('sonner');

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Thanks! Your feedback has been sent')
        );
      });
    });

    it('should show error toast on failed submission', async () => {
      const user = userEvent.setup();
      const { toast } = require('sonner');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      });

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    });

    it('should show network error toast on fetch failure', async () => {
      const user = userEvent.setup();
      const { toast } = require('sonner');

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Network error'));
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(
        submitPromise.then(() => ({ ok: true, json: async () => ({}) }))
      );

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });

      resolveSubmit?.();
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(
        submitPromise.then(() => ({ ok: true, json: async () => ({}) }))
      );

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const sendingButton = screen.getByRole('button', { name: /sending/i });
        expect(sendingButton).toBeDisabled();
      });

      resolveSubmit?.();
    });

    it('should clear form and close dialog after successful submission', async () => {
      const user = userEvent.setup();

      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'Valid feedback message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Share Your Feedback')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle unmounting', () => {
      const { unmount } = render(<FeedbackDialog />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle unmounting while dialog is open', async () => {
      const { unmount } = render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});
