/**
 * Validation Module
 * Exports all validation and error handling functionality
 */

export {
  validateMass,
  validateMetallicity,
  validateAngularMomentum,
  validateCloudParameters,
  validateTimeScale,
  validateSimulationTime,
  getValidationRanges,
  type ValidationResult,
} from './inputValidation';

export {
  SimulationError,
  SimulationErrorType,
  ErrorLogger,
  errorLogger,
  checkNumericalStability,
  checkExtremeValue,
  clampValue,
  safeDivide,
  safeSqrt,
  safePow,
  withErrorHandling,
  type ErrorLog,
} from './errorHandling';

export {
  checkBinaryStability,
  checkHierarchicalStability,
  checkSystemStability,
  checkPlanetaryOrbitStability,
  estimateStabilityLifetime,
} from './orbitalStability';
