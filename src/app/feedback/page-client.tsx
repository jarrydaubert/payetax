// src/app/feedback/page-client.tsx

'use client';

// TODO: Restore animations with CSS-based approach
import { 
  MessageSquare, 
  Send, 
  User, 
  Mail, 
  Sparkles,
  Heart,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';

interface FeedbackFormData {
  name: string;
  email: string;
  feedbackType: 'suggestion' | 'issue' | 'question' | 'other';
  message: string;
}

export default function FeedbackPageClient() {
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
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Something went wrong. Please try again or email us directly.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'suggestion', label: 'Suggestion', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'issue', label: 'Report Issue', icon: <Shield className="h-4 w-4" /> },
    { value: 'question', label: 'Question', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <Zap className="h-4 w-4" /> },
  ];

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen"> {/* Add top padding for navbar */}
        <div className="container mx-auto px-4 py-20 text-center">
          <div
            className="max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center bg-green-500 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-title font-bold mb-6 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              Thank You!
            </h1>
            
            <p className="text-large text-white/90 mb-8 leading-relaxed">
              Your feedback has been received and is very much appreciated. 
              We'll review it carefully and use it to improve ToolHubX.
            </p>

            <div className="space-y-4">
              <Button
                href="/"
                variant="primary"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Calculator
              </Button>
              <div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Send more feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen"> {/* Add top padding for navbar */}
      <div className="container mx-auto px-4 py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calculator
          </Link>
          <div className="text-center max-w-3xl mx-auto">
            <h1 id="feedback-form-title" className="text-title md:text-display font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              We'd Love Your Feedback
            </h1>
            <p className="text-large text-white/80">
              Help us improve ToolHubX by sharing your thoughts, reporting issues, or asking questions.
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="glass-card" role="form" aria-labelledby="feedback-form-title">
            <div className="glass-card-inner space-y-6">
              {/* Error Message */}
              {error && (
                <div role="alert" aria-live="polite" className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-small font-medium text-white mb-2">
                  Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 glass border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-small font-medium text-white mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 glass border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <p className="text-caption text-white/90 mt-1">
                  Only used if we need to follow up
                </p>
              </div>

              {/* Feedback Type */}
              <div>
                <label htmlFor="feedbackType" className="block text-small font-medium text-white mb-2">
                  Feedback Type
                </label>
                <select
                  id="feedbackType"
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  {feedbackTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-small font-medium text-white mb-2">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  rows={6}
                  placeholder="Share your thoughts, describe an issue, or ask a question..."
                  className="w-full px-4 py-3 glass border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                />
                <p className="text-caption text-white/90 mt-1">
                  The more detail you provide, the better we can help!
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim()}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={isSubmitting ? null : <Send className="h-5 w-5" />}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Feedback'
                  )}
                </Button>
                <p className="text-center text-caption text-white/90 mt-3">
                  Your feedback helps us build a better tax calculator 🇬🇧
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
