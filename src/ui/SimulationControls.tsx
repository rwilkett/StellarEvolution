/**
 * Simulation Controls Component
 * Provides controls for starting, pausing, resetting, and adjusting simulation
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { SimulationState } from '../types/core';
import { Tooltip } from './Tooltip';

export const SimulationControls: React.FC = () => {
  const {
    system,
    state,
    timeScale,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setTimeScale,
    jumpToTime,
    updateSimulation,
  } = useSimulation();
  const { showSuccess, showInfo } = useToast();
  
  const [timeScaleInput, setTimeScaleInput] = useState(timeScale.toString());
  const [jumpToTimeInput, setJumpToTimeInput] = useState('');
  const [timeScaleError, setTimeScaleError] = useState<string | undefined>();
  const [jumpToTimeError, setJumpToTimeError] = useState<string | undefined>();

  // Update animation loop
  useEffect(() => {
    if (state !== SimulationState.RUNNING) {
      return;
    }

    let lastTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const currentTime = Date.now();
      const deltaRealTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Calculate simulation time delta based on time scale
      const deltaSimTime = deltaRealTime * timeScale;

      // Update simulation
      updateSimulation(deltaSimTime);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state, timeScale, updateSimulation]);

  const handleStartPause = () => {
    if (state === SimulationState.RUNNING) {
      pauseSimulation();
      showInfo('Simulation paused');
    } else {
      startSimulation();
      showSuccess('Simulation started');
    }
  };

  const handleReset = () => {
    resetSimulation();
    showInfo('Simulation reset to initial state');
  };

  const handleTimeScaleChange = (value: string) => {
    setTimeScaleInput(value);
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setTimeScaleError('Must be a positive number');
      return;
    }
    
    setTimeScaleError(undefined);
  };

  const handleTimeScaleApply = () => {
    const numValue = parseFloat(timeScaleInput);
    if (!isNaN(numValue) && numValue > 0) {
      setTimeScale(numValue);
      setTimeScaleError(undefined);
      showSuccess(`Time scale updated to ${numValue.toExponential(2)} years/second`);
    }
  };

  const handleJumpToTimeChange = (value: string) => {
    setJumpToTimeInput(value);
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setJumpToTimeError('Must be a non-negative number');
      return;
    }
    
    setJumpToTimeError(undefined);
  };

  const handleJumpToTimeApply = () => {
    const numValue = parseFloat(jumpToTimeInput);
    if (!isNaN(numValue) && numValue >= 0) {
      jumpToTime(numValue);
      setJumpToTimeError(undefined);
      setJumpToTimeInput('');
      showSuccess(`Jumped to ${numValue.toExponential(2)} years`);
    }
  };

  const isSimulationReady = system !== null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Simulation Controls</h3>
      
      {/* Start/Pause and Reset Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <Tooltip content={state === SimulationState.RUNNING ? 'Pause the simulation' : 'Start the simulation'}>
          <button
          onClick={handleStartPause}
          disabled={!isSimulationReady}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: !isSimulationReady ? '#95a5a6' : 
                           state === SimulationState.RUNNING ? '#e67e22' : '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: !isSimulationReady ? 'not-allowed' : 'pointer',
          }}
        >
          {state === SimulationState.RUNNING ? '⏸ Pause' : '▶ Start'}
          </button>
        </Tooltip>
        
        <Tooltip content="Reset the simulation to its initial state">
          <button
          onClick={handleReset}
          disabled={!isSimulationReady}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: !isSimulationReady ? '#95a5a6' : '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: !isSimulationReady ? 'not-allowed' : 'pointer',
          }}
        >
          ⟲ Reset
          </button>
        </Tooltip>
      </div>
      
      {/* Time Scale Control */}
      <div style={{ marginBottom: '15px' }}>
        <Tooltip content="Controls how fast time passes in the simulation. Higher values speed up evolution.">
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Time Scale (years/second)
          </label>
        </Tooltip>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={timeScaleInput}
            onChange={(e) => handleTimeScaleChange(e.target.value)}
            disabled={!isSimulationReady}
            style={{
              flex: 1,
              padding: '8px',
              border: timeScaleError ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder="e.g., 1e6"
          />
          <button
            onClick={handleTimeScaleApply}
            disabled={!isSimulationReady || !!timeScaleError}
            style={{
              padding: '8px 16px',
              backgroundColor: !isSimulationReady || timeScaleError ? '#95a5a6' : '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: !isSimulationReady || timeScaleError ? 'not-allowed' : 'pointer',
            }}
          >
            Apply
          </button>
        </div>
        {timeScaleError && (
          <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
            {timeScaleError}
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
          Current: {timeScale.toExponential(2)} years/second
        </div>
      </div>
      
      {/* Jump to Time Control */}
      <div style={{ marginBottom: '15px' }}>
        <Tooltip content="Jump directly to a specific time in the simulation without running through all intermediate steps.">
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Jump to Time (years)
          </label>
        </Tooltip>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={jumpToTimeInput}
            onChange={(e) => handleJumpToTimeChange(e.target.value)}
            disabled={!isSimulationReady}
            style={{
              flex: 1,
              padding: '8px',
              border: jumpToTimeError ? '2px solid #e74c3c' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder="e.g., 1e9"
          />
          <button
            onClick={handleJumpToTimeApply}
            disabled={!isSimulationReady || !!jumpToTimeError || !jumpToTimeInput}
            style={{
              padding: '8px 16px',
              backgroundColor: !isSimulationReady || jumpToTimeError || !jumpToTimeInput ? '#95a5a6' : '#9b59b6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: !isSimulationReady || jumpToTimeError || !jumpToTimeInput ? 'not-allowed' : 'pointer',
            }}
          >
            Jump
          </button>
        </div>
        {jumpToTimeError && (
          <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>
            {jumpToTimeError}
          </div>
        )}
      </div>
    </div>
  );
};
