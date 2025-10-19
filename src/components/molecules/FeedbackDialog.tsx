// src/components/molecules/FeedbackDialog.tsx
'use client';

import { MessageSquare, Send } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
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

export function FeedbackDialog() {
  const emailId = useId();
  const messageId = useId();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    message: '',
  });

  const validate = () => {
    const newErrors = { email: '', message: '' };
    let isValid = true;

    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success('Thanks! Your feedback has been sent to the team.');
        setFormData({ email: '', message: '' });
        setOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send feedback. Please try again.');
      }
    } catch (_error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='flex min-h-[44px] items-center gap-2 px-4 py-2.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
        >
          <MessageSquare className='size-4' />
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
        <form onSubmit={onSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={emailId}>Email (optional)</Label>
            <Input
              id={emailId}
              type='email'
              placeholder='your@email.com'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className='text-destructive text-sm'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor={messageId}>
              Message <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id={messageId}
              placeholder="What worked? What didn't? Suggestions?"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            {errors.message && <p className='text-destructive text-sm'>{errors.message}</p>}
          </div>

          <DialogFooter>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className='mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='mr-2 size-4' />
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
