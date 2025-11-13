/**
 * Cloud Parameters Input Component
 * Allows users to input initial cloud parameters for simulation
 */

import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { CloudParameters } from '../types/core';
import { VALIDATION_RANGES } from '../constants/physics';
import { Tooltip } from './Tooltip';

export const CloudParametersInput: React.FC = () => {
  const { initializeSimulation, error, clearError } = useSimulation();
  const { showSuccess, showError } = useToast();
  
  const [mass, setMass] = useState('10');
  const [metallicity, setMetallicity] = useState('1.0');
  const [angularMomentum, setAngularMomentum] = useState('1e48');
  
  const [validationErrors, setValidationErrors] = useState<{
    mass?: string;
    metallicity?: string;
    angularMomentum?: string;
  }>({});

  const validateInput = (field: 'mass' | 'metallicity' | 'angularMomentum', value: string): string | undefined => {
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

  const handleCreateSimulation = () => {
    // Validate all inputs
    const massError = validateInput('mass', mass);
    const metallicityError = validateInput('metallicity', metallicity);
    const angularMomentumError = validateInput('angularMomentum', angularMomentum);
    
    setValidationErrors({
      mass: massError,
      metallicity: metallicityError,
      angularMomentum: angularMomentumError,
    });
    
    // If any validation errors, don't proceed
    if (massError || metallicityError || angularMomentumError) {
      return;
    }
    
    // Create cloud parameters
    const params: CloudParameters = {
      mass: parseFloat(mass),
      metallicity: parseFloat(metallicity),
      angularMomentum: parseFloat(angularMomentum),
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

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Initial Cloud Parameters</h3>
      
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
      <div style={{ marginBottom: '15px' }}>
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
