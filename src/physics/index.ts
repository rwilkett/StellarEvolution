/**
 * Physics models library
 * Exports all physics calculation functions
 */

// Stellar physics
export {
  calculateLuminosity,
  calculateRadius,
  calculateMainSequenceLifetime,
  calculateTemperature,
  calculateColorTemperature,
  determineSpectralType,
  calculateInitialStellarProperties,
} from './stellarPhysics';

// Orbital mechanics
export {
  calculateOrbitalPeriod,
  calculateSemiMajorAxis,
  calculateMeanAnomaly,
  solveKeplerEquation,
  calculateTrueAnomaly,
  calculateOrbitalPosition,
  calculateOrbitalParametersFromAngularMomentum,
  checkSystemStability,
  calculateHillSphereRadius,
} from './orbitalMechanics';

// Planetary formation
export {
  calculateDiskMass,
  calculateDiskExtent,
  calculateSnowLine,
  calculateDiskProperties,
  determinePlanetComposition,
  calculatePlanetMass,
  calculatePlanetSpacing,
  generatePlanetOrbitalDistances,
  canFormPlanets,
  calculatePlanetRadius,
  applyMagneticBraking,
} from './planetaryFormation';

// Derived cloud properties
export {
  calculateDensity,
  calculateVirialParameter,
  calculateJeansMass,
  calculateCollapseTimescale,
  calculateTurbulentJeansLength,
  calculateMagneticFluxToMassRatio,
  calculateDerivedProperties,
} from './derivedCloudProperties';
