/**
 * Simulation Context
 * Provides global state management for the simulation
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SimulationController } from '../simulation/SimulationController';
import { CloudParameters, StarSystem, SimulationState } from '../types/core';

interface SimulationContextType {
  controller: SimulationController;
  system: StarSystem | null;
  currentTime: number;
  state: SimulationState;
  timeScale: number;
  error: string | null;
  
  initializeSimulation: (params: CloudParameters) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setTimeScale: (scale: number) => void;
  jumpToTime: (time: number) => void;
  updateSimulation: (deltaTime: number) => void;
  clearError: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [controller] = useState(() => new SimulationController());
  const [system, setSystem] = useState<StarSystem | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [state, setState] = useState<SimulationState>(SimulationState.STOPPED);
  const [timeScale, setTimeScaleState] = useState(1e6); // Default: 1 million years per second
  const [error, setError] = useState<string | null>(null);

  const updateState = useCallback(() => {
    const status = controller.getStatus();
    setSystem(status.system);
    setCurrentTime(status.currentTime);
    setState(status.state);
    setTimeScaleState(status.timeScale);
  }, [controller]);

  const initializeSimulation = useCallback((params: CloudParameters) => {
    try {
      setError(null);
      controller.initializeSimulation(params);
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize simulation');
    }
  }, [controller, updateState]);

  const startSimulation = useCallback(() => {
    try {
      setError(null);
      controller.startSimulation();
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start simulation');
    }
  }, [controller, updateState]);

  const pauseSimulation = useCallback(() => {
    try {
      setError(null);
      controller.pauseSimulation();
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause simulation');
    }
  }, [controller, updateState]);

  const resetSimulation = useCallback(() => {
    try {
      setError(null);
      controller.resetSimulation();
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset simulation');
    }
  }, [controller, updateState]);

  const setTimeScale = useCallback((scale: number) => {
    try {
      setError(null);
      controller.setTimeScale(scale);
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set time scale');
    }
  }, [controller, updateState]);

  const jumpToTime = useCallback((time: number) => {
    try {
      setError(null);
      controller.jumpToTime(time);
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to jump to time');
    }
  }, [controller, updateState]);

  const updateSimulation = useCallback((deltaTime: number) => {
    try {
      setError(null);
      controller.updateSimulation(deltaTime);
      updateState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update simulation');
    }
  }, [controller, updateState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SimulationContextType = {
    controller,
    system,
    currentTime,
    state,
    timeScale,
    error,
    initializeSimulation,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setTimeScale,
    jumpToTime,
    updateSimulation,
    clearError,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
