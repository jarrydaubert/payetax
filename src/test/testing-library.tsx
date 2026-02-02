import type { ReactElement, ReactNode } from 'react';
import {
  cleanup,
  render as rtlRender,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react/pure';

import { TooltipProvider } from '@/components/ui/tooltip';

// NOTE: Radix Tooltip (and our wrapper components) require a TooltipProvider in context.
// Many components assume the app/layout provides it, so tests should provide it too.
function AllTheProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

// @testing-library/react auto-registers cleanup; the /pure entry does not.
if (typeof afterEach === 'function') {
  afterEach(() => cleanup());
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react/pure';
export { render };
