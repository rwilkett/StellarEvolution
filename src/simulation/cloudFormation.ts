/**
 * Cloud Formation Module
 * Handles the collapse of interstellar clouds and fragmentation into stars
 */

import { CloudParameters, DerivedCloudProperties } from '../types/core';
import { PHYSICS_CONSTANTS, VALIDATION_RANGES, CLOUD_PARAMETER_DEFAULTS } from '../constants/physics';

/**
 * Calculate star formation efficiency based on virial parameter
 * 
 * @param virialParameter - Virial parameter (dimensionless)
 * @returns Star formation efficiency (0-1)
 */
function calculateStarFormationEfficiency(virialParameter: number): number {
  // Star formation efficiency depends on how bound the cloud is
  // α_vir < 1: High efficiency (30-50%)
  // α_vir ≈ 1-2: Moderate efficiency (10-30%)
  // α_vir > 2: Low efficiency (1-10%)
  
  if (virialParameter < 1) {
    // Strongly bound: high efficiency
    return 0.3 + (1 - virialParameter) * 0.2; // 30-50%
  } else if (virialParameter < 2) {
    // Marginally bound: moderate efficiency
    return 0.1 + (2 - virialParameter) * 0.2; // 10-30%
  } else {
    // Unbound or weakly bound: low efficiency
    return Math.max(0.01, 0.1 * Math.exp(-(virialParameter - 2))); // 1-10%
  }
}

/**
 * Determine if a cloud will fragment into multiple stars
 * Fragmentation depends on angular momentum, turbulence, and Jeans mass
 * 
 * @param cloudParams - Cloud parameters
 * @param derived - Derived cloud properties
 * @returns Number of stars that will form
 */
export function determineFragmentation(
  cloudParams: CloudParameters,
  derived: DerivedCloudProperties
): number {
  const { mass, angularMomentum } = cloudParams;
  const { jeansMass, turbulentJeansLength, virialParameter } = derived;
  
  // Apply defaults for optional parameters
  const radius = cloudParams.radius ?? CLOUD_PARAMETER_DEFAULTS.RADIUS;
  const turbulenceVelocity = cloudParams.turbulenceVelocity ?? CLOUD_PARAMETER_DEFAULTS.TURBULENCE_VELOCITY;
  
  // Calculate normalized angular momentum
  const typicalRadius = 10 * PHYSICS_CONSTANTS.PARSEC;
  const typicalVelocity = 1000; // m/s
  const typicalAngularMomentum = mass * PHYSICS_CONSTANTS.SOLAR_MASS * 
                                  typicalRadius * typicalVelocity;
  
  const normalizedAngularMomentum = angularMomentum / typicalAngularMomentum;
  
  // Calculate turbulence factor (higher turbulence increases fragmentation)
  const turbulenceFactor = 1 + (turbulenceVelocity - 1) / 5; // Normalized around 1 km/s
  
  // Calculate mass ratio (how many Jeans masses fit in the cloud)
  const massRatio = mass / jeansMass;
  
  // Base number of fragments from mass ratio and turbulence
  // More Jeans masses and higher turbulence lead to more fragments
  let baseFragments = Math.floor(massRatio * turbulenceFactor);
  
  // Adjust based on virial parameter
  // Unbound clouds (α_vir > 2) fragment less efficiently
  if (virialParameter > 2) {
    baseFragments = Math.floor(baseFragments * 0.5);
  }
  
  // Adjust based on angular momentum
  const angularMomentumBonus = Math.floor(normalizedAngularMomentum * 2);
  baseFragments += angularMomentumBonus;
  
  // Ensure at least 1 fragment if cloud is bound
  if (virialParameter < 2 && baseFragments < 1) {
    baseFragments = 1;
  }
  
  // Cap maximum fragments based on cloud size and turbulent Jeans length
  // Maximum fragments = cloud volume / fragment volume
  const maxFragments = Math.floor(Math.pow(radius / turbulentJeansLength, 3));
  
  // Apply physical limits
  const finalFragments = Math.max(1, Math.min(baseFragments, maxFragments, 10));
  
  return finalFragments;
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
 * @param efficiency - Star formation efficiency (0-1)
 * @returns Array of stellar masses in solar masses
 */
export function calculateMassDistribution(
  totalMass: number,
  numStars: number,
  efficiency: number = 0.3
): number[] {
  if (numStars === 1) {
    // Single star gets all the mass (accounting for efficiency)
    return [totalMass * efficiency];
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
 * Determine if a cloud will collapse based on Jeans criterion and virial parameter
 * 
 * @param cloudParams - Cloud parameters
 * @param derived - Derived cloud properties
 * @returns True if cloud will collapse
 */
export function willCloudCollapse(
  cloudParams: CloudParameters,
  derived: DerivedCloudProperties
): boolean {
  const { jeansMass, isBound } = derived;
  
  // Cloud will collapse if:
  // 1. Its mass exceeds the Jeans mass (gravitational instability)
  // 2. It is gravitationally bound (virial parameter < 2)
  return cloudParams.mass > jeansMass && isBound;
}

/**
 * Calculate the number of stars that will form from cloud parameters
 * Combines collapse criterion and fragmentation determination
 * 
 * @param cloudParams - Cloud parameters
 * @param derived - Derived cloud properties
 * @returns Number of stars that will form (0 if cloud doesn't collapse)
 */
export function calculateNumberOfStars(
  cloudParams: CloudParameters,
  derived: DerivedCloudProperties
): number {
  // Check if cloud will collapse
  if (!willCloudCollapse(cloudParams, derived)) {
    return 0;
  }
  
  // Determine fragmentation
  return determineFragmentation(cloudParams, derived);
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
 * @param derivedProperties - Pre-calculated derived cloud properties (optional)
 * @returns Complete star system with all stars configured
 * @throws SimulationError if cloud cannot form stars or parameters are extreme
 */
import {
  SimulationError,
  SimulationErrorType,
  errorLogger,
  checkNumericalStability,
} from '../validation/errorHandling';
import { calculateDerivedProperties } from '../physics/derivedCloudProperties';

export function generateStarSystemFromCloud(
  cloudParams: CloudParameters,
  derivedProperties?: DerivedCloudProperties
): StarSystem {
  try {
    // Check for numerical stability
    checkNumericalStability(cloudParams.mass, 'cloud mass');
    checkNumericalStability(cloudParams.metallicity, 'metallicity');
    checkNumericalStability(cloudParams.angularMomentum, 'angular momentum');
    
    // Calculate derived properties if not provided
    const derived = derivedProperties ?? calculateDerivedProperties(cloudParams);
    
    // Calculate number of stars using derived properties
    const numStars = calculateNumberOfStars(cloudParams, derived);
    
    if (numStars === 0) {
      const error = new SimulationError(
        SimulationErrorType.INSUFFICIENT_MASS,
        'Cloud cannot collapse - either mass is below Jeans mass or cloud is unbound',
        { 
          cloudMass: cloudParams.mass, 
          jeansMass: derived.jeansMass,
          virialParameter: derived.virialParameter,
          isBound: derived.isBound
        },
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
    
    // Calculate star formation efficiency from virial parameter
    const efficiency = calculateStarFormationEfficiency(derived.virialParameter);
    
    // Calculate mass distribution with efficiency
    const stellarMasses = calculateMassDistribution(cloudParams.mass, numStars, efficiency);
    
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
      derivedCloudProperties: derived,
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
