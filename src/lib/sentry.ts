/**
 * Sentry Error Tracking & Performance Monitoring Utilities
 *
 * Centralized Sentry utilities for consistent error tracking, performance monitoring,
 * and debugging across the PayeTax application.
 *
 * Features:
 * - Type-safe error tracking with custom contexts
 * - Performance monitoring with transactions and spans
 * - Breadcrumb management for debugging
 * - User context management
 * - Custom fingerprinting for better error grouping
 * - Calculator-specific error tracking
 *
 * PAYTAX-76: Sentry 10.22.0 Maximization
 */

import type { SeverityLevel, User } from '@sentry/nextjs';
import * as Sentry from '@sentry/nextjs';

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
  /** Student loan plan if applicable */
  studentLoanPlan?: string;
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
  severity: ErrorSeverity = 'error'
): string | undefined {
  return Sentry.captureException(error, {
    level: severity as SeverityLevel,
    tags: {
      error_type: 'calculator',
      tax_year: context.taxYear,
      region: context.region,
      has_student_loan: context.studentLoanPlan ? 'yes' : 'no',
      has_pension: context.pensionContribution ? 'yes' : 'no',
      is_married: context.isMarried ? 'yes' : 'no',
    },
    contexts: {
      calculator: {
        salary: context.salary,
        taxCode: context.taxCode || 'default',
        studentLoanPlan: context.studentLoanPlan || 'none',
        pensionContribution: context.pensionContribution || 0,
      },
    },
    fingerprint: ['calculator-error', context.taxYear, context.region],
  });
}

/**
 * Capture a validation error with field-specific context
 * Use this for input validation failures
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
  severity: ErrorSeverity = 'warning'
): string | undefined {
  return Sentry.captureException(error, {
    level: severity as SeverityLevel,
    tags: {
      error_type: 'validation',
      field: context.field,
      location: context.location,
    },
    contexts: {
      validation: {
        field: context.field,
        errorMessage: context.errorMessage,
        attemptedValue:
          typeof context.attemptedValue === 'object'
            ? JSON.stringify(context.attemptedValue)
            : String(context.attemptedValue),
      },
    },
    fingerprint: ['validation-error', context.location, context.field],
  });
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
  severity: ErrorSeverity = 'error'
): string | undefined {
  return Sentry.captureException(error, {
    level: severity as SeverityLevel,
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
        responseBody:
          typeof context.responseBody === 'object'
            ? JSON.stringify(context.responseBody)
            : context.responseBody,
        requestParams: context.requestParams,
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
  severity: ErrorSeverity = 'warning'
): string | undefined {
  return Sentry.captureMessage(message, {
    level: severity as SeverityLevel,
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
  data?: Record<string, unknown>
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
  description?: string
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
  }
): void {
  Sentry.addBreadcrumb({
    category,
    message: options.message,
    level: (options.level as SeverityLevel) || 'info',
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
  tags?: Record<string, string>
): T {
  return (async (...args: unknown[]) => {
    const transaction = startPerformanceTransaction(operationName, {
      args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
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
  }) as T;
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
  tags?: Record<string, string>
): T {
  return ((...args: unknown[]) => {
    const transaction = startPerformanceTransaction(operationName, {
      args: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg)),
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
  }) as T;
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
