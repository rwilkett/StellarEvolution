/**
 * Cloud Parameters Input Component
 * Allows users to input initial cloud parameters for simulation
 */

import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { CloudParameters } from '../types/core';
import { VALIDATION_RANGES } from '../constants/physics';
import { Tooltip } from './Tooltip';
import { DerivedPropertiesDisplay } from './DerivedPropertiesDisplay';

export const CloudParametersInput: React.FC = () => {
  const { initializeSimulation, error, clearError } = useSimulation();
  const { showSuccess, showError } = useToast();
  
  const [mass, setMass] = useState('10');
  const [metallicity, setMetallicity] = useState('1.0');
  const [angularMomentum, setAngularMomentum] = useState('1e48');
  const [temperature, setTemperature] = useState('20');
  const [radius, setRadius] = useState('10');
  const [turbulenceVelocity, setTurbulenceVelocity] = useState('1');
  const [magneticFieldStrength, setMagneticFieldStrength] = useState('10');
  
  const [validationErrors, setValidationErrors] = useState<{
    mass?: string;
    metallicity?: string;
    angularMomentum?: string;
    temperature?: string;
    radius?: string;
    turbulenceVelocity?: string;
    magneticFieldStrength?: string;
  }>({});

  const validateInput = (
    field: 'mass' | 'metallicity' | 'angularMomentum' | 'temperature' | 'radius' | 'turbulenceVelocity' | 'magneticFieldStrength',
    value: string
  ): string | undefined => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }
    
    if (field === 'mass') {
      const { min, max } = VALIDATION_RANGES.CLOUD_MASS;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} M☉`;
      }
    } else if (field === 'metallicity') {
      const { min, max } = VALIDATION_RANGES.METALLICITY;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} Z☉`;
      }
    } else if (field === 'angularMomentum') {
      const { min, max } = VALIDATION_RANGES.ANGULAR_MOMENTUM;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max}`;
      }
    } else if (field === 'temperature') {
      const { min, max } = VALIDATION_RANGES.TEMPERATURE;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} K`;
      }
    } else if (field === 'radius') {
      const { min, max } = VALIDATION_RANGES.RADIUS;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} pc`;
      }
    } else if (field === 'turbulenceVelocity') {
      const { min, max } = VALIDATION_RANGES.TURBULENCE_VELOCITY;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} km/s`;
      }
    } else if (field === 'magneticFieldStrength') {
      const { min, max } = VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH;
      if (numValue < min || numValue > max) {
        return `Must be between ${min} and ${max} μG`;
      }
    }
    
    return undefined;
  };

  const handleMassChange = (value: string) => {
    setMass(value);
    const error = validateInput('mass', value);
    setValidationErrors(prev => ({ ...prev, mass: error }));
    if (error) clearError();
  };

  const handleMetallicityChange = (value: string) => {
    setMetallicity(value);
    const error = validateInput('metallicity', value);
    setValidationErrors(prev => ({ ...prev, metallicity: error }));
    if (error) clearError();
  };

  const handleAngularMomentumChange = (value: string) => {
    setAngularMomentum(value);
    const error = validateInput('angularMomentum', value);
    setValidationErrors(prev => ({ ...prev, angularMomentum: error }));
    if (error) clearError();
  };

  const handleTemperatureChange = (value: string) => {
    setTemperature(value);
    const error = validateInput('temperature', value);
    setValidationErrors(prev => ({ ...prev, temperature: error }));
    if (error) clearError();
  };

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    const error = validateInput('radius', value);
    setValidationErrors(prev => ({ ...prev, radius: error }));
    if (error) clearError();
  };

  const handleTurbulenceVelocityChange = (value: string) => {
    setTurbulenceVelocity(value);
    const error = validateInput('turbulenceVelocity', value);
    setValidationErrors(prev => ({ ...prev, turbulenceVelocity: error }));
    if (error) clearError();
  };

  const handleMagneticFieldStrengthChange = (value: string) => {
    setMagneticFieldStrength(value);
    const error = validateInput('magneticFieldStrength', value);
    setValidationErrors(prev => ({ ...prev, magneticFieldStrength: error }));
    if (error) clearError();
  };

  const handleCreateSimulation = () => {
    // Validate all inputs
    const massError = validateInput('mass', mass);
    const metallicityError = validateInput('metallicity', metallicity);
    const angularMomentumError = validateInput('angularMomentum', angularMomentum);
    const temperatureError = validateInput('temperature', temperature);
    const radiusError = validateInput('radius', radius);
    const turbulenceVelocityError = validateInput('turbulenceVelocity', turbulenceVelocity);
    const magneticFieldStrengthError = validateInput('magneticFieldStrength', magneticFieldStrength);
    
    setValidationErrors({
      mass: massError,
      metallicity: metallicityError,
      angularMomentum: angularMomentumError,
      temperature: temperatureError,
      radius: radiusError,
      turbulenceVelocity: turbulenceVelocityError,
      magneticFieldStrength: magneticFieldStrengthError,
    });
    
    // If any validation errors, don't proceed
    if (massError || metallicityError || angularMomentumError || temperatureError || 
        radiusError || turbulenceVelocityError || magneticFieldStrengthError) {
      return;
    }
    
    // Create cloud parameters
    const params: CloudParameters = {
      mass: parseFloat(mass),
      metallicity: parseFloat(metallicity),
      angularMomentum: parseFloat(angularMomentum),
      temperature: parseFloat(temperature),
      radius: parseFloat(radius),
      turbulenceVelocity: parseFloat(turbulenceVelocity),
      magneticFieldStrength: parseFloat(magneticFieldStrength),
    };
    
    // Initialize simulation
    try {
      initializeSimulation(params);
      showSuccess('Simulation created successfully!');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create simulation');
    }
  };

  const hasValidationErrors = Object.values(validationErrors).some(err => err !== undefined);

  // Create current cloud parameters for derived properties display
  const currentCloudParams = useMemo((): CloudParameters => {
    return {
      mass: parseFloat(mass) || 0,
      metallicity: parseFloat(metallicity) || 0,
      angularMomentum: parseFloat(angularMomentum) || 0,
      temperature: parseFloat(temperature) || 0,
      radius: parseFloat(radius) || 0,
      turbulenceVelocity: parseFloat(turbulenceVelocity) || 0,
      magneticFieldStrength: parseFloat(magneticFieldStrength) || 0,
    };
  }, [mass, metallicity, angularMomentum, temperature, radius, turbulenceVelocity, magneticFieldStrength]);

  // Check if all inputs are valid numbers for derived properties display
  const canShowDerivedProperties = !hasValidationErrors && 
    !isNaN(parseFloat(mass)) &&
    !isNaN(parseFloat(metallicity)) &&
    !isNaN(parseFloat(angularMomentum)) &&
    !isNaN(parseFloat(temperature)) &&
    !isNaN(parseFloat(radius)) &&
    !isNaN(parseFloat(turbulenceVelocity)) &&
    !isNaN(parseFloat(magneticFieldStrength));

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Initial Cloud Parameters</h3>
      
      {/* Basic Properties Section */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', color: '#495057' }}>
          Basic Properties
        </h4>
        
        {/* Mass Input */}
        <div style={{ marginBottom: '15px' }}>
          <Tooltip content="Total mass of the molecular cloud in solar masses. Higher mass can lead to multiple star formation.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Mass (M☉)
            </label>
          </Tooltip>
          <input
            type="text"
            value={mass}
            onChange={(e) => handleMassChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.mass ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.CLOUD_MASS.min} - {VALIDATION_RANGES.CLOUD_MASS.max} M☉
          </div>
          {validationErrors.mass && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.mass}
            </div>
          )}
        </div>
        
        {/* Metallicity Input */}
        <div style={{ marginBottom: '15px' }}>
          <Tooltip content="Fraction of heavy elements relative to the Sun. Affects planet formation and stellar properties.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Metallicity (Z☉)
            </label>
          </Tooltip>
          <input
            type="text"
            value={metallicity}
            onChange={(e) => handleMetallicityChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.metallicity ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.METALLICITY.min} - {VALIDATION_RANGES.METALLICITY.max} Z☉
          </div>
          {validationErrors.metallicity && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.metallicity}
            </div>
          )}
        </div>
        
        {/* Angular Momentum Input */}
        <div style={{ marginBottom: 0 }}>
          <Tooltip content="Rotational momentum of the cloud. Higher values increase the likelihood of binary star formation.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Angular Momentum (kg⋅m²/s)
            </label>
          </Tooltip>
          <input
            type="text"
            value={angularMomentum}
            onChange={(e) => handleAngularMomentumChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.angularMomentum ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.ANGULAR_MOMENTUM.min} - {VALIDATION_RANGES.ANGULAR_MOMENTUM.max.toExponential()}
          </div>
          {validationErrors.angularMomentum && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.angularMomentum}
            </div>
          )}
        </div>
      </div>

      {/* Physical Properties Section */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', color: '#495057' }}>
          Physical Properties
        </h4>
        
        {/* Temperature Input */}
        <div style={{ marginBottom: '15px' }}>
          <Tooltip content="Initial temperature of the molecular cloud. Lower temperatures lead to easier collapse and higher star formation efficiency.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Temperature (K)
            </label>
          </Tooltip>
          <input
            type="text"
            value={temperature}
            onChange={(e) => handleTemperatureChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.temperature ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.TEMPERATURE.min} - {VALIDATION_RANGES.TEMPERATURE.max} K
          </div>
          {validationErrors.temperature && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.temperature}
            </div>
          )}
        </div>
        
        {/* Radius Input */}
        <div style={{ marginBottom: 0 }}>
          <Tooltip content="Physical size of the molecular cloud in parsecs. Affects cloud density and collapse timescale.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Radius (pc)
            </label>
          </Tooltip>
          <input
            type="text"
            value={radius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.radius ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.RADIUS.min} - {VALIDATION_RANGES.RADIUS.max} pc
          </div>
          {validationErrors.radius && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.radius}
            </div>
          )}
        </div>
      </div>

      {/* Dynamical Properties Section */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '14px', color: '#495057' }}>
          Dynamical Properties
        </h4>
        
        {/* Turbulence Velocity Input */}
        <div style={{ marginBottom: '15px' }}>
          <Tooltip content="Velocity dispersion of turbulent motions within the cloud. Higher turbulence increases fragmentation into multiple stars.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Turbulence Velocity (km/s)
            </label>
          </Tooltip>
          <input
            type="text"
            value={turbulenceVelocity}
            onChange={(e) => handleTurbulenceVelocityChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.turbulenceVelocity ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.TURBULENCE_VELOCITY.min} - {VALIDATION_RANGES.TURBULENCE_VELOCITY.max} km/s
          </div>
          {validationErrors.turbulenceVelocity && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.turbulenceVelocity}
            </div>
          )}
        </div>
        
        {/* Magnetic Field Strength Input */}
        <div style={{ marginBottom: 0 }}>
          <Tooltip content="Strength of the magnetic field threading through the cloud. Affects disk formation and angular momentum transport.">
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Magnetic Field Strength (μG)
            </label>
          </Tooltip>
          <input
            type="text"
            value={magneticFieldStrength}
            onChange={(e) => handleMagneticFieldStrengthChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: validationErrors.magneticFieldStrength ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            Valid range: {VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH.min} - {VALIDATION_RANGES.MAGNETIC_FIELD_STRENGTH.max} μG
          </div>
          {validationErrors.magneticFieldStrength && (
            <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
              {validationErrors.magneticFieldStrength}
            </div>
          )}
        </div>
      </div>
      
      {/* Derived Properties Display */}
      {canShowDerivedProperties && (
        <DerivedPropertiesDisplay cloudParams={currentCloudParams} />
      )}

      {/* Create Simulation Button */}
      <button
        onClick={handleCreateSimulation}
        disabled={hasValidationErrors}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: hasValidationErrors ? '#95a5a6' : '#27ae60',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: hasValidationErrors ? 'not-allowed' : 'pointer',
          marginTop: '15px',
        }}
      >
        Create Simulation
      </button>
      
      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          color: '#c0392b',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
