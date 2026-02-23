// src/components/organisms/__tests__/FeedbackDialog.test.tsx
/**
 * FeedbackDialog Tests
 *
 * React 19 useActionState behavior is tested via mocked server actions.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { type FeedbackFormState, submitFeedback } from '@/app/actions/feedback';
import { FeedbackDialog } from '../FeedbackDialog';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the server action
jest.mock('@/app/actions/feedback', () => ({
  submitFeedback: jest.fn(async (_prevState: unknown, _formData: FormData) => ({
    success: true,
    message: 'Thanks! Your feedback has been sent to the team.',
  })),
}));

const mockSubmitFeedback = submitFeedback as jest.MockedFunction<typeof submitFeedback>;

describe('FeedbackDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitFeedback.mockResolvedValue({
      success: true,
      message: 'Thanks! Your feedback has been sent to the team.',
    });
  });

  describe('Rendering', () => {
    it('should render feedback button', () => {
      render(<FeedbackDialog />);

      expect(screen.getByRole('button', { name: /feedback/i })).toBeInTheDocument();
    });

    it('should render a custom trigger label', () => {
      render(<FeedbackDialog triggerLabel='Send feedback' triggerVariant='outline' />);

      expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
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

    it('uses mobile-safe dialog sizing constraints', async () => {
      render(<FeedbackDialog />);
      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toHaveClass('w-[calc(100%-1rem)]', 'max-w-md');
      expect(dialog).toHaveClass('max-h-[calc(100dvh-env(safe-area-inset-top,0px)-1rem)]');
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

    it('should NOT show error for empty email (email is optional)', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Leave email empty
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveValue('');

      // Fill in valid message
      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.change(messageInput, {
        target: { value: 'This is a valid message with enough characters' },
      });

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      const form = submitButton.closest('form');
      if (form) fireEvent.submit(form);

      // Should NOT show email error - empty email is valid
      await waitFor(() => {
        expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument();
      });
    });

    it('should NOT show error for whitespace-only email (treated as empty)', async () => {
      render(<FeedbackDialog />);

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: '   ' } });

      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.change(messageInput, {
        target: { value: 'This is a valid message with enough characters' },
      });

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      const form = submitButton.closest('form');
      if (form) fireEvent.submit(form);

      // Whitespace-only email is trimmed to empty, which is valid (email is optional)
      await waitFor(() => {
        expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillAndSubmitForm = async ({
      email = 'test@example.com',
      message = 'This is my feedback message',
    }: {
      email?: string;
      message?: string;
    } = {}) => {
      const user = userEvent.setup();

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      if (email) {
        await user.type(emailInput, email);
      }

      const messageInput = screen.getByLabelText(/message/i);
      await user.clear(messageInput);
      await user.type(messageInput, message);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      fireEvent.click(submitButton);
    };

    it('should call server action with correct form data', async () => {
      render(<FeedbackDialog />);
      await fillAndSubmitForm();

      await waitFor(() => {
        expect(mockSubmitFeedback).toHaveBeenCalled();
      });

      const latestCall = mockSubmitFeedback.mock.calls.at(-1);
      expect(latestCall).toBeDefined();
      if (!latestCall) return;

      const [, submittedFormData] = latestCall;
      expect(submittedFormData).toBeInstanceOf(FormData);
      expect(submittedFormData.get('email')).toBe('test@example.com');
      expect(submittedFormData.get('message')).toBe('This is my feedback message');
      expect(submittedFormData.get('url')).toBe(window.location.href);
    });

    it('should show success toast on successful submission', async () => {
      render(<FeedbackDialog />);
      await fillAndSubmitForm({ email: '', message: 'Valid feedback message' });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Thanks! Your feedback has been sent'),
        );
      });
    });

    it('should show error toast on failed submission', async () => {
      mockSubmitFeedback.mockResolvedValueOnce({
        success: false,
        error: 'Server error',
      });

      render(<FeedbackDialog />);
      await fillAndSubmitForm({ message: 'Valid feedback message' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    });

    it('should show generic error message returned by server action', async () => {
      mockSubmitFeedback.mockResolvedValueOnce({
        success: false,
        error: 'Something went wrong. Please try again later.',
      });

      render(<FeedbackDialog />);
      await fillAndSubmitForm({ message: 'Valid feedback message' });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again later.');
      });
    });

    it('should show loading state during submission', async () => {
      let resolveSubmit: ((value: FeedbackFormState) => void) | undefined;
      const submitPromise = new Promise<FeedbackFormState>((resolve) => {
        resolveSubmit = resolve;
      });

      mockSubmitFeedback.mockImplementationOnce(async () => submitPromise);

      render(<FeedbackDialog />);
      await fillAndSubmitForm({ message: 'Valid feedback message' });

      await waitFor(() => {
        const sendingButton = screen.getByRole('button', { name: /sending/i });
        expect(sendingButton).toBeDisabled();
      });

      resolveSubmit?.({
        success: true,
        message: 'Thanks! Your feedback has been sent to the team.',
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should disable submit button during submission', async () => {
      let resolveSubmit: ((value: FeedbackFormState) => void) | undefined;
      const submitPromise = new Promise<FeedbackFormState>((resolve) => {
        resolveSubmit = resolve;
      });

      mockSubmitFeedback.mockImplementationOnce(async () => submitPromise);

      render(<FeedbackDialog />);
      await fillAndSubmitForm({ message: 'Valid feedback message' });

      await waitFor(() => {
        const sendingButton = screen.getByRole('button', { name: /sending/i });
        expect(sendingButton).toBeDisabled();
      });

      resolveSubmit?.({
        success: true,
        message: 'Thanks! Your feedback has been sent to the team.',
      });
    });

    it('should clear form and close dialog after successful submission', async () => {
      render(<FeedbackDialog />);
      await fillAndSubmitForm({ email: 'clearme@example.com', message: 'Valid feedback message' });

      await waitFor(() => {
        expect(screen.queryByText('Share Your Feedback')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/message/i)).toHaveValue('');
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
