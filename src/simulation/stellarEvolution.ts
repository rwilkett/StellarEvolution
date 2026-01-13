/**
 * Stellar Evolution Module
 * Handles stellar property initialization and time-based evolution
 */

import {
  Star,
  EvolutionPhase,
  SpectralType,
} from '../types/core';
import {
  calculateLuminosity,
  calculateRadius,
  calculateTemperature,
  determineSpectralType,
  calculateMainSequenceLifetime,
} from '../physics/stellarPhysics';
import { calculateInternalStructure } from '../physics/internalStructure';
import { FINAL_STATE_THRESHOLDS } from '../constants/physics';

/**
 * Generate a unique star ID
 */
function generateStarId(): string {
  return `star-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate initial star properties from mass and metallicity
 * Creates a star in the protostar phase with calculated properties
 * @param mass - Stellar mass in solar masses
 * @param metallicity - Metallicity relative to solar (Z☉)
 * @param name - Optional name for the star
 * @returns Star object with all initial properties
 */
export function createStar(
  mass: number,
  metallicity: number,
  name?: string
): Star {
  // Calculate initial stellar properties using physics functions
  const luminosity = calculateLuminosity(mass);
  const radius = calculateRadius(mass);
  const temperature = calculateTemperature(luminosity, radius);
  const spectralType = determineSpectralType(temperature);
  const lifetime = calculateMainSequenceLifetime(mass);

  // Calculate initial internal structure
  const internalStructure = calculateInternalStructure(
    mass,
    radius,
    luminosity,
    EvolutionPhase.PROTOSTAR,
    0, // age ratio = 0 for new star
    metallicity
  );

  // Create star object with initial properties
  const star: Star = {
    id: generateStarId(),
    name: name || `Star-${mass.toFixed(2)}M☉`,
    mass,
    radius,
    luminosity,
    temperature,
    age: 0,
    metallicity,
    spectralType,
    evolutionPhase: EvolutionPhase.PROTOSTAR,
    lifetime,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    internalStructure,
  };

  return star;
}

/**
 * Initialize a star with calculated properties
 * Alias for createStar for backward compatibility
 * @param mass - Stellar mass in solar masses
 * @param metallicity - Metallicity relative to solar (Z☉)
 * @param name - Optional name for the star
 * @returns Star object with all initial properties
 */
export function initializeStar(
  mass: number,
  metallicity: number,
  name?: string
): Star {
  return createStar(mass, metallicity, name);
}

/**
 * Calculate spectral type from temperature
 * Wrapper function for determineSpectralType
 * @param temperature - Effective temperature in Kelvin
 * @returns Spectral type classification
 */
export function assignSpectralType(temperature: number): SpectralType {
  return determineSpectralType(temperature);
}

/**
 * Calculate main sequence lifetime for a star
 * Wrapper function for calculateMainSequenceLifetime
 * @param mass - Stellar mass in solar masses
 * @returns Main sequence lifetime in years
 */
export function calculateLifetime(mass: number): number {
  return calculateMainSequenceLifetime(mass);
}

/**
 * Determine the evolution phase based on star's age and mass
 * @param star - Star object
 * @returns Current evolution phase
 */
export function determineEvolutionPhase(star: Star): EvolutionPhase {
  const ageRatio = star.age / star.lifetime;

  // Very young stars are protostars (< 1% of lifetime)
  if (ageRatio < 0.01) {
    return EvolutionPhase.PROTOSTAR;
  }

  // Main sequence phase (up to ~90% of lifetime)
  if (ageRatio < 0.9) {
    return EvolutionPhase.MAIN_SEQUENCE;
  }

  // Post-main sequence evolution depends on mass
  if (star.mass < 0.5) {
    // Low mass stars: directly to white dwarf (very long timescale)
    if (ageRatio < 1.0) {
      return EvolutionPhase.MAIN_SEQUENCE;
    }
    return EvolutionPhase.WHITE_DWARF;
  } else if (star.mass < 8) {
    // Intermediate mass stars: red giant branch
    if (ageRatio < 0.95) {
      return EvolutionPhase.RED_GIANT;
    } else if (ageRatio < 0.98) {
      return EvolutionPhase.HORIZONTAL_BRANCH;
    } else if (ageRatio < 1.0) {
      return EvolutionPhase.ASYMPTOTIC_GIANT;
    } else if (ageRatio < 1.01) {
      return EvolutionPhase.PLANETARY_NEBULA;
    }
    return EvolutionPhase.WHITE_DWARF;
  } else {
    // Massive stars: supergiant and supernova
    if (ageRatio < 0.95) {
      return EvolutionPhase.RED_GIANT; // Supergiant phase
    }
    // Determine final state based on mass
    return determineFinalState(star.mass);
  }
}

/**
 * Determine the final state of a star based on its initial mass
 * @param mass - Initial stellar mass in solar masses
 * @returns Final evolution phase (white dwarf, neutron star, or black hole)
 */
export function determineFinalState(mass: number): EvolutionPhase {
  if (mass < FINAL_STATE_THRESHOLDS.WHITE_DWARF_MAX) {
    return EvolutionPhase.WHITE_DWARF;
  } else if (mass < FINAL_STATE_THRESHOLDS.NEUTRON_STAR_MAX) {
    return EvolutionPhase.NEUTRON_STAR;
  } else {
    return EvolutionPhase.BLACK_HOLE;
  }
}

/**
 * Update stellar properties during evolution based on phase
 * @param star - Star object
 * @param phase - Current evolution phase
 * @returns Updated stellar properties (luminosity, radius, temperature)
 */
function updatePropertiesForPhase(
  star: Star,
  phase: EvolutionPhase
): { luminosity: number; radius: number; temperature: number } {
  const ageRatio = star.age / star.lifetime;
  
  // Get initial main sequence properties
  const msLuminosity = calculateLuminosity(star.mass);
  const msRadius = calculateRadius(star.mass);
  const msTemperature = calculateTemperature(msLuminosity, msRadius);

  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      // Protostars are cooler and less luminous
      return {
        luminosity: msLuminosity * 0.1,
        radius: msRadius * 2.0,
        temperature: msTemperature * 0.7,
      };

    case EvolutionPhase.MAIN_SEQUENCE:
      // Main sequence: properties slowly increase
      const msFactor = 1.0 + (ageRatio * 0.3); // Up to 30% increase
      return {
        luminosity: msLuminosity * msFactor,
        radius: msRadius * Math.pow(msFactor, 0.5),
        temperature: msTemperature * Math.pow(msFactor, 0.25),
      };

    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Red giant: greatly expanded radius, cooler surface, higher luminosity
      const giantFactor = star.mass < 2 ? 100 : 1000;
      return {
        luminosity: msLuminosity * (100 + star.mass * 50),
        radius: msRadius * giantFactor,
        temperature: 3500, // Cool red giant temperature
      };

    case EvolutionPhase.HORIZONTAL_BRANCH:
      // Horizontal branch: helium burning, intermediate properties
      return {
        luminosity: msLuminosity * 50,
        radius: msRadius * 10,
        temperature: 5000,
      };

    case EvolutionPhase.PLANETARY_NEBULA:
      // Planetary nebula phase: hot core exposed
      return {
        luminosity: msLuminosity * 100,
        radius: msRadius * 0.1,
        temperature: 100000, // Very hot exposed core
      };

    case EvolutionPhase.WHITE_DWARF:
      // White dwarf: small, hot, dim
      return {
        luminosity: msLuminosity * 0.001,
        radius: 0.01, // About Earth-sized
        temperature: 10000 - (ageRatio * 5000), // Cooling over time
      };

    case EvolutionPhase.NEUTRON_STAR:
      // Neutron star: extremely small and dense
      return {
        luminosity: msLuminosity * 0.0001,
        radius: 0.00001, // ~10 km
        temperature: 1e6, // Very hot initially
      };

    case EvolutionPhase.BLACK_HOLE:
      // Black hole: no light emission
      return {
        luminosity: 0,
        radius: 0.00001, // Event horizon radius (simplified)
        temperature: 0,
      };

    default:
      return {
        luminosity: msLuminosity,
        radius: msRadius,
        temperature: msTemperature,
      };
  }
}

/**
 * Evolve a star's properties over a time delta
 * Updates age, evolution phase, and physical properties
 * @param star - Star object to evolve
 * @param deltaTime - Time step in years
 * @returns Updated star object
 */
export function evolveStar(star: Star, deltaTime: number): Star {
  // Create a new star object with updated properties
  const newAge = star.age + deltaTime;
  
  // Determine new evolution phase
  const newPhase = determineEvolutionPhase({ ...star, age: newAge });
  
  // Update properties based on new phase
  const { luminosity, radius, temperature } = updatePropertiesForPhase(
    { ...star, age: newAge },
    newPhase
  );
  
  // Update spectral type based on new temperature
  const spectralType = determineSpectralType(temperature);

  // Calculate age ratio for internal structure
  const ageRatio = newAge / star.lifetime;

  // Update internal structure
  const internalStructure = calculateInternalStructure(
    star.mass,
    radius,
    luminosity,
    newPhase,
    ageRatio,
    star.metallicity,
    star.internalStructure,
    deltaTime
  );

  // Return updated star
  return {
    ...star,
    age: newAge,
    evolutionPhase: newPhase,
    luminosity,
    radius,
    temperature,
    spectralType,
    internalStructure,
  };
}

/**
 * Evolve a star by a time delta (alias for evolveStar)
 * @param star - Star object to evolve
 * @param deltaTime - Time step in years
 * @returns Updated star object
 */
export function evolveStarByTime(star: Star, deltaTime: number): Star {
  return evolveStar(star, deltaTime);
}
