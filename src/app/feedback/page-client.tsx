// src/app/feedback/page-client.tsx

'use client';

import {
  ArrowLeft,
  CheckCircle,
  Heart,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  User,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import CallToAction from '@/components/ui/CallToAction';

interface FeedbackFormData {
  name: string;
  email: string;
  feedbackType: 'suggestion' | 'issue' | 'question' | 'other';
  message: string;
}

export default function FeedbackPageClient() {
  const titleId = useId();
  const nameId = useId();
  const emailId = useId();
  const feedbackTypeId = useId();
  const messageId = useId();

  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    feedbackType: 'suggestion',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      setError('Please share your thoughts with us');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send feedback');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        feedbackType: 'suggestion',
        message: '',
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again or email us directly.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'suggestion' as const, label: 'Suggestion', icon: Sparkles },
    { value: 'issue' as const, label: 'Report Issue', icon: Shield },
    { value: 'question' as const, label: 'Question', icon: MessageSquare },
    { value: 'other' as const, label: 'Other', icon: Zap },
  ];

  if (submitted) {
    return (
      <div className='relative min-h-screen pt-20'>
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/10 via-gray-900 to-purple-500/5' />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent' />
        <div className='container relative z-10 mx-auto max-w-4xl px-4 py-20 text-center lg:max-w-5xl'>
          <div className='mx-auto max-w-3xl'>
            <div className='glass-card text-center'>
              <div className='mb-8 flex items-center justify-center'>
                <div className='relative'>
                  <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-green-600 opacity-30 blur-xl' />
                  <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-2xl'>
                    <CheckCircle className='h-10 w-10 text-white' />
                  </div>
                </div>
              </div>
              <h1 className='mb-6 bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text font-bold text-3xl text-transparent md:text-5xl'>
                Thank You!
              </h1>
              <p className='mx-auto mb-8 max-w-2xl text-gray-200 text-lg leading-relaxed md:text-xl'>
                Your feedback has been received and is very much appreciated. We'll review it
                carefully and use it to improve ToolHubX.
              </p>
              <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='glass-card'>
                  <div className='mb-1 font-bold text-2xl text-green-400'>✓</div>
                  <div className='text-gray-300 text-sm'>Feedback Received</div>
                </div>
                <div className='glass-card'>
                  <div className='mb-1 font-bold text-2xl text-blue-400'>24h</div>
                  <div className='text-gray-300 text-sm'>Response Time</div>
                </div>
                <div className='glass-card'>
                  <div className='mb-1 font-bold text-2xl text-purple-400'>100%</div>
                  <div className='text-gray-300 text-sm'>Read Rate</div>
                </div>
              </div>
              <div className='space-y-4'>
                <Button
                  asChild
                  variant='default'
                  size='lg'
                  className='group relative overflow-hidden'
                >
                  <Link href='/'>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    <div className='absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100' />
                    <span className='relative z-10'>Back to Calculator</span>
                  </Link>
                </Button>
                <div>
                  <button
                    type='button'
                    onClick={() => setSubmitted(false)}
                    className='text-purple-400 underline underline-offset-2 transition-colors hover:text-cyan-400'
                  >
                    Send more feedback
                  </button>
                </div>
              </div>
            </div>
            <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='glass-card text-center'>
                <Heart className='mx-auto mb-4 h-8 w-8 text-red-400' />
                <h3 className='mb-2 font-semibold text-white'>Spread the Word</h3>
                <p className='mb-4 text-gray-300 text-sm'>Help others discover ToolHubX</p>
                <Button variant='outline' size='sm' className='w-full'>
                  Share with Friends
                </Button>
              </div>
              <div className='glass-card text-center'>
                <Star className='mx-auto mb-4 h-8 w-8 text-yellow-400' />
                <h3 className='mb-2 font-semibold text-white'>Rate Your Experience</h3>
                <p className='mb-4 text-gray-300 text-sm'>Help us improve further</p>
                <Button variant='outline' size='sm' className='w-full'>
                  Leave a Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen pt-20'>
      {/* Gradient Background */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-gray-900 to-cyan-500/5' />
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent' />

      <div className='container relative z-10 mx-auto max-w-5xl px-4 py-12 lg:max-w-6xl'>
        {/* Header Section */}
        <div className='mb-16'>
          <Link
            href='/'
            className='group mb-8 inline-flex items-center text-purple-400 transition-colors hover:text-purple-300'
          >
            <ArrowLeft className='group-hover:-translate-x-1 mr-2 h-4 w-4 transition-transform' />
            Back to Calculator
          </Link>

          <div className='text-center'>
            <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2'>
              <MessageSquare className='h-4 w-4 text-blue-400' />
              <span className='font-medium text-blue-300 text-sm'>Share Your Feedback</span>
            </div>

            <h1 id={titleId} className='mb-6 font-bold text-4xl md:text-6xl'>
              <span className='bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                Your Voice Matters
              </span>
              <br />
              <span className='text-white'>Help Us Improve</span>
            </h1>

            <p className='mx-auto max-w-3xl text-gray-300 text-xl leading-relaxed'>
              Help us make ToolHubX even better by sharing your thoughts, reporting issues, or
              asking questions. Your feedback directly shapes our development priorities.
            </p>
          </div>
        </div>

        {/* Feedback Types Grid */}
        <div className='mb-12'>
          <div className='mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4'>
            {feedbackTypes.map((type, index) => (
              <button
                type='button'
                key={type.value}
                onClick={() => setFormData((prev) => ({ ...prev, feedbackType: type.value }))}
                className={`glass-card cursor-pointer border-2 transition-all hover:scale-105 ${
                  formData.feedbackType === type.value
                    ? 'border-purple-400/50 bg-purple-500/10'
                    : 'border-transparent hover:border-white/20'
                }`}
              >
                <div className='text-center'>
                  <div className='mb-3 flex items-center justify-center'>
                    <div
                      className={`rounded-full p-3 transition-colors ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : index === 1
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : index === 2
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                      } ${formData.feedbackType === type.value ? 'ring-2 ring-white/50' : ''}`}
                    >
                      <type.icon className='h-4 w-4 text-white' />
                    </div>
                  </div>
                  <div className='font-medium text-sm text-white'>{type.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className='mx-auto max-w-3xl'>
          <div className='glass-card'>
            <form onSubmit={handleSubmit} aria-labelledby={titleId} className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div
                  role='alert'
                  aria-live='polite'
                  className='rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 backdrop-blur-sm'
                >
                  <div className='flex items-center space-x-2'>
                    <Shield className='h-5 w-5 text-red-400' />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Name Field */}
                <div>
                  <label htmlFor={nameId} className='mb-2 block font-medium text-sm text-white'>
                    Name (Optional)
                  </label>
                  <div className='relative'>
                    <User
                      className={`-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform transition-colors ${
                        focusedField === 'name' ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    />
                    <input
                      type='text'
                      id={nameId}
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder='Your name'
                      className='glass w-full rounded-lg border border-white/10 py-3 pr-4 pl-10 transition-all hover:border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50'
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor={emailId} className='mb-2 block font-medium text-sm text-white'>
                    Email (Optional)
                  </label>
                  <div className='relative'>
                    <Mail
                      className={`-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 transform transition-colors ${
                        focusedField === 'email' ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    />
                    <input
                      type='email'
                      id={emailId}
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder='your.email@example.com'
                      className='glass w-full rounded-lg border border-white/10 py-3 pr-4 pl-10 transition-all hover:border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50'
                    />
                  </div>
                  <p className='mt-1 text-gray-300 text-xs'>Only used if we need to follow up</p>
                </div>
              </div>

              {/* Feedback Type */}
              <div>
                <label
                  htmlFor={feedbackTypeId}
                  className='mb-2 block font-medium text-sm text-white'
                >
                  Feedback Type
                </label>
                <select
                  id={feedbackTypeId}
                  name='feedbackType'
                  value={formData.feedbackType}
                  onChange={handleChange}
                  className='glass w-full rounded-lg border border-white/10 px-4 py-3 transition-all hover:border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50'
                >
                  {feedbackTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className='bg-background text-white'
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor={messageId} className='mb-2 block font-medium text-sm text-white'>
                  Your Message *
                </label>
                <textarea
                  id={messageId}
                  name='message'
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  rows={6}
                  placeholder='Share your thoughts, describe an issue, or ask a question...'
                  className='glass w-full resize-none rounded-lg border border-white/10 px-4 py-3 transition-all hover:border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50'
                />
                <p className='mt-1 text-gray-300 text-xs'>
                  The more detail you provide, the better we can help!
                </p>
              </div>

              {/* Submit Button */}
              <div className='pt-6'>
                <Button
                  type='submit'
                  disabled={isSubmitting || !formData.message.trim()}
                  variant='default'
                  size='lg'
                  className='group relative w-full overflow-hidden'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100' />
                  <span className='relative z-10'>
                    {isSubmitting ? (
                      <div className='flex items-center justify-center space-x-2'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        <span>Sending your feedback...</span>
                      </div>
                    ) : (
                      'Send Feedback'
                    )}
                  </span>
                </Button>
                <p className='mt-4 text-center text-gray-300 text-xs'>
                  Your feedback helps us build a better tax calculator for everyone 🇬🇧
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Related Actions */}
        <CallToAction variant='calculator' className='mt-16 mb-8' />
      </div>
    </div>
  );
}
