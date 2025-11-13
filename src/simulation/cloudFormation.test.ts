/**
 * Unit tests for cloud formation module
 */

import { describe, it, expect } from 'vitest';
import {
  determineFragmentation,
  calculateMassDistribution,
  calculateNumberOfStars,
} from './cloudFormation';
import { CloudParameters } from '../types/core';
import { VALIDATION_RANGES } from '../constants/physics';

describe('Cloud Formation', () => {
  describe('determineFragmentation', () => {
    it('should form single star from low mass cloud with low angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 0.5,
        metallicity: 1.0,
        angularMomentum: 1e45,
      };
      
      const numStars = determineFragmentation(cloudParams);
      expect(numStars).toBe(1);
    });

    it('should form binary system from low mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 0.8,
        metallicity: 1.0,
        angularMomentum: 2e49, // Higher angular momentum to trigger binary
      };
      
      const numStars = determineFragmentation(cloudParams);
      expect(numStars).toBe(2);
    });

    it('should form multiple stars from medium mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 5.0,
        metallicity: 1.0,
        angularMomentum: 2e50, // Higher angular momentum for fragmentation
      };
      
      const numStars = determineFragmentation(cloudParams);
      expect(numStars).toBeGreaterThanOrEqual(2);
      expect(numStars).toBeLessThanOrEqual(3);
    });

    it('should form multiple stars from high mass cloud', () => {
      const cloudParams: CloudParameters = {
        mass: 50.0,
        metallicity: 1.0,
        angularMomentum: 1e49,
      };
      
      const numStars = determineFragmentation(cloudParams);
      expect(numStars).toBeGreaterThanOrEqual(2);
      expect(numStars).toBeLessThanOrEqual(5);
    });

    it('should form many stars from very high mass cloud with high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 500.0,
        metallicity: 1.0,
        angularMomentum: 1e50,
      };
      
      const numStars = determineFragmentation(cloudParams);
      expect(numStars).toBeGreaterThanOrEqual(3);
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
      
      const numStarsLow = determineFragmentation(lowAngularMomentum);
      const numStarsHigh = determineFragmentation(highAngularMomentum);
      
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
      
      const numStars = calculateNumberOfStars(cloudParams);
      expect(numStars).toBeGreaterThanOrEqual(0);
    });

    it('should handle maximum valid cloud mass', () => {
      const cloudParams: CloudParameters = {
        mass: VALIDATION_RANGES.CLOUD_MASS.max,
        metallicity: 1.0,
        angularMomentum: 1e49,
      };
      
      const numStars = calculateNumberOfStars(cloudParams);
      expect(numStars).toBeGreaterThan(0);
      expect(numStars).toBeLessThanOrEqual(10);
    });

    it('should handle zero angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 10.0,
        metallicity: 1.0,
        angularMomentum: 0,
      };
      
      const numStars = calculateNumberOfStars(cloudParams);
      expect(numStars).toBeGreaterThanOrEqual(1);
    });

    it('should handle very high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 100.0,
        metallicity: 1.0,
        angularMomentum: VALIDATION_RANGES.ANGULAR_MOMENTUM.max,
      };
      
      const numStars = calculateNumberOfStars(cloudParams);
      expect(numStars).toBeGreaterThan(1);
    });
  });
});
