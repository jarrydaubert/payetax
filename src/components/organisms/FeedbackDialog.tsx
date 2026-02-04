// src/components/organisms/FeedbackDialog.tsx
'use client';

import { MessageSquare, Send } from 'lucide-react';
import { startTransition, useActionState, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type FeedbackFormState, submitFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COLORS, ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { validateFeedbackForm } from '@/lib/validation/moleculesValidation';

/**
 * Feedback dialog organism for collecting user feedback
 * React 19 features: useActionState for server action integration
 * Uses Zod validation for type-safe form validation
 * Design tokens: TEXT_SM for labels/text, SIZE_4 for icons, SPACE_Y_4/SPACE_Y_2 for form spacing
 */
export function FeedbackDialog() {
  const emailId = useId();
  const messageId = useId();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    message: '',
  });

  // React 19: useActionState hook for server action state management
  const [state, formAction, isPending] = useActionState<FeedbackFormState, FormData>(
    submitFeedback,
    { success: false },
  );

  // Track which state we've already handled to prevent duplicate side effects
  const lastHandledState = useRef<FeedbackFormState | null>(null);

  // Handle server action response (once per unique state change)
  useEffect(() => {
    // Skip if we've already handled this exact state
    if (state === lastHandledState.current) return;
    // Skip initial state
    if (!(state.success || state.error)) return;

    lastHandledState.current = state;

    if (state.success) {
      // Track successful feedback submission
      trackEvent({
        action: 'feedback_submitted',
        category: 'feedback',
        custom_data: { has_email: !!formData.email },
      });
      toast.success(state.message || 'Feedback sent successfully!');
      setFormData({ email: '', message: '' });
      setErrors({ email: '', message: '' });
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, formData.email]);

  // Track dialog open
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      trackEvent({
        action: 'feedback_dialog_opened',
        category: 'feedback',
      });
    }
  };

  const messageLength = formData.message.trim().length;
  const minLength = 10;
  const maxLength = 5000;

  /**
   * IMPORTANT: Zod validation replaces inline regex checks
   * See moleculesValidation.ts for schema definition.
   * This provides runtime type safety and consistent error messages.
   */
  const validate = () => {
    const result = validateFeedbackForm(formData);

    if (!result.success) {
      const zodErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: zodErrors.email?.[0] || '',
        message: zodErrors.message?.[0] || '',
      });
      return false;
    }

    setErrors({ email: '', message: '' });
    return true;
  };

  /**
   * React 19: Form submission with server action
   * Client validates first, then calls formAction directly
   * Note: userAgent, timestamp, and IP are extracted server-side from headers
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation first
    if (!validate()) {
      return;
    }

    // Create FormData with only necessary fields
    // (timestamp, userAgent, IP are extracted server-side for accuracy/security)
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('email', formData.email);
    formDataToSubmit.append('message', formData.message);
    formDataToSubmit.append('url', window.location.href);

    // Call server action directly - useActionState handles pending state
    startTransition(() => {
      formAction(formDataToSubmit);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex min-h-[44px] items-center rounded-md px-4 py-2.5 font-medium text-muted-foreground transition-colors',
            'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            SPACING.GAP_2,
            TYPOGRAPHY.TEXT_SM,
          )}
          aria-haspopup='dialog'
        >
          <MessageSquare className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          Feedback
        </button>
      </DialogTrigger>
      <DialogContent className='border-border/50 bg-background/95 backdrop-blur-xl sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve PayeTax. Your input directly shapes our development priorities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className={SPACING.SPACE_Y_4}>
          <div className={SPACING.SPACE_Y_2}>
            <Label htmlFor={emailId}>Email (optional)</Label>
            <Input
              id={emailId}
              type='email'
              placeholder='your@email.com'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
            />
            {errors.email && (
              <p
                id={`${emailId}-error`}
                className={cn('text-destructive', TYPOGRAPHY.TEXT_SM)}
                role='alert'
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className={SPACING.SPACE_Y_2}>
            <div className='flex items-center justify-between'>
              <Label htmlFor={messageId}>
                Message <span className='text-destructive'>*</span>
              </Label>
              <span
                className={cn(
                  TYPOGRAPHY.TEXT_XS,
                  messageLength < minLength
                    ? 'text-destructive'
                    : messageLength > maxLength - 100
                      ? COLORS.WARNING
                      : 'text-muted-foreground',
                )}
                aria-live='polite'
              >
                {messageLength}/{maxLength}
              </span>
            </div>
            <Textarea
              id={messageId}
              placeholder="What worked? What didn't? Suggestions?"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              maxLength={maxLength}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${messageId}-error` : `${messageId}-hint`}
            />
            {errors.message ? (
              <p
                id={`${messageId}-error`}
                className={cn('text-destructive', TYPOGRAPHY.TEXT_SM)}
                role='alert'
              >
                {errors.message}
              </p>
            ) : (
              <p
                id={`${messageId}-hint`}
                className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}
              >
                {messageLength < minLength
                  ? `${minLength - messageLength} more character${minLength - messageLength === 1 ? '' : 's'} needed`
                  : 'Share your thoughts, ideas, or issues'}
              </p>
            )}
          </div>

          <DialogFooter>
            {/* React 19: useActionState provides isPending state */}
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? (
                <>
                  <div
                    className={cn(
                      'mr-2 animate-spin rounded-full border-2 border-current border-t-transparent',
                      ICON_SIZES.SIZE_4,
                    )}
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send className={cn('mr-2', ICON_SIZES.SIZE_4)} />
                  Send Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
