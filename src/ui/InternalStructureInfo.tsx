/**
 * Internal Structure Info Panel Component
 * Provides educational information about stellar internal structure and its effects
 */

import React, { useState } from 'react';
import { Star, EvolutionPhase } from '../types/core';
import { Tooltip } from './Tooltip';

interface InternalStructureInfoProps {
  star: Star;
}

export const InternalStructureInfo: React.FC<InternalStructureInfoProps> = ({ star }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('layers');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ddd',
      marginTop: '20px',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
        Understanding Stellar Structure
      </h3>

      {/* Layer Structure Section */}
      <CollapsibleSection
        title="Stellar Layers"
        isExpanded={expandedSection === 'layers'}
        onToggle={() => toggleSection('layers')}
      >
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <p style={{ marginTop: 0 }}>
            Stars are structured in distinct layers based on how energy is transported:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li>
              <strong>Core:</strong> The central region where nuclear fusion occurs,
              generating the star's energy. Temperature and pressure are highest here.
            </li>
            <li>
              <strong>Radiative Zone:</strong> Energy moves outward via photon radiation.
              Photons are constantly absorbed and re-emitted, taking thousands of years
              to reach the surface.
            </li>
            <li>
              <strong>Convective Zone:</strong> Hot plasma rises, cools at the surface,
              and sinks back down in convection currents, similar to boiling water.
            </li>
          </ul>
          {getLayerExplanation(star.evolutionPhase, star.mass)}
        </div>
      </CollapsibleSection>

      {/* Energy Generation Section */}
      <CollapsibleSection
        title="Energy Generation"
        isExpanded={expandedSection === 'energy'}
        onToggle={() => toggleSection('energy')}
      >
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <p style={{ marginTop: 0 }}>
            Stars generate energy through nuclear fusion, where lighter elements
            combine to form heavier ones, releasing tremendous amounts of energy.
          </p>
          {getEnergyExplanation(star.internalStructure.activeReactions.coreReaction, star.evolutionPhase)}
        </div>
      </CollapsibleSection>

      {/* Evolution Connection Section */}
      <CollapsibleSection
        title="Evolution & Observable Properties"
        isExpanded={expandedSection === 'evolution'}
        onToggle={() => toggleSection('evolution')}
      >
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <p style={{ marginTop: 0 }}>
            Internal structure directly affects what we observe from Earth:
          </p>
          {getEvolutionConnectionExplanation(star)}
        </div>
      </CollapsibleSection>

      {/* Current Phase Info */}
      <div style={{
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        border: '1px solid #90caf9',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1565c0' }}>
          Current Phase: {getPhaseDisplayName(star.evolutionPhase)}
        </div>
        <div style={{ fontSize: '12px', color: '#555' }}>
          {getPhaseDescription(star.evolutionPhase)}
        </div>
      </div>
    </div>
  );
};

/**
 * Collapsible section component
 */
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div style={{
      marginBottom: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#fff',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '12px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div style={{ padding: '0 10px 10px 10px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Get layer-specific explanation based on phase and mass
 */
function getLayerExplanation(phase: EvolutionPhase, mass: number): React.ReactNode {
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      return (
        <p>
          <strong>Protostar:</strong> The star is still contracting and heating up.
          It's mostly convective, with turbulent motions throughout as gravitational
          energy is converted to heat.
        </p>
      );
    case EvolutionPhase.MAIN_SEQUENCE:
      if (mass < 0.5) {
        return (
          <p>
            <strong>Low-mass star:</strong> Fully convective throughout. The entire
            star churns like a pot of boiling water, efficiently mixing material.
          </p>
        );
      } else if (mass < 1.5) {
        return (
          <p>
            <strong>Sun-like star:</strong> Radiative core with convective envelope.
            Energy radiates through the inner regions and convects in the outer layers.
          </p>
        );
      } else {
        return (
          <p>
            <strong>Massive star:</strong> Convective core with radiative envelope.
            The intense core fusion creates convection in the center, while outer
            regions transport energy via radiation.
          </p>
        );
      }
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      return (
        <p>
          <strong>Giant phase:</strong> The core has contracted to a tiny, dense,
          inert helium core. The envelope has expanded enormously and is fully
          convective, creating the star's bloated appearance.
        </p>
      );
    case EvolutionPhase.WHITE_DWARF:
      return (
        <p>
          <strong>White dwarf:</strong> The star is essentially a single degenerate
          core with no distinct layers. Electron degeneracy pressure supports it
          against gravity, not thermal pressure.
        </p>
      );
    default:
      return null;
  }
}

/**
 * Get energy generation explanation
 */
function getEnergyExplanation(reaction: string, phase: EvolutionPhase): React.ReactNode {
  if (reaction === 'none') {
    return (
      <div>
        <p>
          <strong>No active fusion:</strong> The core is not hot or dense enough
          for fusion, or has exhausted all available fuel. The star is either
          contracting (heating up) or cooling down.
        </p>
        {phase === EvolutionPhase.RED_GIANT && (
          <p>
            In red giants, hydrogen fusion occurs in a shell around the inert core,
            but the core itself is dormant. This shell burning actually produces
            more energy than main sequence fusion, causing the outer layers to expand.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p>
        The star's luminosity (total energy output) is directly powered by these
        fusion reactions. The energy takes thousands to millions of years to
        travel from the core to the surface.
      </p>
      <p>
        <strong>Energy transport chain:</strong>
      </p>
      <ol style={{ marginLeft: '20px', fontSize: '12px' }}>
        <li>Fusion in core produces high-energy gamma rays</li>
        <li>Photons scatter through radiative zone (if present)</li>
        <li>Convection carries energy through convective zones</li>
        <li>Energy emerges as visible light from the surface</li>
      </ol>
    </div>
  );
}

/**
 * Get evolution connection explanation
 */
function getEvolutionConnectionExplanation(star: Star): React.ReactNode {
  const ageRatio = star.age / star.lifetime;
  const { coreTemperature, layerStructure } = star.internalStructure;

  return (
    <div>
      <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
        <li>
          <strong>Luminosity ({star.luminosity.toFixed(2)} L☉):</strong> Determined
          by the rate of nuclear reactions and the star's ability to transport energy.
        </li>
        <li>
          <strong>Temperature ({Math.round(star.temperature)} K):</strong> Surface
          temperature depends on how much energy reaches the surface and the star's
          radius. Hotter cores lead to higher surface temperatures.
        </li>
        <li>
          <strong>Radius ({star.radius.toFixed(2)} R☉):</strong> As the core contracts,
          it heats up. This can cause outer layers to expand dramatically, creating
          giants.
        </li>
      </ul>

      <div style={{
        padding: '10px',
        backgroundColor: '#fff9c4',
        borderRadius: '4px',
        marginTop: '10px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
          Current State Analysis:
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
          <li>
            Core occupies {(layerStructure.coreRadius * 100).toFixed(1)}% of radius
            but contains most of the mass
          </li>
          <li>
            Core temperature: {(coreTemperature / 1e6).toFixed(1)} million K
            {coreTemperature > 1e8 && ' (hot enough for helium fusion!)'}
          </li>
          <li>
            Age progress: {(ageRatio * 100).toFixed(1)}% through main sequence lifetime
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Get display name for evolution phase
 */
function getPhaseDisplayName(phase: EvolutionPhase): string {
  const names: Record<EvolutionPhase, string> = {
    [EvolutionPhase.PROTOSTAR]: 'Protostar',
    [EvolutionPhase.MAIN_SEQUENCE]: 'Main Sequence',
    [EvolutionPhase.RED_GIANT]: 'Red Giant',
    [EvolutionPhase.HORIZONTAL_BRANCH]: 'Horizontal Branch',
    [EvolutionPhase.ASYMPTOTIC_GIANT]: 'Asymptotic Giant Branch',
    [EvolutionPhase.PLANETARY_NEBULA]: 'Planetary Nebula',
    [EvolutionPhase.WHITE_DWARF]: 'White Dwarf',
    [EvolutionPhase.NEUTRON_STAR]: 'Neutron Star',
    [EvolutionPhase.BLACK_HOLE]: 'Black Hole',
  };
  return names[phase] || phase;
}

/**
 * Get description for evolution phase
 */
function getPhaseDescription(phase: EvolutionPhase): string {
  const descriptions: Record<EvolutionPhase, string> = {
    [EvolutionPhase.PROTOSTAR]: 'A young star still contracting under gravity, not yet hot enough for sustained fusion.',
    [EvolutionPhase.MAIN_SEQUENCE]: 'The stable phase where hydrogen fuses to helium in the core. Stars spend ~90% of their lives here.',
    [EvolutionPhase.RED_GIANT]: 'Hydrogen exhausted in core. The core contracts and heats up while the envelope expands dramatically.',
    [EvolutionPhase.HORIZONTAL_BRANCH]: 'Helium fusion begins in the core (helium flash for low-mass stars). The star stabilizes briefly.',
    [EvolutionPhase.ASYMPTOTIC_GIANT]: 'Both hydrogen and helium burn in shells around an inert C-O core. The star expands even more.',
    [EvolutionPhase.PLANETARY_NEBULA]: 'The outer layers are expelled, revealing the hot core. Creates beautiful glowing gas clouds.',
    [EvolutionPhase.WHITE_DWARF]: 'A dense remnant core supported by electron degeneracy. No fusion occurs; it slowly cools over billions of years.',
    [EvolutionPhase.NEUTRON_STAR]: 'The collapsed core of a massive star, incredibly dense. A teaspoon would weigh billions of tons!',
    [EvolutionPhase.BLACK_HOLE]: 'Spacetime itself is so curved that nothing, not even light, can escape from within the event horizon.',
  };
  return descriptions[phase] || 'An evolutionary phase of the star.';
}
