// src/components/ui/PWAInstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import Button from './Button';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Don't show again for a week after dismissal
      if (dismissedDate > weekAgo) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(beforeInstallPromptEvent);
      
      // Show prompt after a delay (don't be too eager)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds after page load
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        onInstall?.();
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="glass border border-white/20 rounded-lg overflow-hidden">
        <div className="p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
            <Smartphone className="h-6 w-6 text-blue-400" />
          </div>

          {/* Content */}
          <h3 className="font-semibold text-white mb-2">
            Install ToolHubX
          </h3>
          <p className="text-small text-white/80 mb-4 leading-relaxed">
            Get quick access to your UK tax calculator. Works offline and loads faster than the website.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
            >
              Not now
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white/5 border-t border-white/10 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>✓ Works offline</div>
            <div>✓ Faster loading</div>
            <div>✓ Home screen access</div>
            <div>✓ No app store needed</div>
          </div>
        </div>
      </div>
    </div>
  );
}