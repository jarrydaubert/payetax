import { act, render, screen } from '@/test/testing-library';

import { DeferredContent } from '../DeferredContent';

describe('DeferredContent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    window.location.hash = '';
  });

  it('renders fallback then children after timeout', () => {
    render(
      <DeferredContent fallback={<div>Loading...</div>} timeout={100}>
        <div>Loaded!</div>
      </DeferredContent>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByText('Loaded!')).toBeInTheDocument();
  });

  it('renders immediately when hash matches', () => {
    window.location.hash = '#target';

    render(
      <DeferredContent fallback={<div>Loading...</div>} forceRenderOnHash='#target' timeout={1000}>
        <div>Anchored content</div>
      </DeferredContent>,
    );

    expect(screen.getByText('Anchored content')).toBeInTheDocument();
  });
});
