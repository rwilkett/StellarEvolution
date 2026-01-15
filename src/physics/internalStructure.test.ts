/**
 * Tests for internal structure physics module
 */

import { describe, it, expect } from 'vitest';
import {
  calculateInitialCoreComposition,
  calculateCoreTemperature,
  calculateCorePressure,
  determineActiveReactions,
  determineShellBurning,
  calculateLayerStructure,
  calculateInternalStructure,
} from './internalStructure';
import { EvolutionPhase, NuclearReaction } from '../types/core';

describe('Internal Structure Physics Module', () => {
  describe('calculateInitialCoreComposition', () => {
    it('should create composition with hydrogen dominance for solar metallicity', () => {
      const composition = calculateInitialCoreComposition(1.0);
      
      expect(composition.hydrogen).toBeGreaterThan(0.7); // Mostly hydrogen
      expect(composition.helium).toBeCloseTo(0.25, 1); // ~25% helium
      expect(composition.carbon).toBeGreaterThan(0);
      expect(composition.oxygen).toBeGreaterThan(0);
    });

    it('should have all mass fractions sum to approximately 1', () => {
      const composition = calculateInitialCoreComposition(1.0);
      const sum = Object.values(composition).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeCloseTo(1.0, 2);
    });
  });

  describe('calculateCoreTemperature', () => {
    it('should calculate higher temperature for more massive stars', () => {
      const temp1 = calculateCoreTemperature(1.0, EvolutionPhase.MAIN_SEQUENCE, 0.5);
      const temp10 = calculateCoreTemperature(10.0, EvolutionPhase.MAIN_SEQUENCE, 0.5);
      
      expect(temp10).toBeGreaterThan(temp1);
    });

    it('should show temperature increase during red giant phase', () => {
      const msTemp = calculateCoreTemperature(1.0, EvolutionPhase.MAIN_SEQUENCE, 0.5);
      const rgTemp = calculateCoreTemperature(1.0, EvolutionPhase.RED_GIANT, 0.95);
      
      expect(rgTemp).toBeGreaterThan(msTemp);
    });

    it('should be very high for horizontal branch (helium burning)', () => {
      const hbTemp = calculateCoreTemperature(1.0, EvolutionPhase.HORIZONTAL_BRANCH, 0.97);
      
      expect(hbTemp).toBeGreaterThan(1e8); // > 100 million K for helium burning
    });
  });

  describe('calculateCorePressure', () => {
    it('should calculate higher pressure for more massive stars', () => {
      const pressure1 = calculateCorePressure(1.0, 1.0, EvolutionPhase.MAIN_SEQUENCE);
      const pressure10 = calculateCorePressure(10.0, 10.0, EvolutionPhase.MAIN_SEQUENCE);
      
      expect(pressure10).toBeGreaterThan(pressure1);
    });

    it('should show extreme pressure in white dwarf', () => {
      const msPress = calculateCorePressure(1.0, 1.0, EvolutionPhase.MAIN_SEQUENCE);
      const wdPress = calculateCorePressure(1.0, 0.01, EvolutionPhase.WHITE_DWARF);
      
      expect(wdPress).toBeGreaterThan(msPress * 1000);
    });
  });

  describe('determineActiveReactions', () => {
    it('should have no reaction in protostar', () => {
      const composition = calculateInitialCoreComposition(1.0);
      const reaction = determineActiveReactions(1e6, composition, EvolutionPhase.PROTOSTAR, 1.0);
      
      expect(reaction).toBe(NuclearReaction.NONE);
    });

    it('should use PP chain for solar-mass main sequence star', () => {
      const composition = { hydrogen: 0.7, helium: 0.28, carbon: 0.01, oxygen: 0.01, neon: 0, magnesium: 0, silicon: 0, iron: 0 };
      const reaction = determineActiveReactions(1.5e7, composition, EvolutionPhase.MAIN_SEQUENCE, 1.0);
      
      expect(reaction).toBe(NuclearReaction.PP_CHAIN);
    });

    it('should use CNO cycle for massive main sequence star', () => {
      const composition = { hydrogen: 0.7, helium: 0.28, carbon: 0.01, oxygen: 0.01, neon: 0, magnesium: 0, silicon: 0, iron: 0 };
      const reaction = determineActiveReactions(2e7, composition, EvolutionPhase.MAIN_SEQUENCE, 2.0);
      
      expect(reaction).toBe(NuclearReaction.CNO_CYCLE);
    });

    it('should have triple-alpha in horizontal branch', () => {
      const composition = { hydrogen: 0.01, helium: 0.8, carbon: 0.15, oxygen: 0.04, neon: 0, magnesium: 0, silicon: 0, iron: 0 };
      const reaction = determineActiveReactions(1.5e8, composition, EvolutionPhase.HORIZONTAL_BRANCH, 1.0);
      
      expect(reaction).toBe(NuclearReaction.TRIPLE_ALPHA);
    });
  });

  describe('determineShellBurning', () => {
    it('should have hydrogen shell burning in red giant', () => {
      const shells = determineShellBurning(EvolutionPhase.RED_GIANT, 1.0, 0.92);
      
      expect(shells.hydrogenShell).toBe(true);
      expect(shells.heliumShell).toBe(false);
    });

    it('should have both shells in AGB phase', () => {
      const shells = determineShellBurning(EvolutionPhase.ASYMPTOTIC_GIANT, 1.0, 0.98);
      
      expect(shells.hydrogenShell).toBe(true);
      expect(shells.heliumShell).toBe(true);
    });

    it('should have no shell burning in main sequence', () => {
      const shells = determineShellBurning(EvolutionPhase.MAIN_SEQUENCE, 1.0, 0.5);
      
      expect(shells.hydrogenShell).toBe(false);
      expect(shells.heliumShell).toBe(false);
      expect(shells.carbonShell).toBe(false);
    });
  });

  describe('calculateLayerStructure', () => {
    it('should have radiative core for solar-mass star', () => {
      const layers = calculateLayerStructure(1.0, EvolutionPhase.MAIN_SEQUENCE, 0.5);
      
      expect(layers.coreRadius).toBeGreaterThan(0);
      expect(layers.radiativeZoneRadius).toBeGreaterThan(layers.coreRadius);
      expect(layers.convectiveZoneRadius).toBe(1.0); // Extends to surface
    });

    it('should have small core in red giant', () => {
      const layers = calculateLayerStructure(1.0, EvolutionPhase.RED_GIANT, 0.92);
      
      expect(layers.coreRadius).toBeLessThan(0.05); // Very small inert core
      expect(layers.convectiveZoneRadius).toBe(1.0); // Large convective envelope
    });

    it('should have fully degenerate structure in white dwarf', () => {
      const layers = calculateLayerStructure(1.0, EvolutionPhase.WHITE_DWARF, 1.0);
      
      expect(layers.coreRadius).toBeGreaterThan(0.9); // Essentially all core
    });
  });

  describe('calculateInternalStructure', () => {
    it('should create complete internal structure', () => {
      const structure = calculateInternalStructure(1.0, 1.0, 1.0, EvolutionPhase.MAIN_SEQUENCE, 0.5, 1.0);
      
      expect(structure.coreComposition).toBeDefined();
      expect(structure.coreTemperature).toBeGreaterThan(0);
      expect(structure.corePressure).toBeGreaterThan(0);
      expect(structure.activeReactions).toBeDefined();
      expect(structure.shellBurning).toBeDefined();
      expect(structure.layerStructure).toBeDefined();
    });

    it('should have active core reaction in main sequence', () => {
      const structure = calculateInternalStructure(1.0, 1.0, 1.0, EvolutionPhase.MAIN_SEQUENCE, 0.5, 1.0);
      
      expect(structure.activeReactions.coreReaction).not.toBe(NuclearReaction.NONE);
    });

    it('should have energy production matching luminosity', () => {
      const luminosity = 10.0;
      const structure = calculateInternalStructure(2.0, 2.0, luminosity, EvolutionPhase.MAIN_SEQUENCE, 0.5, 1.0);
      
      expect(structure.activeReactions.energyProductionRate).toBeGreaterThan(0);
      expect(structure.activeReactions.energyProductionRate).toBeLessThanOrEqual(luminosity);
    });
  });
});
