import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PWAInstallBanner from '../PWAInstallBanner';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

type InstallPromptEventMock = Event & {
  prompt: jest.Mock<Promise<void>, []>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function dispatchInstallPromptEvent(
  outcome: 'accepted' | 'dismissed' = 'accepted',
): InstallPromptEventMock {
  const event = new Event('beforeinstallprompt') as InstallPromptEventMock;
  event.prompt = jest.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: 'web' });
  window.dispatchEvent(event);
  return event;
}

describe('PWAInstallBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing before install prompt event fires', () => {
    render(<PWAInstallBanner />);
    expect(screen.queryByText('Install PayeTax')).not.toBeInTheDocument();
  });

  it('renders banner and manual instructions link after prompt event', async () => {
    render(<PWAInstallBanner />);
    dispatchInstallPromptEvent('accepted');

    expect(await screen.findByText('Install PayeTax')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Manual install instructions/i })).toHaveAttribute(
      'href',
      '/install',
    );
  });

  it('prompts install and closes banner when install is accepted', async () => {
    render(<PWAInstallBanner />);
    const installEvent = dispatchInstallPromptEvent('accepted');

    const installButton = await screen.findByRole('button', { name: /Install app/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(installEvent.prompt).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Install PayeTax')).not.toBeInTheDocument();
    });
  });

  it('stores dismissal timestamp when user clicks not now', async () => {
    render(<PWAInstallBanner />);
    dispatchInstallPromptEvent('accepted');

    const dismissButton = await screen.findByRole('button', { name: /Not now/i });
    fireEvent.click(dismissButton);

    expect(localStorage.getItem('pwa-install-banner-dismissed-at')).toBeTruthy();
  });

  it('does not reopen when the browser fires another prompt event after dismissal', async () => {
    render(<PWAInstallBanner />);
    dispatchInstallPromptEvent('accepted');

    const dismissButton = await screen.findByRole('button', { name: /Not now/i });
    fireEvent.click(dismissButton);
    dispatchInstallPromptEvent('accepted');

    expect(screen.queryByText('Install PayeTax')).not.toBeInTheDocument();
  });
});
