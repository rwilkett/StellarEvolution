/**
 * Unit tests for orbital mechanics calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOrbitalPeriod,
  calculateSemiMajorAxis,
  calculateMeanAnomaly,
  solveKeplerEquation,
  calculateTrueAnomaly,
  calculateHillSphereRadius,
} from './orbitalMechanics';

describe('Orbital Mechanics', () => {
  describe('Kepler\'s Third Law', () => {
    it('should calculate Earth orbital period correctly', () => {
      // Earth: 1 AU, 1 solar mass, period should be ~1 year
      const period = calculateOrbitalPeriod(1.0, 1.0);
      expect(period).toBeCloseTo(1.0, 2);
    });

    it('should calculate period for Jupiter orbit', () => {
      // Jupiter: ~5.2 AU, period should be ~11.86 years
      const period = calculateOrbitalPeriod(5.2, 1.0);
      expect(period).toBeCloseTo(11.86, 0);
    });

    it('should calculate semi-major axis from period', () => {
      // 1 year period, 1 solar mass should give ~1 AU
      const semiMajorAxis = calculateSemiMajorAxis(1.0, 1.0);
      expect(semiMajorAxis).toBeCloseTo(1.0, 2);
    });

    it('should satisfy round-trip conversion', () => {
      const originalAxis = 5.0;
      const mass = 1.5;
      const period = calculateOrbitalPeriod(originalAxis, mass);
      const calculatedAxis = calculateSemiMajorAxis(period, mass);
      expect(calculatedAxis).toBeCloseTo(originalAxis, 5);
    });
  });

  describe('Kepler Equation', () => {
    it('should solve for circular orbit (e=0)', () => {
      const M = Math.PI / 2;
      const E = solveKeplerEquation(M, 0);
      expect(E).toBeCloseTo(M, 5);
    });

    it('should solve for eccentric orbit', () => {
      const M = Math.PI / 4;
      const e = 0.5;
      const E = solveKeplerEquation(M, e);
      // Verify Kepler's equation: M = E - e*sin(E)
      const verifyM = E - e * Math.sin(E);
      expect(verifyM).toBeCloseTo(M, 5);
    });

    it('should handle high eccentricity', () => {
      const M = Math.PI;
      const e = 0.9;
      const E = solveKeplerEquation(M, e);
      const verifyM = E - e * Math.sin(E);
      expect(verifyM).toBeCloseTo(M, 5);
    });
  });

  describe('calculateMeanAnomaly', () => {
    it('should calculate mean anomaly for half period', () => {
      const M = calculateMeanAnomaly(0.5, 1.0);
      expect(M).toBeCloseTo(Math.PI, 5);
    });

    it('should wrap around after full period', () => {
      const M = calculateMeanAnomaly(1.0, 1.0);
      expect(M).toBeCloseTo(0, 5);
    });
  });

  describe('calculateTrueAnomaly', () => {
    it('should calculate true anomaly for circular orbit', () => {
      const E = Math.PI / 2;
      const nu = calculateTrueAnomaly(E, 0);
      expect(nu).toBeCloseTo(E, 5);
    });

    it('should calculate true anomaly for eccentric orbit', () => {
      const E = Math.PI / 4;
      const e = 0.5;
      const nu = calculateTrueAnomaly(E, e);
      expect(nu).toBeGreaterThan(E);
    });
  });

  describe('calculateHillSphereRadius', () => {
    it('should calculate Hill sphere for Earth', () => {
      // Earth at 1 AU around Sun
      const hillRadius = calculateHillSphereRadius(1.0, 1.0, 1.0 / 333000);
      expect(hillRadius).toBeGreaterThan(0);
      expect(hillRadius).toBeLessThan(0.1);
    });

    it('should scale with semi-major axis', () => {
      const hill1 = calculateHillSphereRadius(1.0, 1.0, 0.001);
      const hill2 = calculateHillSphereRadius(2.0, 1.0, 0.001);
      expect(hill2).toBeCloseTo(hill1 * 2, 5);
    });
  });
});
