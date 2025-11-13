/**
 * Persistence Service
 * Handles saving and loading simulation states using LocalStorage
 */

import { StarSystem } from '../types/core';

/**
 * Saved simulation metadata and state
 */
export interface SavedSimulation {
  id: string;
  name: string;
  timestamp: Date;
  system: StarSystem;
  currentTime: number;
  timeScale: number;
}

/**
 * Serializable version of SavedSimulation for storage
 */
interface SerializedSavedSimulation {
  id: string;
  name: string;
  timestamp: string; // ISO string
  system: StarSystem;
  currentTime: number;
  timeScale: number;
}

const STORAGE_KEY_PREFIX = 'stellar_sim_';
const STORAGE_INDEX_KEY = 'stellar_sim_index';

/**
 * Generate a unique ID for a saved simulation
 * @returns Unique identifier string
 */
function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get the list of saved simulation IDs from the index
 * @returns Array of saved simulation IDs
 */
function getSavedSimulationIds(): string[] {
  try {
    const indexData = localStorage.getItem(STORAGE_INDEX_KEY);
    if (!indexData) {
      return [];
    }
    return JSON.parse(indexData) as string[];
  } catch (error) {
    console.error('Failed to read simulation index:', error);
    return [];
  }
}

/**
 * Update the index of saved simulation IDs
 * @param ids - Array of simulation IDs
 */
function updateSimulationIndex(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to update simulation index:', error);
    throw new Error('Failed to update simulation index');
  }
}

/**
 * Save a simulation state to LocalStorage
 * @param system - Star system to save
 * @param currentTime - Current simulation time in years
 * @param timeScale - Current time scale multiplier
 * @param name - User-provided name for the saved simulation
 * @returns The unique ID of the saved simulation
 * @throws Error if save fails
 */
export function saveSimulation(
  system: StarSystem,
  currentTime: number,
  timeScale: number,
  name: string
): string {
  if (!system) {
    throw new Error('Cannot save: no system provided');
  }

  if (!name || name.trim().length === 0) {
    throw new Error('Cannot save: name is required');
  }

  // Generate unique ID
  const id = generateUniqueId();

  // Create saved simulation object
  const savedSim: SavedSimulation = {
    id,
    name: name.trim(),
    timestamp: new Date(),
    system,
    currentTime,
    timeScale,
  };

  // Serialize for storage (convert Date to ISO string)
  const serialized: SerializedSavedSimulation = {
    ...savedSim,
    timestamp: savedSim.timestamp.toISOString(),
  };

  try {
    // Save to LocalStorage
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
    localStorage.setItem(storageKey, JSON.stringify(serialized));

    // Update index
    const ids = getSavedSimulationIds();
    ids.push(id);
    updateSimulationIndex(ids);

    return id;
  } catch (error) {
    console.error('Failed to save simulation:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some saved simulations.');
    }
    
    throw new Error('Failed to save simulation');
  }
}

/**
 * Load a saved simulation from LocalStorage
 * @param id - Unique ID of the saved simulation
 * @returns The saved simulation with all state restored
 * @throws Error if simulation not found or load fails
 */
export function loadSimulation(id: string): SavedSimulation {
  if (!id || id.trim().length === 0) {
    throw new Error('Cannot load: simulation ID is required');
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
    const data = localStorage.getItem(storageKey);

    if (!data) {
      throw new Error(`Simulation with ID ${id} not found`);
    }

    // Deserialize
    const serialized: SerializedSavedSimulation = JSON.parse(data);

    // Convert ISO string back to Date
    const savedSim: SavedSimulation = {
      ...serialized,
      timestamp: new Date(serialized.timestamp),
    };

    return savedSim;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    console.error('Failed to load simulation:', error);
    throw new Error('Failed to load simulation: data may be corrupted');
  }
}

/**
 * List all saved simulations
 * @returns Array of saved simulations with metadata
 */
export function listSavedSimulations(): SavedSimulation[] {
  const ids = getSavedSimulationIds();
  const simulations: SavedSimulation[] = [];

  for (const id of ids) {
    try {
      const sim = loadSimulation(id);
      simulations.push(sim);
    } catch (error) {
      // Skip corrupted or missing simulations
      console.warn(`Failed to load simulation ${id}:`, error);
      
      // Remove from index if it doesn't exist
      const updatedIds = ids.filter(existingId => existingId !== id);
      updateSimulationIndex(updatedIds);
    }
  }

  // Sort by timestamp (newest first)
  simulations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return simulations;
}

/**
 * Delete a saved simulation from LocalStorage
 * @param id - Unique ID of the simulation to delete
 * @throws Error if deletion fails
 */
export function deleteSimulation(id: string): void {
  if (!id || id.trim().length === 0) {
    throw new Error('Cannot delete: simulation ID is required');
  }

  try {
    // Remove from storage
    const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
    localStorage.removeItem(storageKey);

    // Update index
    const ids = getSavedSimulationIds();
    const updatedIds = ids.filter(existingId => existingId !== id);
    updateSimulationIndex(updatedIds);
  } catch (error) {
    console.error('Failed to delete simulation:', error);
    throw new Error('Failed to delete simulation');
  }
}

/**
 * Clear all saved simulations
 * Useful for testing or resetting the application
 */
export function clearAllSimulations(): void {
  try {
    const ids = getSavedSimulationIds();
    
    // Remove all simulation data
    for (const id of ids) {
      const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
      localStorage.removeItem(storageKey);
    }
    
    // Clear the index
    localStorage.removeItem(STORAGE_INDEX_KEY);
  } catch (error) {
    console.error('Failed to clear all simulations:', error);
    throw new Error('Failed to clear all simulations');
  }
}
