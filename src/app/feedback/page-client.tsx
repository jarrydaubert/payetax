// src/app/feedback/page-client.tsx
'use client';

import { MessageSquare, Mail, Shield, Clock, Sparkles, Heart, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import Alert from '@/components/ui/Alert';

// Dynamically import the FeedbackForm to prevent server/client mismatch
const FeedbackForm = dynamic(() => import('./FeedbackForm'), {
  ssr: false,
  loading: () => (
    <div className="max-w-5xl mx-auto">
      <div className="glass-card">
        <div className="glass-card-inner p-12">
          <div className="h-96 bg-background/20 animate-pulse rounded-2xl" />
        </div>
      </div>
    </div>
  ),
});

/**
 * Cutting-edge feedback page with spacious, modern design and enhanced desktop layout
 */
export default function FeedbackPageClient() {
  return (
    <div className="relative min-h-screen">
      {/* Enhanced aurora gradient background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/25 to-pink-500/30 animate-gradient-slow" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/20 via-transparent to-emerald-500/20 animate-gradient-slow delay-1000" />
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-0" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-500/40 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-500/30 rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl relative z-10">
        {/* Hero Header with breathing room */}
        <div className="text-center mb-20 pt-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-pink-500 animate-pulse delay-300" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            We'd Love Your Feedback
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Help us make ToolHubX better by sharing your thoughts, reporting issues, or asking questions.
            <br className="hidden sm:block" />
            <span className="text-primary font-medium">Your input shapes our development.</span>
          </p>
          
          <div className="flex justify-center">
            <a
              href="/"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors duration-300 text-lg group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Calculator
            </a>
          </div>
        </div>

        {/* Main feedback form with generous spacing */}
        <div className="mb-24">
          <FeedbackForm />
        </div>

        {/* Information cards with enhanced spacing and design */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">More Ways to Connect</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the method that works best for you
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Direct Contact Card */}
            <div className="glass-card group hover:scale-105 transition-transform duration-300">
              <div className="glass-card-inner p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Direct Email</h3>
                <p className="text-muted-foreground mb-6">
                  For urgent inquiries or detailed technical discussions
                </p>
                <a
                  href="mailto:support@toolhubx.uk"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors duration-200 bg-primary/10 px-6 py-3 rounded-full hover:bg-primary/20"
                >
                  support@toolhubx.uk
                </a>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="glass-card group hover:scale-105 transition-transform duration-300">
              <div className="glass-card-inner p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Fast Response</h3>
                <p className="text-muted-foreground mb-6">
                  We typically respond within 24 hours during weekdays
                </p>
                <div className="inline-flex items-center text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-6 py-3 rounded-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Usually much faster!
                </div>
              </div>
            </div>

            {/* Privacy Card */}
            <div className="glass-card group hover:scale-105 transition-transform duration-300">
              <div className="glass-card-inner p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Privacy First</h3>
                <p className="text-muted-foreground mb-6">
                  Anonymous feedback unless you provide contact details
                </p>
                <div className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium bg-purple-500/10 px-6 py-3 rounded-full">
                  Always secure & private
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced privacy notice */}
        <div className="mb-16">
          <Alert 
            variant="info" 
            title="Your Privacy Matters" 
            className="max-w-4xl mx-auto border border-primary/20 bg-primary/5"
          >
            <div className="text-base leading-relaxed">
              <p className="mb-3">
                Your feedback is incredibly valuable to us and helps shape the future of ToolHubX. 
                Here's how we handle your information:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span>All feedback is stored securely and treated confidentially</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span>We never share feedback data with third parties</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span>Contact details are only used for follow-up if needed</span>
                </li>
              </ul>
              <p className="mt-4">
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Learn more about our privacy practices →
                </a>
              </p>
            </div>
          </Alert>
        </div>

        {/* Call-to-action footer with personality */}
        <div className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary/60 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-purple-500/60 rounded-full animate-pulse delay-200" />
                <div className="w-3 h-3 bg-pink-500/60 rounded-full animate-pulse delay-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Built by Developers, For Everyone
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ToolHubX is crafted by passionate developers who care deeply about creating the most 
              accurate and user-friendly UK tax calculator. Every piece of feedback is read, 
              considered, and often implemented in future updates.
            </p>
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Made with care in the UK</span>
                <span className="text-2xl">🇬🇧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
