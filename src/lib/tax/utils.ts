/**
 * Shared tax calculation utilities.
 */

/**
 * Round monetary values to the nearest penny.
 */
export function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}
