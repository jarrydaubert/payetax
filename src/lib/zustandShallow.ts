import * as reactShallowModule from 'zustand/react/shallow';
import { useShallow as useShallowFallback } from 'zustand/shallow';

type UseShallowHook = typeof useShallowFallback;
type ReactShallowModule = {
  useShallow?: UseShallowHook;
};

const reactUseShallow = (reactShallowModule as ReactShallowModule).useShallow;

/**
 * Runtime-safe useShallow export for environments where module interop may
 * resolve `zustand/react/shallow` unexpectedly.
 */
export const useShallow: UseShallowHook =
  typeof reactUseShallow === 'function' ? reactUseShallow : useShallowFallback;
