/**
 * Commit the calculator field being edited before an action calculates.
 *
 * Amount fields commit on blur. A pointer click normally moves focus (and so commits the field)
 * before the action runs, but not every activation does (a click that keeps focus, or assistive
 * technology activating a control directly). Blurring commits synchronously, so after this call
 * the store holds what the field shows: a committed amount, or rejected text that blocks
 * calculation.
 *
 * @module components/organisms/CalculatorInputs/commitFocusedField
 */
export function commitFocusedField(container: HTMLElement | null): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement && container?.contains(active)) {
    active.blur();
  }
}
