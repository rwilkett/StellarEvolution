/**
 * Derived Cloud Properties Module
 * Calculates derived physical quantities from cloud parameters
 */

import { CloudParameters, DerivedCloudProperties } from '../types/core';
import { PHYSICS_CONSTANTS, CLOUD_PARAMETER_DEFAULTS } from '../constants/physics';

/**
 * Calculate cloud density from mass and radius
 * 
 * Formula: ρ = (3M) / (4πR³)
 * 
 * @param mass - Cloud mass in solar masses
 * @param radius - Cloud radius in parsecs
 * @returns Density in particles/cm³
 */
export function calculateDensity(mass: number, radius: number): number {
  // Convert mass to kg
  const massKg = mass * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  // Convert radius to meters
  const radiusMeters = radius * PHYSICS_CONSTANTS.PARSEC;
  
  // Calculate volume in m³
  const volume = (4 / 3) * Math.PI * Math.pow(radiusMeters, 3);
  
  // Calculate mass density in kg/m³
  const massDensity = massKg / volume;
  
  // Convert to number density (particles/cm³)
  // Assume mean molecular weight μ = 2.33 for molecular clouds (mostly H₂)
  const meanMolecularWeight = 2.33;
  const protonMass = 1.673e-27; // kg
  const meanParticleMass = meanMolecularWeight * protonMass;
  
  // Number density in particles/m³
  const numberDensity = massDensity / meanParticleMass;
  
  // Convert to particles/cm³
  return numberDensity / 1e6;
}

/**
 * Calculate virial parameter from mass, radius, and turbulence velocity
 * 
 * Formula: α_vir = (5σ²R) / (GM)
 * 
 * The virial parameter indicates whether a cloud is gravitationally bound:
 * - α_vir < 1: Strongly bound, rapid collapse
 * - α_vir ≈ 1-2: Marginally bound, slow collapse
 * - α_vir > 2: Unbound, no collapse
 * 
 * @param mass - Cloud mass in solar masses
 * @param radius - Cloud radius in parsecs
 * @param turbulenceVelocity - Velocity dispersion in km/s
 * @returns Virial parameter (dimensionless)
 */
export function calculateVirialParameter(
  mass: number,
  radius: number,
  turbulenceVelocity: number
): number {
  // Convert to SI units
  const massKg = mass * PHYSICS_CONSTANTS.SOLAR_MASS;
  const radiusMeters = radius * PHYSICS_CONSTANTS.PARSEC;
  const velocityMs = turbulenceVelocity * 1000; // km/s to m/s
  
  // Calculate virial parameter
  // α_vir = (5σ²R) / (GM)
  const numerator = 5 * Math.pow(velocityMs, 2) * radiusMeters;
  const denominator = PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * massKg;
  
  return numerator / denominator;
}

/**
 * Calculate Jeans mass using temperature and density
 * 
 * Formula: M_J = (5kT / (GμmH))^(3/2) × (3 / (4πρ))^(1/2)
 * 
 * The Jeans mass is the critical mass above which a cloud will gravitationally collapse
 * 
 * @param temperature - Cloud temperature in Kelvin
 * @param density - Cloud density in particles/cm³
 * @returns Jeans mass in solar masses
 */
export function calculateJeansMass(temperature: number, density: number): number {
  // Physical constants
  const boltzmannConstant = 1.381e-23; // J/K
  const protonMass = 1.673e-27; // kg
  const meanMolecularWeight = 2.33; // for molecular clouds (mostly H₂)
  
  // Convert density to kg/m³
  const densityKgM3 = density * 1e6 * meanMolecularWeight * protonMass;
  
  // Calculate Jeans mass
  // M_J = (5kT / (GμmH))^(3/2) × (3 / (4πρ))^(1/2)
  const thermalTerm = (5 * boltzmannConstant * temperature) / 
                      (PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * meanMolecularWeight * protonMass);
  
  const densityTerm = 3 / (4 * Math.PI * densityKgM3);
  
  const jeansMassKg = Math.pow(thermalTerm, 1.5) * Math.sqrt(densityTerm);
  
  // Convert to solar masses
  return jeansMassKg / PHYSICS_CONSTANTS.SOLAR_MASS;
}

/**
 * Calculate free-fall collapse timescale from density
 * 
 * Formula: t_ff = √(3π / (32Gρ))
 * 
 * @param density - Cloud density in particles/cm³
 * @returns Collapse timescale in years
 */
export function calculateCollapseTimescale(density: number): number {
  // Physical constants
  const protonMass = 1.673e-27; // kg
  const meanMolecularWeight = 2.33; // for molecular clouds
  
  // Convert density to kg/m³
  const densityKgM3 = density * 1e6 * meanMolecularWeight * protonMass;
  
  // Calculate free-fall time
  // t_ff = √(3π / (32Gρ))
  const timescaleSeconds = Math.sqrt(
    (3 * Math.PI) / (32 * PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * densityKgM3)
  );
  
  // Convert to years
  return timescaleSeconds / PHYSICS_CONSTANTS.SECONDS_PER_YEAR;
}

/**
 * Calculate turbulent Jeans length
 * 
 * Formula: λ_J,turb = σ × √(π / (Gρ))
 * 
 * Determines characteristic fragment size in turbulent clouds
 * 
 * @param turbulenceVelocity - Velocity dispersion in km/s
 * @param density - Cloud density in particles/cm³
 * @returns Turbulent Jeans length in parsecs
 */
export function calculateTurbulentJeansLength(
  turbulenceVelocity: number,
  density: number
): number {
  // Physical constants
  const protonMass = 1.673e-27; // kg
  const meanMolecularWeight = 2.33;
  
  // Convert to SI units
  const velocityMs = turbulenceVelocity * 1000; // km/s to m/s
  const densityKgM3 = density * 1e6 * meanMolecularWeight * protonMass;
  
  // Calculate turbulent Jeans length
  // λ_J,turb = σ × √(π / (Gρ))
  const jeansLengthMeters = velocityMs * Math.sqrt(
    Math.PI / (PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * densityKgM3)
  );
  
  // Convert to parsecs
  return jeansLengthMeters / PHYSICS_CONSTANTS.PARSEC;
}

/**
 * Calculate magnetic flux-to-mass ratio
 * 
 * Formula: λ = B × πR² / M
 * 
 * Normalized to critical value; affects disk formation and angular momentum transport
 * 
 * @param magneticFieldStrength - Magnetic field strength in microgauss (μG)
 * @param radius - Cloud radius in parsecs
 * @param mass - Cloud mass in solar masses
 * @returns Magnetic flux-to-mass ratio (normalized units)
 */
export function calculateMagneticFluxToMassRatio(
  magneticFieldStrength: number,
  radius: number,
  mass: number
): number {
  // Convert to SI units
  const fieldTesla = magneticFieldStrength * 1e-10; // μG to Tesla (1 μG = 10^-10 T)
  const radiusMeters = radius * PHYSICS_CONSTANTS.PARSEC;
  const massKg = mass * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  // Calculate magnetic flux
  const area = Math.PI * Math.pow(radiusMeters, 2);
  const magneticFlux = fieldTesla * area; // Weber (Wb)
  
  // Calculate flux-to-mass ratio
  const fluxToMassRatio = magneticFlux / massKg;
  
  // Normalize to critical value
  // Critical flux-to-mass ratio for molecular clouds: ~2-3 × 10^-21 Wb/kg
  const criticalRatio = 2.5e-21; // Wb/kg
  
  return fluxToMassRatio / criticalRatio;
}

/**
 * Calculate all derived cloud properties from input parameters
 * 
 * This is the main function that computes all derived quantities
 * 
 * @param params - Cloud parameters
 * @returns Complete set of derived cloud properties
 */
export function calculateDerivedProperties(params: CloudParameters): DerivedCloudProperties {
  // Apply defaults for optional parameters
  const temperature = params.temperature ?? CLOUD_PARAMETER_DEFAULTS.TEMPERATURE;
  const radius = params.radius ?? CLOUD_PARAMETER_DEFAULTS.RADIUS;
  const turbulenceVelocity = params.turbulenceVelocity ?? CLOUD_PARAMETER_DEFAULTS.TURBULENCE_VELOCITY;
  const magneticFieldStrength = params.magneticFieldStrength ?? CLOUD_PARAMETER_DEFAULTS.MAGNETIC_FIELD_STRENGTH;
  
  // Calculate density first (needed for other calculations)
  const density = calculateDensity(params.mass, radius);
  
  // Calculate virial parameter
  const virialParameter = calculateVirialParameter(params.mass, radius, turbulenceVelocity);
  
  // Calculate Jeans mass
  const jeansMass = calculateJeansMass(temperature, density);
  
  // Calculate collapse timescale
  const collapseTimescale = calculateCollapseTimescale(density);
  
  // Determine if cloud is bound (virial parameter < 2)
  const isBound = virialParameter < 2;
  
  // Calculate turbulent Jeans length
  const turbulentJeansLength = calculateTurbulentJeansLength(turbulenceVelocity, density);
  
  // Calculate magnetic flux-to-mass ratio
  const magneticFluxToMassRatio = calculateMagneticFluxToMassRatio(
    magneticFieldStrength,
    radius,
    params.mass
  );
  
  return {
    density,
    virialParameter,
    jeansMass,
    collapseTimescale,
    isBound,
    turbulentJeansLength,
    magneticFluxToMassRatio,
  };
}
