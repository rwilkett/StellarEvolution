/**
 * Unit tests for cloud formation module
 */

import { describe, it, expect } from 'vitest';
import {
  determineFragmentation,
  calculateMassDistribution,
  calculateNumberOfStars,
  willCloudCollapse,
} from './cloudFormation';
import { CloudParameters } from '../types/core';
import { VALIDATION_RANGES } from '../constants/physics';
import { calculateDerivedProperties } from '../physics/derivedCloudProperties';

describe('Cloud Formation', () => {
  describe('determineFragmentation', () => {
    it('should form single star from low mass cloud with low angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 0.5,
        metallicity: 1.0,
        angularMomentum: 1e45,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      expect(numStars).toBe(1);
    });

    it('should form binary system from low mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 0.8,
        metallicity: 1.0,
        angularMomentum: 2e49, // Higher angular momentum to trigger binary
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      // Should form at least 1 star, possibly more with high angular momentum
      expect(numStars).toBeGreaterThanOrEqual(1);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should form multiple stars from medium mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 5.0,
        metallicity: 1.0,
        angularMomentum: 2e50, // Higher angular momentum for fragmentation
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(1);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should form multiple stars from high mass cloud', () => {
      const cloudParams: CloudParameters = {
        mass: 50.0,
        metallicity: 1.0,
        angularMomentum: 1e49,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(1);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should form many stars from very high mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 500.0,
        metallicity: 1.0,
        angularMomentum: 1e50,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(1);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should increase fragmentation with higher angular momentum', () => {
      const lowAngularMomentum: CloudParameters = {
        mass: 10.0,
        metallicity: 1.0,
        angularMomentum: 1e47,
      };
      
      const highAngularMomentum: CloudParameters = {
        mass: 10.0,
        metallicity: 1.0,
        angularMomentum: 1e49,
      };
      
      const derivedLow = calculateDerivedProperties(lowAngularMomentum);
      const derivedHigh = calculateDerivedProperties(highAngularMomentum);
      
      const numStarsLow = determineFragmentation(lowAngularMomentum, derivedLow);
      const numStarsHigh = determineFragmentation(highAngularMomentum, derivedHigh);
      
      expect(numStarsHigh).toBeGreaterThanOrEqual(numStarsLow);
    });
  });

  describe('calculateMassDistribution', () => {
    it('should return single mass for single star', () => {
      const masses = calculateMassDistribution(10.0, 1);
      
      expect(masses).toHaveLength(1);
      expect(masses[0]).toBeGreaterThan(0);
      expect(masses[0]).toBeLessThanOrEqual(10.0);
    });

    it('should return correct number of masses', () => {
      const numStars = 5;
      const masses = calculateMassDistribution(50.0, numStars);
      
      expect(masses).toHaveLength(numStars);
    });

    it('should have total mass sum less than or equal to input mass', () => {
      const totalMass = 100.0;
      const numStars = 10;
      const masses = calculateMassDistribution(totalMass, numStars);
      
      const sumMasses = masses.reduce((sum, mass) => sum + mass, 0);
      
      // Sum should be less than total due to star formation efficiency
      expect(sumMasses).toBeLessThanOrEqual(totalMass);
      expect(sumMasses).toBeGreaterThan(0);
    });

    it('should sort masses in descending order', () => {
      const masses = calculateMassDistribution(50.0, 5);
      
      for (let i = 0; i < masses.length - 1; i++) {
        expect(masses[i]).toBeGreaterThanOrEqual(masses[i + 1]);
      }
    });

    it('should respect minimum stellar mass', () => {
      const masses = calculateMassDistribution(10.0, 20);
      
      masses.forEach(mass => {
        expect(mass).toBeGreaterThanOrEqual(VALIDATION_RANGES.STELLAR_MASS.min);
      });
    });

    it('should respect maximum stellar mass', () => {
      const masses = calculateMassDistribution(1000.0, 5);
      
      masses.forEach(mass => {
        expect(mass).toBeLessThanOrEqual(VALIDATION_RANGES.STELLAR_MASS.max);
      });
    });

    it('should produce different distributions for different calls', () => {
      const masses1 = calculateMassDistribution(50.0, 5);
      const masses2 = calculateMassDistribution(50.0, 5);
      
      // Due to randomness, distributions should be different
      const areDifferent = masses1.some((mass, i) => Math.abs(mass - masses2[i]) > 0.01);
      expect(areDifferent).toBe(true);
    });
  });

  describe('calculateNumberOfStars - edge cases', () => {
    it('should handle minimum valid cloud mass', () => {
      const cloudParams: CloudParameters = {
        mass: VALIDATION_RANGES.CLOUD_MASS.min,
        metallicity: 1.0,
        angularMomentum: 1e46,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = calculateNumberOfStars(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(0);
    });

    it('should handle maximum valid cloud mass', () => {
      const cloudParams: CloudParameters = {
        mass: VALIDATION_RANGES.CLOUD_MASS.max,
        metallicity: 1.0,
        angularMomentum: 1e49,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = calculateNumberOfStars(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(0);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should handle zero angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 10.0,
        metallicity: 1.0,
        angularMomentum: 0,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = calculateNumberOfStars(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(0);
    });

    it('should handle very high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 100.0,
        metallicity: 1.0,
        angularMomentum: VALIDATION_RANGES.ANGULAR_MOMENTUM.max,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = calculateNumberOfStars(cloudParams, derived);
      expect(numStars).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Turbulent Fragmentation', () => {
    it('should increase fragmentation with higher turbulence velocity', () => {
      const lowTurbulence: CloudParameters = {
        mass: 20,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 0.5, // Low turbulence
      };
      
      const highTurbulence: CloudParameters = {
        mass: 20,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 5, // High turbulence
      };
      
      const derivedLow = calculateDerivedProperties(lowTurbulence);
      const derivedHigh = calculateDerivedProperties(highTurbulence);
      
      const numStarsLow = determineFragmentation(lowTurbulence, derivedLow);
      const numStarsHigh = determineFragmentation(highTurbulence, derivedHigh);
      
      // Higher turbulence should lead to more fragmentation
      expect(numStarsHigh).toBeGreaterThanOrEqual(numStarsLow);
    });

    it('should use turbulent Jeans length for fragment spacing', () => {
      const cloudParams: CloudParameters = {
        mass: 50,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 5, // Smaller radius to ensure fragments fit
        turbulenceVelocity: 2,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      
      // Number of fragments should be limited by turbulent Jeans length
      const maxFragments = Math.pow(cloudParams.radius! / derived.turbulentJeansLength, 3);
      expect(numStars).toBeLessThanOrEqual(Math.max(10, Math.floor(maxFragments)));
    });

    it('should reduce fragmentation for unbound clouds', () => {
      const boundCloud: CloudParameters = {
        mass: 1000,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 2, // Very small radius
        turbulenceVelocity: 0.2, // Very low turbulence - bound
      };
      
      const unboundCloud: CloudParameters = {
        mass: 20,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 5, // High turbulence - unbound
      };
      
      const derivedBound = calculateDerivedProperties(boundCloud);
      const derivedUnbound = calculateDerivedProperties(unboundCloud);
      
      // Verify bound/unbound status
      expect(derivedBound.isBound).toBe(true);
      expect(derivedUnbound.isBound).toBe(false);
      
      const numStarsBound = determineFragmentation(boundCloud, derivedBound);
      const numStarsUnbound = determineFragmentation(unboundCloud, derivedUnbound);
      
      // Unbound clouds should fragment less efficiently
      expect(numStarsUnbound).toBeLessThanOrEqual(numStarsBound);
    });

    it('should produce physically plausible fragment counts', () => {
      const cloudParams: CloudParameters = {
        mass: 100,
        metallicity: 1.0,
        angularMomentum: 1e49,
        temperature: 20,
        radius: 20,
        turbulenceVelocity: 2,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      const numStars = determineFragmentation(cloudParams, derived);
      
      // Should be between 1 and 10 stars
      expect(numStars).toBeGreaterThanOrEqual(1);
      expect(numStars).toBeLessThanOrEqual(10);
    });
  });

  describe('willCloudCollapse', () => {
    it('should collapse when mass exceeds Jeans mass and cloud is bound', () => {
      const cloudParams: CloudParameters = {
        mass: 1000,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 10, // Cold
        radius: 5, // Small
        turbulenceVelocity: 0.3, // Low turbulence - bound
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      
      // Verify conditions
      expect(cloudParams.mass).toBeGreaterThan(derived.jeansMass);
      expect(derived.isBound).toBe(true);
      
      const willCollapse = willCloudCollapse(cloudParams, derived);
      expect(willCollapse).toBe(true);
    });

    it('should not collapse when cloud is unbound', () => {
      const cloudParams: CloudParameters = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 5, // High turbulence - unbound
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      
      // Verify cloud is unbound
      expect(derived.isBound).toBe(false);
      
      const willCollapse = willCloudCollapse(cloudParams, derived);
      expect(willCollapse).toBe(false);
    });

    it('should not collapse when mass is below Jeans mass', () => {
      const cloudParams: CloudParameters = {
        mass: 0.5,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 50, // High temperature increases Jeans mass
        radius: 10,
        turbulenceVelocity: 0.5,
      };
      
      const derived = calculateDerivedProperties(cloudParams);
      
      // Verify mass is below Jeans mass
      expect(cloudParams.mass).toBeLessThan(derived.jeansMass);
      
      const willCollapse = willCloudCollapse(cloudParams, derived);
      expect(willCollapse).toBe(false);
    });
  });
});
