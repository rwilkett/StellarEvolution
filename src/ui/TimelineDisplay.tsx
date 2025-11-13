/**
 * Timeline Display Component
 * Shows current simulation time and evolution phases of stars
 */

import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PHYSICS_CONSTANTS } from '../constants/physics';

export const TimelineDisplay: React.FC = () => {
  const { system, currentTime, jumpToTime } = useSimulation();
  const [scrubberValue, setScrubberValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Format time in appropriate units
  const formatTime = (timeInYears: number): string => {
    if (timeInYears < 1000) {
      return `${timeInYears.toFixed(2)} years`;
    } else if (timeInYears < PHYSICS_CONSTANTS.YEARS_PER_MYR) {
      return `${(timeInYears / 1000).toFixed(2)} thousand years`;
    } else if (timeInYears < PHYSICS_CONSTANTS.YEARS_PER_GYR) {
      return `${(timeInYears / PHYSICS_CONSTANTS.YEARS_PER_MYR).toFixed(2)} Myr`;
    } else {
      return `${(timeInYears / PHYSICS_CONSTANTS.YEARS_PER_GYR).toFixed(2)} Gyr`;
    }
  };

  // Get evolution phase display name
  const getPhaseDisplayName = (phase: string): string => {
    return phase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate maximum time for scrubber (longest star lifetime)
  const maxTime = system?.stars.reduce((max, star) => {
    return Math.max(max, star.lifetime * 1.2); // 120% of lifetime for post-main-sequence
  }, 0) || 1e10;

  const handleScrubberChange = (value: number) => {
    setScrubberValue(value);
  };

  const handleScrubberMouseDown = () => {
    setIsDragging(true);
  };

  const handleScrubberMouseUp = () => {
    setIsDragging(false);
    // Jump to the selected time
    const targetTime = (scrubberValue / 100) * maxTime;
    jumpToTime(targetTime);
  };

  // Update scrubber position when time changes (if not dragging)
  React.useEffect(() => {
    if (!isDragging) {
      const percentage = (currentTime / maxTime) * 100;
      setScrubberValue(Math.min(percentage, 100));
    }
  }, [currentTime, maxTime, isDragging]);

  if (!system) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#ecf0f1',
        borderRadius: '4px',
        textAlign: 'center',
        color: '#7f8c8d',
      }}>
        No simulation loaded
      </div>
    );
  }

  return (
    <div>
      {/* Current Time Display */}
      <div style={{
        padding: '15px',
        backgroundColor: '#3498db',
        color: '#fff',
        borderRadius: '4px',
        marginBottom: '15px',
      }}>
        <div style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>
          Current Simulation Time
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Timeline Navigation
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={scrubberValue}
          onChange={(e) => handleScrubberChange(parseFloat(e.target.value))}
          onMouseDown={handleScrubberMouseDown}
          onMouseUp={handleScrubberMouseUp}
          onTouchStart={handleScrubberMouseDown}
          onTouchEnd={handleScrubberMouseUp}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#7f8c8d',
          marginTop: '5px',
        }}>
          <span>0 years</span>
          <span>{formatTime(maxTime)}</span>
        </div>
      </div>

      {/* Star Evolution Phases */}
      <div>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Star Evolution Phases</h4>
        {system.stars.map((star) => {
          const ageRatio = (star.age / star.lifetime) * 100;
          
          return (
            <div
              key={star.id}
              style={{
                padding: '12px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {star.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                    {star.mass.toFixed(2)} M☉ • {star.spectralType} type
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: '#3498db',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}>
                  {getPhaseDisplayName(star.evolutionPhase)}
                </div>
              </div>
              
              {/* Age Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#ecf0f1',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(ageRatio, 100)}%`,
                  height: '100%',
                  backgroundColor: ageRatio < 90 ? '#27ae60' : ageRatio < 100 ? '#f39c12' : '#e74c3c',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#7f8c8d',
                marginTop: '5px',
              }}>
                <span>Age: {formatTime(star.age)}</span>
                <span>Lifetime: {formatTime(star.lifetime)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
