/**
 * Unit tests for derived cloud properties calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateDensity,
  calculateVirialParameter,
  calculateJeansMass,
  calculateCollapseTimescale,
  calculateTurbulentJeansLength,
  calculateMagneticFluxToMassRatio,
  calculateDerivedProperties,
} from './derivedCloudProperties';
import { CloudParameters } from '../types/core';

describe('Derived Cloud Properties', () => {
  describe('calculateDensity', () => {
    it('should calculate density for typical molecular cloud', () => {
      // Typical molecular cloud: 10 M☉, 10 pc radius
      const density = calculateDensity(10, 10);
      
      // Typical molecular cloud densities: 0.01-1 particles/cm³ for large clouds
      expect(density).toBeGreaterThan(0.001);
      expect(density).toBeLessThan(10);
    });

    it('should calculate higher density for smaller radius', () => {
      const densityLarge = calculateDensity(10, 10);
      const densitySmall = calculateDensity(10, 5);
      
      // Smaller radius should give higher density (ρ ∝ 1/R³)
      expect(densitySmall).toBeGreaterThan(densityLarge);
      expect(densitySmall / densityLarge).toBeCloseTo(8, 0); // (10/5)³ = 8
    });

    it('should calculate higher density for larger mass', () => {
      const densityLow = calculateDensity(10, 10);
      const densityHigh = calculateDensity(20, 10);
      
      // Higher mass should give higher density (ρ ∝ M)
      expect(densityHigh).toBeGreaterThan(densityLow);
      expect(densityHigh / densityLow).toBeCloseTo(2, 0);
    });

    it('should handle very dense clouds', () => {
      // Dense cloud core: 1 M☉, 0.1 pc
      const density = calculateDensity(1, 0.1);
      
      expect(density).toBeGreaterThan(1000);
      expect(density).toBeLessThan(1e8);
    });

    it('should handle diffuse clouds', () => {
      // Diffuse cloud: 100 M☉, 100 pc
      const density = calculateDensity(100, 100);
      
      expect(density).toBeGreaterThan(0.0001);
      expect(density).toBeLessThan(0.01);
    });
  });

  describe('calculateVirialParameter', () => {
    it('should calculate virial parameter for bound cloud', () => {
      // Bound cloud: very low turbulence, very high mass, very small radius
      const virialParam = calculateVirialParameter(1000, 2, 0.2);
      
      // Should be < 2 for bound cloud
      expect(virialParam).toBeLessThan(2);
      expect(virialParam).toBeGreaterThan(0);
    });

    it('should calculate virial parameter for unbound cloud', () => {
      // Unbound cloud: high turbulence
      const virialParam = calculateVirialParameter(10, 10, 5);
      
      // Should be > 2 for unbound cloud
      expect(virialParam).toBeGreaterThan(2);
    });

    it('should increase with higher turbulence velocity', () => {
      const virialLow = calculateVirialParameter(10, 10, 1);
      const virialHigh = calculateVirialParameter(10, 10, 2);
      
      // α_vir ∝ σ²
      expect(virialHigh).toBeGreaterThan(virialLow);
      expect(virialHigh / virialLow).toBeCloseTo(4, 0); // (2/1)² = 4
    });

    it('should decrease with higher mass', () => {
      const virialLowMass = calculateVirialParameter(10, 10, 1);
      const virialHighMass = calculateVirialParameter(20, 10, 1);
      
      // α_vir ∝ 1/M
      expect(virialHighMass).toBeLessThan(virialLowMass);
      expect(virialLowMass / virialHighMass).toBeCloseTo(2, 0);
    });

    it('should increase with larger radius', () => {
      const virialSmall = calculateVirialParameter(10, 5, 1);
      const virialLarge = calculateVirialParameter(10, 10, 1);
      
      // α_vir ∝ R
      expect(virialLarge).toBeGreaterThan(virialSmall);
      expect(virialLarge / virialSmall).toBeCloseTo(2, 0);
    });
  });

  describe('calculateJeansMass', () => {
    it('should calculate Jeans mass for typical molecular cloud', () => {
      // Typical: T=20K, ρ=100 particles/cm³
      const jeansMass = calculateJeansMass(20, 100);
      
      // Typical Jeans mass: 10-1000 M☉ for these conditions
      expect(jeansMass).toBeGreaterThan(1);
      expect(jeansMass).toBeLessThan(1000);
    });

    it('should increase with higher temperature', () => {
      const jeansCold = calculateJeansMass(10, 100);
      const jeansWarm = calculateJeansMass(40, 100);
      
      // M_J ∝ T^(3/2)
      expect(jeansWarm).toBeGreaterThan(jeansCold);
      expect(jeansWarm / jeansCold).toBeCloseTo(8, 0); // (40/10)^1.5 = 8
    });

    it('should decrease with higher density', () => {
      const jeansLowDensity = calculateJeansMass(20, 50);
      const jeansHighDensity = calculateJeansMass(20, 200);
      
      // M_J ∝ ρ^(-1/2)
      expect(jeansHighDensity).toBeLessThan(jeansLowDensity);
      expect(jeansLowDensity / jeansHighDensity).toBeCloseTo(2, 0); // (200/50)^0.5 = 2
    });

    it('should handle cold dense clouds', () => {
      // Cold dense cloud: T=5K, ρ=1000 particles/cm³
      const jeansMass = calculateJeansMass(5, 1000);
      
      expect(jeansMass).toBeGreaterThan(0.01);
      expect(jeansMass).toBeLessThan(10);
    });

    it('should handle warm diffuse clouds', () => {
      // Warm diffuse cloud: T=100K, ρ=10 particles/cm³
      const jeansMass = calculateJeansMass(100, 10);
      
      expect(jeansMass).toBeGreaterThan(100);
      expect(jeansMass).toBeLessThan(10000);
    });
  });

  describe('calculateCollapseTimescale', () => {
    it('should calculate collapse timescale for typical molecular cloud', () => {
      // Typical density: 100 particles/cm³
      const timescale = calculateCollapseTimescale(100);
      
      // Typical collapse time: 10^5 to 10^6 years
      expect(timescale).toBeGreaterThan(1e4);
      expect(timescale).toBeLessThan(1e7);
    });

    it('should decrease with higher density', () => {
      const timescaleLow = calculateCollapseTimescale(100);
      const timescaleHigh = calculateCollapseTimescale(400);
      
      // t_ff ∝ ρ^(-1/2)
      expect(timescaleHigh).toBeLessThan(timescaleLow);
      expect(timescaleLow / timescaleHigh).toBeCloseTo(2, 0); // (400/100)^0.5 = 2
    });

    it('should handle dense cloud cores', () => {
      // Dense core: 10000 particles/cm³
      const timescale = calculateCollapseTimescale(10000);
      
      // Should be relatively short
      expect(timescale).toBeGreaterThan(1e3);
      expect(timescale).toBeLessThan(1e6);
    });

    it('should handle diffuse clouds', () => {
      // Diffuse cloud: 10 particles/cm³
      const timescale = calculateCollapseTimescale(10);
      
      // Should be relatively long
      expect(timescale).toBeGreaterThan(1e5);
      expect(timescale).toBeLessThan(1e8);
    });
  });

  describe('calculateTurbulentJeansLength', () => {
    it('should calculate turbulent Jeans length for typical cloud', () => {
      const length = calculateTurbulentJeansLength(1, 100);
      
      // Typical length: 0.1-10 pc
      expect(length).toBeGreaterThan(0.01);
      expect(length).toBeLessThan(100);
    });

    it('should increase with higher turbulence velocity', () => {
      const lengthLow = calculateTurbulentJeansLength(1, 100);
      const lengthHigh = calculateTurbulentJeansLength(2, 100);
      
      // λ_J,turb ∝ σ
      expect(lengthHigh).toBeGreaterThan(lengthLow);
      expect(lengthHigh / lengthLow).toBeCloseTo(2, 0);
    });

    it('should decrease with higher density', () => {
      const lengthLowDensity = calculateTurbulentJeansLength(1, 50);
      const lengthHighDensity = calculateTurbulentJeansLength(1, 200);
      
      // λ_J,turb ∝ ρ^(-1/2)
      expect(lengthHighDensity).toBeLessThan(lengthLowDensity);
      expect(lengthLowDensity / lengthHighDensity).toBeCloseTo(2, 0);
    });
  });

  describe('calculateMagneticFluxToMassRatio', () => {
    it('should calculate flux-to-mass ratio for typical cloud', () => {
      // Typical: B=10 μG, R=10 pc, M=10 M☉
      const ratio = calculateMagneticFluxToMassRatio(10, 10, 10);
      
      // Should be positive and physically reasonable
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThan(1e20);
    });

    it('should increase with stronger magnetic field', () => {
      const ratioWeak = calculateMagneticFluxToMassRatio(10, 10, 10);
      const ratioStrong = calculateMagneticFluxToMassRatio(100, 10, 10);
      
      // λ ∝ B
      expect(ratioStrong).toBeGreaterThan(ratioWeak);
      expect(ratioStrong / ratioWeak).toBeCloseTo(10, 0);
    });

    it('should increase with larger radius', () => {
      const ratioSmall = calculateMagneticFluxToMassRatio(10, 5, 10);
      const ratioLarge = calculateMagneticFluxToMassRatio(10, 10, 10);
      
      // λ ∝ R²
      expect(ratioLarge).toBeGreaterThan(ratioSmall);
      expect(ratioLarge / ratioSmall).toBeCloseTo(4, 0); // (10/5)² = 4
    });

    it('should decrease with higher mass', () => {
      const ratioLowMass = calculateMagneticFluxToMassRatio(10, 10, 10);
      const ratioHighMass = calculateMagneticFluxToMassRatio(10, 10, 20);
      
      // λ ∝ 1/M
      expect(ratioHighMass).toBeLessThan(ratioLowMass);
      expect(ratioLowMass / ratioHighMass).toBeCloseTo(2, 0);
    });
  });

  describe('calculateDerivedProperties', () => {
    it('should calculate all derived properties for typical cloud', () => {
      const params: CloudParameters = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 1,
        magneticFieldStrength: 10,
      };
      
      const derived = calculateDerivedProperties(params);
      
      expect(derived.density).toBeGreaterThan(0);
      expect(derived.virialParameter).toBeGreaterThan(0);
      expect(derived.jeansMass).toBeGreaterThan(0);
      expect(derived.collapseTimescale).toBeGreaterThan(0);
      expect(derived.turbulentJeansLength).toBeGreaterThan(0);
      expect(derived.magneticFluxToMassRatio).toBeGreaterThan(0);
      expect(typeof derived.isBound).toBe('boolean');
    });

    it('should identify bound cloud correctly', () => {
      const params: CloudParameters = {
        mass: 1000,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 2, // Very small radius
        turbulenceVelocity: 0.2, // Very low turbulence
        magneticFieldStrength: 10,
      };
      
      const derived = calculateDerivedProperties(params);
      
      expect(derived.virialParameter).toBeLessThan(2);
      expect(derived.isBound).toBe(true);
    });

    it('should identify unbound cloud correctly', () => {
      const params: CloudParameters = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 20,
        radius: 10,
        turbulenceVelocity: 5, // High turbulence
        magneticFieldStrength: 10,
      };
      
      const derived = calculateDerivedProperties(params);
      
      expect(derived.virialParameter).toBeGreaterThan(2);
      expect(derived.isBound).toBe(false);
    });

    it('should apply defaults for missing optional parameters', () => {
      const params: CloudParameters = {
        mass: 10,
        metallicity: 1.0,
        angularMomentum: 1e48,
        // No optional parameters provided
      };
      
      const derived = calculateDerivedProperties(params);
      
      // Should still calculate all properties using defaults
      expect(derived.density).toBeGreaterThan(0);
      expect(derived.virialParameter).toBeGreaterThan(0);
      expect(derived.jeansMass).toBeGreaterThan(0);
      expect(derived.collapseTimescale).toBeGreaterThan(0);
    });

    it('should produce physically reasonable results for cold dense cloud', () => {
      const params: CloudParameters = {
        mass: 1000,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 10, // Cold
        radius: 2, // Very small
        turbulenceVelocity: 0.2, // Very low turbulence
        magneticFieldStrength: 10,
      };
      
      const derived = calculateDerivedProperties(params);
      
      // Cold dense clouds should be bound and have relatively short collapse times
      expect(derived.isBound).toBe(true);
      expect(derived.collapseTimescale).toBeLessThan(1e7);
      expect(derived.jeansMass).toBeGreaterThan(0);
    });

    it('should produce physically reasonable results for warm diffuse cloud', () => {
      const params: CloudParameters = {
        mass: 100,
        metallicity: 1.0,
        angularMomentum: 1e48,
        temperature: 50, // Warm
        radius: 50, // Large
        turbulenceVelocity: 3, // High turbulence
        magneticFieldStrength: 10,
      };
      
      const derived = calculateDerivedProperties(params);
      
      // Warm diffuse clouds may be unbound and have longer collapse times
      expect(derived.collapseTimescale).toBeGreaterThan(1e5);
      expect(derived.jeansMass).toBeGreaterThan(1);
    });
  });
});
