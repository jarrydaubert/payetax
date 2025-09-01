// src/components/ui/PWAInstallPrompt.tsx
'use client';

import { Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    <div className='fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:max-w-sm'>
      <div className='glass-card overflow-hidden border border-white/20 p-0'>
        <div className='p-4'>
          {/* Close button */}
          <button
            type='button'
            onClick={handleDismiss}
            className='absolute top-2 right-2 p-1 text-white/60 transition-colors hover:text-white'
            aria-label='Dismiss install prompt'
          >
            <X className='h-4 w-4' />
          </button>

          {/* Icon */}
          <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20'>
            <Smartphone className='h-6 w-6 text-blue-400' />
          </div>

          {/* Content */}
          <h3 className='mb-2 font-semibold text-white'>Install ToolHubX</h3>
          <p className='mb-4 text-small text-white/80 leading-relaxed'>
            Get quick access to your UK tax calculator. Works offline and loads faster than the
            website.
          </p>

          {/* Actions */}
          <div className='flex gap-2'>
            <Button
              onClick={handleInstall}
              variant='primary'
              size='sm'
              leftIcon={<Download className='h-4 w-4' />}
            >
              Install
            </Button>
            <Button onClick={handleDismiss} variant='ghost' size='sm'>
              Not now
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className='border-white/10 border-t bg-white/5 p-3'>
          <div className='grid grid-cols-2 gap-2 text-white/70 text-xs'>
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
