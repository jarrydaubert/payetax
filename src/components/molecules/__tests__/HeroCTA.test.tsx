import { act, fireEvent, render, screen } from '@/test/testing-library';

import { HeroCTA } from '../HeroCTA';

const trackEvent = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

describe('HeroCTA', () => {
  afterEach(() => {
    trackEvent.mockReset();
  });

  it('tracks CTA clicks', () => {
    render(
      <HeroCTA href='/calculator' trackingLabel='hero-cta'>
        Calculate Now
      </HeroCTA>,
    );

    fireEvent.click(screen.getByRole('link', { name: /Calculate Now/i }));

    expect(trackEvent).toHaveBeenCalledWith({
      action: 'cta_clicked',
      category: 'engagement',
      label: 'hero-cta',
    });
  });

  it('handles anchor links with smooth scroll behavior', () => {
    jest.useFakeTimers();

    const target = document.createElement('div');
    target.id = 'section';
    target.scrollIntoView = jest.fn();
    document.body.appendChild(target);

    render(
      <HeroCTA href='#section' trackingLabel='anchor-cta'>
        Go to section
      </HeroCTA>,
    );

    fireEvent.click(screen.getByRole('link', { name: /Go to section/i }));
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    document.body.removeChild(target);
    jest.useRealTimers();
  });

  it('falls back to scroll + retry when target is missing', () => {
    jest.useFakeTimers();

    render(
      <HeroCTA href='#missing' trackingLabel='missing-cta'>
        Missing section
      </HeroCTA>,
    );

    fireEvent.click(screen.getByRole('link', { name: /Missing section/i }));

    expect(window.scrollTo).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    jest.useRealTimers();
  });
});
