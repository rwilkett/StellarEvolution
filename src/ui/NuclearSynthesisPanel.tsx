/**
 * Nuclear Synthesis Panel Component
 * Displays information about active nuclear reactions and element abundances
 */

import React from 'react';
import { Star, NuclearReaction } from '../types/core';
import { Tooltip } from './Tooltip';

interface NuclearSynthesisPanelProps {
  star: Star;
}

export const NuclearSynthesisPanel: React.FC<NuclearSynthesisPanelProps> = ({ star }) => {
  const { activeReactions, coreComposition, coreTemperature, corePressure } = star.internalStructure;

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ddd',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Nuclear Synthesis</h3>

      {/* Core Reaction */}
      <div style={{ marginBottom: '15px' }}>
        <Tooltip content="The primary nuclear fusion reaction occurring in the star's core">
          <h4 style={{ margin: '0 0 8px 0' }}>Core Reaction</h4>
        </Tooltip>
        <div style={{
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
        }}>
          {activeReactions.coreReaction === NuclearReaction.NONE ? (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No active fusion in core (inert or degenerate)
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                {getReactionName(activeReactions.coreReaction)}
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px' }}>
                {getReactionEquation(activeReactions.coreReaction)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {getReactionDescription(activeReactions.coreReaction)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shell Burning */}
      {activeReactions.shellReactions.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <Tooltip content="Nuclear fusion reactions occurring in shells around the core">
            <h4 style={{ margin: '0 0 8px 0' }}>Shell Burning</h4>
          </Tooltip>
          {activeReactions.shellReactions.map((reaction, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                border: '1px solid #ffe0b2',
                marginBottom: '5px',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#e65100' }}>
                {getReactionName(reaction)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {getReactionEquation(reaction)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Energy Production */}
      <div style={{ marginBottom: '15px' }}>
        <Tooltip content="Rate at which nuclear reactions are producing energy">
          <h4 style={{ margin: '0 0 8px 0' }}>Energy Production</h4>
        </Tooltip>
        <div style={{
          padding: '10px',
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #c8e6c9',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
            {activeReactions.energyProductionRate.toExponential(2)} L☉
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
            ({(activeReactions.energyProductionRate / star.luminosity * 100).toFixed(1)}% of total luminosity)
          </div>
        </div>
      </div>

      {/* Core Composition */}
      <div style={{ marginBottom: '15px' }}>
        <Tooltip content="Mass fractions of different elements in the stellar core">
          <h4 style={{ margin: '0 0 8px 0' }}>Core Composition</h4>
        </Tooltip>
        <div style={{
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
        }}>
          <CompositionBar label="Hydrogen (H)" fraction={coreComposition.hydrogen} color="#3498db" />
          <CompositionBar label="Helium (He)" fraction={coreComposition.helium} color="#e74c3c" />
          <CompositionBar label="Carbon (C)" fraction={coreComposition.carbon} color="#9b59b6" />
          <CompositionBar label="Oxygen (O)" fraction={coreComposition.oxygen} color="#1abc9c" />
          {coreComposition.neon > 0.001 && (
            <CompositionBar label="Neon (Ne)" fraction={coreComposition.neon} color="#f39c12" />
          )}
          {coreComposition.magnesium > 0.001 && (
            <CompositionBar label="Magnesium (Mg)" fraction={coreComposition.magnesium} color="#e67e22" />
          )}
          {coreComposition.silicon > 0.001 && (
            <CompositionBar label="Silicon (Si)" fraction={coreComposition.silicon} color="#95a5a6" />
          )}
          {coreComposition.iron > 0.001 && (
            <CompositionBar label="Iron (Fe)" fraction={coreComposition.iron} color="#7f8c8d" />
          )}
        </div>
      </div>

      {/* Core Conditions */}
      <div>
        <h4 style={{ margin: '0 0 8px 0' }}>Core Conditions</h4>
        <div style={{
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
          fontSize: '13px',
        }}>
          <div style={{ marginBottom: '5px' }}>
            <Tooltip content="Temperature at the center of the star where fusion occurs">
              <span style={{ fontWeight: 'bold' }}>Temperature:</span>
            </Tooltip>
            {' '}{(coreTemperature / 1e6).toFixed(1)} million K
          </div>
          <div>
            <Tooltip content="Pressure at the center of the star">
              <span style={{ fontWeight: 'bold' }}>Pressure:</span>
            </Tooltip>
            {' '}{corePressure.toExponential(2)} Pa
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Composition bar component for visualizing element fractions
 */
interface CompositionBarProps {
  label: string;
  fraction: number;
  color: string;
}

const CompositionBar: React.FC<CompositionBarProps> = ({ label, fraction, color }) => {
  const percentage = (fraction * 100).toFixed(1);
  const width = Math.max(fraction * 100, 0.5); // Minimum 0.5% for visibility

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3px',
        fontSize: '12px',
      }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#666' }}>{percentage}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${width}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

/**
 * Get human-readable name for a nuclear reaction
 */
function getReactionName(reaction: NuclearReaction): string {
  switch (reaction) {
    case NuclearReaction.PP_CHAIN:
      return 'Proton-Proton Chain';
    case NuclearReaction.CNO_CYCLE:
      return 'CNO Cycle';
    case NuclearReaction.TRIPLE_ALPHA:
      return 'Triple-Alpha Process';
    case NuclearReaction.HELIUM_CARBON:
      return 'Helium-Carbon Fusion';
    case NuclearReaction.CARBON_BURNING:
      return 'Carbon Burning';
    case NuclearReaction.NEON_BURNING:
      return 'Neon Burning';
    case NuclearReaction.OXYGEN_BURNING:
      return 'Oxygen Burning';
    case NuclearReaction.SILICON_BURNING:
      return 'Silicon Burning';
    default:
      return 'No Active Reaction';
  }
}

/**
 * Get equation representation for a nuclear reaction
 */
function getReactionEquation(reaction: NuclearReaction): string {
  switch (reaction) {
    case NuclearReaction.PP_CHAIN:
      return '4 ¹H → ⁴He + 2e⁺ + 2νₑ + energy';
    case NuclearReaction.CNO_CYCLE:
      return '4 ¹H + ¹²C → ⁴He + ¹²C + energy (catalytic)';
    case NuclearReaction.TRIPLE_ALPHA:
      return '3 ⁴He → ¹²C + energy';
    case NuclearReaction.HELIUM_CARBON:
      return '⁴He + ¹²C → ¹⁶O + energy';
    case NuclearReaction.CARBON_BURNING:
      return '¹²C + ¹²C → ²⁰Ne/²⁴Mg + particles + energy';
    case NuclearReaction.NEON_BURNING:
      return '²⁰Ne + γ → ¹⁶O + ⁴He';
    case NuclearReaction.OXYGEN_BURNING:
      return '¹⁶O + ¹⁶O → ²⁸Si/³²S + particles + energy';
    case NuclearReaction.SILICON_BURNING:
      return '²⁸Si + ... → ⁵⁶Fe + energy';
    default:
      return '';
  }
}

/**
 * Get description for a nuclear reaction
 */
function getReactionDescription(reaction: NuclearReaction): string {
  switch (reaction) {
    case NuclearReaction.PP_CHAIN:
      return 'The primary hydrogen fusion process in low to medium mass stars like the Sun. Four hydrogen nuclei combine to form one helium nucleus, releasing energy.';
    case NuclearReaction.CNO_CYCLE:
      return 'Hydrogen fusion using carbon, nitrogen, and oxygen as catalysts. Dominant in stars more massive than ~1.5 solar masses where core temperatures exceed 15 million K.';
    case NuclearReaction.TRIPLE_ALPHA:
      return 'Helium fusion process where three helium nuclei combine to form carbon. Occurs at temperatures above 100 million K after hydrogen is exhausted.';
    case NuclearReaction.HELIUM_CARBON:
      return 'Further helium capture onto carbon nuclei produces oxygen. This process determines the final C/O ratio in the core.';
    case NuclearReaction.CARBON_BURNING:
      return 'Carbon nuclei fuse at temperatures above 600 million K, producing neon, magnesium, and other elements. Occurs in massive stars.';
    case NuclearReaction.NEON_BURNING:
      return 'Photodisintegration of neon at extreme temperatures, producing oxygen and helium. A brief phase in massive stellar evolution.';
    case NuclearReaction.OXYGEN_BURNING:
      return 'Oxygen fusion at temperatures above 1.5 billion K, producing silicon, sulfur, and other elements in massive stars.';
    case NuclearReaction.SILICON_BURNING:
      return 'Final fusion stage producing iron-peak elements. Iron-56 is the most stable nucleus; fusion beyond this point consumes energy rather than producing it.';
    default:
      return '';
  }
}
