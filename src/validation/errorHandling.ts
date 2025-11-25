/**
 * Error Handling Module
 * Provides error types and handling for simulation edge cases
 */

/**
 * Simulation error types
 */
export enum SimulationErrorType {
  INVALID_PARAMETERS = 'invalid_parameters',
  NUMERICAL_INSTABILITY = 'numerical_instability',
  UNSTABLE_SYSTEM = 'unstable_system',
  CALCULATION_TIMEOUT = 'calculation_timeout',
  INSUFFICIENT_MASS = 'insufficient_mass',
  EXTREME_VALUES = 'extreme_values',
  ORBITAL_INSTABILITY = 'orbital_instability',
  LEGACY_FORMAT = 'legacy_format',
}

/**
 * Simulation error class
 */
export class SimulationError extends Error {
  public readonly type: SimulationErrorType;
  public readonly details?: any;
  public readonly recoverable: boolean;

  constructor(
    type: SimulationErrorType,
    message: string,
    details?: any,
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'SimulationError';
    this.type = type;
    this.details = details;
    this.recoverable = recoverable;
    
    // Maintains proper stack trace for where error was thrown
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, SimulationError);
    }
  }
}

/**
 * Error logger interface
 */
export interface ErrorLog {
  timestamp: Date;
  type: SimulationErrorType;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Error logger class
 * Logs errors without crashing the application
 */
export class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100;

  /**
   * Log an error
   * @param error - Error to log
   */
  public logError(error: SimulationError | Error): void {
    const log: ErrorLog = {
      timestamp: new Date(),
      type: error instanceof SimulationError 
        ? error.type 
        : SimulationErrorType.NUMERICAL_INSTABILITY,
      message: error.message,
      details: error instanceof SimulationError ? error.details : undefined,
      stack: error.stack,
    };

    this.logs.push(log);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    // Always log errors to console for debugging
    console.error('[SimulationError]', log);
  }

  /**
   * Get all error logs
   * @returns Array of error logs
   */
  public getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get recent error logs
   * @param count - Number of recent logs to retrieve
   * @returns Array of recent error logs
   */
  public getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all error logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error count by type
   * @returns Object with error counts by type
   */
  public getErrorCounts(): Record<SimulationErrorType, number> {
    const counts: Record<SimulationErrorType, number> = {
      [SimulationErrorType.INVALID_PARAMETERS]: 0,
      [SimulationErrorType.NUMERICAL_INSTABILITY]: 0,
      [SimulationErrorType.UNSTABLE_SYSTEM]: 0,
      [SimulationErrorType.CALCULATION_TIMEOUT]: 0,
      [SimulationErrorType.INSUFFICIENT_MASS]: 0,
      [SimulationErrorType.EXTREME_VALUES]: 0,
      [SimulationErrorType.ORBITAL_INSTABILITY]: 0,
      [SimulationErrorType.LEGACY_FORMAT]: 0,
    };

    for (const log of this.logs) {
      counts[log.type]++;
    }

    return counts;
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();

/**
 * Check for numerical instability in a value
 * @param value - Value to check
 * @param name - Name of the value for error message
 * @returns True if value is stable
 * @throws SimulationError if value is unstable
 */
export function checkNumericalStability(value: number, name: string): boolean {
  if (!isFinite(value)) {
    const error = new SimulationError(
      SimulationErrorType.NUMERICAL_INSTABILITY,
      `Numerical instability detected: ${name} is ${value}`,
      { value, name }
    );
    errorLogger.logError(error);
    throw error;
  }

  if (isNaN(value)) {
    const error = new SimulationError(
      SimulationErrorType.NUMERICAL_INSTABILITY,
      `Numerical instability detected: ${name} is NaN`,
      { value, name }
    );
    errorLogger.logError(error);
    throw error;
  }

  return true;
}

/**
 * Check for extreme parameter values
 * @param value - Value to check
 * @param min - Minimum reasonable value
 * @param max - Maximum reasonable value
 * @param name - Name of the parameter
 * @returns True if value is within reasonable range
 */
export function checkExtremeValue(
  value: number,
  min: number,
  max: number,
  name: string
): boolean {
  if (value < min || value > max) {
    const error = new SimulationError(
      SimulationErrorType.EXTREME_VALUES,
      `Extreme value detected for ${name}: ${value} (expected range: ${min} - ${max})`,
      { value, min, max, name },
      true // Recoverable - can continue with clamped value
    );
    errorLogger.logError(error);
    return false;
  }
  return true;
}

/**
 * Clamp a value to a safe range
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe division that handles division by zero
 * @param numerator - Numerator
 * @param denominator - Denominator
 * @param fallback - Fallback value if denominator is zero
 * @returns Result of division or fallback
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number = 0
): number {
  if (denominator === 0 || !isFinite(denominator)) {
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Division by zero or invalid denominator',
        { numerator, denominator }
      )
    );
    return fallback;
  }

  const result = numerator / denominator;

  if (!isFinite(result)) {
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Division resulted in non-finite value',
        { numerator, denominator, result }
      )
    );
    return fallback;
  }

  return result;
}

/**
 * Safe square root that handles negative values
 * @param value - Value to take square root of
 * @param fallback - Fallback value if input is negative
 * @returns Square root or fallback
 */
export function safeSqrt(value: number, fallback: number = 0): number {
  if (value < 0) {
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Attempted to take square root of negative number',
        { value }
      )
    );
    return fallback;
  }

  return Math.sqrt(value);
}

/**
 * Safe power operation that handles edge cases
 * @param base - Base value
 * @param exponent - Exponent
 * @param fallback - Fallback value if result is invalid
 * @returns Result of power operation or fallback
 */
export function safePow(
  base: number,
  exponent: number,
  fallback: number = 0
): number {
  if (base === 0 && exponent < 0) {
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Attempted to raise zero to negative power',
        { base, exponent }
      )
    );
    return fallback;
  }

  const result = Math.pow(base, exponent);

  if (!isFinite(result)) {
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Power operation resulted in non-finite value',
        { base, exponent, result }
      )
    );
    return fallback;
  }

  return result;
}

/**
 * Wrap a function with error handling
 * @param fn - Function to wrap
 * @param errorMessage - Error message prefix
 * @returns Wrapped function that logs errors
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof SimulationError) {
        errorLogger.logError(error);
        throw error;
      } else if (error instanceof Error) {
        const simError = new SimulationError(
          SimulationErrorType.NUMERICAL_INSTABILITY,
          `${errorMessage}: ${error.message}`,
          { originalError: error.message, stack: error.stack }
        );
        errorLogger.logError(simError);
        throw simError;
      } else {
        const simError = new SimulationError(
          SimulationErrorType.NUMERICAL_INSTABILITY,
          `${errorMessage}: Unknown error`,
          { error }
        );
        errorLogger.logError(simError);
        throw simError;
      }
    }
  }) as T;
}
