/**
 * Cloud Formation Module
 * Handles the collapse of interstellar clouds and fragmentation into stars
 */

import { CloudParameters } from '../types/core';
import { PHYSICS_CONSTANTS, VALIDATION_RANGES } from '../constants/physics';

/**
 * Calculate the Jeans mass for a cloud
 * The Jeans mass is the critical mass above which a cloud will collapse under its own gravity
 * 
 * Simplified formula: M_J ≈ (T^1.5) / (ρ^0.5)
 * For this simulation, we use a normalized approach based on cloud parameters
 * 
 * @param cloudParams - Cloud parameters
 * @returns Jeans mass in solar masses
 */
export function calculateJeansMass(cloudParams: CloudParameters): number {
  // Simplified Jeans mass calculation
  // In reality, this depends on temperature and density
  // For simulation purposes, we assume the cloud is near the Jeans instability
  // and use the cloud mass as a reference
  
  // Typical molecular cloud temperature: ~10-20 K
  const temperature = 15; // Kelvin
  
  // Estimate density from mass and typical cloud size
  // Typical molecular cloud: ~10-100 pc diameter
  const typicalCloudRadius = 10 * PHYSICS_CONSTANTS.PARSEC; // meters
  const volume = (4/3) * Math.PI * Math.pow(typicalCloudRadius, 3);
  const density = (cloudParams.mass * PHYSICS_CONSTANTS.SOLAR_MASS) / volume;
  
  // Jeans mass formula (simplified)
  // M_J ∝ T^(3/2) / sqrt(ρ)
  const jeansMass = PHYSICS_CONSTANTS.JEANS_MASS_COEFFICIENT * 
                    Math.pow(temperature, 1.5) / Math.sqrt(density);
  
  // Convert to solar masses
  return jeansMass / PHYSICS_CONSTANTS.SOLAR_MASS;
}

/**
 * Determine if a cloud will fragment into multiple stars
 * Fragmentation depends on angular momentum and turbulence
 * 
 * @param cloudParams - Cloud parameters
 * @returns Number of stars that will form
 */
export function determineFragmentation(cloudParams: CloudParameters): number {
  const { mass, angularMomentum } = cloudParams;
  
  // Calculate normalized angular momentum
  // Higher angular momentum leads to more fragmentation
  const typicalRadius = 10 * PHYSICS_CONSTANTS.PARSEC;
  const typicalVelocity = 1000; // m/s (typical molecular cloud velocity dispersion)
  const typicalAngularMomentum = mass * PHYSICS_CONSTANTS.SOLAR_MASS * 
                                  typicalRadius * typicalVelocity;
  
  const normalizedAngularMomentum = angularMomentum / typicalAngularMomentum;
  
  // Determine number of fragments based on mass and angular momentum
  // Low mass clouds typically form single stars
  // High mass clouds with high angular momentum fragment more
  
  if (mass < 1.0) {
    // Low mass clouds: single star or binary
    if (normalizedAngularMomentum > 0.5) {
      return 2; // Binary system
    }
    return 1; // Single star
  } else if (mass < 10.0) {
    // Medium mass clouds: 1-3 stars
    if (normalizedAngularMomentum > 1.0) {
      return 3;
    } else if (normalizedAngularMomentum > 0.5) {
      return 2;
    }
    return 1;
  } else if (mass < 100.0) {
    // High mass clouds: 2-5 stars
    const baseFragments = 2;
    const additionalFragments = Math.floor(normalizedAngularMomentum * 2);
    return Math.min(baseFragments + additionalFragments, 5);
  } else {
    // Very high mass clouds: 3-10 stars
    const baseFragments = 3;
    const additionalFragments = Math.floor(normalizedAngularMomentum * 3);
    return Math.min(baseFragments + additionalFragments, 10);
  }
}

/**
 * Calculate mass distribution for multiple stars using IMF approximation
 * Uses a simplified Salpeter-like Initial Mass Function
 * 
 * The IMF describes the distribution of stellar masses at birth
 * Salpeter IMF: dN/dM ∝ M^(-2.35)
 * 
 * @param totalMass - Total mass to distribute in solar masses
 * @param numStars - Number of stars to create
 * @returns Array of stellar masses in solar masses
 */
export function calculateMassDistribution(totalMass: number, numStars: number): number[] {
  if (numStars === 1) {
    // Single star gets all the mass (accounting for some loss)
    return [totalMass * 0.3]; // ~30% efficiency typical for star formation
  }
  
  // Generate random masses following IMF
  // Salpeter exponent: α = 2.35
  const alpha = 2.35;
  
  // Generate masses using power-law distribution
  const rawMasses: number[] = [];
  let totalRawMass = 0;
  
  for (let i = 0; i < numStars; i++) {
    // Generate random value between 0 and 1
    const u = Math.random();
    
    // Transform to power-law distribution
    // M ∝ u^(-1/(α-1))
    const minMass = VALIDATION_RANGES.STELLAR_MASS.min;
    const maxMass = Math.min(totalMass * 0.5, VALIDATION_RANGES.STELLAR_MASS.max);
    
    // Power-law transformation
    const exponent = -1 / (alpha - 1);
    const mass = minMass * Math.pow(
      1 + u * (Math.pow(maxMass / minMass, alpha - 1) - 1),
      exponent
    );
    
    rawMasses.push(mass);
    totalRawMass += mass;
  }
  
  // Normalize masses to match total available mass (with star formation efficiency)
  const efficiency = 0.3; // 30% of cloud mass becomes stars
  const availableMass = totalMass * efficiency;
  const scaleFactor = availableMass / totalRawMass;
  
  const normalizedMasses = rawMasses.map(m => m * scaleFactor);
  
  // Sort masses in descending order (most massive first)
  normalizedMasses.sort((a, b) => b - a);
  
  // Ensure all masses are within valid range
  return normalizedMasses.map(m => 
    Math.max(
      VALIDATION_RANGES.STELLAR_MASS.min,
      Math.min(m, VALIDATION_RANGES.STELLAR_MASS.max)
    )
  );
}

/**
 * Determine if a cloud will collapse based on Jeans criterion
 * 
 * @param cloudParams - Cloud parameters
 * @returns True if cloud will collapse
 */
export function willCloudCollapse(cloudParams: CloudParameters): boolean {
  const jeansMass = calculateJeansMass(cloudParams);
  
  // Cloud will collapse if its mass exceeds the Jeans mass
  return cloudParams.mass > jeansMass;
}

/**
 * Calculate the number of stars that will form from cloud parameters
 * Combines collapse criterion and fragmentation determination
 * 
 * @param cloudParams - Cloud parameters
 * @returns Number of stars that will form (0 if cloud doesn't collapse)
 */
export function calculateNumberOfStars(cloudParams: CloudParameters): number {
  // Check if cloud will collapse
  if (!willCloudCollapse(cloudParams)) {
    return 0;
  }
  
  // Determine fragmentation
  return determineFragmentation(cloudParams);
}

/**
 * Generate initial star properties from cloud collapse
 * Creates Star objects with calculated properties
 * 
 * @param mass - Stellar mass in solar masses
 * @param metallicity - Metallicity relative to solar
 * @param index - Star index for naming
 * @returns Star object with initial properties
 */
import { Star, StarSystem, EvolutionPhase, Vector3 } from '../types/core';
import { 
  calculateInitialStellarProperties 
} from '../physics/stellarPhysics';
import { 
  calculateOrbitalParametersFromAngularMomentum,
  calculateOrbitalPeriod,
  calculateOrbitalPosition
} from '../physics/orbitalMechanics';

export function generateStarFromMass(
  mass: number,
  metallicity: number,
  index: number
): Star {
  // Calculate stellar properties using physics models
  const properties = calculateInitialStellarProperties(mass);
  
  // Generate unique ID and name
  const id = `star-${Date.now()}-${index}`;
  const starNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const name = starNames[index] || `Star ${index + 1}`;
  
  // Initial position at origin (will be adjusted for binary/multiple systems)
  const position: Vector3 = { x: 0, y: 0, z: 0 };
  const velocity: Vector3 = { x: 0, y: 0, z: 0 };
  
  return {
    id,
    name,
    mass,
    radius: properties.radius,
    luminosity: properties.luminosity,
    temperature: properties.temperature,
    age: 0, // Just formed
    metallicity,
    spectralType: properties.spectralType,
    evolutionPhase: EvolutionPhase.PROTOSTAR,
    lifetime: properties.lifetime,
    position,
    velocity,
  };
}

/**
 * Configure binary star system with orbital parameters
 * Calculates orbital parameters and sets initial positions
 * 
 * @param star1 - Primary star
 * @param star2 - Secondary star
 * @param angularMomentum - System angular momentum
 * @returns Array of two stars with updated positions
 */
export function configureBinarySystem(
  star1: Star,
  star2: Star,
  angularMomentum: number
): [Star, Star] {
  // Calculate orbital parameters from angular momentum
  // Use moderate eccentricity for realism
  const eccentricity = 0.1 + Math.random() * 0.3; // 0.1 to 0.4
  
  const orbitalParams = calculateOrbitalParametersFromAngularMomentum(
    angularMomentum,
    star1.mass,
    star2.mass,
    eccentricity
  );
  
  // Calculate orbital period
  const period = calculateOrbitalPeriod(
    orbitalParams.semiMajorAxis,
    star1.mass + star2.mass
  );
  
  // Set initial positions (at time = 0)
  const pos2 = calculateOrbitalPosition(orbitalParams, 0, period);
  
  // Primary star on opposite side of center of mass (using mass ratio)
  star1.position = {
    x: -pos2.x * (star2.mass / star1.mass),
    y: -pos2.y * (star2.mass / star1.mass),
    z: -pos2.z * (star2.mass / star1.mass),
  };
  
  // Secondary star at calculated position
  star2.position = pos2;
  
  return [star1, star2];
}

/**
 * Configure multiple-star system with hierarchical orbits
 * For systems with 3+ stars, creates hierarchical configuration
 * 
 * @param stars - Array of stars to configure
 * @param angularMomentum - System angular momentum
 * @returns Array of stars with updated positions
 */
export function configureMultipleStarSystem(
  stars: Star[],
  angularMomentum: number
): Star[] {
  if (stars.length === 2) {
    return configureBinarySystem(stars[0], stars[1], angularMomentum);
  }
  
  if (stars.length === 1) {
    return stars;
  }
  
  // For 3+ stars, create hierarchical system
  // Most massive two stars form inner binary
  // Additional stars orbit the binary
  
  // Sort by mass (descending)
  const sortedStars = [...stars].sort((a, b) => b.mass - a.mass);
  
  // Configure inner binary with most massive stars
  const [primary, secondary] = configureBinarySystem(
    sortedStars[0],
    sortedStars[1],
    angularMomentum * 0.6 // 60% of angular momentum in inner binary
  );
  
  // Place additional stars in wider orbits
  const configuredStars = [primary, secondary];
  
  for (let i = 2; i < sortedStars.length; i++) {
    const star = sortedStars[i];
    
    // Calculate orbital distance (wider for each additional star)
    const innerBinarySeparation = Math.sqrt(
      Math.pow(primary.position.x - secondary.position.x, 2) +
      Math.pow(primary.position.y - secondary.position.y, 2) +
      Math.pow(primary.position.z - secondary.position.z, 2)
    );
    
    // Outer orbit should be 5-10 times wider for stability
    const separationMultiplier = 5 + i * 2;
    const outerDistance = innerBinarySeparation * separationMultiplier;
    
    // Random angle for variety
    const angle = Math.random() * 2 * Math.PI;
    const inclination = (Math.random() - 0.5) * Math.PI / 6; // ±15 degrees
    
    // Set position
    star.position = {
      x: outerDistance * Math.cos(angle),
      y: outerDistance * Math.sin(angle),
      z: outerDistance * Math.sin(inclination),
    };
    
    configuredStars.push(star);
  }
  
  return configuredStars;
}

/**
 * Generate complete star system from cloud parameters
 * Main function that orchestrates cloud collapse, fragmentation, and star generation
 * 
 * @param cloudParams - Initial cloud parameters
 * @returns Complete star system with all stars configured
 * @throws SimulationError if cloud cannot form stars or parameters are extreme
 */
import {
  SimulationError,
  SimulationErrorType,
  errorLogger,
  checkNumericalStability,
} from '../validation/errorHandling';

export function generateStarSystemFromCloud(cloudParams: CloudParameters): StarSystem {
  try {
    // Check for numerical stability
    checkNumericalStability(cloudParams.mass, 'cloud mass');
    checkNumericalStability(cloudParams.metallicity, 'metallicity');
    checkNumericalStability(cloudParams.angularMomentum, 'angular momentum');
    
    // Calculate number of stars
    const numStars = calculateNumberOfStars(cloudParams);
    
    if (numStars === 0) {
      const error = new SimulationError(
        SimulationErrorType.INSUFFICIENT_MASS,
        'Cloud mass is below Jeans mass threshold - no stars will form',
        { cloudMass: cloudParams.mass, jeansMass: calculateJeansMass(cloudParams) },
        false
      );
      errorLogger.logError(error);
      throw error;
    }
    
    // Check for extreme number of stars
    if (numStars > 10) {
      errorLogger.logError(
        new SimulationError(
          SimulationErrorType.EXTREME_VALUES,
          `Very high number of stars (${numStars}) - system may be complex`,
          { numStars },
          true
        )
      );
    }
    
    // Calculate mass distribution
    const stellarMasses = calculateMassDistribution(cloudParams.mass, numStars);
    
    // Validate stellar masses
    for (const mass of stellarMasses) {
      checkNumericalStability(mass, 'stellar mass');
    }
    
    // Generate stars
    const stars = stellarMasses.map((mass, index) => 
      generateStarFromMass(mass, cloudParams.metallicity, index)
    );
    
    // Configure orbital parameters for multiple-star systems
    const configuredStars = configureMultipleStarSystem(stars, cloudParams.angularMomentum);
    
    // Create star system
    const systemId = `system-${Date.now()}`;
    const systemName = `System ${systemId.slice(-6)}`;
    
    return {
      id: systemId,
      name: systemName,
      stars: configuredStars,
      planets: [], // Planets will be added later by planetary formation module
      age: 0,
      initialCloudParameters: cloudParams,
    };
  } catch (error) {
    if (error instanceof SimulationError) {
      throw error;
    }
    
    const simError = new SimulationError(
      SimulationErrorType.NUMERICAL_INSTABILITY,
      `Failed to generate star system: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cloudParams, originalError: error },
      false
    );
    errorLogger.logError(simError);
    throw simError;
  }
}
