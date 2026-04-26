import { afterEach } from '@jest/globals';
import {
  cleanup,
  type RenderOptions,
  type RenderResult,
  render as rtlRender,
} from '@testing-library/react/pure';
import type { ReactElement, ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

// NOTE: Radix Tooltip (and our wrapper components) require a TooltipProvider in context.
// Many components assume the app/layout provides it, so tests should provide it too.
function AllTheProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

// @testing-library/react auto-registers cleanup; the /pure entry does not.
afterEach(() => cleanup());

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react/pure';
export { render };
