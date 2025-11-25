/**
 * Input Validation Tests
 * Tests for input validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateMass,
  validateMetallicity,
  validateAngularMomentum,
  validateTemperature,
  validateRadius,
  validateTurbulenceVelocity,
  validateMagneticFieldStrength,
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

  describe('validateTemperature', () => {
    it('should accept valid temperature values', () => {
      const result = validateTemperature(20);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid temperature', () => {
      const result = validateTemperature(5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid temperature', () => {
      const result = validateTemperature(100);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range temperature values', () => {
      const result = validateTemperature(50);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject temperature below minimum', () => {
      const result = validateTemperature(3);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
      expect(result.errors[0]).toContain('5');
      expect(result.errors[0]).toContain('K');
    });

    it('should reject temperature above maximum', () => {
      const result = validateTemperature(150);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
      expect(result.errors[0]).toContain('100');
      expect(result.errors[0]).toContain('K');
    });

    it('should reject NaN temperature with clear error message', () => {
      const result = validateTemperature(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity temperature', () => {
      const result = validateTemperature(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative temperature', () => {
      const result = validateTemperature(-10);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error message with actual value', () => {
      const result = validateTemperature(3);
      expect(result.errors[0]).toContain('3');
    });

    it('should reject boundary value just below minimum', () => {
      const result = validateTemperature(4.9);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject boundary value just above maximum', () => {
      const result = validateTemperature(100.1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not exceed');
    });
  });

  describe('validateRadius', () => {
    it('should accept valid radius values', () => {
      const result = validateRadius(10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid radius', () => {
      const result = validateRadius(0.1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid radius', () => {
      const result = validateRadius(200);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range radius values', () => {
      const result = validateRadius(50);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject radius below minimum', () => {
      const result = validateRadius(0.05);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
      expect(result.errors[0]).toContain('0.1');
      expect(result.errors[0]).toContain('pc');
    });

    it('should reject radius above maximum', () => {
      const result = validateRadius(300);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
      expect(result.errors[0]).toContain('200');
      expect(result.errors[0]).toContain('pc');
    });

    it('should reject NaN radius with clear error message', () => {
      const result = validateRadius(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity radius', () => {
      const result = validateRadius(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative radius', () => {
      const result = validateRadius(-5);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject zero radius', () => {
      const result = validateRadius(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error message with actual value', () => {
      const result = validateRadius(0.05);
      expect(result.errors[0]).toContain('0.05');
    });

    it('should reject boundary value just below minimum', () => {
      const result = validateRadius(0.09);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject boundary value just above maximum', () => {
      const result = validateRadius(200.1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not exceed');
    });
  });

  describe('validateTurbulenceVelocity', () => {
    it('should accept valid turbulence velocity values', () => {
      const result = validateTurbulenceVelocity(1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid turbulence velocity', () => {
      const result = validateTurbulenceVelocity(0.1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid turbulence velocity', () => {
      const result = validateTurbulenceVelocity(10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range turbulence velocity values', () => {
      const result = validateTurbulenceVelocity(5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject turbulence velocity below minimum', () => {
      const result = validateTurbulenceVelocity(0.05);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
      expect(result.errors[0]).toContain('0.1');
      expect(result.errors[0]).toContain('km/s');
    });

    it('should reject turbulence velocity above maximum', () => {
      const result = validateTurbulenceVelocity(15);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
      expect(result.errors[0]).toContain('10');
      expect(result.errors[0]).toContain('km/s');
    });

    it('should reject NaN turbulence velocity with clear error message', () => {
      const result = validateTurbulenceVelocity(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity turbulence velocity', () => {
      const result = validateTurbulenceVelocity(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative turbulence velocity', () => {
      const result = validateTurbulenceVelocity(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject zero turbulence velocity', () => {
      const result = validateTurbulenceVelocity(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error message with actual value', () => {
      const result = validateTurbulenceVelocity(0.05);
      expect(result.errors[0]).toContain('0.05');
    });

    it('should reject boundary value just below minimum', () => {
      const result = validateTurbulenceVelocity(0.09);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject boundary value just above maximum', () => {
      const result = validateTurbulenceVelocity(10.1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not exceed');
    });
  });

  describe('validateMagneticFieldStrength', () => {
    it('should accept valid magnetic field strength values', () => {
      const result = validateMagneticFieldStrength(10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept minimum valid magnetic field strength', () => {
      const result = validateMagneticFieldStrength(1);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept maximum valid magnetic field strength', () => {
      const result = validateMagneticFieldStrength(1000);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept mid-range magnetic field strength values', () => {
      const result = validateMagneticFieldStrength(100);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject magnetic field strength below minimum', () => {
      const result = validateMagneticFieldStrength(0.5);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('at least');
      expect(result.errors[0]).toContain('1');
      expect(result.errors[0]).toContain('μG');
    });

    it('should reject magnetic field strength above maximum', () => {
      const result = validateMagneticFieldStrength(1500);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('not exceed');
      expect(result.errors[0]).toContain('1000');
      expect(result.errors[0]).toContain('μG');
    });

    it('should reject NaN magnetic field strength with clear error message', () => {
      const result = validateMagneticFieldStrength(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('valid number');
    });

    it('should reject Infinity magnetic field strength', () => {
      const result = validateMagneticFieldStrength(Infinity);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('finite');
    });

    it('should reject negative magnetic field strength', () => {
      const result = validateMagneticFieldStrength(-10);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject zero magnetic field strength', () => {
      const result = validateMagneticFieldStrength(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide helpful error message with actual value', () => {
      const result = validateMagneticFieldStrength(0.5);
      expect(result.errors[0]).toContain('0.5');
    });

    it('should reject boundary value just below minimum', () => {
      const result = validateMagneticFieldStrength(0.9);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('at least');
    });

    it('should reject boundary value just above maximum', () => {
      const result = validateMagneticFieldStrength(1000.1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('not exceed');
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

    it('should accept valid cloud parameters with enhanced properties', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 1,
        magneticFieldStrength: 10,
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

    it('should reject invalid temperature', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
        temperature: 3,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Temperature'))).toBe(true);
    });

    it('should reject invalid radius', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
        radius: 0.05,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Radius'))).toBe(true);
    });

    it('should reject invalid turbulence velocity', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
        turbulenceVelocity: 0.05,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Turbulence velocity'))).toBe(true);
    });

    it('should reject invalid magnetic field strength', () => {
      const params = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e45,
        magneticFieldStrength: 0.5,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Magnetic field strength'))).toBe(true);
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

    it('should collect multiple errors from enhanced properties', () => {
      const params = {
        mass: 0.01,
        metallicity: 10.0,
        angularMomentum: -1,
        temperature: 3,
        radius: 0.05,
        turbulenceVelocity: 15,
        magneticFieldStrength: 1500,
      };
      const result = validateCloudParameters(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(7);
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
      expect(ranges).toHaveProperty('temperature');
      expect(ranges).toHaveProperty('radius');
      expect(ranges).toHaveProperty('turbulenceVelocity');
      expect(ranges).toHaveProperty('magneticFieldStrength');
      expect(ranges).toHaveProperty('timeScale');
      expect(ranges).toHaveProperty('simulationTime');
    });

    it('should have min and max for each range', () => {
      const ranges = getValidationRanges();
      expect(ranges.mass).toHaveProperty('min');
      expect(ranges.mass).toHaveProperty('max');
      expect(ranges.mass).toHaveProperty('unit');
    });

    it('should have correct ranges for enhanced properties', () => {
      const ranges = getValidationRanges();
      
      expect(ranges.temperature.min).toBe(5);
      expect(ranges.temperature.max).toBe(100);
      expect(ranges.temperature.unit).toBe('K');
      
      expect(ranges.radius.min).toBe(0.1);
      expect(ranges.radius.max).toBe(200);
      expect(ranges.radius.unit).toBe('pc');
      
      expect(ranges.turbulenceVelocity.min).toBe(0.1);
      expect(ranges.turbulenceVelocity.max).toBe(10);
      expect(ranges.turbulenceVelocity.unit).toBe('km/s');
      
      expect(ranges.magneticFieldStrength.min).toBe(1);
      expect(ranges.magneticFieldStrength.max).toBe(1000);
      expect(ranges.magneticFieldStrength.unit).toBe('μG');
    });
  });
});
