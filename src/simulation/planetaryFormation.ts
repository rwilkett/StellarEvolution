/**
 * Planetary Formation Module
 * Handles protoplanetary disk calculations and planet generation
 */

import {
  Star,
  Planet,
  ProtoplanetaryDisk,
  PlanetComposition,
} from '../types/core';
import {
  calculateDiskProperties,
  canFormPlanets,
  generatePlanetOrbitalDistances,
  determinePlanetComposition,
  calculatePlanetMass,
  calculatePlanetRadius,
} from '../physics/planetaryFormation';
import { calculateOrbitalPeriod } from '../physics/orbitalMechanics';
import {
  checkPlanetaryOrbitStability,
  checkNumericalStability,
  errorLogger,
  SimulationError,
  SimulationErrorType,
} from '../validation';

/**
 * Generate a unique planet ID
 */
function generatePlanetId(): string {
  return `planet-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create protoplanetary disk from star properties
 * Calculates disk mass, extent, and metallicity from initial cloud conditions
 * @param star - Host star object
 * @returns ProtoplanetaryDisk object or null if disk cannot form
 */
export function createProtoplanetaryDisk(star: Star): ProtoplanetaryDisk | null {
  // Calculate disk properties using physics functions
  const disk = calculateDiskProperties(
    star.id,
    star.mass,
    star.luminosity,
    star.metallicity
  );

  // Check if disk has sufficient mass for planet formation
  if (!canFormPlanets(disk.mass, star.mass)) {
    return null;
  }

  return disk;
}

/**
 * Determine if a disk has sufficient mass for planet formation
 * @param disk - ProtoplanetaryDisk object
 * @param stellarMass - Mass of the host star in solar masses
 * @returns True if planets can form
 */
export function hasSufficientMassForPlanets(
  disk: ProtoplanetaryDisk,
  stellarMass: number
): boolean {
  return canFormPlanets(disk.mass, stellarMass);
}

/**
 * Calculate disk metallicity from initial cloud conditions
 * The disk inherits the metallicity from the parent cloud
 * @param cloudMetallicity - Metallicity of the parent cloud relative to solar
 * @returns Disk metallicity relative to solar
 */
export function calculateDiskMetallicity(cloudMetallicity: number): number {
  // Disk metallicity is the same as cloud metallicity
  // In reality, there could be some enrichment or depletion, but we use a simple model
  return cloudMetallicity;
}

/**
 * Determine inner and outer radius of protoplanetary disk
 * Already implemented in calculateDiskProperties, this is a convenience wrapper
 * @param stellarMass - Mass of the host star in solar masses
 * @param stellarLuminosity - Luminosity of the host star in solar luminosities
 * @returns Object with innerRadius and outerRadius in AU
 */
export function determineDiskExtent(
  stellarMass: number,
  stellarLuminosity: number
): { innerRadius: number; outerRadius: number } {
  // Inner radius is determined by dust sublimation temperature (~1500K)
  const innerRadius = 0.05 * Math.sqrt(stellarLuminosity);
  
  // Outer radius scales with stellar mass
  const outerRadius = 30 * Math.pow(stellarMass, 0.5);
  
  return { innerRadius, outerRadius };
}

/**
 * Generate a single planet from disk properties and orbital distance
 * @param disk - ProtoplanetaryDisk object
 * @param star - Host star object
 * @param orbitalDistance - Distance from star in AU
 * @param planetIndex - Index for naming (0-based)
 * @returns Planet object with all properties
 * @throws SimulationError if planet parameters are invalid or orbit is unstable
 */
function generatePlanet(
  disk: ProtoplanetaryDisk,
  star: Star,
  orbitalDistance: number,
  planetIndex: number
): Planet {
  try {
    // Check numerical stability of orbital distance
    checkNumericalStability(orbitalDistance, 'orbital distance');
    
    // Determine planet composition based on distance from star
    const composition = determinePlanetComposition(
      orbitalDistance,
      disk.snowLine,
      disk.metallicity
    );

    // Calculate planet mass based on composition and disk properties
    const mass = calculatePlanetMass(composition, disk.mass, disk.metallicity);
    checkNumericalStability(mass, 'planet mass');

    // Calculate planet radius from mass and composition
    const radius = calculatePlanetRadius(mass, composition);
    checkNumericalStability(radius, 'planet radius');

    // Check orbital stability
    const isStable = checkPlanetaryOrbitStability(
      orbitalDistance,
      mass,
      star.radius,
      star.mass
    );
    
    if (!isStable) {
      // Log warning but continue - orbit may be dynamically unstable but still simulatable
      errorLogger.logError(
        new SimulationError(
          SimulationErrorType.ORBITAL_INSTABILITY,
          `Planet at ${orbitalDistance.toFixed(2)} AU may have unstable orbit around ${star.name}`,
          { orbitalDistance, starName: star.name, starMass: star.mass },
          true
        )
      );
    }

    // Calculate orbital parameters
    const orbitalPeriod = calculateOrbitalPeriod(orbitalDistance, star.mass);
    checkNumericalStability(orbitalPeriod, 'orbital period');
    
    // Eccentricity is typically low for planets (0-0.3)
    const eccentricity = Math.random() * 0.3;

    // Generate planet name
    const planetName = `${star.name}-${String.fromCharCode(98 + planetIndex)}`; // b, c, d, etc.

    // Create planet object
    const planet: Planet = {
      id: generatePlanetId(),
      name: planetName,
      mass,
      radius,
      composition,
      semiMajorAxis: orbitalDistance,
      eccentricity,
      orbitalPeriod,
      parentStarId: star.id,
      position: { x: orbitalDistance, y: 0, z: 0 }, // Initial position at perihelion
    };

    return planet;
  } catch (error) {
    if (error instanceof SimulationError) {
      throw error;
    }
    
    const simError = new SimulationError(
      SimulationErrorType.NUMERICAL_INSTABILITY,
      `Failed to generate planet at ${orbitalDistance.toFixed(2)} AU: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { orbitalDistance, starName: star.name, originalError: error },
      true
    );
    errorLogger.logError(simError);
    throw simError;
  }
}

/**
 * Generate planets from protoplanetary disk properties
 * Creates multiple planets with calculated masses, compositions, and orbital parameters
 * @param disk - ProtoplanetaryDisk object
 * @param star - Host star object
 * @param maxPlanets - Maximum number of planets to generate (default: 10)
 * @returns Array of Planet objects
 */
export function generatePlanets(
  disk: ProtoplanetaryDisk,
  star: Star,
  maxPlanets: number = 10
): Planet[] {
  try {
    // Check if disk can form planets
    if (!canFormPlanets(disk.mass, star.mass)) {
      return [];
    }

    // Generate orbital distances for planets
    const orbitalDistances = generatePlanetOrbitalDistances(
      disk.innerRadius,
      disk.outerRadius,
      star.mass,
      maxPlanets
    );

    // Generate planets at each orbital distance
    const planets: Planet[] = [];
    for (let i = 0; i < orbitalDistances.length; i++) {
      try {
        const planet = generatePlanet(disk, star, orbitalDistances[i], i);
        planets.push(planet);
      } catch (error) {
        // Log error but continue with other planets
        errorLogger.logError(
          new SimulationError(
            SimulationErrorType.NUMERICAL_INSTABILITY,
            `Failed to generate planet ${i} at ${orbitalDistances[i].toFixed(2)} AU: ${error instanceof Error ? error.message : 'Unknown error'}`,
            { planetIndex: i, orbitalDistance: orbitalDistances[i], starName: star.name },
            true
          )
        );
        // Skip this planet and continue
      }
    }

    return planets;
  } catch (error) {
    // Log error and return empty array
    errorLogger.logError(
      new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        `Failed to generate planets for star ${star.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { starName: star.name, starMass: star.mass, originalError: error },
        true
      )
    );
    return [];
  }
}

/**
 * Calculate planet mass distribution across the disk
 * Distributes total available mass among planets based on their positions
 * @param disk - ProtoplanetaryDisk object
 * @param numPlanets - Number of planets to distribute mass among
 * @returns Array of planet masses in Earth masses
 */
export function calculatePlanetMassDistribution(
  disk: ProtoplanetaryDisk,
  numPlanets: number
): number[] {
  if (numPlanets === 0) {
    return [];
  }

  // Convert disk mass to Earth masses (1 solar mass ≈ 333,000 Earth masses)
  const totalDiskMassEarth = disk.mass * 333000;
  
  // Planets typically capture 1-10% of disk mass
  const availableMass = totalDiskMassEarth * 0.05;

  // Distribute mass with some randomness
  const masses: number[] = [];
  let remainingMass = availableMass;

  for (let i = 0; i < numPlanets; i++) {
    // Each planet gets a fraction of remaining mass
    const fraction = 0.1 + Math.random() * 0.3;
    const planetMass = Math.min(remainingMass * fraction, remainingMass / (numPlanets - i));
    masses.push(planetMass);
    remainingMass -= planetMass;
  }

  return masses;
}

/**
 * Calculate orbital parameters for a planet
 * @param orbitalDistance - Semi-major axis in AU
 * @param stellarMass - Mass of the host star in solar masses
 * @param eccentricity - Orbital eccentricity (default: random 0-0.3)
 * @returns Object with orbital parameters
 */
export function calculatePlanetOrbitalParameters(
  orbitalDistance: number,
  stellarMass: number,
  eccentricity?: number
): {
  semiMajorAxis: number;
  eccentricity: number;
  orbitalPeriod: number;
} {
  const e = eccentricity !== undefined ? eccentricity : Math.random() * 0.3;
  const period = calculateOrbitalPeriod(orbitalDistance, stellarMass);

  return {
    semiMajorAxis: orbitalDistance,
    eccentricity: e,
    orbitalPeriod: period,
  };
}

/**
 * Determine planet composition based on distance from star and metallicity
 * Wrapper for physics function with additional logic
 * @param orbitalDistance - Distance from star in AU
 * @param snowLine - Snow line distance in AU
 * @param metallicity - System metallicity relative to solar
 * @returns Planet composition type
 */
export function determinePlanetType(
  orbitalDistance: number,
  snowLine: number,
  metallicity: number
): PlanetComposition {
  return determinePlanetComposition(orbitalDistance, snowLine, metallicity);
}

/**
 * Create Planet objects with all required properties
 * High-level function that combines disk and star properties to generate a complete planet
 * @param disk - ProtoplanetaryDisk object
 * @param star - Host star object
 * @param orbitalDistance - Distance from star in AU
 * @param name - Optional custom name for the planet
 * @returns Planet object with all properties
 */
export function createPlanet(
  disk: ProtoplanetaryDisk,
  star: Star,
  orbitalDistance: number,
  name?: string
): Planet {
  // Determine composition
  const composition = determinePlanetComposition(
    orbitalDistance,
    disk.snowLine,
    disk.metallicity
  );

  // Calculate mass and radius
  const mass = calculatePlanetMass(composition, disk.mass, disk.metallicity);
  const radius = calculatePlanetRadius(mass, composition);

  // Calculate orbital parameters
  const orbitalPeriod = calculateOrbitalPeriod(orbitalDistance, star.mass);
  const eccentricity = Math.random() * 0.3;

  // Create planet object
  const planet: Planet = {
    id: generatePlanetId(),
    name: name || `Planet-${orbitalDistance.toFixed(2)}AU`,
    mass,
    radius,
    composition,
    semiMajorAxis: orbitalDistance,
    eccentricity,
    orbitalPeriod,
    parentStarId: star.id,
    position: { x: orbitalDistance, y: 0, z: 0 },
  };

  return planet;
}
