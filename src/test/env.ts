/**
 * Test-only helper for overriding NODE_ENV.
 *
 * TypeScript types NODE_ENV as readonly (Next.js narrows it), so direct
 * assignment fails typechecking. Tests that exercise production/development
 * branches should use this instead.
 */
export function setNodeEnv(value: string | undefined): void {
  if (value === undefined) {
    // biome-ignore lint/performance/noDelete: assigning undefined to process.env stores the string "undefined"; delete is the only correct removal.
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
    return;
  }

  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}
