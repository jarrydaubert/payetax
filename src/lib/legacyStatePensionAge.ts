/**
 * Compatibility for calculator input saved or sent before JGF-21.
 *
 * Earlier releases stored a representative `age` (67 when the user chose
 * "State Pension Age or over", otherwise nothing) and exempted employee NI at
 * age 66 or over. Calculations now use the explicit `reachedStatePensionAge`
 * declaration; this maps a legacy value to exactly what it previously meant.
 * It is used only at storage and API boundaries, never by the tax engine.
 */
const LEGACY_EXEMPT_FROM_AGE = 66;

export function reachedStatePensionAgeFromLegacyAge(age: number | undefined): boolean {
  return age !== undefined && age >= LEGACY_EXEMPT_FROM_AGE;
}
