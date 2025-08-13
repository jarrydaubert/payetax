// src/lib/debounce.ts
/**
 * Utility module providing debounce functionality for optimizing event handlers
 * and preventing excessive function calls, especially during user input.
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last time it was invoked.
 * Useful for limiting function calls on frequently firing events like resize or input.
 *
 * @template Args - Array type representing the arguments of the function
 * @template ReturnType - The return type of the original function
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function that delays execution
 *
 * @example
 * // Debounce an input handler to limit API calls
 * const debouncedSearch = debounce((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 *
 * // Use in an input handler
 * inputElement.addEventListener('input', (e) => {
 *   debouncedSearch(e.target.value);
 * });
 */
export function debounce<Args extends unknown[], ReturnType>(
  func: (...args: Args) => ReturnType,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Args): void => {
    // Clear previous timeout if it exists
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default debounce;
