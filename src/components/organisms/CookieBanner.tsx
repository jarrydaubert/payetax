'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { ConsentPreferences } from '@/lib/cookieUtils';
import {
  CONSENT_STORAGE_KEY,
  clearCookieConsent,
  getConsentPreferences,
  isConsentExpired,
  setConsentPreferences,
} from '@/lib/cookieUtils';

const CONSENT_UPDATED_EVENT = 'cookieConsentUpdated';
const OPEN_PREFERENCES_EVENT = 'openCookiePreferences';

function notifyConsentUpdated(preferences: ConsentPreferences): void {
  document.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: preferences }));
}

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(false);

  const loadCurrentPreferences = useCallback((): ConsentPreferences | null => {
    const consent = getConsentPreferences();
    setAnalyticsDraft(consent?.analytics ?? false);
    return consent;
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const initialize = () => {
      try {
        const expired = isConsentExpired();
        if (expired) {
          clearCookieConsent();
        }

        const existing = loadCurrentPreferences();
        const hasDecision = Boolean(existing);

        if (hasDecision) {
          setShowBanner(false);
          return;
        }

        timer = setTimeout(() => setShowBanner(true), 500);
      } catch {
        timer = setTimeout(() => setShowBanner(true), 500);
      }
    };

    const handleOpenPreferences = () => {
      loadCurrentPreferences();
      setShowBanner(false);
      setModalOpen(true);
    };

    // Keep the visible banner in sync with decisions made in other tabs:
    // a stored decision elsewhere dismisses this tab's banner/modal, and a
    // cleared decision (e.g. expiry) re-prompts here too.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return;

      const preferences = getConsentPreferences();
      setModalOpen(false);
      if (preferences) {
        setAnalyticsDraft(preferences.analytics);
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    };

    initialize();
    document.addEventListener(OPEN_PREFERENCES_EVENT, handleOpenPreferences);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener(OPEN_PREFERENCES_EVENT, handleOpenPreferences);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadCurrentPreferences]);

  const applyPreferences = useCallback((preferences: ConsentPreferences) => {
    setConsentPreferences(preferences);
    setAnalyticsDraft(preferences.analytics);
    setModalOpen(false);
    setShowBanner(false);
    notifyConsentUpdated(preferences);
  }, []);

  const handleAcceptAll = useCallback(() => {
    applyPreferences({ analytics: true });
  }, [applyPreferences]);

  const handleRejectAll = useCallback(() => {
    applyPreferences({ analytics: false });
  }, [applyPreferences]);

  const handleSavePreferences = useCallback(() => {
    applyPreferences({ analytics: analyticsDraft });
  }, [analyticsDraft, applyPreferences]);

  const handleManageFromBanner = useCallback(() => {
    loadCurrentPreferences();
    setShowBanner(false);
    setModalOpen(true);
  }, [loadCurrentPreferences]);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!(open || getConsentPreferences())) {
      setShowBanner(true);
    }
  }, []);

  return (
    <>
      {showBanner && (
        <aside
          aria-label='Cookie preferences'
          data-testid='cookie-banner'
          className='safe-bottom fixed right-4 bottom-4 left-4 z-40 sm:right-auto sm:w-[24rem]'
        >
          <Card className='border-border bg-card'>
            <CardContent className='p-4'>
              <div className='mb-3 flex items-start gap-3'>
                <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12'>
                  <Cookie className='size-4 text-primary' aria-hidden='true' />
                </div>
                <div className='min-w-0'>
                  <h2 className='font-semibold text-foreground text-sm'>Cookie Preferences</h2>
                  <p className='mt-1 text-muted-foreground text-xs leading-relaxed'>
                    We use analytics cookies to improve PayeTax. Essential storage for your consent
                    choice is always active. Read our{' '}
                    <Link
                      href='/privacy'
                      className='font-medium text-primary underline-offset-2 hover:underline'
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2 px-4 pt-0 pb-4'>
              <div className='grid w-full grid-cols-2 gap-2'>
                <Button
                  onClick={handleRejectAll}
                  variant='outline'
                  size='touch'
                  className='w-full'
                  data-testid='cookie-reject-all'
                >
                  Essential Only
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant='default'
                  size='touch'
                  className='w-full'
                  data-testid='cookie-accept-all'
                >
                  Accept All
                </Button>
              </div>
              <Button
                onClick={handleManageFromBanner}
                variant='ghost'
                size='sm'
                className='min-h-6 px-2 py-1 text-xs'
                data-testid='cookie-manage-preferences'
              >
                Manage Preferences
              </Button>
            </CardFooter>
          </Card>
        </aside>
      )}

      <Dialog open={modalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Privacy Overview</DialogTitle>
            <DialogDescription>
              Choose which non-essential cookies you allow. Necessary storage remains always on.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <section className='rounded-lg border border-border/70 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h3 className='font-semibold text-foreground text-sm'>Necessary</h3>
                  <p className='mt-1 text-muted-foreground text-sm'>
                    Required for core site operation and remembering your consent choice.
                  </p>
                </div>
                <span className='rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground text-xs'>
                  Always on
                </span>
              </div>
            </section>

            <section className='rounded-lg border border-border/70 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h3 className='font-semibold text-foreground text-sm'>Analytics</h3>
                  <p className='mt-1 text-muted-foreground text-sm'>
                    Helps us understand usage and improve journeys. Disabled by default until you
                    opt in.
                  </p>
                </div>
                <Switch
                  checked={analyticsDraft}
                  onCheckedChange={setAnalyticsDraft}
                  aria-label='Enable analytics cookies'
                />
              </div>
            </section>
          </div>

          <DialogFooter className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:space-x-0'>
            <Button
              type='button'
              variant='outline'
              size='touch'
              onClick={handleRejectAll}
              data-testid='cookie-modal-reject-all'
            >
              Reject All
            </Button>
            <Button
              type='button'
              variant='outline'
              size='touch'
              onClick={handleSavePreferences}
              data-testid='cookie-modal-save'
            >
              Save Preferences
            </Button>
            <Button
              type='button'
              variant='default'
              size='touch'
              onClick={handleAcceptAll}
              data-testid='cookie-modal-accept-all'
            >
              Accept All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieBanner;
