/**
 * System Overview Component
 * Displays summary information about the entire star system
 */

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { EvolutionPhase, PlanetComposition } from '../types/core';

export const SystemOverview: React.FC = () => {
  const { system, currentTime } = useSimulation();

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

  // Get key milestones from the system
  const getMilestones = () => {
    if (!system) return [];

    const milestones: Array<{ time: number; event: string }> = [];

    // System formation
    milestones.push({
      time: 0,
      event: 'System formation from molecular cloud',
    });

    // Star evolution milestones
    system.stars.forEach((star) => {
      // Main sequence end
      milestones.push({
        time: star.lifetime,
        event: `${star.name} leaves main sequence`,
      });

      // Red giant phase (if applicable)
      if (star.mass >= 0.5) {
        milestones.push({
          time: star.lifetime * 1.1,
          event: `${star.name} enters red giant phase`,
        });
      }

      // Final state
      let finalPhase = '';
      if (star.mass < 1.4) {
        finalPhase = 'white dwarf';
      } else if (star.mass < 3.0) {
        finalPhase = 'neutron star';
      } else {
        finalPhase = 'black hole';
      }
      
      milestones.push({
        time: star.lifetime * 1.2,
        event: `${star.name} becomes ${finalPhase}`,
      });
    });

    // Sort by time and filter to show only upcoming or recent milestones
    return milestones
      .sort((a, b) => a.time - b.time)
      .filter(m => m.time <= currentTime * 1.5); // Show past and near-future events
  };

  // Count planets by composition
  const getPlanetStats = () => {
    if (!system) return { rocky: 0, iceGiant: 0, gasGiant: 0 };

    return system.planets.reduce(
      (acc, planet) => {
        if (planet.composition === PlanetComposition.ROCKY) acc.rocky++;
        else if (planet.composition === PlanetComposition.ICE_GIANT) acc.iceGiant++;
        else if (planet.composition === PlanetComposition.GAS_GIANT) acc.gasGiant++;
        return acc;
      },
      { rocky: 0, iceGiant: 0, gasGiant: 0 }
    );
  };

  // Get current phase distribution
  const getPhaseDistribution = () => {
    if (!system) return {};

    return system.stars.reduce((acc, star) => {
      const phase = star.evolutionPhase;
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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
        No simulation loaded. Create a simulation to see system overview.
      </div>
    );
  }

  const planetStats = getPlanetStats();
  const milestones = getMilestones();
  const phaseDistribution = getPhaseDistribution();

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
        backgroundColor: '#16a085',
        color: '#fff',
      }}>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '20px' }}>
          {system.name}
        </h3>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          System Age: {formatTime(currentTime)}
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px',
        }}>
          {/* Number of Stars */}
          <StatCard
            label="Stars"
            value={system.stars.length.toString()}
            icon="⭐"
            color="#3498db"
          />

          {/* Number of Planets */}
          <StatCard
            label="Planets"
            value={system.planets.length.toString()}
            icon="🪐"
            color="#9b59b6"
          />

          {/* Total System Mass */}
          <StatCard
            label="Total Stellar Mass"
            value={`${system.stars.reduce((sum, s) => sum + s.mass, 0).toFixed(2)} M☉`}
            icon="⚖️"
            color="#e67e22"
          />

          {/* System Age */}
          <StatCard
            label="System Age"
            value={formatTime(currentTime)}
            icon="⏱️"
            color="#1abc9c"
          />
        </div>

        {/* Initial Cloud Conditions */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
            Initial Cloud Conditions
          </h4>
          <div style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
          }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <InfoRow
                label="Cloud Mass"
                value={`${system.initialCloudParameters.mass.toFixed(2)} M☉`}
              />
              <InfoRow
                label="Metallicity"
                value={`${system.initialCloudParameters.metallicity.toFixed(3)} Z☉`}
              />
              <InfoRow
                label="Angular Momentum"
                value={`${system.initialCloudParameters.angularMomentum.toExponential(2)} kg⋅m²/s`}
              />
            </div>
          </div>
        </div>

        {/* Planet Distribution */}
        {system.planets.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
              Planet Distribution
            </h4>
            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef',
            }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                {planetStats.rocky > 0 && (
                  <InfoRow
                    label="Rocky Planets"
                    value={planetStats.rocky.toString()}
                    icon="🪨"
                  />
                )}
                {planetStats.iceGiant > 0 && (
                  <InfoRow
                    label="Ice Giants"
                    value={planetStats.iceGiant.toString()}
                    icon="❄️"
                  />
                )}
                {planetStats.gasGiant > 0 && (
                  <InfoRow
                    label="Gas Giants"
                    value={planetStats.gasGiant.toString()}
                    icon="🌪️"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Evolution Phase Distribution */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
            Stellar Evolution Status
          </h4>
          <div style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
          }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(phaseDistribution).map(([phase, count]) => (
                <InfoRow
                  key={phase}
                  label={formatPhaseName(phase as EvolutionPhase)}
                  value={`${count} star${count > 1 ? 's' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Key Milestones */}
        <div>
          <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
            Key Milestones
          </h4>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
          }}>
            {milestones.length === 0 ? (
              <div style={{ color: '#7f8c8d', textAlign: 'center' }}>
                No milestones to display
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      paddingBottom: '10px',
                      borderBottom: index < milestones.length - 1 ? '1px solid #e9ecef' : 'none',
                    }}
                  >
                    <div style={{
                      minWidth: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: milestone.time <= currentTime ? '#27ae60' : '#95a5a6',
                      marginTop: '6px',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: milestone.time <= currentTime ? 'bold' : 'normal',
                        color: milestone.time <= currentTime ? '#2c3e50' : '#7f8c8d',
                        marginBottom: '2px',
                      }}>
                        {milestone.event}
                      </div>
                      <div style={{ fontSize: '11px', color: '#95a5a6' }}>
                        {formatTime(milestone.time)}
                        {milestone.time <= currentTime && ' (completed)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <div style={{
      padding: '15px',
      backgroundColor: color,
      color: '#fff',
      borderRadius: '6px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '5px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        {label}
      </div>
    </div>
  );
};

// Helper component for info rows
interface InfoRowProps {
  label: string;
  value: string;
  icon?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
    }}>
      <span style={{ color: '#7f8c8d' }}>
        {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
        {label}
      </span>
      <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
        {value}
      </span>
    </div>
  );
};

// Helper function to format phase names
const formatPhaseName = (phase: EvolutionPhase): string => {
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
