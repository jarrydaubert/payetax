// src/components/ui/PWAInstallPrompt.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, Smartphone, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader } from './card';

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
      }, 3000); // 3 seconds after page load for testing
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

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='-translate-x-1/2 fixed bottom-4 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md'
        >
          <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/90 shadow-2xl backdrop-blur-xl'>
            {/* Animated gradient background */}
            <motion.div
              className='absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10'
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />

            {/* Close button */}
            <motion.button
              type='button'
              onClick={handleDismiss}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className='absolute top-3 right-3 z-10 rounded-full bg-background/50 p-1.5 text-foreground/60 transition-colors hover:bg-background/80 hover:text-foreground'
              aria-label='Dismiss install prompt'
            >
              <X className='h-4 w-4' />
            </motion.button>

            <CardHeader className='relative pb-3'>
              <div className='flex items-start gap-3'>
                {/* Icon with animation */}
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                  className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/30 to-blue-500/20'
                >
                  <Smartphone className='h-6 w-6 text-primary' />
                </motion.div>

                <div className='flex-1'>
                  <h3 className='mb-1 flex items-center gap-2 font-bold text-foreground text-lg'>
                    Install PayeTax
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkles className='h-4 w-4 text-yellow-400' />
                    </motion.span>
                  </h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    Get quick access to your UK tax calculator. Works offline and loads faster than
                    the website.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='relative pb-3'>
              {/* Benefits grid */}
              <div className='grid grid-cols-2 gap-2 text-xs'>
                {[
                  { icon: '⚡', text: 'Lightning fast' },
                  { icon: '📱', text: 'Home screen' },
                  { icon: '🔒', text: 'Works offline' },
                  { icon: '✨', text: 'No app store' },
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.2 }}
                    className='flex items-center gap-1.5 rounded-lg bg-primary/5 px-2 py-1.5'
                  >
                    <span className='text-base'>{benefit.icon}</span>
                    <span className='font-medium text-foreground/80'>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>

            <CardFooter className='relative flex gap-2 pt-0'>
              <Button
                onClick={handleDismiss}
                variant='ghost'
                size='sm'
                className='flex-1 hover:bg-background/50'
              >
                Not now
              </Button>
              <Button
                onClick={handleInstall}
                variant='default'
                size='sm'
                className='group relative flex-1 overflow-hidden'
              >
                <motion.span
                  className='absolute inset-0 bg-gradient-to-r from-primary to-blue-500'
                  whileHover={{ scale: 1.05 }}
                />
                <span className='relative flex items-center justify-center gap-1.5'>
                  <Download className='h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5' />
                  Install
                </span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
