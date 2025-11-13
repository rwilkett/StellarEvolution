/**
 * Stellar Properties Display Component
 * Shows detailed properties for a selected star with real-time updates
 */

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Star, EvolutionPhase } from '../types/core';

interface StellarPropertiesDisplayProps {
  selectedStarId?: string | null;
}

export const StellarPropertiesDisplay: React.FC<StellarPropertiesDisplayProps> = ({ 
  selectedStarId 
}) => {
  const { system } = useSimulation();

  // Find the selected star or default to the first star
  const star: Star | undefined = React.useMemo(() => {
    if (!system || !system.stars.length) return undefined;
    
    if (selectedStarId) {
      return system.stars.find(s => s.id === selectedStarId);
    }
    
    // Default to first star if no selection
    return system.stars[0];
  }, [system, selectedStarId]);

  // Format large numbers with appropriate units
  const formatNumber = (value: number, decimals: number = 2): string => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(decimals)} billion`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(decimals)} million`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(decimals)} thousand`;
    }
    return value.toFixed(decimals);
  };

  // Format time in appropriate units
  const formatTime = (timeInYears: number): string => {
    if (timeInYears < 1000) {
      return `${timeInYears.toFixed(2)} years`;
    } else if (timeInYears < 1e6) {
      return `${(timeInYears / 1000).toFixed(2)} thousand years`;
    } else if (timeInYears < 1e9) {
      return `${(timeInYears / 1e6).toFixed(2)} Myr`;
    } else {
      return `${(timeInYears / 1e9).toFixed(2)} Gyr`;
    }
  };

  // Get evolution phase display name
  const getPhaseDisplayName = (phase: EvolutionPhase): string => {
    const phaseNames: Record<EvolutionPhase, string> = {
      [EvolutionPhase.PROTOSTAR]: 'Protostar',
      [EvolutionPhase.MAIN_SEQUENCE]: 'Main Sequence',
      [EvolutionPhase.RED_GIANT]: 'Red Giant',
      [EvolutionPhase.HORIZONTAL_BRANCH]: 'Horizontal Branch',
      [EvolutionPhase.ASYMPTOTIC_GIANT]: 'Asymptotic Giant',
      [EvolutionPhase.PLANETARY_NEBULA]: 'Planetary Nebula',
      [EvolutionPhase.WHITE_DWARF]: 'White Dwarf',
      [EvolutionPhase.NEUTRON_STAR]: 'Neutron Star',
      [EvolutionPhase.BLACK_HOLE]: 'Black Hole',
    };
    return phaseNames[phase] || phase;
  };

  // Get color for evolution phase
  const getPhaseColor = (phase: EvolutionPhase): string => {
    const colors: Record<EvolutionPhase, string> = {
      [EvolutionPhase.PROTOSTAR]: '#9b59b6',
      [EvolutionPhase.MAIN_SEQUENCE]: '#3498db',
      [EvolutionPhase.RED_GIANT]: '#e74c3c',
      [EvolutionPhase.HORIZONTAL_BRANCH]: '#f39c12',
      [EvolutionPhase.ASYMPTOTIC_GIANT]: '#d35400',
      [EvolutionPhase.PLANETARY_NEBULA]: '#1abc9c',
      [EvolutionPhase.WHITE_DWARF]: '#ecf0f1',
      [EvolutionPhase.NEUTRON_STAR]: '#34495e',
      [EvolutionPhase.BLACK_HOLE]: '#2c3e50',
    };
    return colors[phase] || '#95a5a6';
  };

  if (!system) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
        textAlign: 'center',
        color: '#7f8c8d',
      }}>
        No simulation loaded
      </div>
    );
  }

  if (!star) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #ddd',
        textAlign: 'center',
        color: '#7f8c8d',
      }}>
        No star selected
      </div>
    );
  }

  const agePercentage = (star.age / star.lifetime) * 100;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #ddd',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: '#2c3e50',
        color: '#fff',
      }}>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '20px' }}>
          {star.name}
        </h3>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Spectral Type: {star.spectralType}
        </div>
      </div>

      {/* Evolution Phase Badge */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: getPhaseColor(star.evolutionPhase),
        color: star.evolutionPhase === EvolutionPhase.WHITE_DWARF ? '#2c3e50' : '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
      }}>
        {getPhaseDisplayName(star.evolutionPhase)}
      </div>

      {/* Properties Grid */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
        }}>
          {/* Mass */}
          <PropertyCard
            label="Mass"
            value={`${star.mass.toFixed(3)} M☉`}
            icon="⚖️"
          />

          {/* Temperature */}
          <PropertyCard
            label="Temperature"
            value={`${formatNumber(star.temperature, 0)} K`}
            icon="🌡️"
          />

          {/* Luminosity */}
          <PropertyCard
            label="Luminosity"
            value={`${star.luminosity.toExponential(2)} L☉`}
            icon="💡"
          />

          {/* Radius */}
          <PropertyCard
            label="Radius"
            value={`${star.radius.toFixed(3)} R☉`}
            icon="📏"
          />

          {/* Age */}
          <PropertyCard
            label="Age"
            value={formatTime(star.age)}
            icon="⏱️"
          />

          {/* Metallicity */}
          <PropertyCard
            label="Metallicity"
            value={`${star.metallicity.toFixed(3)} Z☉`}
            icon="🔬"
          />
        </div>

        {/* Lifetime Progress */}
        <div style={{ marginTop: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Lifetime Progress
            </span>
            <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
              {agePercentage.toFixed(1)}%
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#ecf0f1',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min(agePercentage, 100)}%`,
              height: '100%',
              backgroundColor: 
                agePercentage < 80 ? '#27ae60' : 
                agePercentage < 95 ? '#f39c12' : 
                '#e74c3c',
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }} />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#7f8c8d',
            marginTop: '5px',
          }}>
            <span>Main Sequence Lifetime: {formatTime(star.lifetime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for property cards
interface PropertyCardProps {
  label: string;
  value: string;
  icon: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ label, value, icon }) => {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
    }}>
      <div style={{
        fontSize: '11px',
        color: '#7f8c8d',
        marginBottom: '4px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
      }}>
        <span style={{ marginRight: '4px' }}>{icon}</span>
        {label}
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c3e50',
      }}>
        {value}
      </div>
    </div>
  );
};
