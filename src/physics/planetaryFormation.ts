/**
 * Planetary formation physics functions
 * Implements protoplanetary disk calculations and planet formation models
 */

import { PLANET_FORMATION, CLOUD_PARAMETER_DEFAULTS } from '../constants/physics';
import { ProtoplanetaryDisk, PlanetComposition } from '../types/core';

/**
 * Calculate protoplanetary disk mass from stellar mass
 * Disk mass is typically 0.5-10% of stellar mass
 * @param stellarMass - Mass of the host star in solar masses
 * @param metallicity - Metallicity of the system relative to solar
 * @returns Disk mass in solar masses
 */
export function calculateDiskMass(
  stellarMass: number,
  metallicity: number
): number {
  // Base disk mass fraction (increases with metallicity)
  const baseFraction = PLANET_FORMATION.MIN_DISK_MASS_FRACTION;
  const maxFraction = PLANET_FORMATION.MAX_DISK_MASS_FRACTION;
  
  // Metallicity affects disk mass (higher metallicity = more disk mass)
  const metallicityFactor = Math.min(metallicity, 2.0);
  const diskFraction = baseFraction + (maxFraction - baseFraction) * (metallicityFactor / 2.0);
  
  return stellarMass * diskFraction;
}

/**
 * Apply magnetic braking to reduce disk radius
 * 
 * Magnetic fields remove angular momentum from the disk, reducing its size
 * Formula: R_disk = R_disk,0 × (B/B_0)^(-α) where α ≈ 0.5-1.0
 * 
 * @param baseRadius - Base disk radius without magnetic effects in AU
 * @param magneticFieldStrength - Magnetic field strength in microgauss (μG)
 * @returns Reduced disk radius in AU
 */
export function applyMagneticBraking(
  baseRadius: number,
  magneticFieldStrength: number
): number {
  // Reference field strength (typical molecular cloud value)
  const referenceField = CLOUD_PARAMETER_DEFAULTS.MAGNETIC_FIELD_STRENGTH; // 10 μG
  
  // Magnetic braking exponent (0.5-1.0, we use 0.7 as a middle value)
  const alpha = 0.7;
  
  // Calculate reduction factor
  const reductionFactor = Math.pow(magneticFieldStrength / referenceField, -alpha);
  
  // Apply reduction
  const reducedRadius = baseRadius * reductionFactor;
  
  // Ensure disk radius stays within physical bounds (10-1000 AU)
  return Math.max(10, Math.min(reducedRadius, 1000));
}

/**
 * Calculate protoplanetary disk extent (inner and outer radii)
 * @param stellarMass - Mass of the host star in solar masses
 * @param stellarLuminosity - Luminosity of the host star in solar luminosities
 * @param magneticFieldStrength - Optional magnetic field strength in μG (for magnetic braking)
 * @returns Object with inner and outer radius in AU
 */
export function calculateDiskExtent(
  stellarMass: number,
  stellarLuminosity: number,
  magneticFieldStrength?: number
): { innerRadius: number; outerRadius: number } {
  // Inner radius is determined by dust sublimation temperature (~1500K)
  // Using simplified relation: r_inner ≈ 0.05 * sqrt(L) AU
  const innerRadius = 0.05 * Math.sqrt(stellarLuminosity);
  
  // Outer radius scales with stellar mass
  // Typical disks extend to 30-100 AU for solar-mass stars
  let outerRadius = 30 * Math.pow(stellarMass, 0.5);
  
  // Apply magnetic braking if field strength is provided
  if (magneticFieldStrength !== undefined) {
    outerRadius = applyMagneticBraking(outerRadius, magneticFieldStrength);
  }
  
  return { innerRadius, outerRadius };
}

/**
 * Calculate snow line distance from star
 * Snow line is where water ice can condense (~170K)
 * @param stellarLuminosity - Luminosity of the host star in solar luminosities
 * @returns Snow line distance in AU
 */
export function calculateSnowLine(stellarLuminosity: number): number {
  // Snow line distance: r_snow ≈ 2.7 * sqrt(L/L_sun) AU
  // This is where temperature drops to ~170K for water ice condensation
  return PLANET_FORMATION.SNOW_LINE_COEFFICIENT * Math.sqrt(stellarLuminosity);
}

/**
 * Calculate complete protoplanetary disk properties
 * @param starId - ID of the host star
 * @param stellarMass - Mass of the host star in solar masses
 * @param stellarLuminosity - Luminosity of the host star in solar luminosities
 * @param metallicity - Metallicity of the system relative to solar
 * @param magneticFieldStrength - Optional magnetic field strength in μG
 * @returns ProtoplanetaryDisk object with all properties
 */
export function calculateDiskProperties(
  starId: string,
  stellarMass: number,
  stellarLuminosity: number,
  metallicity: number,
  magneticFieldStrength?: number
): ProtoplanetaryDisk {
  const mass = calculateDiskMass(stellarMass, metallicity);
  
  // Calculate disk extent with magnetic braking if field strength provided
  const baseExtent = calculateDiskExtent(stellarMass, stellarLuminosity);
  const { innerRadius, outerRadius } = magneticFieldStrength !== undefined
    ? calculateDiskExtent(stellarMass, stellarLuminosity, magneticFieldStrength)
    : baseExtent;
  
  const snowLine = calculateSnowLine(stellarLuminosity);
  
  // Calculate magnetic braking factor if field strength provided
  let magneticBrakingFactor: number | undefined;
  if (magneticFieldStrength !== undefined) {
    // Braking factor is the ratio of reduced to base radius
    magneticBrakingFactor = outerRadius / baseExtent.outerRadius;
  }
  
  return {
    starId,
    mass,
    innerRadius,
    outerRadius,
    metallicity,
    snowLine,
    magneticBrakingFactor,
  };
}

/**
 * Determine planet composition based on orbital distance and snow line
 * @param orbitalDistance - Distance from star in AU
 * @param snowLine - Snow line distance in AU
 * @param metallicity - System metallicity relative to solar
 * @returns Planet composition type
 */
export function determinePlanetComposition(
  orbitalDistance: number,
  snowLine: number,
  metallicity: number
): PlanetComposition {
  if (orbitalDistance < snowLine * 0.5) {
    // Very close to star: rocky planets only
    return PlanetComposition.ROCKY;
  } else if (orbitalDistance < snowLine) {
    // Inside snow line but not too close: rocky planets
    return PlanetComposition.ROCKY;
  } else if (orbitalDistance < snowLine * 3) {
    // Just beyond snow line: ice giants can form
    // Higher metallicity favors ice giant formation
    return metallicity > 0.5 ? PlanetComposition.ICE_GIANT : PlanetComposition.ROCKY;
  } else {
    // Far from star: gas giants can form if enough material
    return PlanetComposition.GAS_GIANT;
  }
}

/**
 * Calculate planet mass based on composition and disk properties
 * @param composition - Planet composition type
 * @param diskMass - Total disk mass in solar masses
 * @param metallicity - System metallicity relative to solar
 * @returns Planet mass in Earth masses
 */
export function calculatePlanetMass(
  composition: PlanetComposition,
  diskMass: number,
  metallicity: number
): number {
  // Convert disk mass to Earth masses (1 solar mass ≈ 333,000 Earth masses)
  const diskMassEarth = diskMass * 333000;
  
  // Base mass depends on composition
  let baseMass: number;
  
  switch (composition) {
    case PlanetComposition.ROCKY:
      // Rocky planets: 0.1 to 10 Earth masses
      baseMass = 0.5 + Math.random() * 5;
      // Metallicity increases rocky planet mass
      baseMass *= (0.5 + metallicity * 0.5);
      break;
      
    case PlanetComposition.ICE_GIANT:
      // Ice giants: 10 to 20 Earth masses
      baseMass = 10 + Math.random() * 10;
      break;
      
    case PlanetComposition.GAS_GIANT:
      // Gas giants: 50 to 500 Earth masses
      baseMass = 50 + Math.random() * 450;
      // More massive disks can form more massive planets
      baseMass *= Math.min(diskMass / 0.01, 2.0);
      break;
  }
  
  // Limit by available disk mass in the feeding zone
  const maxMass = diskMassEarth * 0.01; // Max 1% of disk mass per planet
  return Math.min(baseMass, maxMass);
}

/**
 * Calculate planet spacing using empirical relations
 * Planets tend to be spaced by ~10-20 mutual Hill radii
 * @param innerDistance - Distance of inner planet in AU
 * @param stellarMass - Mass of the host star in solar masses
 * @param planetMass - Mass of the planet in Earth masses
 * @returns Distance to next planet in AU
 */
export function calculatePlanetSpacing(
  innerDistance: number,
  stellarMass: number,
  planetMass: number
): number {
  // Convert planet mass to solar masses
  const planetMassSolar = planetMass / 333000;
  
  // Hill sphere radius: r_H = a * (m/(3M))^(1/3)
  const hillRadius = innerDistance * Math.pow(planetMassSolar / (3 * stellarMass), 1/3);
  
  // Spacing is typically 10-20 Hill radii
  const hillRadiiSpacing = 10 + Math.random() * 10;
  
  return hillRadius * hillRadiiSpacing;
}

/**
 * Generate planet orbital distances within a disk
 * @param diskInnerRadius - Inner radius of disk in AU
 * @param diskOuterRadius - Outer radius of disk in AU
 * @param stellarMass - Mass of the host star in solar masses
 * @param maxPlanets - Maximum number of planets to generate
 * @returns Array of orbital distances in AU
 */
export function generatePlanetOrbitalDistances(
  diskInnerRadius: number,
  diskOuterRadius: number,
  stellarMass: number,
  maxPlanets: number = 10
): number[] {
  const distances: number[] = [];
  
  // Start at inner edge of habitable zone (roughly 0.5-1.5 AU for solar-type stars)
  let currentDistance = Math.max(diskInnerRadius * 2, 0.3);
  
  while (currentDistance < diskOuterRadius && distances.length < maxPlanets) {
    distances.push(currentDistance);
    
    // Estimate planet mass for spacing calculation (use average)
    const estimatedMass = 5; // Earth masses (rough average)
    const spacing = calculatePlanetSpacing(currentDistance, stellarMass, estimatedMass);
    
    // Add spacing with some randomness
    currentDistance += spacing * (0.8 + Math.random() * 0.4);
  }
  
  return distances;
}

/**
 * Check if disk has sufficient mass for planet formation
 * @param diskMass - Disk mass in solar masses
 * @param stellarMass - Stellar mass in solar masses
 * @returns True if disk can form planets
 */
export function canFormPlanets(diskMass: number, stellarMass: number): boolean {
  // Minimum disk mass fraction for planet formation
  const minFraction = PLANET_FORMATION.MIN_DISK_MASS_FRACTION * 0.5;
  return (diskMass / stellarMass) >= minFraction;
}

/**
 * Calculate planet radius from mass and composition
 * Uses empirical mass-radius relations
 * @param mass - Planet mass in Earth masses
 * @param composition - Planet composition type
 * @returns Planet radius in Earth radii
 */
export function calculatePlanetRadius(
  mass: number,
  composition: PlanetComposition
): number {
  switch (composition) {
    case PlanetComposition.ROCKY:
      // Rocky planets: R ∝ M^0.27 (for M < 10 Earth masses)
      return Math.pow(mass, 0.27);
      
    case PlanetComposition.ICE_GIANT:
      // Ice giants: roughly constant density
      return Math.pow(mass, 0.31);
      
    case PlanetComposition.GAS_GIANT:
      // Gas giants: R ∝ M^0.1 (weak dependence due to degeneracy pressure)
      // Jupiter-like radius for ~300 Earth masses
      return 11 * Math.pow(mass / 318, 0.1);
  }
}
