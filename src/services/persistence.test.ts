/**
 * Unit tests for persistence service
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  saveSimulation,
  loadSimulation,
  listSavedSimulations,
  deleteSimulation,
  clearAllSimulations,
} from './persistence';
import { StarSystem, Star, Planet, EvolutionPhase, SpectralType, PlanetComposition, NuclearReaction } from '../types/core';

// Mock localStorage for Node.js test environment
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

describe('Persistence Service', () => {
  // Set up localStorage mock before all tests
  beforeAll(() => {
    (globalThis as any).localStorage = new LocalStorageMock() as Storage;
  });
  // Mock star system for testing
  const mockStar: Star = {
    id: 'star-1',
    name: 'Test Star',
    mass: 1.0,
    radius: 1.0,
    luminosity: 1.0,
    temperature: 5778,
    age: 4.6e9,
    metallicity: 1.0,
    spectralType: SpectralType.G,
    evolutionPhase: EvolutionPhase.MAIN_SEQUENCE,
    lifetime: 1e10,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    internalStructure: {
      coreComposition: {
        hydrogen: 0.73,
        helium: 0.25,
        carbon: 0.005,
        oxygen: 0.01,
        neon: 0.002,
        magnesium: 0.001,
        silicon: 0.001,
        iron: 0.001,
      },
      coreTemperature: 1.5e7,
      corePressure: 2.5e16,
      activeReactions: {
        coreReaction: NuclearReaction.PP_CHAIN,
        shellReactions: [],
        energyProductionRate: 1.0,
      },
      shellBurning: {
        hydrogenShell: false,
        heliumShell: false,
        carbonShell: false,
      },
      layerStructure: {
        coreRadius: 0.25,
        radiativeZoneRadius: 0.7,
        convectiveZoneRadius: 1.0,
      },
    },
  };

  const mockPlanet: Planet = {
    id: 'planet-1',
    name: 'Test Planet',
    mass: 1.0,
    radius: 1.0,
    composition: PlanetComposition.ROCKY,
    semiMajorAxis: 1.0,
    eccentricity: 0.0167,
    orbitalPeriod: 1.0,
    parentStarId: 'star-1',
    position: { x: 1.0, y: 0, z: 0 },
  };

  const mockSystem: StarSystem = {
    id: 'system-1',
    name: 'Test System',
    stars: [mockStar],
    planets: [mockPlanet],
    age: 4.6e9,
    initialCloudParameters: {
      mass: 1.0,
      metallicity: 1.0,
      angularMomentum: 1e48,
    },
  };

  // Clear localStorage before and after each test
  beforeEach(() => {
    clearAllSimulations();
  });

  afterEach(() => {
    clearAllSimulations();
  });

  describe('saveSimulation', () => {
    it('should save a simulation and return a unique ID', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test Save');
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs for multiple saves', () => {
      const id1 = saveSimulation(mockSystem, 0, 1.0, 'Save 1');
      const id2 = saveSimulation(mockSystem, 0, 1.0, 'Save 2');
      const id3 = saveSimulation(mockSystem, 0, 1.0, 'Save 3');
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should throw error when system is not provided', () => {
      expect(() => {
        saveSimulation(null as any, 0, 1.0, 'Test');
      }).toThrow('Cannot save: no system provided');
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        saveSimulation(mockSystem, 0, 1.0, '');
      }).toThrow('Cannot save: name is required');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => {
        saveSimulation(mockSystem, 0, 1.0, '   ');
      }).toThrow('Cannot save: name is required');
    });

    it('should trim whitespace from name', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, '  Test Name  ');
      const loaded = loadSimulation(id);
      
      expect(loaded.name).toBe('Test Name');
    });

    it('should save current time and time scale', () => {
      const currentTime = 1.5e9;
      const timeScale = 2.5;
      const id = saveSimulation(mockSystem, currentTime, timeScale, 'Test');
      const loaded = loadSimulation(id);
      
      expect(loaded.currentTime).toBe(currentTime);
      expect(loaded.timeScale).toBe(timeScale);
    });

    it('should save timestamp as Date object', () => {
      const beforeSave = new Date();
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      const afterSave = new Date();
      const loaded = loadSimulation(id);
      
      expect(loaded.timestamp).toBeInstanceOf(Date);
      expect(loaded.timestamp.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(loaded.timestamp.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });

  describe('loadSimulation', () => {
    it('should load a saved simulation', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test Load');
      const loaded = loadSimulation(id);
      
      expect(loaded).toBeDefined();
      expect(loaded.id).toBe(id);
      expect(loaded.name).toBe('Test Load');
    });

    it('should throw error when ID is empty', () => {
      expect(() => {
        loadSimulation('');
      }).toThrow('Cannot load: simulation ID is required');
    });

    it('should throw error when simulation not found', () => {
      expect(() => {
        loadSimulation('nonexistent-id');
      }).toThrow('not found');
    });

    it('should restore all system properties', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.id).toBe(mockSystem.id);
      expect(loaded.system.name).toBe(mockSystem.name);
      expect(loaded.system.stars).toHaveLength(1);
      expect(loaded.system.planets).toHaveLength(1);
      expect(loaded.system.age).toBe(mockSystem.age);
    });

    it('should restore star properties correctly', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      const loaded = loadSimulation(id);
      const star = loaded.system.stars[0];
      
      expect(star.id).toBe(mockStar.id);
      expect(star.name).toBe(mockStar.name);
      expect(star.mass).toBe(mockStar.mass);
      expect(star.temperature).toBe(mockStar.temperature);
      expect(star.spectralType).toBe(mockStar.spectralType);
      expect(star.evolutionPhase).toBe(mockStar.evolutionPhase);
    });

    it('should restore planet properties correctly', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      const loaded = loadSimulation(id);
      const planet = loaded.system.planets[0];
      
      expect(planet.id).toBe(mockPlanet.id);
      expect(planet.name).toBe(mockPlanet.name);
      expect(planet.mass).toBe(mockPlanet.mass);
      expect(planet.semiMajorAxis).toBe(mockPlanet.semiMajorAxis);
      expect(planet.composition).toBe(mockPlanet.composition);
    });

    it('should restore initial cloud parameters', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.initialCloudParameters.mass).toBe(1.0);
      expect(loaded.system.initialCloudParameters.metallicity).toBe(1.0);
      expect(loaded.system.initialCloudParameters.angularMomentum).toBe(1e48);
    });
  });

  describe('Save and Load Round-Trip', () => {
    it('should preserve complete state through save and load', () => {
      const currentTime = 2.5e9;
      const timeScale = 3.0;
      const name = 'Round Trip Test';
      
      const id = saveSimulation(mockSystem, currentTime, timeScale, name);
      const loaded = loadSimulation(id);
      
      // Verify all top-level properties
      expect(loaded.id).toBe(id);
      expect(loaded.name).toBe(name);
      expect(loaded.currentTime).toBe(currentTime);
      expect(loaded.timeScale).toBe(timeScale);
      expect(loaded.timestamp).toBeInstanceOf(Date);
      
      // Verify system structure
      expect(loaded.system).toEqual(mockSystem);
    });

    it('should preserve multiple stars through round-trip', () => {
      const multiStarSystem: StarSystem = {
        ...mockSystem,
        stars: [
          mockStar,
          { ...mockStar, id: 'star-2', name: 'Star 2', mass: 2.0 },
          { ...mockStar, id: 'star-3', name: 'Star 3', mass: 0.5 },
        ],
      };
      
      const id = saveSimulation(multiStarSystem, 0, 1.0, 'Multi Star');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.stars).toHaveLength(3);
      expect(loaded.system.stars[0].id).toBe('star-1');
      expect(loaded.system.stars[1].id).toBe('star-2');
      expect(loaded.system.stars[2].id).toBe('star-3');
      expect(loaded.system.stars[1].mass).toBe(2.0);
      expect(loaded.system.stars[2].mass).toBe(0.5);
    });

    it('should preserve multiple planets through round-trip', () => {
      const multiPlanetSystem: StarSystem = {
        ...mockSystem,
        planets: [
          mockPlanet,
          { ...mockPlanet, id: 'planet-2', name: 'Planet 2', semiMajorAxis: 5.2 },
          { ...mockPlanet, id: 'planet-3', name: 'Planet 3', semiMajorAxis: 9.5 },
        ],
      };
      
      const id = saveSimulation(multiPlanetSystem, 0, 1.0, 'Multi Planet');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.planets).toHaveLength(3);
      expect(loaded.system.planets[0].id).toBe('planet-1');
      expect(loaded.system.planets[1].id).toBe('planet-2');
      expect(loaded.system.planets[2].id).toBe('planet-3');
      expect(loaded.system.planets[1].semiMajorAxis).toBe(5.2);
      expect(loaded.system.planets[2].semiMajorAxis).toBe(9.5);
    });

    it('should preserve system with no planets', () => {
      const noPlanetSystem: StarSystem = {
        ...mockSystem,
        planets: [],
      };
      
      const id = saveSimulation(noPlanetSystem, 0, 1.0, 'No Planets');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.planets).toHaveLength(0);
      expect(loaded.system.stars).toHaveLength(1);
    });

    it('should preserve evolved star properties', () => {
      const evolvedStar: Star = {
        ...mockStar,
        age: 8e9,
        temperature: 4500,
        radius: 10.0,
        luminosity: 50.0,
        evolutionPhase: EvolutionPhase.RED_GIANT,
      };
      
      const evolvedSystem: StarSystem = {
        ...mockSystem,
        stars: [evolvedStar],
        age: 8e9,
      };
      
      const id = saveSimulation(evolvedSystem, 8e9, 1.0, 'Evolved');
      const loaded = loadSimulation(id);
      const star = loaded.system.stars[0];
      
      expect(star.age).toBe(8e9);
      expect(star.temperature).toBe(4500);
      expect(star.radius).toBe(10.0);
      expect(star.luminosity).toBe(50.0);
      expect(star.evolutionPhase).toBe(EvolutionPhase.RED_GIANT);
    });
  });

  describe('listSavedSimulations', () => {
    it('should return empty array when no simulations saved', () => {
      const list = listSavedSimulations();
      
      expect(list).toEqual([]);
    });

    it('should return all saved simulations', () => {
      saveSimulation(mockSystem, 0, 1.0, 'Save 1');
      saveSimulation(mockSystem, 0, 1.0, 'Save 2');
      saveSimulation(mockSystem, 0, 1.0, 'Save 3');
      
      const list = listSavedSimulations();
      
      expect(list).toHaveLength(3);
    });

    it('should return simulations with correct properties', () => {
      const id = saveSimulation(mockSystem, 1e9, 2.0, 'Test List');
      const list = listSavedSimulations();
      
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(id);
      expect(list[0].name).toBe('Test List');
      expect(list[0].currentTime).toBe(1e9);
      expect(list[0].timeScale).toBe(2.0);
      expect(list[0].timestamp).toBeInstanceOf(Date);
      expect(list[0].system).toBeDefined();
    });

    it('should sort simulations by timestamp (newest first)', () => {
      // Save with small delays to ensure different timestamps
      const id1 = saveSimulation(mockSystem, 0, 1.0, 'First');
      
      // Small delay
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait
      }
      
      const id2 = saveSimulation(mockSystem, 0, 1.0, 'Second');
      
      // Small delay
      const start2 = Date.now();
      while (Date.now() - start2 < 10) {
        // Wait
      }
      
      const id3 = saveSimulation(mockSystem, 0, 1.0, 'Third');
      
      const list = listSavedSimulations();
      
      expect(list).toHaveLength(3);
      expect(list[0].id).toBe(id3); // Newest first
      expect(list[1].id).toBe(id2);
      expect(list[2].id).toBe(id1); // Oldest last
    });

    it('should include all system data in listed simulations', () => {
      saveSimulation(mockSystem, 0, 1.0, 'Complete Data');
      const list = listSavedSimulations();
      
      expect(list[0].system.stars).toHaveLength(1);
      expect(list[0].system.planets).toHaveLength(1);
      expect(list[0].system.initialCloudParameters).toBeDefined();
    });
  });

  describe('deleteSimulation', () => {
    it('should delete a saved simulation', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'To Delete');
      
      expect(listSavedSimulations()).toHaveLength(1);
      
      deleteSimulation(id);
      
      expect(listSavedSimulations()).toHaveLength(0);
    });

    it('should throw error when ID is empty', () => {
      expect(() => {
        deleteSimulation('');
      }).toThrow('Cannot delete: simulation ID is required');
    });

    it('should not throw when deleting non-existent simulation', () => {
      expect(() => {
        deleteSimulation('nonexistent-id');
      }).not.toThrow();
    });

    it('should only delete specified simulation', () => {
      const id1 = saveSimulation(mockSystem, 0, 1.0, 'Keep 1');
      const id2 = saveSimulation(mockSystem, 0, 1.0, 'Delete');
      const id3 = saveSimulation(mockSystem, 0, 1.0, 'Keep 2');
      
      expect(listSavedSimulations()).toHaveLength(3);
      
      deleteSimulation(id2);
      
      const list = listSavedSimulations();
      expect(list).toHaveLength(2);
      expect(list.find(s => s.id === id1)).toBeDefined();
      expect(list.find(s => s.id === id2)).toBeUndefined();
      expect(list.find(s => s.id === id3)).toBeDefined();
    });

    it('should prevent loading deleted simulation', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'To Delete');
      
      deleteSimulation(id);
      
      expect(() => {
        loadSimulation(id);
      }).toThrow('not found');
    });

    it('should handle multiple deletions', () => {
      const id1 = saveSimulation(mockSystem, 0, 1.0, 'Delete 1');
      const id2 = saveSimulation(mockSystem, 0, 1.0, 'Delete 2');
      const id3 = saveSimulation(mockSystem, 0, 1.0, 'Delete 3');
      
      deleteSimulation(id1);
      deleteSimulation(id2);
      deleteSimulation(id3);
      
      expect(listSavedSimulations()).toHaveLength(0);
    });
  });

  describe('clearAllSimulations', () => {
    it('should clear all saved simulations', () => {
      saveSimulation(mockSystem, 0, 1.0, 'Save 1');
      saveSimulation(mockSystem, 0, 1.0, 'Save 2');
      saveSimulation(mockSystem, 0, 1.0, 'Save 3');
      
      expect(listSavedSimulations()).toHaveLength(3);
      
      clearAllSimulations();
      
      expect(listSavedSimulations()).toHaveLength(0);
    });

    it('should not throw when clearing empty storage', () => {
      expect(() => {
        clearAllSimulations();
      }).not.toThrow();
    });

    it('should prevent loading after clear', () => {
      const id = saveSimulation(mockSystem, 0, 1.0, 'Test');
      
      clearAllSimulations();
      
      expect(() => {
        loadSimulation(id);
      }).toThrow('not found');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long simulation names', () => {
      const longName = 'A'.repeat(1000);
      const id = saveSimulation(mockSystem, 0, 1.0, longName);
      const loaded = loadSimulation(id);
      
      expect(loaded.name).toBe(longName);
    });

    it('should handle special characters in names', () => {
      const specialName = 'Test "Name" with \'quotes\' & symbols!@#$%';
      const id = saveSimulation(mockSystem, 0, 1.0, specialName);
      const loaded = loadSimulation(id);
      
      expect(loaded.name).toBe(specialName);
    });

    it('should handle very large time values', () => {
      const largeTime = 1e15;
      const id = saveSimulation(mockSystem, largeTime, 1.0, 'Large Time');
      const loaded = loadSimulation(id);
      
      expect(loaded.currentTime).toBe(largeTime);
    });

    it('should handle zero and negative time scale', () => {
      const id1 = saveSimulation(mockSystem, 0, 0, 'Zero Scale');
      const id2 = saveSimulation(mockSystem, 0, -1.5, 'Negative Scale');
      
      const loaded1 = loadSimulation(id1);
      const loaded2 = loadSimulation(id2);
      
      expect(loaded1.timeScale).toBe(0);
      expect(loaded2.timeScale).toBe(-1.5);
    });

    it('should handle system with many stars and planets', () => {
      const largeSystem: StarSystem = {
        ...mockSystem,
        stars: Array.from({ length: 10 }, (_, i) => ({
          ...mockStar,
          id: `star-${i}`,
          name: `Star ${i}`,
        })),
        planets: Array.from({ length: 50 }, (_, i) => ({
          ...mockPlanet,
          id: `planet-${i}`,
          name: `Planet ${i}`,
        })),
      };
      
      const id = saveSimulation(largeSystem, 0, 1.0, 'Large System');
      const loaded = loadSimulation(id);
      
      expect(loaded.system.stars).toHaveLength(10);
      expect(loaded.system.planets).toHaveLength(50);
    });
  });
});
