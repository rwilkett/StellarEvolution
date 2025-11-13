/**
 * Orbital Stability Module
 * Provides functions to check orbital stability in multiple-star systems
 */

import { Star, StarSystem } from '../types/core';
import { SimulationError, SimulationErrorType, errorLogger } from './errorHandling';

/**
 * Check if a binary star system is stable
 * Uses Hill stability criterion for binary systems
 * 
 * @param star1 - Primary star
 * @param star2 - Secondary star
 * @returns True if system is stable
 */
export function checkBinaryStability(star1: Star, star2: Star): boolean {
  // Calculate separation
  const dx = star2.position.x - star1.position.x;
  const dy = star2.position.y - star1.position.y;
  const dz = star2.position.z - star1.position.z;
  const separation = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Check for collision (stars too close)
  const minSeparation = (star1.radius + star2.radius) * 0.00465; // Convert solar radii to AU
  
  if (separation < minSeparation) {
    const error = new SimulationError(
      SimulationErrorType.ORBITAL_INSTABILITY,
      `Binary system unstable: stars too close (${separation.toFixed(4)} AU < ${minSeparation.toFixed(4)} AU)`,
      { star1: star1.name, star2: star2.name, separation, minSeparation }
    );
    errorLogger.logError(error);
    return false;
  }

  // Check for unreasonably large separation (unbound system)
  // Use approximate Hill sphere calculation
  const totalMass = star1.mass + star2.mass;
  const maxSeparation = 1000 * Math.pow(totalMass, 1/3); // Rough estimate in AU
  
  if (separation > maxSeparation) {
    const error = new SimulationError(
      SimulationErrorType.ORBITAL_INSTABILITY,
      `Binary system potentially unbound: stars too far apart (${separation.toFixed(2)} AU > ${maxSeparation.toFixed(2)} AU)`,
      { star1: star1.name, star2: star2.name, separation, maxSeparation },
      true // Recoverable warning
    );
    errorLogger.logError(error);
    return false;
  }

  return true;
}

/**
 * Check if a multiple-star system is hierarchically stable
 * Uses hierarchical stability criteria for triple and higher-order systems
 * 
 * @param stars - Array of stars in the system
 * @returns True if system is stable
 */
export function checkHierarchicalStability(stars: Star[]): boolean {
  if (stars.length < 3) {
    // For binary or single star, use binary stability check
    if (stars.length === 2) {
      return checkBinaryStability(stars[0], stars[1]);
    }
    return true;
  }

  // For triple+ systems, check hierarchical stability
  // The system should have a clear hierarchy: inner binary + outer companions
  
  // Find the two closest stars (inner binary)
  let minSeparation = Infinity;
  let innerPair: [number, number] = [0, 1];
  
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[j].position.x - stars[i].position.x;
      const dy = stars[j].position.y - stars[i].position.y;
      const dz = stars[j].position.z - stars[i].position.z;
      const separation = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (separation < minSeparation) {
        minSeparation = separation;
        innerPair = [i, j];
      }
    }
  }

  // Check inner binary stability
  const innerBinaryStable = checkBinaryStability(
    stars[innerPair[0]],
    stars[innerPair[1]]
  );
  
  if (!innerBinaryStable) {
    return false;
  }

  // Calculate center of mass of inner binary
  const star1 = stars[innerPair[0]];
  const star2 = stars[innerPair[1]];
  const totalMass = star1.mass + star2.mass;
  
  const comX = (star1.position.x * star1.mass + star2.position.x * star2.mass) / totalMass;
  const comY = (star1.position.y * star1.mass + star2.position.y * star2.mass) / totalMass;
  const comZ = (star1.position.z * star1.mass + star2.position.z * star2.mass) / totalMass;

  // Check that outer stars are sufficiently far from inner binary
  // Stability criterion: outer orbit should be at least 3-5 times wider than inner orbit
  const stabilityRatio = 3.0; // Conservative stability ratio
  
  for (let i = 0; i < stars.length; i++) {
    if (i === innerPair[0] || i === innerPair[1]) {
      continue; // Skip inner binary stars
    }
    
    const outerStar = stars[i];
    const dx = outerStar.position.x - comX;
    const dy = outerStar.position.y - comY;
    const dz = outerStar.position.z - comZ;
    const outerSeparation = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (outerSeparation < minSeparation * stabilityRatio) {
      const error = new SimulationError(
        SimulationErrorType.ORBITAL_INSTABILITY,
        `Hierarchical system unstable: outer star ${outerStar.name} too close to inner binary ` +
        `(${outerSeparation.toFixed(2)} AU < ${(minSeparation * stabilityRatio).toFixed(2)} AU)`,
        {
          outerStar: outerStar.name,
          innerBinary: [star1.name, star2.name],
          outerSeparation,
          innerSeparation: minSeparation,
          requiredRatio: stabilityRatio
        }
      );
      errorLogger.logError(error);
      return false;
    }
  }

  return true;
}

/**
 * Check if a star system is stable
 * Main function that checks stability for any system configuration
 * 
 * @param system - Star system to check
 * @returns True if system is stable
 */
export function checkSystemStability(system: StarSystem): boolean {
  if (!system || !system.stars || system.stars.length === 0) {
    return true; // Empty system is trivially stable
  }

  if (system.stars.length === 1) {
    return true; // Single star is always stable
  }

  if (system.stars.length === 2) {
    return checkBinaryStability(system.stars[0], system.stars[1]);
  }

  return checkHierarchicalStability(system.stars);
}

/**
 * Check if a planet's orbit is stable around its host star
 * Checks for collision with star and reasonable orbital parameters
 * 
 * @param planetDistance - Planet's orbital distance in AU
 * @param _planetMass - Planet's mass in Earth masses (reserved for future use)
 * @param starRadius - Star's radius in solar radii
 * @param starMass - Star's mass in solar masses
 * @returns True if orbit is stable
 */
export function checkPlanetaryOrbitStability(
  planetDistance: number,
  _planetMass: number,
  starRadius: number,
  starMass: number
): boolean {
  // Check for collision with star
  const starRadiusAU = starRadius * 0.00465; // Convert solar radii to AU
  const minDistance = starRadiusAU * 2; // Planet should be at least 2 stellar radii away
  
  if (planetDistance < minDistance) {
    const error = new SimulationError(
      SimulationErrorType.ORBITAL_INSTABILITY,
      `Planet orbit unstable: too close to star (${planetDistance.toFixed(4)} AU < ${minDistance.toFixed(4)} AU)`,
      { planetDistance, minDistance, starRadius }
    );
    errorLogger.logError(error);
    return false;
  }

  // Check for unreasonably large distance (beyond Hill sphere)
  // Approximate Hill sphere radius for a star in isolation
  const maxDistance = 1000 * Math.pow(starMass, 1/3); // Rough estimate in AU
  
  if (planetDistance > maxDistance) {
    const error = new SimulationError(
      SimulationErrorType.ORBITAL_INSTABILITY,
      `Planet orbit potentially unstable: too far from star (${planetDistance.toFixed(2)} AU > ${maxDistance.toFixed(2)} AU)`,
      { planetDistance, maxDistance, starMass },
      true // Recoverable warning
    );
    errorLogger.logError(error);
    return false;
  }

  return true;
}

/**
 * Estimate system stability lifetime
 * Provides a rough estimate of how long the system will remain stable
 * 
 * @param system - Star system to analyze
 * @returns Estimated stability lifetime in years, or Infinity if indefinitely stable
 */
export function estimateStabilityLifetime(system: StarSystem): number {
  if (!system || !system.stars || system.stars.length <= 1) {
    return Infinity; // Single star systems are indefinitely stable
  }

  // For multiple star systems, stability depends on orbital configuration
  // This is a simplified estimate
  
  if (system.stars.length === 2) {
    // Binary systems are generally stable for stellar lifetimes
    const minLifetime = Math.min(...system.stars.map(s => s.lifetime));
    return minLifetime;
  }

  // For hierarchical systems, stability is more complex
  // Use a conservative estimate based on dynamical timescale
  const separations: number[] = [];
  
  for (let i = 0; i < system.stars.length; i++) {
    for (let j = i + 1; j < system.stars.length; j++) {
      const dx = system.stars[j].position.x - system.stars[i].position.x;
      const dy = system.stars[j].position.y - system.stars[i].position.y;
      const dz = system.stars[j].position.z - system.stars[i].position.z;
      const separation = Math.sqrt(dx * dx + dy * dy + dz * dz);
      separations.push(separation);
    }
  }

  const minSeparation = Math.min(...separations);
  const totalMass = system.stars.reduce((sum, star) => sum + star.mass, 0);
  
  // Dynamical timescale: t_dyn ~ sqrt(a³ / (G * M))
  // Simplified: stability lifetime ~ 1000 * dynamical timescale
  const G = 4 * Math.PI * Math.PI; // In AU³ / (M☉ * year²)
  const dynamicalTime = Math.sqrt(Math.pow(minSeparation, 3) / (G * totalMass));
  const stabilityLifetime = 1000 * dynamicalTime;

  return stabilityLifetime;
}
