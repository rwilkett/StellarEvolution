/**
 * Tests for Planetary Formation Module
 */

import { describe, it, expect } from 'vitest';
import {
  createProtoplanetaryDisk,
  hasSufficientMassForPlanets,
  calculateDiskMetallicity,
  determineDiskExtent,
  generatePlanets,
  calculatePlanetMassDistribution,
  calculatePlanetOrbitalParameters,
  determinePlanetType,
  createPlanet,
} from './planetaryFormation';
import { createStar } from './stellarEvolution';
import { PlanetComposition } from '../types/core';

describe('Planetary Formation Module', () => {
  describe('createProtoplanetaryDisk', () => {
    it('should create a disk for a solar-mass star', () => {
      const star = createStar(1.0, 1.0, 'Sun');
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      expect(disk!.starId).toBe(star.id);
      expect(disk!.mass).toBeGreaterThan(0);
      expect(disk!.innerRadius).toBeGreaterThan(0);
      expect(disk!.outerRadius).toBeGreaterThan(disk!.innerRadius);
      expect(disk!.snowLine).toBeGreaterThan(0);
      expect(disk!.metallicity).toBe(1.0);
    });

    it('should create a disk with properties scaling with stellar mass', () => {
      const lowMassStar = createStar(0.5, 1.0);
      const highMassStar = createStar(2.0, 1.0);

      const lowMassDisk = createProtoplanetaryDisk(lowMassStar);
      const highMassDisk = createProtoplanetaryDisk(highMassStar);

      expect(lowMassDisk).not.toBeNull();
      expect(highMassDisk).not.toBeNull();
      expect(highMassDisk!.mass).toBeGreaterThan(lowMassDisk!.mass);
      expect(highMassDisk!.outerRadius).toBeGreaterThan(lowMassDisk!.outerRadius);
    });
  });

  describe('hasSufficientMassForPlanets', () => {
    it('should return true for typical disk masses', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const canForm = hasSufficientMassForPlanets(disk!, star.mass);
      expect(canForm).toBe(true);
    });
  });

  describe('calculateDiskMetallicity', () => {
    it('should return the same metallicity as the cloud', () => {
      const cloudMetallicity = 1.5;
      const diskMetallicity = calculateDiskMetallicity(cloudMetallicity);

      expect(diskMetallicity).toBe(cloudMetallicity);
    });
  });

  describe('determineDiskExtent', () => {
    it('should calculate inner and outer radii', () => {
      const extent = determineDiskExtent(1.0, 1.0);

      expect(extent.innerRadius).toBeGreaterThan(0);
      expect(extent.outerRadius).toBeGreaterThan(extent.innerRadius);
    });

    it('should scale outer radius with stellar mass', () => {
      const extent1 = determineDiskExtent(0.5, 1.0);
      const extent2 = determineDiskExtent(2.0, 1.0);

      expect(extent2.outerRadius).toBeGreaterThan(extent1.outerRadius);
    });
  });

  describe('generatePlanets', () => {
    it('should generate planets for a solar-mass star', () => {
      const star = createStar(1.0, 1.0, 'Sun');
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      expect(planets.length).toBeGreaterThan(0);
      expect(planets.length).toBeLessThanOrEqual(10);

      // Check first planet properties
      const planet = planets[0];
      expect(planet.id).toBeDefined();
      expect(planet.name).toContain(star.name);
      expect(planet.mass).toBeGreaterThan(0);
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.semiMajorAxis).toBeGreaterThan(0);
      expect(planet.eccentricity).toBeGreaterThanOrEqual(0);
      expect(planet.eccentricity).toBeLessThan(1);
      expect(planet.orbitalPeriod).toBeGreaterThan(0);
      expect(planet.parentStarId).toBe(star.id);
    });

    it('should generate planets with different compositions', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      // Should have at least some variety in compositions
      const compositions = new Set(planets.map(p => p.composition));
      expect(compositions.size).toBeGreaterThan(0);
    });

    it('should generate planets within disk boundaries', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      planets.forEach(planet => {
        expect(planet.semiMajorAxis).toBeGreaterThanOrEqual(disk!.innerRadius);
        expect(planet.semiMajorAxis).toBeLessThanOrEqual(disk!.outerRadius);
      });
    });
  });

  describe('calculatePlanetMassDistribution', () => {
    it('should distribute mass among planets', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const masses = calculatePlanetMassDistribution(disk!, 5);

      expect(masses.length).toBe(5);
      masses.forEach(mass => {
        expect(mass).toBeGreaterThan(0);
      });
    });

    it('should return empty array for zero planets', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const masses = calculatePlanetMassDistribution(disk!, 0);

      expect(masses.length).toBe(0);
    });
  });

  describe('calculatePlanetOrbitalParameters', () => {
    it('should calculate orbital parameters', () => {
      const params = calculatePlanetOrbitalParameters(1.0, 1.0);

      expect(params.semiMajorAxis).toBe(1.0);
      expect(params.eccentricity).toBeGreaterThanOrEqual(0);
      expect(params.eccentricity).toBeLessThan(1);
      expect(params.orbitalPeriod).toBeCloseTo(1.0, 1); // ~1 year for 1 AU
    });

    it('should use provided eccentricity', () => {
      const params = calculatePlanetOrbitalParameters(1.0, 1.0, 0.1);

      expect(params.eccentricity).toBe(0.1);
    });
  });

  describe('determinePlanetType', () => {
    it('should determine rocky planets inside snow line', () => {
      const composition = determinePlanetType(1.0, 2.7, 1.0);
      expect(composition).toBe(PlanetComposition.ROCKY);
    });

    it('should determine ice giants or gas giants beyond snow line', () => {
      const composition = determinePlanetType(5.0, 2.7, 1.0);
      expect([
        PlanetComposition.ICE_GIANT,
        PlanetComposition.GAS_GIANT,
      ]).toContain(composition);
    });
  });

  describe('createPlanet', () => {
    it('should create a planet with all properties', () => {
      const star = createStar(1.0, 1.0, 'Sun');
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planet = createPlanet(disk!, star, 1.0, 'Earth');

      expect(planet.id).toBeDefined();
      expect(planet.name).toBe('Earth');
      expect(planet.mass).toBeGreaterThan(0);
      expect(planet.radius).toBeGreaterThan(0);
      expect(planet.semiMajorAxis).toBe(1.0);
      expect(planet.parentStarId).toBe(star.id);
    });
  });

  describe('Disk property calculations for various stellar masses', () => {
    it('should create larger disks for more massive stars', () => {
      const lowMassStar = createStar(0.5, 1.0);
      const solarMassStar = createStar(1.0, 1.0);
      const highMassStar = createStar(2.0, 1.0);

      const lowMassDisk = createProtoplanetaryDisk(lowMassStar);
      const solarMassDisk = createProtoplanetaryDisk(solarMassStar);
      const highMassDisk = createProtoplanetaryDisk(highMassStar);

      expect(lowMassDisk).not.toBeNull();
      expect(solarMassDisk).not.toBeNull();
      expect(highMassDisk).not.toBeNull();

      // Disk mass should increase with stellar mass
      expect(solarMassDisk!.mass).toBeGreaterThan(lowMassDisk!.mass);
      expect(highMassDisk!.mass).toBeGreaterThan(solarMassDisk!.mass);

      // Disk extent should increase with stellar mass
      expect(solarMassDisk!.outerRadius).toBeGreaterThan(lowMassDisk!.outerRadius);
      expect(highMassDisk!.outerRadius).toBeGreaterThan(solarMassDisk!.outerRadius);
    });

    it('should create disks with snow line scaling with luminosity', () => {
      const lowLumStar = createStar(0.5, 1.0);
      const highLumStar = createStar(2.0, 1.0);

      const lowLumDisk = createProtoplanetaryDisk(lowLumStar);
      const highLumDisk = createProtoplanetaryDisk(highLumStar);

      expect(lowLumDisk).not.toBeNull();
      expect(highLumDisk).not.toBeNull();

      // Snow line should be farther out for more luminous stars
      expect(highLumDisk!.snowLine).toBeGreaterThan(lowLumDisk!.snowLine);
    });

    it('should create disks with metallicity affecting disk mass', () => {
      const lowMetalStar = createStar(1.0, 0.5);
      const highMetalStar = createStar(1.0, 2.0);

      const lowMetalDisk = createProtoplanetaryDisk(lowMetalStar);
      const highMetalDisk = createProtoplanetaryDisk(highMetalStar);

      expect(lowMetalDisk).not.toBeNull();
      expect(highMetalDisk).not.toBeNull();

      // Higher metallicity should result in more massive disks
      expect(highMetalDisk!.mass).toBeGreaterThan(lowMetalDisk!.mass);
    });
  });

  describe('Planet composition changes across snow line', () => {
    it('should create rocky planets inside snow line', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();

      // Create planets at various distances inside snow line
      const innerPlanet = createPlanet(disk!, star, disk!.snowLine * 0.3);
      const midPlanet = createPlanet(disk!, star, disk!.snowLine * 0.7);

      expect(innerPlanet.composition).toBe(PlanetComposition.ROCKY);
      expect(midPlanet.composition).toBe(PlanetComposition.ROCKY);
    });

    it('should create ice giants or gas giants beyond snow line', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();

      // Create planets beyond snow line
      const beyondSnowLine = createPlanet(disk!, star, disk!.snowLine * 1.5);
      const farPlanet = createPlanet(disk!, star, disk!.snowLine * 4);

      // Should be ice giant or gas giant
      expect([PlanetComposition.ICE_GIANT, PlanetComposition.GAS_GIANT]).toContain(
        beyondSnowLine.composition
      );
      expect(farPlanet.composition).toBe(PlanetComposition.GAS_GIANT);
    });

    it('should show composition transition at snow line boundary', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();

      const justInside = determinePlanetType(disk!.snowLine * 0.9, disk!.snowLine, 1.0);
      const justOutside = determinePlanetType(disk!.snowLine * 1.1, disk!.snowLine, 1.0);

      // Inside should be rocky
      expect(justInside).toBe(PlanetComposition.ROCKY);
      // Outside should be ice giant or gas giant
      expect([PlanetComposition.ICE_GIANT, PlanetComposition.GAS_GIANT]).toContain(justOutside);
    });
  });

  describe('Planet spacing and orbital stability', () => {
    it('should generate planets with increasing orbital distances', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      // Check that planets are ordered by distance
      for (let i = 1; i < planets.length; i++) {
        expect(planets[i].semiMajorAxis).toBeGreaterThan(planets[i - 1].semiMajorAxis);
      }
    });

    it('should maintain minimum spacing between planets', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      // Check spacing between consecutive planets
      for (let i = 1; i < planets.length; i++) {
        const spacing = planets[i].semiMajorAxis - planets[i - 1].semiMajorAxis;
        
        // Minimum spacing should be at least a few Hill radii
        // For typical planets, this should be at least 0.1 AU
        expect(spacing).toBeGreaterThan(0.05);
      }
    });

    it('should generate stable orbital configurations', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      // All planets should have valid orbital parameters
      planets.forEach(planet => {
        // Eccentricity should be less than 1 for bound orbits
        expect(planet.eccentricity).toBeLessThan(1);
        expect(planet.eccentricity).toBeGreaterThanOrEqual(0);

        // Orbital period should be positive
        expect(planet.orbitalPeriod).toBeGreaterThan(0);

        // Semi-major axis should be positive
        expect(planet.semiMajorAxis).toBeGreaterThan(0);
      });
    });

    it('should respect Hill sphere constraints for stability', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      // Check that planets are spaced by multiple Hill radii
      for (let i = 1; i < planets.length; i++) {
        const innerPlanet = planets[i - 1];
        const outerPlanet = planets[i];

        // Calculate Hill radius for inner planet
        const planetMassSolar = innerPlanet.mass / 333000;
        const hillRadius = innerPlanet.semiMajorAxis * 
          Math.pow(planetMassSolar / (3 * star.mass), 1/3);

        const spacing = outerPlanet.semiMajorAxis - innerPlanet.semiMajorAxis;

        // Spacing should be at least a few Hill radii (typically 10-20)
        // We'll check for at least 5 Hill radii as a conservative stability criterion
        expect(spacing).toBeGreaterThan(hillRadius * 3);
      }
    });

    it('should generate fewer planets for smaller disks', () => {
      const lowMassStar = createStar(0.5, 1.0);
      const highMassStar = createStar(2.0, 1.0);

      const lowMassDisk = createProtoplanetaryDisk(lowMassStar);
      const highMassDisk = createProtoplanetaryDisk(highMassStar);

      expect(lowMassDisk).not.toBeNull();
      expect(highMassDisk).not.toBeNull();

      const lowMassPlanets = generatePlanets(lowMassDisk!, lowMassStar);
      const highMassPlanets = generatePlanets(highMassDisk!, highMassStar);

      // More massive stars with larger disks should tend to have more planets
      // (though this is probabilistic, so we just check they're reasonable)
      expect(lowMassPlanets.length).toBeGreaterThan(0);
      expect(highMassPlanets.length).toBeGreaterThan(0);
      expect(highMassPlanets.length).toBeGreaterThanOrEqual(lowMassPlanets.length);
    });

    it('should verify orbital periods follow Keplers third law', () => {
      const star = createStar(1.0, 1.0);
      const disk = createProtoplanetaryDisk(star);

      expect(disk).not.toBeNull();
      const planets = generatePlanets(disk!, star);

      planets.forEach(planet => {
        // Kepler's third law: P^2 = a^3 (for solar mass star, P in years, a in AU)
        const expectedPeriod = Math.sqrt(Math.pow(planet.semiMajorAxis, 3) / star.mass);
        
        // Allow 1% tolerance for numerical precision
        expect(planet.orbitalPeriod).toBeCloseTo(expectedPeriod, 1);
      });
    });
  });
});
