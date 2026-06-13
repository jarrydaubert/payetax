/**
 * Retained-surface Sentry error monitoring utilities
 *
 * Centralized Sentry utilities for calculator, tool, blog, and email-results failures.
 *
 * Features:
 * - Type-safe error tracking with custom contexts
 * - Breadcrumb management for debugging
 * - User context management
 * - Custom fingerprinting for better error grouping
 * - Calculator-specific error tracking
 */

import type { SeverityLevel, User } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';

type ZodIssueLike = {
  message: string;
  code?: string;
  path?: (string | number)[];
  expected?: unknown;
  received?: unknown;
};

interface ZodErrorLike {
  issues: ZodIssueLike[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isZodIssueLike(value: unknown): value is ZodIssueLike {
  return isRecord(value) && typeof value.message === 'string';
}

function isZodErrorLike(error: unknown): error is ZodErrorLike {
  return isRecord(error) && Array.isArray(error.issues) && error.issues.every(isZodIssueLike);
}

function describeSentryValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `array:${value.length}`;
  if (typeof value === 'object') return `object:${Object.keys(value).length}`;
  if (typeof value === 'string') return value.length > 0 ? 'string:present' : 'string:empty';
  if (typeof value === 'number') return Number.isFinite(value) ? 'number:finite' : 'number:invalid';
  return typeof value;
}

/**
 * Error Severity Levels
 * Maps to Sentry severity levels for consistent error classification
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Custom context types for different error scenarios
 */
export interface CalculatorErrorContext {
  /** Salary amount being calculated */
  salary: number;
  /** Tax year being used */
  taxYear: string;
  /** Tax region (England, Scotland, Wales) */
  region: string;
  /** Tax code if provided */
  taxCode?: string;
  /** Student loan plans if applicable */
  studentLoanPlans?: string | string[];
  /** Pension contribution amount */
  pensionContribution?: number;
  /** Whether married/civil partnership */
  isMarried?: boolean;
}

export interface ValidationErrorContext {
  /** Field that failed validation */
  field: string;
  /** Validation error message */
  errorMessage: string;
  /** Attempted value */
  attemptedValue: unknown;
  /** Component or module where validation occurred */
  location: string;
  /** Full Zod error object (optional, for detailed debugging) */
  zodError?: unknown;
  /** Expected value or format (optional) */
  expectedFormat?: string;
}

export interface APIErrorContext {
  /** API endpoint that failed */
  endpoint: string;
  /** HTTP method */
  method: string;
  /** HTTP status code */
  statusCode?: number;
  /** Response body if available */
  responseBody?: unknown;
  /** Request parameters */
  requestParams?: Record<string, unknown>;
}

export interface OperationalFailureContext {
  /** High-level operation that failed */
  operation: 'send-results' | 'send-director-results';
  /** Public API route where the failure happened */
  route: '/api/send-results' | '/api/send-director-results';
  /** Safe operational reason, without user payload details */
  reason:
    | 'rate_limit_distributed_unavailable'
    | 'email_not_configured'
    | 'email_delivery_failed'
    | 'email_unexpected_error';
  /** HTTP response code returned to the caller */
  statusCode: 500 | 503;
}

export interface PerformanceContext {
  /** Operation being measured */
  operation: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Size of data being processed */
  dataSize?: number;
  /** Whether operation completed successfully */
  success?: boolean;
}

/**
 * Capture handled operational failures that still affect users.
 *
 * Use this for server-side failures where the route intentionally returns a JSON
 * response instead of throwing. Do not include request payloads, email addresses,
 * salaries, tax codes, or other user-entered data in this context.
 */
export function captureOperationalFailure(
  context: OperationalFailureContext,
  severity: ErrorSeverity = 'error',
): string | undefined {
  return Sentry.captureMessage(`Operational failure: ${context.reason}`, {
    level: severity,
    tags: {
      error_type: 'operational_failure',
      operation: context.operation,
      route: context.route,
      reason: context.reason,
      status_code: String(context.statusCode),
    },
    contexts: {
      operationalFailure: {
        operation: context.operation,
        route: context.route,
        reason: context.reason,
        statusCode: context.statusCode,
      },
    },
    fingerprint: ['operational-failure', context.operation, context.reason],
  });
}

export async function captureOperationalFailureAndFlush(
  context: OperationalFailureContext,
  severity: ErrorSeverity = 'error',
  timeout = 2000,
): Promise<string | undefined> {
  const eventId = captureOperationalFailure(context, severity);
  await flushSentryEvents(timeout);
  return eventId;
}

/**
 * Capture an error with calculator-specific context
 * Use this for errors during tax calculations
 *
 * @example
 * ```typescript
 * try {
 *   const result = calculateTax(input);
 * } catch (error) {
 *   captureCalculatorError(error, {
 *     salary: 50000,
 *     taxYear: '2025-26',
 *     region: 'England',
 *     taxCode: '1257L'
 *   });
 * }
 * ```
 */
export function captureCalculatorError(
  error: unknown,
  context: CalculatorErrorContext,
  severity: ErrorSeverity = 'error',
): string | undefined {
  const level: SeverityLevel = severity;
  return Sentry.captureException(error, {
    level,
    tags: {
      error_type: 'calculator',
      tax_year: context.taxYear,
      region: context.region,
      has_student_loan:
        context.studentLoanPlans && context.studentLoanPlans !== 'none' ? 'yes' : 'no',
      has_pension: context.pensionContribution ? 'yes' : 'no',
      is_married: context.isMarried ? 'yes' : 'no',
    },
    contexts: {
      calculator: {
        taxYear: context.taxYear,
        region: context.region,
        salaryProvided: Number.isFinite(context.salary),
        taxCodeProvided: Boolean(context.taxCode),
        studentLoanPlans: context.studentLoanPlans || 'none',
        pensionContributionProvided: Boolean(context.pensionContribution),
        isMarried: Boolean(context.isMarried),
      },
    },
    fingerprint: ['calculator-error', context.taxYear, context.region],
  });
}

/**
 * Log a validation error as a breadcrumb (NOT as an exception)
 *
 * User input validation failures are expected behavior, not errors.
 * We log them as breadcrumbs so they provide context if a real error occurs later,
 * but we don't report them as exceptions to avoid noise in Sentry.
 *
 * @example
 * ```typescript
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   captureValidationError(result.error, {
 *     field: 'salary',
 *     errorMessage: result.error.message,
 *     attemptedValue: data.salary,
 *     location: 'CalculatorInputs'
 *   });
 * }
 * ```
 */
export function captureValidationError(
  error: unknown,
  context: ValidationErrorContext,
  _severity: ErrorSeverity = 'warning',
): string | undefined {
  // Extract detailed Zod error information if available
  const zodDetails = extractZodErrorDetails(error);

  // Log as breadcrumb instead of exception - validation errors are expected user behavior
  Sentry.addBreadcrumb({
    category: 'validation',
    message: `Validation failed for ${context.field}: ${context.errorMessage}`,
    level: 'warning',
    data: {
      field: context.field,
      location: context.location,
      attemptedValueShape: describeSentryValue(context.attemptedValue),
      expectedFormat: context.expectedFormat,
      errorCount: zodDetails.issueCount,
      errorCodes: zodDetails.errorCodes,
    },
  });

  // Return undefined since we're not capturing an exception
  return undefined;
}

/**
 * Extract detailed information from Zod errors for better debugging
 * @internal
 */
function extractZodErrorDetails(error: unknown): {
  issueCount: number;
  allIssues: string[];
  errorCodes: string[];
  paths: string[];
  validationType: string | null;
} {
  if (isZodErrorLike(error)) {
    const zodError = error;

    const allIssues = zodError.issues.map((issue, index) => {
      const pathStr = issue.path?.join('.') || 'root';
      let issueDetail = `[${index + 1}] ${pathStr}: ${issue.message}`;

      // Add type mismatch info if available
      if (issue.expected && issue.received) {
        issueDetail += ` (expected: ${String(issue.expected)}, got: ${String(issue.received)})`;
      }

      return issueDetail;
    });

    const errorCodes = zodError.issues
      .map((issue) => issue.code)
      .filter((code): code is string => code !== undefined);

    const paths = zodError.issues
      .map((issue) => issue.path?.join('.'))
      .filter((path): path is string => path !== undefined);

    // Determine validation type from first error code
    const validationType = errorCodes[0] || null;

    return {
      issueCount: zodError.issues.length,
      allIssues,
      errorCodes,
      paths,
      validationType,
    };
  }

  // Not a Zod error or no issues
  return {
    issueCount: 1,
    allIssues: [String(error)],
    errorCodes: [],
    paths: [],
    validationType: null,
  };
}

/**
 * Capture an API error with endpoint-specific context
 * Use this for failed API requests
 *
 * @example
 * ```typescript
 * try {
 *   const response = await fetch('/api/calculate');
 *   if (!response.ok) {
 *     throw new Error('API request failed');
 *   }
 * } catch (error) {
 *   captureAPIError(error, {
 *     endpoint: '/api/calculate',
 *     method: 'POST',
 *     statusCode: 500,
 *     requestParams: { salary: 50000 }
 *   });
 * }
 * ```
 */
export function captureAPIError(
  error: unknown,
  context: APIErrorContext,
  severity: ErrorSeverity = 'error',
): string | undefined {
  const level: SeverityLevel = severity;
  return Sentry.captureException(error, {
    level,
    tags: {
      error_type: 'api',
      endpoint: context.endpoint,
      method: context.method,
      status_code: context.statusCode?.toString() || 'unknown',
    },
    contexts: {
      api: {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
        responseBodyShape: describeSentryValue(context.responseBody),
        requestParamKeys: context.requestParams ? Object.keys(context.requestParams) : [],
      },
    },
    fingerprint: ['api-error', context.endpoint, context.method],
  });
}

/**
 * Capture a performance issue (slow operation, timeout, etc.)
 * Use this to track performance problems that don't throw errors
 *
 * @example
 * ```typescript
 * const start = performance.now();
 * const result = await heavyOperation();
 * const duration = performance.now() - start;
 *
 * if (duration > 1000) {
 *   capturePerformanceIssue('Slow calculation', {
 *     operation: 'calculateTax',
 *     duration,
 *     dataSize: input.length,
 *     success: true
 *   });
 * }
 * ```
 */
export function capturePerformanceIssue(
  message: string,
  context: PerformanceContext,
  severity: ErrorSeverity = 'warning',
): string | undefined {
  const level: SeverityLevel = severity;
  return Sentry.captureMessage(message, {
    level,
    tags: {
      issue_type: 'performance',
      operation: context.operation,
      success: context.success ? 'yes' : 'no',
    },
    contexts: {
      performance: {
        operation: context.operation,
        duration: context.duration,
        dataSize: context.dataSize,
      },
    },
    fingerprint: ['performance-issue', context.operation],
  });
}

/**
 * Start a performance transaction for monitoring
 * Returns an object with end() method to finish the span
 *
 * @example
 * ```typescript
 * const transaction = startPerformanceTransaction('calculate-tax', {
 *   salary: 50000,
 *   taxYear: '2025-26'
 * });
 *
 * try {
 *   const result = calculateTax(input);
 * } catch (error) {
 *   throw error;
 * } finally {
 *   transaction?.end();
 * }
 * ```
 */
export function startPerformanceTransaction(
  name: string,
  data?: Record<string, unknown>,
): { end: () => void } | undefined {
  // Add breadcrumb instead of transaction for simpler tracking
  addBreadcrumb('performance', {
    message: `Starting: ${name}`,
    level: 'info',
    data,
  });

  return {
    end: () => {
      addBreadcrumb('performance', {
        message: `Completed: ${name}`,
        level: 'info',
      });
    },
  };
}

/**
 * Start a performance span within a transaction
 * Simplified to use breadcrumbs for tracking
 *
 * @example
 * ```typescript
 * const span = startPerformanceSpan('validate-input');
 * // ... perform validation ...
 * span?.end();
 * ```
 */
export function startPerformanceSpan(
  operation: string,
  description?: string,
): { end: () => void } | undefined {
  addBreadcrumb('performance', {
    message: `Starting: ${description || operation}`,
    level: 'info',
  });

  return {
    end: () => {
      addBreadcrumb('performance', {
        message: `Completed: ${description || operation}`,
        level: 'info',
      });
    },
  };
}

/**
 * Add a breadcrumb for debugging
 * Breadcrumbs appear in error reports to show what led to the error
 *
 * @example
 * ```typescript
 * addBreadcrumb('user-action', {
 *   message: 'User changed salary input',
 *   data: { previousSalary: 45000, newSalary: 50000 }
 * });
 * ```
 */
export function addBreadcrumb(
  category: string,
  options: {
    message: string;
    level?: ErrorSeverity;
    data?: Record<string, unknown>;
  },
): void {
  const level: SeverityLevel = options.level ?? 'info';
  Sentry.addBreadcrumb({
    category,
    message: options.message,
    level,
    data: options.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for error tracking
 * Useful for tracking which users experience specific errors
 *
 * @example
 * ```typescript
 * setUserContext({
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   region: 'England'
 * });
 * ```
 */
export function setUserContext(user: User | null): void {
  Sentry.setUser(user);
}

/**
 * Set custom tags for error grouping
 * Tags help filter and group errors in Sentry
 *
 * @example
 * ```typescript
 * setTags({
 *   tax_year: '2025-26',
 *   region: 'Scotland',
 *   feature: 'calculator'
 * });
 * ```
 */
export function setTags(tags: Record<string, string | number | boolean>): void {
  for (const [key, value] of Object.entries(tags)) {
    Sentry.setTag(key, String(value));
  }
}

/**
 * Set custom context data for errors
 * Context provides additional information in error reports
 *
 * @example
 * ```typescript
 * setContext('calculator_state', {
 *   salary: 50000,
 *   taxYear: '2025-26',
 *   lastCalculation: new Date().toISOString()
 * });
 * ```
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.setContext(name, context);
}

/**
 * Clear user context (on logout, etc.)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Wrap an async function with error tracking
 * Automatically captures errors and adds performance monitoring
 *
 * @example
 * ```typescript
 * const safeCalculate = withErrorTracking(
 *   calculateTax,
 *   'calculate-tax',
 *   { operation: 'tax-calculation' }
 * );
 *
 * const result = await safeCalculate(input);
 * ```
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  operationName: string,
  tags?: Record<string, string>,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return (async (...args: Parameters<T>) => {
    const transaction = startPerformanceTransaction(operationName, {
      argShapes: args.map(describeSentryValue),
    });

    if (tags) {
      setTags(tags);
    }

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: operationName,
          ...tags,
        },
      });
      throw error;
    } finally {
      transaction?.end();
    }
  }) as (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
}

/**
 * Wrap a synchronous function with error tracking
 *
 * @example
 * ```typescript
 * const safeValidate = withErrorTrackingSync(
 *   validateInput,
 *   'validate-input',
 *   { operation: 'validation' }
 * );
 *
 * const result = safeValidate(data);
 * ```
 */
export function withErrorTrackingSync<T extends (...args: unknown[]) => unknown>(
  fn: T,
  operationName: string,
  tags?: Record<string, string>,
): (...args: Parameters<T>) => ReturnType<T> {
  return ((...args: Parameters<T>) => {
    const transaction = startPerformanceTransaction(operationName, {
      argShapes: args.map(describeSentryValue),
    });

    if (tags) {
      setTags(tags);
    }

    try {
      const result = fn(...args);
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: operationName,
          ...tags,
        },
      });
      throw error;
    } finally {
      transaction?.end();
    }
  }) as (...args: Parameters<T>) => ReturnType<T>;
}

/**
 * Utility to check if Sentry is enabled
 * Useful for conditional logging
 */
export function isSentryEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.NODE_ENV === 'production'
  );
}

/**
 * Flush Sentry events (useful before page unload)
 * Returns a promise that resolves when all events are sent
 *
 * @example
 * ```typescript
 * window.addEventListener('beforeunload', async () => {
 *   await flushSentryEvents(2000); // Wait up to 2 seconds
 * });
 * ```
 */
export function flushSentryEvents(timeout = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}

/**
 * Export Sentry namespace for advanced usage
 */
export { Sentry };
