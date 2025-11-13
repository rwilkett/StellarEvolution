/**
 * Simulation Module Exports
 * Central export point for all simulation functionality
 */

// Cloud Formation
export {
  calculateJeansMass,
  determineFragmentation,
  calculateMassDistribution,
  willCloudCollapse,
  calculateNumberOfStars,
  generateStarFromMass,
  configureBinarySystem,
  configureMultipleStarSystem,
  generateStarSystemFromCloud,
} from './cloudFormation';

// Stellar Evolution
export {
  createStar,
  initializeStar,
  assignSpectralType,
  calculateLifetime,
  determineEvolutionPhase,
  determineFinalState,
  evolveStar,
  evolveStarByTime,
} from './stellarEvolution';

// Planetary Formation
export {
  createProtoplanetaryDisk,
  hasSufficientMassForPlanets,
  calculateDiskMetallicity,
  determineDiskExtent,
  generatePlanets,
  calculatePlanetMassDistribution,
  calculatePlanetOrbitalParameters,
  determinePlanetType,
  createPlanet,
} from './planetaryFormation';

// Simulation Controller
export { SimulationController } from './SimulationController';
