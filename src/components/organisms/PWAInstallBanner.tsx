'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const DISMISS_KEY = 'pwa-install-banner-dismissed-at';
const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

function wasDismissedRecently(): boolean {
  const stored = safeGetItem(DISMISS_KEY);
  if (!stored) return false;
  const timestamp = Number(stored);
  return Number.isFinite(timestamp) && Date.now() - timestamp < DISMISS_WINDOW_MS;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplayMode() || wasDismissedRecently()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const dismissBanner = () => {
    safeSetItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'dismissed') {
        safeSetItem(DISMISS_KEY, String(Date.now()));
      }
    } finally {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (!(visible && deferredPrompt)) return null;

  return (
    <div className='fixed top-24 right-4 left-4 z-40 sm:left-auto'>
      <Card className='w-full max-w-sm border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl'>
        <CardContent className='p-4'>
          <h2 className='font-semibold text-foreground text-sm'>Install PayeTax</h2>
          <p className='mt-1 text-muted-foreground text-sm'>
            Add PayeTax to your home screen for faster access and better offline support.
          </p>
          <a
            href='/install'
            className='mt-2 inline-block text-primary text-xs underline underline-offset-2 hover:text-primary/80'
          >
            Manual install instructions
          </a>
        </CardContent>
        <CardFooter className='flex items-center justify-end gap-2 px-4 pt-0 pb-4'>
          <Button type='button' variant='outline' size='sm' onClick={dismissBanner}>
            Not now
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleInstallClick}
            className='bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end hover:from-brand-gradient-start/90 hover:to-brand-gradient-end/90'
          >
            Install app
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
