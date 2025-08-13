// src/app/feedback/FeedbackForm.tsx
'use client';

import { Send, MessageSquare, User, Mail, Tag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

// Define types for form data
interface FeedbackFormData {
  name: string;
  email: string;
  feedbackType: 'suggestion' | 'issue' | 'question' | 'other';
  message: string;
}

/**
 * Cutting-edge feedback form with spacious, modern design and micro-interactions
 */
const FeedbackForm = () => {
  // Form data state
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    feedbackType: 'suggestion',
    message: '',
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Handle field changes with micro-interaction state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.message.trim()) {
      setError('Please share your thoughts with us');
      return;
    }

    // Start submission
    setIsSubmitting(true);
    setError(null);

    try {
      // Send form data to API route for logging
      const res = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // Check response status
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send feedback');
      }

      // Success! Show confirmation to user
      setSubmitted(true);

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        feedbackType: 'suggestion',
        message: '',
      });
    } catch (err: unknown) {
      let errorMessage = 'Something went wrong. Please try again or email us directly.';

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another response
  const handleReset = () => {
    setSubmitted(false);
  };

  // Success state with celebration design
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5">
          <div className="glass-card-inner text-center py-16 px-8">
            {/* Celebration animation container */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              {/* Sparkle effects */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-green-500 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-emerald-500 animate-pulse delay-300" />
            </div>

            <h3 className="text-3xl font-bold text-foreground mb-4">
              Thank You! 🎉
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Your feedback has been received and will help us make ToolHubX even better. 
              We truly appreciate you taking the time to share your thoughts.
            </p>
            <Button 
              onClick={handleReset} 
              variant="primary" 
              size="lg"
              className="px-8 py-4 text-lg font-medium"
            >
              Share More Feedback
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main form with cutting-edge spacious design
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header section with breathing room */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 mb-6">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-6">Share Your Feedback</h2>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
          Help us improve ToolHubX by sharing your thoughts, reporting issues, or asking questions. 
          Your input directly shapes our development roadmap.
        </p>
      </div>

      {/* Error message with proper spacing */}
      {error && (
        <div className="mb-12">
          <Alert variant="error" className="max-w-2xl mx-auto">
            {error}
          </Alert>
        </div>
      )}

      {/* Main form container */}
      <div className="glass-card">
        <div className="glass-card-inner p-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Contact section */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Contact Info</h3>
                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Optional</span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Name field */}
                <div className="space-y-3">
                  <label
                    htmlFor="name"
                    className="block text-base font-medium text-foreground"
                  >
                    Your Name
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your name"
                      className="w-full px-6 py-4 bg-background/30 backdrop-blur-sm border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-lg placeholder:text-muted-foreground/60"
                    />
                    {focusedField === 'name' && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20 pointer-events-none animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-2">
                    We'll credit you for suggestions if you'd like
                  </p>
                </div>

                {/* Email field */}
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-foreground"
                  >
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your.email@example.com"
                      className="w-full px-6 py-4 bg-background/30 backdrop-blur-sm border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-lg placeholder:text-muted-foreground/60"
                    />
                    {focusedField === 'email' && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20 pointer-events-none animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-2">
                    Only used if we need to follow up
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Type Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Feedback Type</h3>
              </div>

              <div className={`relative transition-all duration-300 ${focusedField === 'feedbackType' ? 'scale-[1.02]' : ''}`}>
                <select
                  id="feedbackType"
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('feedbackType')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-6 py-4 bg-background/30 backdrop-blur-sm border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-lg appearance-none cursor-pointer"
                >
                  <option value="suggestion">💡 Suggestion - I have an idea to improve ToolHubX</option>
                  <option value="issue">🐛 Issue Report - Something isn't working correctly</option>
                  <option value="question">❓ Question - I need help or clarification</option>
                  <option value="other">💬 Other - Something else I'd like to discuss</option>
                </select>
                {focusedField === 'feedbackType' && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20 pointer-events-none animate-pulse" />
                )}
                {/* Custom dropdown arrow */}
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Your Message</h3>
                <span className="text-sm text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Required</span>
              </div>

              <div className={`relative transition-all duration-300 ${focusedField === 'message' ? 'scale-[1.01]' : ''}`}>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  rows={8}
                  placeholder="Share your thoughts, describe an issue, or ask a question. The more detail you provide, the better we can help!"
                  className="w-full px-6 py-6 bg-background/30 backdrop-blur-sm border border-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 text-lg placeholder:text-muted-foreground/60 resize-none"
                />
                {focusedField === 'message' && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20 pointer-events-none animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground pl-2">
                Include as much context as possible - screenshots, steps to reproduce issues, or detailed suggestions help us understand better
              </p>
            </div>

            {/* Submit Section */}
            <div className="pt-8 border-t border-border/50">
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.message.trim()}
                  variant="primary"
                  size="lg"
                  className="px-12 py-5 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  leftIcon={isSubmitting ? null : <Send className="h-5 w-5" />}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                      <span>Sending your feedback...</span>
                    </div>
                  ) : (
                    'Send Feedback'
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6 max-w-lg mx-auto">
                Your feedback is valuable and helps us build a better tax calculator for everyone in the UK 🇬🇧
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
