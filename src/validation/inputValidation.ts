/**
 * Input Validation Module
 * Provides validation functions for user inputs and simulation parameters
 */

import { CloudParameters } from '../types/core';
import { VALIDATION_RANGES } from '../constants/physics';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate cloud mass input
 * @param mass - Mass in solar masses
 * @returns Validation result with error messages if invalid
 */
export function validateMass(mass: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof mass !== 'number' || isNaN(mass)) {
    errors.push('Mass must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(mass)) {
    errors.push('Mass must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.CLOUD_MASS;
  
  if (mass < min) {
    errors.push(`Mass must be at least ${min} ${unit} (provided: ${mass} ${unit})`);
  }
  
  if (mass > max) {
    errors.push(`Mass must not exceed ${max} ${unit} (provided: ${mass} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate metallicity input
 * @param metallicity - Metallicity relative to solar (Z☉)
 * @returns Validation result with error messages if invalid
 */
export function validateMetallicity(metallicity: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof metallicity !== 'number' || isNaN(metallicity)) {
    errors.push('Metallicity must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(metallicity)) {
    errors.push('Metallicity must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.METALLICITY;
  
  if (metallicity < min) {
    errors.push(`Metallicity must be at least ${min} ${unit} (provided: ${metallicity} ${unit})`);
  }
  
  if (metallicity > max) {
    errors.push(`Metallicity must not exceed ${max} ${unit} (provided: ${metallicity} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate angular momentum input
 * @param angularMomentum - Angular momentum in kg⋅m²/s
 * @returns Validation result with error messages if invalid
 */
export function validateAngularMomentum(angularMomentum: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof angularMomentum !== 'number' || isNaN(angularMomentum)) {
    errors.push('Angular momentum must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(angularMomentum)) {
    errors.push('Angular momentum must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.ANGULAR_MOMENTUM;
  
  if (angularMomentum < min) {
    errors.push(`Angular momentum must be at least ${min} ${unit} (provided: ${angularMomentum} ${unit})`);
  }
  
  if (angularMomentum > max) {
    errors.push(`Angular momentum must not exceed ${max} ${unit} (provided: ${angularMomentum} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate temperature input
 * @param temperature - Temperature in Kelvin
 * @returns Validation result with error messages if invalid
 */
export function validateTemperature(temperature: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof temperature !== 'number' || isNaN(temperature)) {
    errors.push('Temperature must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(temperature)) {
    errors.push('Temperature must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.TEMPERATURE;
  
  if (temperature < min) {
    errors.push(`Temperature must be at least ${min} ${unit} (provided: ${temperature} ${unit})`);
  }
  
  if (temperature > max) {
    errors.push(`Temperature must not exceed ${max} ${unit} (provided: ${temperature} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate radius input
 * @param radius - Radius in parsecs
 * @returns Validation result with error messages if invalid
 */
export function validateRadius(radius: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof radius !== 'number' || isNaN(radius)) {
    errors.push('Radius must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(radius)) {
    errors.push('Radius must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.RADIUS;
  
  if (radius < min) {
    errors.push(`Radius must be at least ${min} ${unit} (provided: ${radius} ${unit})`);
  }
  
  if (radius > max) {
    errors.push(`Radius must not exceed ${max} ${unit} (provided: ${radius} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate turbulence velocity input
 * @param turbulenceVelocity - Turbulence velocity in km/s
 * @returns Validation result with error messages if invalid
 */
export function validateTurbulenceVelocity(turbulenceVelocity: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof turbulenceVelocity !== 'number' || isNaN(turbulenceVelocity)) {
    errors.push('Turbulence velocity must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(turbulenceVelocity)) {
    errors.push('Turbulence velocity must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.TURBULENCE_VELOCITY;
  
  if (turbulenceVelocity < min) {
    errors.push(`Turbulence velocity must be at least ${min} ${unit} (provided: ${turbulenceVelocity} ${unit})`);
  }
  
  if (turbulenceVelocity > max) {
    errors.push(`Turbulence velocity must not exceed ${max} ${unit} (provided: ${turbulenceVelocity} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate magnetic field strength input
 * @param magneticFieldStrength - Magnetic field strength in microgauss (μG)
 * @returns Validation result with error messages if invalid
 */
export function validateMagneticFieldStrength(magneticFieldStrength: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof magneticFieldStrength !== 'number' || isNaN(magneticFieldStrength)) {
    errors.push('Magnetic field strength must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(magneticFieldStrength)) {
    errors.push('Magnetic field strength must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH;
  
  if (magneticFieldStrength < min) {
    errors.push(`Magnetic field strength must be at least ${min} ${unit} (provided: ${magneticFieldStrength} ${unit})`);
  }
  
  if (magneticFieldStrength > max) {
    errors.push(`Magnetic field strength must not exceed ${max} ${unit} (provided: ${magneticFieldStrength} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate complete cloud parameters
 * @param params - Cloud parameters to validate
 * @returns Validation result with all error messages
 */
export function validateCloudParameters(params: CloudParameters): ValidationResult {
  const errors: string[] = [];
  
  // Validate mass
  const massValidation = validateMass(params.mass);
  if (!massValidation.isValid) {
    errors.push(...massValidation.errors);
  }
  
  // Validate metallicity
  const metallicityValidation = validateMetallicity(params.metallicity);
  if (!metallicityValidation.isValid) {
    errors.push(...metallicityValidation.errors);
  }
  
  // Validate angular momentum
  const angularMomentumValidation = validateAngularMomentum(params.angularMomentum);
  if (!angularMomentumValidation.isValid) {
    errors.push(...angularMomentumValidation.errors);
  }
  
  // Validate temperature (if provided)
  if (params.temperature !== undefined) {
    const temperatureValidation = validateTemperature(params.temperature);
    if (!temperatureValidation.isValid) {
      errors.push(...temperatureValidation.errors);
    }
  }
  
  // Validate radius (if provided)
  if (params.radius !== undefined) {
    const radiusValidation = validateRadius(params.radius);
    if (!radiusValidation.isValid) {
      errors.push(...radiusValidation.errors);
    }
  }
  
  // Validate turbulence velocity (if provided)
  if (params.turbulenceVelocity !== undefined) {
    const turbulenceValidation = validateTurbulenceVelocity(params.turbulenceVelocity);
    if (!turbulenceValidation.isValid) {
      errors.push(...turbulenceValidation.errors);
    }
  }
  
  // Validate magnetic field strength (if provided)
  if (params.magneticFieldStrength !== undefined) {
    const magneticFieldValidation = validateMagneticFieldStrength(params.magneticFieldStrength);
    if (!magneticFieldValidation.isValid) {
      errors.push(...magneticFieldValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate time scale input
 * @param timeScale - Time scale multiplier
 * @returns Validation result with error messages if invalid
 */
export function validateTimeScale(timeScale: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof timeScale !== 'number' || isNaN(timeScale)) {
    errors.push('Time scale must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(timeScale)) {
    errors.push('Time scale must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.TIME_SCALE;
  
  if (timeScale <= 0) {
    errors.push('Time scale must be positive');
  } else if (timeScale < min) {
    errors.push(`Time scale must be at least ${min}${unit} (provided: ${timeScale}${unit})`);
  }
  
  if (timeScale > max) {
    errors.push(`Time scale must not exceed ${max}${unit} (provided: ${timeScale}${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate simulation time input
 * @param time - Time in years
 * @returns Validation result with error messages if invalid
 */
export function validateSimulationTime(time: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof time !== 'number' || isNaN(time)) {
    errors.push('Simulation time must be a valid number');
    return { isValid: false, errors };
  }
  
  if (!isFinite(time)) {
    errors.push('Simulation time must be a finite number');
    return { isValid: false, errors };
  }
  
  const { min, max, unit } = VALIDATION_RANGES.SIMULATION_TIME;
  
  if (time < min) {
    errors.push(`Simulation time must be at least ${min} ${unit} (provided: ${time} ${unit})`);
  }
  
  if (time > max) {
    errors.push(`Simulation time must not exceed ${max} ${unit} (provided: ${time} ${unit})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get validation ranges for display in UI
 * @returns Object containing all validation ranges
 */
export function getValidationRanges() {
  return {
    mass: {
      min: VALIDATION_RANGES.CLOUD_MASS.min,
      max: VALIDATION_RANGES.CLOUD_MASS.max,
      unit: VALIDATION_RANGES.CLOUD_MASS.unit
    },
    metallicity: {
      min: VALIDATION_RANGES.METALLICITY.min,
      max: VALIDATION_RANGES.METALLICITY.max,
      unit: VALIDATION_RANGES.METALLICITY.unit
    },
    angularMomentum: {
      min: VALIDATION_RANGES.ANGULAR_MOMENTUM.min,
      max: VALIDATION_RANGES.ANGULAR_MOMENTUM.max,
      unit: VALIDATION_RANGES.ANGULAR_MOMENTUM.unit
    },
    temperature: {
      min: VALIDATION_RANGES.TEMPERATURE.min,
      max: VALIDATION_RANGES.TEMPERATURE.max,
      unit: VALIDATION_RANGES.TEMPERATURE.unit
    },
    radius: {
      min: VALIDATION_RANGES.RADIUS.min,
      max: VALIDATION_RANGES.RADIUS.max,
      unit: VALIDATION_RANGES.RADIUS.unit
    },
    turbulenceVelocity: {
      min: VALIDATION_RANGES.TURBULENCE_VELOCITY.min,
      max: VALIDATION_RANGES.TURBULENCE_VELOCITY.max,
      unit: VALIDATION_RANGES.TURBULENCE_VELOCITY.unit
    },
    magneticFieldStrength: {
      min: VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH.min,
      max: VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH.max,
      unit: VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH.unit
    },
    timeScale: {
      min: VALIDATION_RANGES.TIME_SCALE.min,
      max: VALIDATION_RANGES.TIME_SCALE.max,
      unit: VALIDATION_RANGES.TIME_SCALE.unit
    },
    simulationTime: {
      min: VALIDATION_RANGES.SIMULATION_TIME.min,
      max: VALIDATION_RANGES.SIMULATION_TIME.max,
      unit: VALIDATION_RANGES.SIMULATION_TIME.unit
    }
  };
}
