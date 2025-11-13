/**
 * Stellar physics calculation functions
 * Implements mass-luminosity relations, stellar lifetimes, and spectral classifications
 */

import {
  PHYSICS_CONSTANTS,
  MASS_LUMINOSITY_EXPONENTS,
  LIFETIME_CONSTANTS,
  SPECTRAL_TYPE_TEMPERATURES,
} from '../constants/physics';
import { SpectralType } from '../types/core';

/**
 * Calculate stellar luminosity from mass using mass-luminosity relation
 * Uses different exponents for different mass ranges
 * @param mass - Stellar mass in solar masses
 * @returns Luminosity in solar luminosities
 */
export function calculateLuminosity(mass: number): number {
  if (mass < 0.43) {
    // Low mass stars: L ∝ M^2.3
    return Math.pow(mass, MASS_LUMINOSITY_EXPONENTS.LOW_MASS);
  } else if (mass < 2) {
    // Mid mass stars: L ∝ M^4.0
    return Math.pow(mass, MASS_LUMINOSITY_EXPONENTS.MID_MASS);
  } else if (mass < 55) {
    // High mass stars: L ∝ M^3.5
    return Math.pow(mass, MASS_LUMINOSITY_EXPONENTS.HIGH_MASS);
  } else {
    // Very high mass stars: L ∝ M^1.0
    return Math.pow(mass, MASS_LUMINOSITY_EXPONENTS.VERY_HIGH_MASS);
  }
}

/**
 * Calculate stellar radius from mass for main sequence stars
 * Uses empirical mass-radius relation
 * @param mass - Stellar mass in solar masses
 * @returns Radius in solar radii
 */
export function calculateRadius(mass: number): number {
  if (mass < 1) {
    // Low mass stars: R ∝ M^0.8
    return Math.pow(mass, 0.8);
  } else {
    // Higher mass stars: R ∝ M^0.57
    return Math.pow(mass, 0.57);
  }
}

/**
 * Calculate main sequence lifetime from mass
 * Lifetime ∝ M / L ∝ M^-2.5 (approximately)
 * @param mass - Stellar mass in solar masses
 * @returns Main sequence lifetime in years
 */
export function calculateMainSequenceLifetime(mass: number): number {
  const luminosity = calculateLuminosity(mass);
  // Lifetime = (mass / luminosity) * base_lifetime
  // For solar mass star: lifetime ≈ 10 billion years
  return (mass / luminosity) * LIFETIME_CONSTANTS.MAIN_SEQUENCE_COEFFICIENT;
}

/**
 * Calculate stellar effective temperature from luminosity and radius
 * Uses Stefan-Boltzmann law: L = 4πR²σT⁴
 * @param luminosity - Luminosity in solar luminosities
 * @param radius - Radius in solar radii
 * @returns Effective temperature in Kelvin
 */
export function calculateTemperature(luminosity: number, radius: number): number {
  // Convert to SI units
  const luminositySI = luminosity * PHYSICS_CONSTANTS.SOLAR_LUMINOSITY;
  const radiusSI = radius * PHYSICS_CONSTANTS.SOLAR_RADIUS;
  
  // Stefan-Boltzmann law: L = 4πR²σT⁴
  // Solving for T: T = (L / (4πR²σ))^(1/4)
  const temperature4 = luminositySI / (
    4 * Math.PI * radiusSI * radiusSI * PHYSICS_CONSTANTS.STEFAN_BOLTZMANN
  );
  
  return Math.pow(temperature4, 0.25);
}

/**
 * Calculate color temperature from luminosity and radius
 * Alternative method using Wien's displacement law
 * @param luminosity - Luminosity in solar luminosities
 * @param radius - Radius in solar radii
 * @returns Temperature in Kelvin
 */
export function calculateColorTemperature(luminosity: number, radius: number): number {
  // Use Stefan-Boltzmann for effective temperature
  return calculateTemperature(luminosity, radius);
}

/**
 * Determine spectral type from temperature
 * @param temperature - Effective temperature in Kelvin
 * @returns Spectral type classification
 */
export function determineSpectralType(temperature: number): SpectralType {
  if (temperature >= SPECTRAL_TYPE_TEMPERATURES.O.min) {
    return SpectralType.O;
  } else if (temperature >= SPECTRAL_TYPE_TEMPERATURES.B.min) {
    return SpectralType.B;
  } else if (temperature >= SPECTRAL_TYPE_TEMPERATURES.A.min) {
    return SpectralType.A;
  } else if (temperature >= SPECTRAL_TYPE_TEMPERATURES.F.min) {
    return SpectralType.F;
  } else if (temperature >= SPECTRAL_TYPE_TEMPERATURES.G.min) {
    return SpectralType.G;
  } else if (temperature >= SPECTRAL_TYPE_TEMPERATURES.K.min) {
    return SpectralType.K;
  } else {
    return SpectralType.M;
  }
}

/**
 * Calculate all initial stellar properties from mass
 * Convenience function that calculates luminosity, radius, temperature, and spectral type
 * @param mass - Stellar mass in solar masses
 * @returns Object containing all calculated properties
 */
export function calculateInitialStellarProperties(mass: number) {
  const luminosity = calculateLuminosity(mass);
  const radius = calculateRadius(mass);
  const temperature = calculateTemperature(luminosity, radius);
  const spectralType = determineSpectralType(temperature);
  const lifetime = calculateMainSequenceLifetime(mass);
  
  return {
    luminosity,
    radius,
    temperature,
    spectralType,
    lifetime,
  };
}
