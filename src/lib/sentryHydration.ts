/** Hydration diagnostics may embed rendered text or React decoder arguments. */
export function getSafeHydrationMessage(message: string): string | undefined {
  const code = /^Minified React error #(418|423)\b/.exec(message)?.[1];
  if (code) return `React hydration failed (${code})`;
  if (/^Hydration failed\b/.test(message)) return 'Hydration failed';
  if (/^There was an error while hydrating\b/.test(message))
    return 'There was an error while hydrating';
  if (/^Text content does not match server-rendered HTML\b/.test(message))
    return 'Text content does not match server-rendered HTML';
  return undefined;
}
