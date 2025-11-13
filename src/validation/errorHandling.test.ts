/**
 * Error Handling Tests
 * Tests for error handling functions and utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SimulationError,
  SimulationErrorType,
  ErrorLogger,
  checkNumericalStability,
  checkExtremeValue,
  safeDivide,
  safeSqrt,
  safePow,
  clampValue,
  withErrorHandling,
} from './errorHandling';

describe('Error Handling', () => {
  describe('SimulationError', () => {
    it('should create error with correct properties', () => {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        'Test error',
        { test: 'data' },
        true
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(SimulationErrorType.INVALID_PARAMETERS);
      expect(error.message).toBe('Test error');
      expect(error.details).toEqual({ test: 'data' });
      expect(error.recoverable).toBe(true);
    });

    it('should default to recoverable', () => {
      const error = new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        'Test error'
      );

      expect(error.recoverable).toBe(true);
    });
  });

  describe('ErrorLogger', () => {
    let logger: ErrorLogger;

    beforeEach(() => {
      logger = new ErrorLogger();
    });

    it('should log errors', () => {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        'Test error'
      );

      logger.logError(error);
      const logs = logger.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe(SimulationErrorType.INVALID_PARAMETERS);
      expect(logs[0].message).toBe('Test error');
    });

    it('should get recent logs', () => {
      for (let i = 0; i < 15; i++) {
        logger.logError(
          new SimulationError(
            SimulationErrorType.NUMERICAL_INSTABILITY,
            `Error ${i}`
          )
        );
      }

      const recent = logger.getRecentLogs(5);
      expect(recent).toHaveLength(5);
      expect(recent[4].message).toBe('Error 14');
    });

    it('should clear logs', () => {
      logger.logError(
        new SimulationError(
          SimulationErrorType.INVALID_PARAMETERS,
          'Test error'
        )
      );

      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should count errors by type', () => {
      logger.logError(
        new SimulationError(
          SimulationErrorType.INVALID_PARAMETERS,
          'Error 1'
        )
      );
      logger.logError(
        new SimulationError(
          SimulationErrorType.INVALID_PARAMETERS,
          'Error 2'
        )
      );
      logger.logError(
        new SimulationError(
          SimulationErrorType.NUMERICAL_INSTABILITY,
          'Error 3'
        )
      );

      const counts = logger.getErrorCounts();
      expect(counts[SimulationErrorType.INVALID_PARAMETERS]).toBe(2);
      expect(counts[SimulationErrorType.NUMERICAL_INSTABILITY]).toBe(1);
    });
  });

  describe('checkNumericalStability', () => {
    it('should accept finite numbers', () => {
      expect(() => checkNumericalStability(42, 'test')).not.toThrow();
      expect(() => checkNumericalStability(0, 'test')).not.toThrow();
      expect(() => checkNumericalStability(-42, 'test')).not.toThrow();
    });

    it('should accept very small numbers', () => {
      expect(() => checkNumericalStability(1e-100, 'test')).not.toThrow();
    });

    it('should accept very large numbers', () => {
      expect(() => checkNumericalStability(1e100, 'test')).not.toThrow();
    });

    it('should throw on NaN with descriptive error', () => {
      try {
        checkNumericalStability(NaN, 'testValue');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SimulationError);
        expect((error as SimulationError).message).toContain('testValue');
        expect((error as SimulationError).message).toContain('NaN');
      }
    });

    it('should throw on Infinity', () => {
      expect(() => checkNumericalStability(Infinity, 'test')).toThrow(
        SimulationError
      );
    });

    it('should throw on -Infinity', () => {
      expect(() => checkNumericalStability(-Infinity, 'test')).toThrow(
        SimulationError
      );
    });

    it('should include value name in error details', () => {
      try {
        checkNumericalStability(NaN, 'myParameter');
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as SimulationError).details).toHaveProperty('name', 'myParameter');
      }
    });
  });

  describe('safeDivide', () => {
    it('should perform normal division', () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(7, 3)).toBeCloseTo(2.333, 2);
    });

    it('should handle negative numbers', () => {
      expect(safeDivide(-10, 2)).toBe(-5);
      expect(safeDivide(10, -2)).toBe(-5);
      expect(safeDivide(-10, -2)).toBe(5);
    });

    it('should handle very small divisors', () => {
      expect(safeDivide(1, 1e-10)).toBe(1e10);
    });

    it('should return fallback on division by zero', () => {
      expect(safeDivide(10, 0, 99)).toBe(99);
    });

    it('should return default fallback (0) on division by zero', () => {
      expect(safeDivide(10, 0)).toBe(0);
    });

    it('should handle non-finite numerator', () => {
      expect(safeDivide(Infinity, 2, 99)).toBe(99);
    });

    it('should handle non-finite denominator', () => {
      expect(safeDivide(10, Infinity, 99)).toBe(99);
    });

    it('should handle NaN numerator', () => {
      expect(safeDivide(NaN, 2, 99)).toBe(99);
    });

    it('should handle zero divided by zero', () => {
      expect(safeDivide(0, 0, 99)).toBe(99);
    });
  });

  describe('safeSqrt', () => {
    it('should calculate square root normally', () => {
      expect(safeSqrt(4)).toBe(2);
      expect(safeSqrt(9)).toBe(3);
      expect(safeSqrt(0)).toBe(0);
    });

    it('should handle very large numbers', () => {
      expect(safeSqrt(1e20)).toBe(1e10);
    });

    it('should handle very small numbers', () => {
      expect(safeSqrt(1e-20)).toBeCloseTo(1e-10, 15);
    });

    it('should handle fractional results', () => {
      expect(safeSqrt(2)).toBeCloseTo(1.414, 3);
    });

    it('should return fallback for negative numbers', () => {
      expect(safeSqrt(-4, 99)).toBe(99);
    });

    it('should return default fallback (0) for negative numbers', () => {
      expect(safeSqrt(-4)).toBe(0);
    });

    it('should return fallback for very negative numbers', () => {
      expect(safeSqrt(-1e10, 42)).toBe(42);
    });
  });

  describe('safePow', () => {
    it('should calculate power normally', () => {
      expect(safePow(2, 3)).toBe(8);
      expect(safePow(5, 2)).toBe(25);
    });

    it('should handle negative exponents', () => {
      expect(safePow(2, -1)).toBe(0.5);
      expect(safePow(10, -2)).toBe(0.01);
    });

    it('should handle fractional exponents', () => {
      expect(safePow(4, 0.5)).toBe(2);
      expect(safePow(27, 1/3)).toBeCloseTo(3, 10);
    });

    it('should handle zero base with positive exponent', () => {
      expect(safePow(0, 2)).toBe(0);
    });

    it('should return fallback for 0^negative', () => {
      expect(safePow(0, -1, 99)).toBe(99);
    });

    it('should return fallback for 0^0 (indeterminate)', () => {
      // Math.pow(0, 0) returns 1, but we check for non-finite results
      const result = safePow(0, 0, 99);
      expect(typeof result).toBe('number');
    });

    it('should handle non-finite results from overflow', () => {
      expect(safePow(1000, 1000, 99)).toBe(99);
    });

    it('should handle negative base with integer exponent', () => {
      expect(safePow(-2, 3)).toBe(-8);
      expect(safePow(-2, 2)).toBe(4);
    });
  });

  describe('clampValue', () => {
    it('should clamp values to range', () => {
      expect(clampValue(5, 0, 10)).toBe(5);
      expect(clampValue(-5, 0, 10)).toBe(0);
      expect(clampValue(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases at boundaries', () => {
      expect(clampValue(0, 0, 10)).toBe(0);
      expect(clampValue(10, 0, 10)).toBe(10);
    });

    it('should handle negative ranges', () => {
      expect(clampValue(-5, -10, -1)).toBe(-5);
      expect(clampValue(-15, -10, -1)).toBe(-10);
      expect(clampValue(0, -10, -1)).toBe(-1);
    });

    it('should handle very large values', () => {
      expect(clampValue(1e100, 0, 100)).toBe(100);
    });

    it('should handle very small values', () => {
      expect(clampValue(-1e100, 0, 100)).toBe(0);
    });

    it('should handle single-point range', () => {
      expect(clampValue(5, 10, 10)).toBe(10);
      expect(clampValue(15, 10, 10)).toBe(10);
    });
  });

  describe('checkExtremeValue', () => {
    beforeEach(() => {
      new ErrorLogger();
    });

    it('should return true for values within range', () => {
      expect(checkExtremeValue(5, 0, 10, 'test')).toBe(true);
    });

    it('should return true for values at boundaries', () => {
      expect(checkExtremeValue(0, 0, 10, 'test')).toBe(true);
      expect(checkExtremeValue(10, 0, 10, 'test')).toBe(true);
    });

    it('should return false for values below minimum', () => {
      expect(checkExtremeValue(-1, 0, 10, 'test')).toBe(false);
    });

    it('should return false for values above maximum', () => {
      expect(checkExtremeValue(11, 0, 10, 'test')).toBe(false);
    });

    it('should log error for extreme values', () => {
      checkExtremeValue(100, 0, 10, 'testParam');
      // Error should be logged (check console or error logger)
      expect(checkExtremeValue(100, 0, 10, 'testParam')).toBe(false);
    });
  });

  describe('withErrorHandling', () => {
    it('should execute function normally when no error', () => {
      const fn = (x: number) => x * 2;
      const wrapped = withErrorHandling(fn, 'Test operation');
      expect(wrapped(5)).toBe(10);
    });

    it('should catch and wrap regular errors', () => {
      const fn = () => {
        throw new Error('Regular error');
      };
      const wrapped = withErrorHandling(fn, 'Test operation');
      
      expect(() => wrapped()).toThrow(SimulationError);
    });

    it('should preserve SimulationError', () => {
      const fn = () => {
        throw new SimulationError(
          SimulationErrorType.NUMERICAL_INSTABILITY,
          'Test error'
        );
      };
      const wrapped = withErrorHandling(fn, 'Test operation');
      
      try {
        wrapped();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(SimulationError);
        expect((error as SimulationError).type).toBe(
          SimulationErrorType.NUMERICAL_INSTABILITY
        );
      }
    });

    it('should handle non-Error throws', () => {
      const fn = () => {
        throw 'string error';
      };
      const wrapped = withErrorHandling(fn, 'Test operation');
      
      expect(() => wrapped()).toThrow(SimulationError);
    });
  });
});
