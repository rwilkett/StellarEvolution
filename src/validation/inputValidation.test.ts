/**
 * Input Validation Tests
 * Tests for input validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateMass,
  validateMetallicity,
  validateAngularMomentum,
  validateCloudParameters,
  validateTimeScale,
  validateSimulationTime,
  getValidationRanges,
} from './inputValidation';

describe('Input Validation', () => {
  describe('validateMass', () => {
    it('should accept valid mass values', () => {
      const result = validateMass(1.0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid mass', () => {
      const result = validateMass(0.1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid mass', () => {
      const result = validateMass(1000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range mass values', () => {
      const result = validateMass(10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject mass below minimum', () => {
      const result = validateMass(0.05);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
      expect(result.errors[0]).toContain('0.1');
    });

    it('should reject mass above maximum', () => {
      const result = validateMass(2000);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
      expect(result.errors[0]).toContain('1000');
    });

    it('should reject NaN with clear error message', () => {
      const result = validateMass(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject positive Infinity', () => {
      const result = validateMass(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative Infinity', () => {
      const result = validateMass(-Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative mass', () => {
      const result = validateMass(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject zero mass', () => {
      const result = validateMass(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error message with actual value', () => {
      const result = validateMass(0.05);
      expect(result.errors[0]).toContain('0.05');
    });
  });

  describe('validateMetallicity', () => {
    it('should accept valid metallicity values', () => {
      const result = validateMetallicity(1.0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid metallicity', () => {
      const result = validateMetallicity(0.0001);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid metallicity', () => {
      const result = validateMetallicity(3.0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept low metallicity values', () => {
      const result = validateMetallicity(0.001);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept high metallicity values', () => {
      const result = validateMetallicity(2.5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject metallicity below minimum', () => {
      const result = validateMetallicity(0.00001);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject metallicity above maximum', () => {
      const result = validateMetallicity(5.0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
    });

    it('should reject NaN metallicity', () => {
      const result = validateMetallicity(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity metallicity', () => {
      const result = validateMetallicity(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative metallicity', () => {
      const result = validateMetallicity(-0.5);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAngularMomentum', () => {
    it('should accept valid angular momentum values', () => {
      const result = validateAngularMomentum(1e45);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept zero angular momentum (minimum)', () => {
      const result = validateAngularMomentum(0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum angular momentum', () => {
      const result = validateAngularMomentum(1e50);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range angular momentum', () => {
      const result = validateAngularMomentum(5e48);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative angular momentum', () => {
      const result = validateAngularMomentum(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject angular momentum above maximum', () => {
      const result = validateAngularMomentum(1e51);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
    });

    it('should reject NaN angular momentum', () => {
      const result = validateAngularMomentum(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity angular momentum', () => {
      const result = validateAngularMomentum(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });
  });

  describe('validateCloudParameters', () => {
    it('should accept valid cloud parameters', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid mass', () => {
      const params = {
        mass: 0.01,
        metallicity: 1.0,
        angularMomentum: 1e45,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should collect multiple errors', () => {
      const params = {
        mass: 0.01,
        metallicity: 10.0,
        angularMomentum: -1,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateTimeScale', () => {
    it('should accept valid time scale', () => {
      const result = validateTimeScale(1.0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum time scale', () => {
      const result = validateTimeScale(0.001);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum time scale', () => {
      const result = validateTimeScale(1000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero time scale', () => {
      const result = validateTimeScale(0);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('positive');
    });

    it('should reject negative time scale', () => {
      const result = validateTimeScale(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('positive');
    });

    it('should reject time scale below minimum', () => {
      const result = validateTimeScale(0.0001);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject time scale above maximum', () => {
      const result = validateTimeScale(2000);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject NaN time scale', () => {
      const result = validateTimeScale(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity time scale', () => {
      const result = validateTimeScale(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });
  });

  describe('validateSimulationTime', () => {
    it('should accept valid simulation time', () => {
      const result = validateSimulationTime(1e9);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum simulation time (zero)', () => {
      const result = validateSimulationTime(0);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum simulation time', () => {
      const result = validateSimulationTime(1e11);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept very large time values', () => {
      const result = validateSimulationTime(5e10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative time', () => {
      const result = validateSimulationTime(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject time above maximum', () => {
      const result = validateSimulationTime(2e11);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
    });

    it('should reject NaN time', () => {
      const result = validateSimulationTime(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity time', () => {
      const result = validateSimulationTime(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });
  });

  describe('getValidationRanges', () => {
    it('should return all validation ranges', () => {
      const ranges = getValidationRanges();
      expect(ranges).toHaveProperty('mass');
      expect(ranges).toHaveProperty('metallicity');
      expect(ranges).toHaveProperty('angularMomentum');
      expect(ranges).toHaveProperty('timeScale');
      expect(ranges).toHaveProperty('simulationTime');
    });

    it('should have min and max for each range', () => {
      const ranges = getValidationRanges();
      expect(ranges.mass).toHaveProperty('min');
      expect(ranges.mass).toHaveProperty('max');
      expect(ranges.mass).toHaveProperty('unit');
    });
  });
});
