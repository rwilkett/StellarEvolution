/**
 * Tabbed Stellar Properties Display Component
 * Shows tabs for multiple stars, or single view for one star
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StellarPropertiesDisplay } from './StellarPropertiesDisplay';
import { Star } from '../types/core';

export const TabbedStellarPropertiesDisplay: React.FC = () => {
  const { system } = useSimulation();
  const [selectedStarIndex, setSelectedStarIndex] = useState(0);

  // Reset selected index when system changes or when selected index is out of bounds
  useEffect(() => {
    if (system && system.stars.length > 0) {
      if (selectedStarIndex >= system.stars.length) {
        setSelectedStarIndex(0);
      }
    }
  }, [system, selectedStarIndex]);

  if (!system || !system.stars.length) {
    return <StellarPropertiesDisplay />;
  }

  // If only one star, render without tabs
  if (system.stars.length === 1) {
    return <StellarPropertiesDisplay selectedStarId={system.stars[0].id} />;
  }

  // Multiple stars - render with tabs
  const selectedStar = system.stars[selectedStarIndex];

  // Generate tab label for a star
  const getTabLabel = (star: Star, index: number): string => {
    // Use star name if it's meaningful, otherwise use spectral type
    if (star.name && star.name !== `Star ${index + 1}`) {
      return star.name;
    }
    return `Star ${index + 1} (${star.spectralType})`;
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #ddd',
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        overflow: 'hidden',
      }}>
        {system.stars.map((star, index) => (
          <button
            key={star.id}
            onClick={() => setSelectedStarIndex(index)}
            style={{
              padding: '12px 20px',
              backgroundColor: selectedStarIndex === index ? '#fff' : 'transparent',
              border: 'none',
              borderBottom: selectedStarIndex === index ? '2px solid #3498db' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedStarIndex === index ? 'bold' : 'normal',
              color: selectedStarIndex === index ? '#2c3e50' : '#7f8c8d',
              transition: 'all 0.2s ease',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (selectedStarIndex !== index) {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedStarIndex !== index) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {getTabLabel(star, index)}
          </button>
        ))}
      </div>

      {/* Content */}
      <StellarPropertiesDisplay selectedStarId={selectedStar?.id} />
    </div>
  );
};
