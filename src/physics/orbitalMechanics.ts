/**
 * Orbital mechanics calculation functions
 * Implements Kepler's laws and orbital dynamics for stellar systems
 */

import { PHYSICS_CONSTANTS } from '../constants/physics';
import { Vector3, OrbitalParameters } from '../types/core';

/**
 * Calculate orbital period using Kepler's third law
 * T² = (4π²/GM) * a³
 * @param semiMajorAxis - Semi-major axis in AU
 * @param totalMass - Total mass of the system in solar masses
 * @returns Orbital period in years
 */
export function calculateOrbitalPeriod(
  semiMajorAxis: number,
  totalMass: number
): number {
  // Convert semi-major axis from AU to meters
  const semiMajorAxisMeters = semiMajorAxis * PHYSICS_CONSTANTS.AU;
  
  // Convert total mass from solar masses to kg
  const totalMassKg = totalMass * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  // Kepler's third law: T² = (4π²/GM) * a³
  const periodSquaredSeconds = (
    (4 * Math.PI * Math.PI) / 
    (PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * totalMassKg)
  ) * Math.pow(semiMajorAxisMeters, 3);
  
  const periodSeconds = Math.sqrt(periodSquaredSeconds);
  
  // Convert from seconds to years
  return periodSeconds / PHYSICS_CONSTANTS.SECONDS_PER_YEAR;
}

/**
 * Calculate semi-major axis from orbital period using Kepler's third law
 * a³ = (GMT²)/(4π²)
 * @param period - Orbital period in years
 * @param totalMass - Total mass of the system in solar masses
 * @returns Semi-major axis in AU
 */
export function calculateSemiMajorAxis(
  period: number,
  totalMass: number
): number {
  // Convert period from years to seconds
  const periodSeconds = period * PHYSICS_CONSTANTS.SECONDS_PER_YEAR;
  
  // Convert total mass from solar masses to kg
  const totalMassKg = totalMass * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  // Kepler's third law rearranged: a³ = (GMT²)/(4π²)
  const semiMajorAxisCubed = (
    PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * totalMassKg * periodSeconds * periodSeconds
  ) / (4 * Math.PI * Math.PI);
  
  const semiMajorAxisMeters = Math.pow(semiMajorAxisCubed, 1/3);
  
  // Convert from meters to AU
  return semiMajorAxisMeters / PHYSICS_CONSTANTS.AU;
}

/**
 * Calculate mean anomaly from time
 * M = n * t, where n = 2π/T is the mean motion
 * @param time - Time since periapsis in years
 * @param period - Orbital period in years
 * @returns Mean anomaly in radians
 */
export function calculateMeanAnomaly(time: number, period: number): number {
  const meanMotion = (2 * Math.PI) / period;
  return (meanMotion * time) % (2 * Math.PI);
}

/**
 * Solve Kepler's equation for eccentric anomaly
 * M = E - e*sin(E)
 * Uses Newton-Raphson iteration
 * @param meanAnomaly - Mean anomaly in radians
 * @param eccentricity - Orbital eccentricity
 * @param tolerance - Convergence tolerance (default: 1e-6)
 * @returns Eccentric anomaly in radians
 */
export function solveKeplerEquation(
  meanAnomaly: number,
  eccentricity: number,
  tolerance: number = 1e-6
): number {
  // Initial guess
  let E = meanAnomaly;
  
  // Newton-Raphson iteration
  let delta = 1;
  let iterations = 0;
  const maxIterations = 100;
  
  while (Math.abs(delta) > tolerance && iterations < maxIterations) {
    // f(E) = E - e*sin(E) - M
    const f = E - eccentricity * Math.sin(E) - meanAnomaly;
    // f'(E) = 1 - e*cos(E)
    const fPrime = 1 - eccentricity * Math.cos(E);
    
    delta = f / fPrime;
    E = E - delta;
    iterations++;
  }
  
  return E;
}

/**
 * Calculate true anomaly from eccentric anomaly
 * tan(ν/2) = sqrt((1+e)/(1-e)) * tan(E/2)
 * @param eccentricAnomaly - Eccentric anomaly in radians
 * @param eccentricity - Orbital eccentricity
 * @returns True anomaly in radians
 */
export function calculateTrueAnomaly(
  eccentricAnomaly: number,
  eccentricity: number
): number {
  const tanHalfNu = Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * 
                    Math.tan(eccentricAnomaly / 2);
  return 2 * Math.atan(tanHalfNu);
}

/**
 * Calculate orbital position in 3D space
 * @param params - Orbital parameters
 * @param time - Time since epoch in years
 * @returns Position vector in AU
 */
export function calculateOrbitalPosition(
  params: OrbitalParameters,
  time: number,
  period: number
): Vector3 {
  // Calculate mean anomaly
  const M = calculateMeanAnomaly(time, period);
  
  // Solve for eccentric anomaly
  const E = solveKeplerEquation(M, params.eccentricity);
  
  // Calculate true anomaly
  const nu = calculateTrueAnomaly(E, params.eccentricity);
  
  // Calculate distance from focus
  const r = params.semiMajorAxis * (1 - params.eccentricity * Math.cos(E));
  
  // Position in orbital plane
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  
  // Rotate to 3D space using orbital elements
  const cosOmega = Math.cos(params.longitudeOfAscendingNode);
  const sinOmega = Math.sin(params.longitudeOfAscendingNode);
  const cosW = Math.cos(params.argumentOfPeriapsis);
  const sinW = Math.sin(params.argumentOfPeriapsis);
  const cosI = Math.cos(params.inclination);
  const sinI = Math.sin(params.inclination);
  
  // Apply rotation matrices
  const x = (cosOmega * cosW - sinOmega * sinW * cosI) * xOrbital +
            (-cosOmega * sinW - sinOmega * cosW * cosI) * yOrbital;
  
  const y = (sinOmega * cosW + cosOmega * sinW * cosI) * xOrbital +
            (-sinOmega * sinW + cosOmega * cosW * cosI) * yOrbital;
  
  const z = (sinW * sinI) * xOrbital + (cosW * sinI) * yOrbital;
  
  return { x, y, z };
}

/**
 * Calculate orbital parameters from angular momentum and masses
 * @param angularMomentum - Specific angular momentum in m²/s
 * @param mass1 - Mass of first body in solar masses
 * @param mass2 - Mass of second body in solar masses
 * @param eccentricity - Desired eccentricity (default: 0 for circular)
 * @returns Orbital parameters
 */
export function calculateOrbitalParametersFromAngularMomentum(
  angularMomentum: number,
  mass1: number,
  mass2: number,
  eccentricity: number = 0
): OrbitalParameters {
  const totalMass = mass1 + mass2;
  const reducedMass = (mass1 * mass2) / totalMass;
  
  // Convert masses to kg
  const totalMassKg = totalMass * PHYSICS_CONSTANTS.SOLAR_MASS;
  const reducedMassKg = reducedMass * PHYSICS_CONSTANTS.SOLAR_MASS;
  
  // For circular orbit: L = μ * sqrt(G * M * a)
  // Solving for a: a = L² / (μ² * G * M)
  const semiMajorAxisMeters = (angularMomentum * angularMomentum) / 
    (reducedMassKg * reducedMassKg * PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * totalMassKg);
  
  const semiMajorAxis = semiMajorAxisMeters / PHYSICS_CONSTANTS.AU;
  
  // Random orbital angles for variety
  const inclination = Math.random() * Math.PI / 6; // 0-30 degrees
  const longitudeOfAscendingNode = Math.random() * 2 * Math.PI;
  const argumentOfPeriapsis = Math.random() * 2 * Math.PI;
  const meanAnomalyAtEpoch = Math.random() * 2 * Math.PI;
  
  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    longitudeOfAscendingNode,
    argumentOfPeriapsis,
    meanAnomalyAtEpoch,
  };
}

/**
 * Check stability of a multiple-star system
 * Uses simplified stability criteria based on separation ratios
 * @param innerSeparation - Separation of inner binary in AU
 * @param outerSeparation - Separation to third star in AU
 * @returns True if system is likely stable
 */
export function checkSystemStability(
  innerSeparation: number,
  outerSeparation: number
): boolean {
  // Hierarchical stability criterion: outer separation should be
  // at least 3-5 times the inner separation
  const separationRatio = outerSeparation / innerSeparation;
  return separationRatio >= 3.0;
}

/**
 * Calculate Hill sphere radius (sphere of gravitational influence)
 * @param semiMajorAxis - Semi-major axis in AU
 * @param primaryMass - Mass of primary body in solar masses
 * @param secondaryMass - Mass of secondary body in solar masses
 * @returns Hill sphere radius in AU
 */
export function calculateHillSphereRadius(
  semiMajorAxis: number,
  primaryMass: number,
  secondaryMass: number
): number {
  // Hill sphere radius: r_H = a * (m/(3M))^(1/3)
  return semiMajorAxis * Math.pow(secondaryMass / (3 * primaryMass), 1/3);
}
