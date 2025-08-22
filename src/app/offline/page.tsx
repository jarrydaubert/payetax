// src/app/offline/page.tsx
/**
 * Offline fallback page for PWA
 * Shows when user is offline and page isn't cached
 */

'use client';

import Link from 'next/link';
import { Wifi, Calculator, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OfflinePage() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <div className="glass-card">
          <div className="glass-card-inner py-16">
            {/* Offline Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <Wifi className="h-10 w-10 text-amber-400" />
            </div>

            {/* Title */}
            <h1 className="text-heading font-bold mb-4 text-white">
              You're Offline
            </h1>

            {/* Description */}
            <p className="text-large text-white/80 mb-8 leading-relaxed">
              It looks like you're not connected to the internet. Don't worry - ToolHubX works offline too! 
              Your previous calculations are still available.
            </p>

            {/* Features Available Offline */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
              <h2 className="text-subheading font-semibold text-white mb-4">
                Available Offline:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">Tax calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">Cached tax rates</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">Previous results</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/90">Saved calculations</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={() => window.history.back()}
                variant="primary"
                size="lg"
                leftIcon={<ArrowLeft className="h-5 w-5" />}
              >
                Go Back
              </Button>
              
              <div>
                <Link 
                  href="/"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Try Calculator Anyway
                </Link>
              </div>
            </div>

            {/* Connection Status */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-small text-blue-300">
                💡 <strong>Tip:</strong> When you're back online, ToolHubX will automatically sync and show the latest tax rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}