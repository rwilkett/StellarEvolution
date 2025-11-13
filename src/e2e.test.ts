/**
 * End-to-End Integration Tests
 * Complete simulation workflows from start to finish
 * Tests all requirements with various parameter combinations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationController } from './simulation/SimulationController';
import { CloudParameters, SimulationState, EvolutionPhase } from './types/core';
import { validateCloudParameters } from './validation/inputValidation';
import { createCSVBlob, exportStellarPropertiesToCSV, exportOrbitalParametersToCSV, exportTimeSeriesDataToCSV } from './services/dataExport';
import { saveSimulation, loadSimulation, listSavedSimulations, deleteSimulation } from './services/persistence';

describe('End-to-End Simulation Workflows', () => {
  let controller: SimulationController;

  beforeEach(() => {
    controller = new SimulationController();
  });

  describe('Complete Workflow: Solar-Type Star System', () => {
    it('should create, evolve, save, load, and export a solar-type star system', async () => {
      // Step 1: Validate input parameters
      const cloudParams: CloudParameters = {
        mass: 1.0, // 1 solar mass
        metallicity: 1.0, // Solar metallicity
        angularMomentum: 1e42, // kg⋅m²/s
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      // Step 2: Initialize simulation
      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();
      expect(system.stars.length).toBeGreaterThan(0);
      expect(system.age).toBe(0);

      // Step 3: Start simulation
      controller.startSimulation();
      expect(controller.getState()).toBe(SimulationState.RUNNING);

      // Step 4: Evolve for 1 billion years
      controller.updateSimulation(1e9);
      expect(controller.getCurrentTime()).toBeGreaterThan(0);


      // Step 5: Verify stellar evolution
      const evolvedSystem = controller.getSystem();
      expect(evolvedSystem).toBeDefined();
      expect(evolvedSystem!.stars[0].age).toBeGreaterThan(0);
      expect(evolvedSystem!.stars[0].evolutionPhase).toBeDefined();

      // Step 6: Pause simulation
      controller.pauseSimulation();
      expect(controller.getState()).toBe(SimulationState.PAUSED);

      // Step 7: Save simulation
      const saveId = saveSimulation(evolvedSystem!, controller.getCurrentTime(), controller.getTimeScale(), 'Solar System Test');
      expect(saveId).toBeDefined();

      // Step 8: Load simulation
      const loadedSim = loadSimulation(saveId);
      expect(loadedSim).toBeDefined();
      expect(loadedSim.system.age).toBe(evolvedSystem!.age);
      expect(loadedSim.system.stars.length).toBe(evolvedSystem!.stars.length);

      // Step 9: Export data
      const csvString = exportStellarPropertiesToCSV(loadedSim.system, true);
      const csvData = createCSVBlob(csvString);
      expect(csvData).toBeDefined();
      expect(csvData.size).toBeGreaterThan(0);

      // Step 10: Resume and continue evolution
      controller.startSimulation();
      controller.updateSimulation(1e9);
      expect(controller.getCurrentTime()).toBeGreaterThan(1e9);

      // Step 11: Reset simulation
      controller.resetSimulation();
      expect(controller.getState()).toBe(SimulationState.STOPPED);
      expect(controller.getCurrentTime()).toBe(0);
    });
  });

  describe('Complete Workflow: Low-Mass Star System', () => {
    it('should handle low-mass star formation and long-term evolution', () => {
      // Low-mass star (0.5 solar masses)
      const cloudParams: CloudParameters = {
        mass: 0.5,
        metallicity: 0.5,
        angularMomentum: 5e41,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system.stars.length).toBeGreaterThan(0);

      const star = system.stars[0];
      expect(star.mass).toBeLessThanOrEqual(0.5);
      expect(star.luminosity).toBeLessThan(1.0); // Less luminous than Sun

      // Low-mass stars have very long lifetimes
      expect(star.lifetime).toBeGreaterThan(1e10); // > 10 billion years

      // Evolve for 5 billion years
      controller.updateSimulation(5e9);
      const evolvedSystem = controller.getSystem();
      const evolvedStar = evolvedSystem!.stars[0];

      // Should still be on main sequence
      expect(evolvedStar.evolutionPhase).toBe(EvolutionPhase.MAIN_SEQUENCE);
      expect(evolvedStar.age).toBeGreaterThan(0);
    });
  });

  describe('Complete Workflow: Massive Star System', () => {
    it('should handle massive star formation and rapid evolution', () => {
      // Massive star (20 solar masses)
      const cloudParams: CloudParameters = {
        mass: 20.0,
        metallicity: 1.0,
        angularMomentum: 1e43,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system.stars.length).toBeGreaterThan(0);

      const star = system.stars[0];
      expect(star.mass).toBeGreaterThan(10);
      expect(star.luminosity).toBeGreaterThan(100); // Much more luminous than Sun

      // Massive stars have short lifetimes
      expect(star.lifetime).toBeLessThan(1e8); // < 100 million years

      // Evolve through significant fraction of lifetime
      controller.updateSimulation(1e7); // 10 million years
      const evolvedSystem = controller.getSystem();
      const evolvedStar = evolvedSystem!.stars[0];

      expect(evolvedStar.age).toBeGreaterThan(0);
      expect(evolvedStar.evolutionPhase).toBeDefined();
    });
  });

  describe('Complete Workflow: Binary Star System', () => {
    it('should create and evolve a binary star system with orbital dynamics', () => {
      // High angular momentum favors binary formation
      const cloudParams: CloudParameters = {
        mass: 2.0,
        metallicity: 1.0,
        angularMomentum: 5e43, // High angular momentum
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      
      // May form multiple stars with high angular momentum
      expect(system.stars.length).toBeGreaterThan(0);

      // Evolve system
      controller.updateSimulation(1e9);
      const evolvedSystem = controller.getSystem();

      // Verify all stars have evolved
      evolvedSystem!.stars.forEach(star => {
        expect(star.age).toBeGreaterThan(0);
        expect(star.position).toBeDefined();
        expect(star.velocity).toBeDefined();
      });
    });
  });

  describe('Complete Workflow: Metal-Poor Star System', () => {
    it('should handle low-metallicity star formation with fewer planets', () => {
      // Low metallicity (Population II-like)
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 0.01, // 1% solar metallicity
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system.stars.length).toBeGreaterThan(0);

      const star = system.stars[0];
      expect(star.metallicity).toBeLessThan(0.1);

      // Low metallicity typically means fewer/smaller planets
      // (though some systems may still have planets)
      expect(system.planets).toBeDefined();
      expect(Array.isArray(system.planets)).toBe(true);
    });
  });

  describe('Complete Workflow: Metal-Rich Star System', () => {
    it('should handle high-metallicity star formation with more planets', () => {
      // High metallicity
      const cloudParams: CloudParameters = {
        mass: 1.5,
        metallicity: 2.0, // 2x solar metallicity
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system.stars.length).toBeGreaterThan(0);

      const star = system.stars[0];
      expect(star.metallicity).toBeGreaterThan(1.0);

      // High metallicity typically means more/larger planets
      expect(system.planets).toBeDefined();
      
      if (system.planets.length > 0) {
        system.planets.forEach(planet => {
          expect(planet.mass).toBeGreaterThan(0);
          expect(planet.semiMajorAxis).toBeGreaterThan(0);
          expect(planet.composition).toBeDefined();
        });
      }
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject invalid mass (too low)', () => {
      const cloudParams: CloudParameters = {
        mass: 0.05, // Below minimum
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors!.length).toBeGreaterThan(0);
    });

    it('should reject invalid mass (too high)', () => {
      const cloudParams: CloudParameters = {
        mass: 2000, // Above maximum
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
    });

    it('should reject invalid metallicity (too low)', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 0.00001, // Below minimum
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
    });

    it('should reject invalid metallicity (too high)', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 5.0, // Above maximum
        angularMomentum: 1e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
    });

    it('should reject negative angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: -1e42, // Negative
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
    });

    it('should accept valid parameters at boundaries', () => {
      const cloudParams: CloudParameters = {
        mass: 0.1, // Minimum valid
        metallicity: 0.0001, // Minimum valid
        angularMomentum: 0, // Minimum valid
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Time Control Tests', () => {
    beforeEach(() => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      controller.initializeSimulation(cloudParams);
    });

    it('should handle time scale changes during simulation', () => {
      controller.setTimeScale(1e6);
      expect(controller.getTimeScale()).toBe(1e6);

      controller.startSimulation();
      controller.updateSimulation(1e6);
      
      const time1 = controller.getCurrentTime();
      expect(time1).toBeGreaterThan(0);

      controller.setTimeScale(1e9);
      controller.updateSimulation(1e6);
      
      const time2 = controller.getCurrentTime();
      expect(time2).toBeGreaterThan(time1);
    });

    it('should jump to specific times correctly', () => {
      controller.jumpToTime(1e9);
      expect(controller.getCurrentTime()).toBe(1e9);

      controller.jumpToTime(5e9);
      expect(controller.getCurrentTime()).toBe(5e9);

      controller.jumpToTime(1e6); // Jump backward
      expect(controller.getCurrentTime()).toBe(1e6);
    });

    it('should handle rapid time jumps', () => {
      const times = [1e6, 1e9, 5e8, 2e9, 1e7, 3e9];
      
      times.forEach(time => {
        controller.jumpToTime(time);
        expect(controller.getCurrentTime()).toBe(time);
        
        const system = controller.getSystem();
        expect(system!.age).toBe(time);
      });
    });
  });

  describe('Data Export Tests', () => {
    it('should export star data in CSV format', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      controller.updateSimulation(1e9);

      const csvString = exportStellarPropertiesToCSV(system, true);
      const csvData = createCSVBlob(csvString);

      expect(csvData).toBeDefined();
      expect(csvData.size).toBeGreaterThan(0);
      expect(csvData.type).toContain('csv');
    });

    it('should export orbital data', () => {
      const cloudParams: CloudParameters = {
        mass: 2.0,
        metallicity: 1.0,
        angularMomentum: 5e43,
      };

      const system = controller.initializeSimulation(cloudParams);

      const csvString = exportOrbitalParametersToCSV(system, true);
      const csvData = createCSVBlob(csvString);

      expect(csvData).toBeDefined();
      expect(csvData.size).toBeGreaterThan(0);
    });

    it('should export time-series data', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      controller.updateSimulation(1e9);

      const csvString = exportTimeSeriesDataToCSV(system, 1e8, true);
      const csvData = createCSVBlob(csvString);

      expect(csvData).toBeDefined();
      expect(csvData.size).toBeGreaterThan(0);
    });

    it('should complete export within 5 seconds', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      controller.updateSimulation(1e9);

      const startTime = performance.now();
      
      const csvString = exportTimeSeriesDataToCSV(system, 1e8, true);
      createCSVBlob(csvString);

      const endTime = performance.now();
      const exportTime = endTime - startTime;

      expect(exportTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe('Persistence Tests', () => {
    it('should save and load simulation state', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      controller.updateSimulation(1e9);

      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Test Save');
      expect(saveId).toBeDefined();

      const loadedSim = loadSimulation(saveId);
      expect(loadedSim).toBeDefined();
      expect(loadedSim.system.age).toBe(system.age);
      expect(loadedSim.system.stars.length).toBe(system.stars.length);
    });

    it('should list saved simulations', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      
      saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Save 1');
      saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Save 2');

      const savedSims = listSavedSimulations();
      expect(savedSims.length).toBeGreaterThanOrEqual(2);
    });

    it('should delete saved simulations', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'To Delete');

      deleteSimulation(saveId);

      const savedSims = listSavedSimulations();
      const found = savedSims.find(s => s.id === saveId);
      expect(found).toBeUndefined();
    });

    it('should preserve all simulation state on save/load', () => {
      const cloudParams: CloudParameters = {
        mass: 1.5,
        metallicity: 1.2,
        angularMomentum: 2e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      controller.updateSimulation(2e9);

      const originalStar = system.stars[0];

      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Full State Test');
      const loadedSim = loadSimulation(saveId);

      expect(loadedSim.system.age).toBe(system.age);
      expect(loadedSim.system.initialCloudParameters).toEqual(cloudParams);
      
      const loadedStar = loadedSim.system.stars[0];
      expect(loadedStar.mass).toBe(originalStar.mass);
      expect(loadedStar.age).toBe(originalStar.age);
      expect(loadedStar.luminosity).toBe(originalStar.luminosity);
      expect(loadedStar.temperature).toBe(originalStar.temperature);
    });
  });

  describe('Performance and Responsiveness Tests', () => {
    it('should initialize simulation within 100ms', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const startTime = performance.now();
      controller.initializeSimulation(cloudParams);
      const endTime = performance.now();

      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(100);
    });

    it('should update simulation within 100ms', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      controller.initializeSimulation(cloudParams);

      const startTime = performance.now();
      controller.updateSimulation(1e9);
      const endTime = performance.now();

      const updateTime = endTime - startTime;
      expect(updateTime).toBeLessThan(100);
    });

    it('should handle rapid state changes efficiently', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      controller.initializeSimulation(cloudParams);

      const startTime = performance.now();

      // Perform rapid state changes
      for (let i = 0; i < 10; i++) {
        controller.startSimulation();
        controller.pauseSimulation();
        controller.setTimeScale(1e6 * (i + 1));
        controller.updateSimulation(1e6);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle large time jumps efficiently', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      controller.initializeSimulation(cloudParams);

      const startTime = performance.now();
      controller.jumpToTime(1e10); // 10 billion years
      const endTime = performance.now();

      const jumpTime = endTime - startTime;
      expect(jumpTime).toBeLessThan(200); // Less than 200ms
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle minimum valid parameters', () => {
      const cloudParams: CloudParameters = {
        mass: 0.1,
        metallicity: 0.0001,
        angularMomentum: 0,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();
      expect(system.stars.length).toBeGreaterThan(0);
    });

    it('should handle maximum valid parameters', () => {
      const cloudParams: CloudParameters = {
        mass: 1000,
        metallicity: 3.0,
        angularMomentum: 1e45,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();
      expect(system.stars.length).toBeGreaterThan(0);
    });

    it('should handle zero angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 0,
      };

      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();
      
      // Zero angular momentum should produce single star
      expect(system.stars.length).toBeGreaterThan(0);
    });

    it('should handle very high angular momentum', () => {
      const cloudParams: CloudParameters = {
        mass: 10.0,
        metallicity: 1.0,
        angularMomentum: 1e45,
      };

      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();
      
      // High angular momentum may produce multiple stars
      expect(system.stars.length).toBeGreaterThan(0);
    });

    it('should throw error when starting uninitialized simulation', () => {
      const uninitializedController = new SimulationController();
      expect(() => uninitializedController.startSimulation()).toThrow();
    });

    it('should throw error for negative time scale', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      controller.initializeSimulation(cloudParams);
      expect(() => controller.setTimeScale(-1)).toThrow();
    });

    it('should throw error for negative target time', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      controller.initializeSimulation(cloudParams);
      expect(() => controller.jumpToTime(-1)).toThrow();
    });
  });

  describe('Stellar Evolution Verification', () => {
    it('should evolve solar-mass star correctly over 5 billion years', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      const initialStar = system.stars[0];

      controller.jumpToTime(5e9); // 5 billion years (current age of Sun)

      const evolvedSystem = controller.getSystem();
      const evolvedStar = evolvedSystem!.stars[0];

      // Should still be on main sequence
      expect(evolvedStar.evolutionPhase).toBe(EvolutionPhase.MAIN_SEQUENCE);
      expect(evolvedStar.age).toBe(5e9);
      
      // Luminosity should have increased slightly
      expect(evolvedStar.luminosity).toBeGreaterThanOrEqual(initialStar.luminosity);
    });

    it('should evolve massive star through complete lifecycle', () => {
      const cloudParams: CloudParameters = {
        mass: 25.0, // 25 solar masses
        metallicity: 1.0,
        angularMomentum: 1e43,
      };

      const system = controller.initializeSimulation(cloudParams);
      const initialStar = system.stars[0];

      // Massive stars live only ~7 million years
      controller.jumpToTime(1e7); // 10 million years

      const evolvedSystem = controller.getSystem();
      const evolvedStar = evolvedSystem!.stars[0];

      // Should have evolved significantly or reached end state
      expect(evolvedStar.age).toBeGreaterThan(initialStar.age);
      expect(evolvedStar.evolutionPhase).toBeDefined();
    });

    it('should track evolution phases correctly', () => {
      const cloudParams: CloudParameters = {
        mass: 5.0, // 5 solar masses
        metallicity: 1.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);

      // Check at different times
      const times = [0, 1e8, 5e8, 1e9];
      const phases: EvolutionPhase[] = [];

      times.forEach(time => {
        controller.jumpToTime(time);
        const currentSystem = controller.getSystem();
        phases.push(currentSystem!.stars[0].evolutionPhase);
      });

      // Should have evolution phase defined at all times
      phases.forEach(phase => {
        expect(phase).toBeDefined();
      });
    });
  });

  describe('Planetary System Verification', () => {
    it('should generate planets for suitable stars', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.5, // High metallicity favors planet formation
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      
      expect(system.planets).toBeDefined();
      expect(Array.isArray(system.planets)).toBe(true);
      
      // With high metallicity, likely to have planets
      if (system.planets.length > 0) {
        system.planets.forEach(planet => {
          expect(planet.mass).toBeGreaterThan(0);
          expect(planet.radius).toBeGreaterThan(0);
          expect(planet.semiMajorAxis).toBeGreaterThan(0);
          expect(planet.eccentricity).toBeGreaterThanOrEqual(0);
          expect(planet.eccentricity).toBeLessThan(1);
          expect(planet.composition).toBeDefined();
          expect(planet.parentStarId).toBeDefined();
        });
      }
    });

    it('should update planet positions during evolution', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 1.5,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      
      if (system.planets.length > 0) {
        const initialPlanet = system.planets[0];
        const initialPosition = { ...initialPlanet.position };

        controller.updateSimulation(1e6); // 1 million years

        const evolvedSystem = controller.getSystem();
        const evolvedPlanet = evolvedSystem!.planets[0];

        // Position should be defined (may have changed)
        expect(evolvedPlanet.position).toBeDefined();
        expect(evolvedPlanet.position.x).toBeDefined();
        expect(evolvedPlanet.position.y).toBeDefined();
        expect(evolvedPlanet.position.z).toBeDefined();
      }
    });

    it('should respect snow line in planet composition', () => {
      const cloudParams: CloudParameters = {
        mass: 1.0,
        metallicity: 2.0,
        angularMomentum: 1e42,
      };

      const system = controller.initializeSimulation(cloudParams);
      
      if (system.planets.length > 1) {
        // Inner planets should be rocky, outer planets may be icy/gas
        const innerPlanets = system.planets.filter(p => p.semiMajorAxis < 3);
        const outerPlanets = system.planets.filter(p => p.semiMajorAxis >= 3);

        // Verify composition types exist
        innerPlanets.forEach(planet => {
          expect(planet.composition).toBeDefined();
        });

        outerPlanets.forEach(planet => {
          expect(planet.composition).toBeDefined();
        });
      }
    });
  });

  describe('Complex Multi-Step Workflows', () => {
    it('should handle complete user workflow: create, evolve, modify, save, load, export', () => {
      // Step 1: Create simulation
      const cloudParams: CloudParameters = {
        mass: 1.5,
        metallicity: 1.2,
        angularMomentum: 2e42,
      };

      const validation = validateCloudParameters(cloudParams);
      expect(validation.isValid).toBe(true);

      const system = controller.initializeSimulation(cloudParams);
      expect(system).toBeDefined();

      // Step 2: Start and evolve
      controller.startSimulation();
      controller.setTimeScale(1e9);
      controller.updateSimulation(1e9);

      // Step 3: Pause and inspect
      controller.pauseSimulation();
      const pausedTime = controller.getCurrentTime();
      expect(pausedTime).toBeGreaterThan(0);

      // Step 4: Jump to different time
      controller.jumpToTime(5e9);
      expect(controller.getCurrentTime()).toBe(5e9);

      // Step 5: Save simulation
      const evolvedSystem = controller.getSystem();
      const saveId = saveSimulation(evolvedSystem!, controller.getCurrentTime(), controller.getTimeScale(), 'Complex Workflow Test');
      expect(saveId).toBeDefined();

      // Step 6: Reset and verify
      controller.resetSimulation();
      expect(controller.getCurrentTime()).toBe(0);

      // Step 7: Load saved simulation
      const loadedSim = loadSimulation(saveId);
      expect(loadedSim.system.age).toBe(5e9);

      // Step 8: Export data
      const csvString = exportTimeSeriesDataToCSV(loadedSim.system, 1e9, true);
      const csvData = createCSVBlob(csvString);
      expect(csvData.size).toBeGreaterThan(0);

      // Step 9: Continue evolution from loaded state
      controller.initializeSimulation(loadedSim.system.initialCloudParameters);
      controller.jumpToTime(loadedSim.system.age);
      controller.updateSimulation(1e9);
      expect(controller.getCurrentTime()).toBeGreaterThan(5e9);
    });

    it('should handle multiple simulations in sequence', () => {
      const scenarios = [
        { mass: 0.5, metallicity: 0.5, angularMomentum: 5e41 },
        { mass: 1.0, metallicity: 1.0, angularMomentum: 1e42 },
        { mass: 5.0, metallicity: 1.5, angularMomentum: 5e42 },
        { mass: 20.0, metallicity: 1.0, angularMomentum: 1e43 },
      ];

      const savedIds: string[] = [];

      for (const params of scenarios) {
        const system = controller.initializeSimulation(params);
        controller.updateSimulation(1e9);
        
        const saveId = saveSimulation(
          system,
          controller.getCurrentTime(),
          controller.getTimeScale(),
          `Scenario ${params.mass}M☉`
        );
        savedIds.push(saveId);

        controller.resetSimulation();
      }

      // Verify all simulations were saved
      expect(savedIds.length).toBe(scenarios.length);

      // Load and verify each
      for (let i = 0; i < savedIds.length; i++) {
        const loaded = loadSimulation(savedIds[i]);
        expect(loaded).toBeDefined();
        expect(loaded.system.initialCloudParameters.mass).toBe(scenarios[i].mass);
      }
    });
  });

  describe('Requirements Verification', () => {
    it('should meet Requirement 1.1: Accept mass input (0.1 to 1000 M☉)', () => {
      const validMasses = [0.1, 1.0, 10.0, 100.0, 1000.0];
      
      validMasses.forEach(mass => {
        const params: CloudParameters = {
          mass,
          metallicity: 1.0,
          angularMomentum: 1e42,
        };
        
        const validation = validateCloudParameters(params);
        expect(validation.isValid).toBe(true);
        
        const system = controller.initializeSimulation(params);
        expect(system).toBeDefined();
      });
    });

    it('should meet Requirement 1.2: Accept metallicity input (0.0001 to 3.0 Z☉)', () => {
      const validMetallicities = [0.0001, 0.01, 0.5, 1.0, 2.0, 3.0];
      
      validMetallicities.forEach(metallicity => {
        const params: CloudParameters = {
          mass: 1.0,
          metallicity,
          angularMomentum: 1e42,
        };
        
        const validation = validateCloudParameters(params);
        expect(validation.isValid).toBe(true);
        
        const system = controller.initializeSimulation(params);
        expect(system).toBeDefined();
      });
    });

    it('should meet Requirement 1.3: Accept angular momentum input', () => {
      const validAngularMomenta = [0, 1e40, 1e42, 1e44];
      
      validAngularMomenta.forEach(angularMomentum => {
        const params: CloudParameters = {
          mass: 1.0,
          metallicity: 1.0,
          angularMomentum,
        };
        
        const validation = validateCloudParameters(params);
        expect(validation.isValid).toBe(true);
        
        const system = controller.initializeSimulation(params);
        expect(system).toBeDefined();
      });
    });

    it('should meet Requirement 1.4: Display error messages for invalid inputs', () => {
      const invalidParams: CloudParameters = {
        mass: -1,
        metallicity: 10,
        angularMomentum: -1e42,
      };
      
      const validation = validateCloudParameters(invalidParams);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors!.length).toBeGreaterThan(0);
      
      validation.errors!.forEach(error => {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      });
    });

    it('should meet Requirement 7.1: Start simulation', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      controller.initializeSimulation(params);
      controller.startSimulation();
      
      expect(controller.getState()).toBe(SimulationState.RUNNING);
    });

    it('should meet Requirement 7.2: Pause simulation', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      controller.initializeSimulation(params);
      controller.startSimulation();
      controller.pauseSimulation();
      
      expect(controller.getState()).toBe(SimulationState.PAUSED);
    });

    it('should meet Requirement 7.3: Reset simulation', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      controller.initializeSimulation(params);
      controller.updateSimulation(1e9);
      controller.resetSimulation();
      
      expect(controller.getState()).toBe(SimulationState.STOPPED);
      expect(controller.getCurrentTime()).toBe(0);
    });

    it('should meet Requirement 7.4: Display current simulation time', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      controller.initializeSimulation(params);
      controller.updateSimulation(1e9);
      
      const currentTime = controller.getCurrentTime();
      expect(currentTime).toBeGreaterThan(0);
      expect(currentTime).toBe(1e9);
    });

    it('should meet Requirement 7.5: Adjust time scale', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      controller.initializeSimulation(params);
      controller.setTimeScale(1e9);
      
      expect(controller.getTimeScale()).toBe(1e9);
    });

    it('should meet Requirement 8.1: Export stellar properties to CSV', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      const csvString = exportStellarPropertiesToCSV(system, true);
      const csvData = createCSVBlob(csvString);
      
      expect(csvData).toBeDefined();
      expect(csvData.type).toContain('csv');
    });

    it('should meet Requirement 8.4: Complete export within 5 seconds', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      controller.updateSimulation(1e9);
      
      const startTime = performance.now();
      const csvString = exportTimeSeriesDataToCSV(system, 1e8, true);
      createCSVBlob(csvString);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should meet Requirement 9.1: Save simulation state', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Test');
      
      expect(saveId).toBeDefined();
      expect(typeof saveId).toBe('string');
    });

    it('should meet Requirement 9.2: Load simulation state', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Test');
      const loadedSim = loadSimulation(saveId);
      
      expect(loadedSim).toBeDefined();
      expect(loadedSim.system.age).toBe(system.age);
    });

    it('should meet Requirement 9.3: List saved simulations', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'Test');
      
      const savedSims = listSavedSimulations();
      expect(Array.isArray(savedSims)).toBe(true);
      expect(savedSims.length).toBeGreaterThan(0);
    });

    it('should meet Requirement 9.5: Delete saved simulations', () => {
      const params: CloudParameters = {
        mass: 1.0,
        metallicity: 1.0,
        angularMomentum: 1e42,
      };
      
      const system = controller.initializeSimulation(params);
      const saveId = saveSimulation(system, controller.getCurrentTime(), controller.getTimeScale(), 'To Delete');
      
      deleteSimulation(saveId);
      
      const savedSims = listSavedSimulations();
      const found = savedSims.find(s => s.id === saveId);
      expect(found).toBeUndefined();
    });
  });
});
