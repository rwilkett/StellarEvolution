/**
 * Derived Properties Display Component
 * Shows calculated cloud properties in real-time as user changes inputs
 */

import React, { useMemo } from 'react';
import { CloudParameters } from '../types/core';
import { calculateDerivedProperties } from '../physics/derivedCloudProperties';

interface DerivedPropertiesDisplayProps {
  cloudParams: CloudParameters;
}

export const DerivedPropertiesDisplay: React.FC<DerivedPropertiesDisplayProps> = ({ cloudParams }) => {
  // Calculate derived properties (memoized for performance)
  const derived = useMemo(() => {
    try {
      return calculateDerivedProperties(cloudParams);
    } catch (error) {
      return null;
    }
  }, [cloudParams]);

  // Format collapse timescale with appropriate units
  const formatCollapseTimescale = (timeInYears: number): string => {
    if (timeInYears < 1000) {
      return `${timeInYears.toFixed(0)} years`;
    } else if (timeInYears < 1e6) {
      return `${(timeInYears / 1000).toFixed(2)} thousand years`;
    } else if (timeInYears < 1e9) {
      return `${(timeInYears / 1e6).toFixed(2)} Myr`;
    } else {
      return `${(timeInYears / 1e9).toFixed(2)} Gyr`;
    }
  };

  // Format density with scientific notation
  const formatDensity = (density: number): string => {
    if (density < 1) {
      return density.toExponential(2);
    } else if (density < 1000) {
      return density.toFixed(2);
    } else {
      return density.toExponential(2);
    }
  };

  if (!derived) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px',
        marginTop: '15px',
      }}>
        Unable to calculate derived properties. Please check your input values.
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#e7f3ff',
      borderRadius: '6px',
      border: '1px solid #b3d9ff',
    }}>
      <h4 style={{ 
        marginTop: 0, 
        marginBottom: '12px', 
        fontSize: '14px', 
        color: '#004085',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>📊</span>
        <span>Derived Cloud Properties</span>
      </h4>

      <div style={{ display: 'grid', gap: '10px' }}>
        {/* Density */}
        <PropertyRow
          label="Density"
          value={`${formatDensity(derived.density)} particles/cm³`}
          tooltip="Number density of particles in the cloud"
        />

        {/* Virial Parameter with bound/unbound indicator */}
        <PropertyRow
          label="Virial Parameter"
          value={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{derived.virialParameter.toFixed(3)}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: derived.isBound ? '#d4edda' : '#f8d7da',
                color: derived.isBound ? '#155724' : '#721c24',
              }}>
                {derived.isBound ? '✓ Bound' : '✗ Unbound'}
              </span>
            </span>
          }
          tooltip={
            derived.virialParameter < 1
              ? 'Strongly bound - rapid collapse expected'
              : derived.virialParameter < 2
              ? 'Marginally bound - slow collapse expected'
              : 'Unbound - no collapse expected'
          }
        />

        {/* Jeans Mass */}
        <PropertyRow
          label="Jeans Mass"
          value={`${derived.jeansMass.toFixed(2)} M☉`}
          tooltip="Critical mass for gravitational collapse"
        />

        {/* Collapse Timescale */}
        <PropertyRow
          label="Collapse Timescale"
          value={formatCollapseTimescale(derived.collapseTimescale)}
          tooltip="Free-fall time for cloud collapse"
        />

        {/* Additional info box */}
        <div style={{
          marginTop: '5px',
          padding: '10px',
          backgroundColor: derived.isBound ? '#d4edda' : '#fff3cd',
          border: `1px solid ${derived.isBound ? '#c3e6cb' : '#ffc107'}`,
          borderRadius: '4px',
          fontSize: '12px',
          color: derived.isBound ? '#155724' : '#856404',
        }}>
          {derived.isBound ? (
            <>
              <strong>Cloud is gravitationally bound.</strong>
              {' '}Star formation will occur over approximately {formatCollapseTimescale(derived.collapseTimescale)}.
            </>
          ) : (
            <>
              <strong>Cloud is not gravitationally bound.</strong>
              {' '}Turbulence and thermal pressure exceed gravitational attraction. Star formation unlikely.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for property rows
interface PropertyRowProps {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
}

const PropertyRow: React.FC<PropertyRowProps> = ({ label, value, tooltip }) => {
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        padding: '8px',
        backgroundColor: '#fff',
        borderRadius: '4px',
      }}
      title={tooltip}
    >
      <span style={{ color: '#495057', fontWeight: '500' }}>
        {label}
      </span>
      <span style={{ fontWeight: 'bold', color: '#004085' }}>
        {value}
      </span>
    </div>
  );
};
