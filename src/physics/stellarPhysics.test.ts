/**
 * Unit tests for stellar physics calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLuminosity,
  calculateRadius,
  calculateMainSequenceLifetime,
  calculateTemperature,
  determineSpectralType,
} from './stellarPhysics';
import { SpectralType } from '../types/core';

describe('Stellar Physics', () => {
  describe('calculateLuminosity', () => {
    it('should calculate solar luminosity for solar mass', () => {
      const luminosity = calculateLuminosity(1.0);
      expect(luminosity).toBeCloseTo(1.0, 1);
    });

    it('should calculate luminosity for low mass star', () => {
      const luminosity = calculateLuminosity(0.1);
      expect(luminosity).toBeGreaterThan(0);
      expect(luminosity).toBeLessThan(0.01);
    });

    it('should calculate luminosity for high mass star', () => {
      const luminosity = calculateLuminosity(10);
      expect(luminosity).toBeGreaterThan(1000);
    });

    it('should handle very high mass stars', () => {
      const luminosity = calculateLuminosity(100);
      expect(luminosity).toBeGreaterThan(0);
      expect(luminosity).toBeLessThan(1e6);
    });
  });

  describe('calculateRadius', () => {
    it('should calculate solar radius for solar mass', () => {
      const radius = calculateRadius(1.0);
      expect(radius).toBeCloseTo(1.0, 1);
    });

    it('should calculate radius for low mass star', () => {
      const radius = calculateRadius(0.1);
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(1.0);
    });

    it('should calculate radius for high mass star', () => {
      const radius = calculateRadius(10);
      expect(radius).toBeGreaterThan(1.0);
    });
  });

  describe('calculateMainSequenceLifetime', () => {
    it('should calculate ~10 Gyr lifetime for solar mass star', () => {
      const lifetime = calculateMainSequenceLifetime(1.0);
      expect(lifetime).toBeCloseTo(1e10, -9);
    });

    it('should calculate longer lifetime for low mass stars', () => {
      const lifetimeLow = calculateMainSequenceLifetime(0.5);
      const lifetimeSolar = calculateMainSequenceLifetime(1.0);
      expect(lifetimeLow).toBeGreaterThan(lifetimeSolar);
    });

    it('should calculate shorter lifetime for high mass stars', () => {
      const lifetimeHigh = calculateMainSequenceLifetime(10);
      const lifetimeSolar = calculateMainSequenceLifetime(1.0);
      expect(lifetimeHigh).toBeLessThan(lifetimeSolar);
    });
  });

  describe('calculateTemperature', () => {
    it('should calculate solar temperature for solar luminosity and radius', () => {
      const temperature = calculateTemperature(1.0, 1.0);
      expect(temperature).toBeCloseTo(5778, -2);
    });

    it('should calculate higher temperature for higher luminosity', () => {
      const temp1 = calculateTemperature(1.0, 1.0);
      const temp2 = calculateTemperature(10.0, 1.0);
      expect(temp2).toBeGreaterThan(temp1);
    });
  });

  describe('determineSpectralType', () => {
    it('should classify solar temperature as G type', () => {
      const spectralType = determineSpectralType(5778);
      expect(spectralType).toBe(SpectralType.G);
    });

    it('should classify hot stars as O type', () => {
      const spectralType = determineSpectralType(35000);
      expect(spectralType).toBe(SpectralType.O);
    });

    it('should classify cool stars as M type', () => {
      const spectralType = determineSpectralType(3000);
      expect(spectralType).toBe(SpectralType.M);
    });
  });
});
