/**
 * Save/Load Dialog Component
 * Provides UI for saving and loading simulations
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from './Loading';
import {
  saveSimulation,
  loadSimulation,
  listSavedSimulations,
  deleteSimulation,
  SavedSimulation,
} from '../services/persistence';

interface SaveLoadDialogProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  onClose: () => void;
}

export const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({ isOpen, mode, onClose }) => {
  const { system, currentTime, timeScale, initializeSimulation, jumpToTime, setTimeScale } = useSimulation();
  const { showSuccess, showError } = useToast();
  const [saveName, setSaveName] = useState('');
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [loading, setLoading] = useState(false);

  // Load saved simulations when dialog opens in load mode
  useEffect(() => {
    if (isOpen && mode === 'load') {
      loadSavedSimulationsList();
    }
  }, [isOpen, mode]);

  // Clear state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSaveName('');
    }
  }, [isOpen]);

  const loadSavedSimulationsList = () => {
    try {
      const sims = listSavedSimulations();
      setSavedSimulations(sims);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load saved simulations');
    }
  };

  const handleSave = () => {
    if (!system) {
      showError('No simulation to save');
      return;
    }

    if (!saveName.trim()) {
      showError('Please enter a name for the simulation');
      return;
    }

    setLoading(true);

    try {
      saveSimulation(system, currentTime, timeScale, saveName.trim());
      showSuccess(`Simulation saved successfully as "${saveName.trim()}"`);
      setSaveName('');
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (id: string) => {
    setLoading(true);

    try {
      const savedSim = loadSimulation(id);
      
      // Initialize simulation with the loaded system
      initializeSimulation(savedSim.system.initialCloudParameters);
      
      // Restore the simulation state
      jumpToTime(savedSim.currentTime);
      setTimeScale(savedSim.timeScale);
      
      showSuccess(`Simulation "${savedSim.name}" loaded successfully`);
      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      deleteSimulation(id);
      showSuccess(`Simulation "${name}" deleted successfully`);
      loadSavedSimulationsList();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete simulation');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatTime = (years: number) => {
    if (years < 1e6) {
      return `${years.toFixed(0)} years`;
    } else if (years < 1e9) {
      return `${(years / 1e6).toFixed(2)} Myr`;
    } else {
      return `${(years / 1e9).toFixed(2)} Gyr`;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: 0 }}>
            {mode === 'save' ? 'Save Simulation' : 'Load Simulation'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}>
            <LoadingSpinner />
          </div>
        )}

        {!loading && mode === 'save' ? (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}>
                Simulation Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name for this simulation"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>

            {system && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '16px',
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Current Simulation</h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  <div>System: {system.name}</div>
                  <div>Stars: {system.stars.length}</div>
                  <div>Planets: {system.planets.length}</div>
                  <div>Age: {formatTime(currentTime)}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !system}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading || !system ? '#ccc' : '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !system ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : !loading ? (
          <div>
            {savedSimulations.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}>
                No saved simulations found
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                {savedSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    style={{
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                          {sim.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Saved: {formatDate(sim.timestamp)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleLoad(sim.id)}
                          disabled={loading}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: loading ? '#ccc' : '#3498db',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(sim.id, sim.name)}
                          disabled={loading}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: loading ? '#ccc' : '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '4px',
                    }}>
                      <div>System: {sim.system.name}</div>
                      <div>Stars: {sim.system.stars.length}</div>
                      <div>Planets: {sim.system.planets.length}</div>
                      <div>Age: {formatTime(sim.currentTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
