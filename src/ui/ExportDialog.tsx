/**
 * Export Dialog Component
 * Provides UI for exporting simulation data
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from './Loading';
import {
  ExportFormat,
  ExportOptions,
  exportStellarProperties,
  exportOrbitalParameters,
  exportCompleteSystem,
} from '../services/dataExport';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportType = 'stellar' | 'orbital' | 'complete';

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { system } = useSimulation();
  const { showSuccess, showError } = useToast();
  const [exportType, setExportType] = useState<ExportType>('complete');
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [includeTimeSeries, setIncludeTimeSeries] = useState(false);
  const [timeSeriesInterval, setTimeSeriesInterval] = useState(1e6); // 1 million years
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Clear state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
    }
  }, [isOpen]);

  const handleExport = async () => {
    if (!system) {
      showError('No simulation to export');
      return;
    }

    setLoading(true);
    setProgress(0);

    const options: ExportOptions = {
      format,
      includeTimeSeries,
      timeSeriesInterval,
      includeMetadata,
    };

    try {
      if (exportType === 'stellar') {
        await exportStellarProperties(system, options);
        showSuccess('Stellar properties exported successfully');
      } else if (exportType === 'orbital') {
        await exportOrbitalParameters(system, options);
        showSuccess('Orbital parameters exported successfully');
      } else {
        // Complete system export with progress callback
        await exportCompleteSystem(system, options, (p) => setProgress(p));
        showSuccess('Complete system data exported successfully');
      }

      onClose();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to export data');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatIntervalDisplay = (interval: number) => {
    if (interval < 1e6) {
      return `${interval.toFixed(0)} years`;
    } else if (interval < 1e9) {
      return `${(interval / 1e6).toFixed(1)} Myr`;
    } else {
      return `${(interval / 1e9).toFixed(1)} Gyr`;
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
        maxWidth: '500px',
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
          <h2 style={{ margin: 0 }}>Export Data</h2>
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

        {!system && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            marginBottom: '16px',
          }}>
            No simulation available to export
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
          }}>
            <LoadingSpinner size={50} />
            {progress > 0 && (
              <div style={{
                marginTop: '20px',
                width: '100%',
                maxWidth: '300px',
              }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#3498db',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '8px',
                }}>
                  Exporting... {progress}%
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && system && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}>
                Export Type
              </label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value as ExportType)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="complete">Complete System Data</option>
                <option value="stellar">Stellar Properties Only</option>
                <option value="orbital">Orbital Parameters Only</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}>
                Format
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value={ExportFormat.CSV}
                    checked={format === ExportFormat.CSV}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    disabled={loading}
                    style={{ marginRight: '6px' }}
                  />
                  CSV
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value={ExportFormat.JSON}
                    checked={format === ExportFormat.JSON}
                    onChange={(e) => setFormat(e.target.value as ExportFormat)}
                    disabled={loading}
                    style={{ marginRight: '6px' }}
                  />
                  JSON
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  disabled={loading}
                  style={{ marginRight: '8px' }}
                />
                Include metadata (initial conditions, timestamps)
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={includeTimeSeries}
                  onChange={(e) => setIncludeTimeSeries(e.target.checked)}
                  disabled={loading}
                />
                <span style={{ marginLeft: '8px' }}>Include time-series data</span>
              </label>
            </div>

            {includeTimeSeries && (
              <div style={{ marginBottom: '16px', marginLeft: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  Time-series interval: {formatIntervalDisplay(timeSeriesInterval)}
                </label>
                <input
                  type="range"
                  min="4"
                  max="9"
                  step="0.5"
                  value={Math.log10(timeSeriesInterval)}
                  onChange={(e) => setTimeSeriesInterval(Math.pow(10, parseFloat(e.target.value)))}
                  disabled={loading}
                  style={{ width: '100%' }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px',
                }}>
                  <span>10k years</span>
                  <span>1 Gyr</span>
                </div>
              </div>
            )}

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
                onClick={handleExport}
                disabled={loading || !system}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading || !system ? '#ccc' : '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !system ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {loading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
