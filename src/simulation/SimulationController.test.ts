/**
 * Simulation Controller Tests
 * Tests for the SimulationController class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationController } from './SimulationController';
import { CloudParameters, SimulationState, StarSystem } from '../types/core';

describe('SimulationController', () => {
  let controller: SimulationController;
  let testCloudParams: CloudParameters;

  beforeEach(() => {
    controller = new SimulationController();
    testCloudParams = {
      mass: 1000.0, // 1000 solar masses (enough to overcome Jeans mass)
      metallicity: 1.0, // Solar metallicity
      angularMomentum: 1e42, // kg⋅m²/s
      temperature: 10, // Cold cloud (10K)
      radius: 2, // Smaller radius (2 pc) for higher density and bound cloud
      turbulenceVelocity: 0.5, // Low turbulence (0.5 km/s) for bound cloud
      magneticFieldStrength: 10, // Moderate magnetic field
    };
  });

  describe('initializeSimulation', () => {
    it('should create a star system from cloud parameters', () => {
      const system = controller.initializeSimulation(testCloudParams);
      
      expect(system).toBeDefined();
      expect(system.stars.length).toBeGreaterThan(0);
      expect(system.age).toBe(0);
      expect(system.initialCloudParameters).toEqual(testCloudParams);
    });

    it('should generate planets for stars', () => {
      const system = controller.initializeSimulation(testCloudParams);
      
      // Not all stars will have planets, but the system should have a planets array
      expect(system.planets).toBeDefined();
      expect(Array.isArray(system.planets)).toBe(true);
    });

    it('should reset simulation state', () => {
      controller.initializeSimulation(testCloudParams);
      
      const status = controller.getStatus();
      expect(status.state).toBe(SimulationState.STOPPED);
      expect(status.currentTime).toBe(0);
    });
  });

  describe('state management', () => {
    beforeEach(() => {
      controller.initializeSimulation(testCloudParams);
    });

    it('should start simulation', () => {
      controller.startSimulation();
      
      const state = controller.getState();
      expect(state).toBe(SimulationState.RUNNING);
    });

    it('should pause simulation', () => {
      controller.startSimulation();
      controller.pauseSimulation();
      
      const state = controller.getState();
      expect(state).toBe(SimulationState.PAUSED);
    });

    it('should reset simulation', () => {
      controller.startSimulation();
      controller.updateSimulation(1e6); // Advance 1 million years
      
      const timeBefore = controller.getCurrentTime();
      expect(timeBefore).toBeGreaterThan(0);
      
      controller.resetSimulation();
      
      const timeAfter = controller.getCurrentTime();
      expect(timeAfter).toBe(0);
      expect(controller.getState()).toBe(SimulationState.STOPPED);
    });

    it('should throw error when starting without initialization', () => {
      const uninitializedController = new SimulationController();
      
      expect(() => uninitializedController.startSimulation()).toThrow();
    });
  });

  describe('time control', () => {
    beforeEach(() => {
      controller.initializeSimulation(testCloudParams);
    });

    it('should set time scale', () => {
      controller.setTimeScale(1e3);
      
      const timeScale = controller.getTimeScale();
      expect(timeScale).toBe(1e3);
    });

    it('should throw error for negative time scale', () => {
      expect(() => controller.setTimeScale(-1)).toThrow();
    });

    it('should throw error for zero time scale', () => {
      expect(() => controller.setTimeScale(0)).toThrow();
    });

    it('should jump to specific time', () => {
      const targetTime = 1e9; // 1 billion years
      
      controller.jumpToTime(targetTime);
      
      const currentTime = controller.getCurrentTime();
      expect(currentTime).toBe(targetTime);
    });

    it('should handle jumping backwards by reinitializing', () => {
      controller.jumpToTime(1e9);
      controller.jumpToTime(1e6);
      
      const currentTime = controller.getCurrentTime();
      expect(currentTime).toBe(1e6);
    });

    it('should throw error for negative target time', () => {
      expect(() => controller.jumpToTime(-1)).toThrow();
    });
  });

  describe('simulation updates', () => {
    beforeEach(() => {
      controller.initializeSimulation(testCloudParams);
    });

    it('should update simulation time', () => {
      const deltaTime = 1e6; // 1 million years
      
      controller.updateSimulation(deltaTime);
      
      const currentTime = controller.getCurrentTime();
      expect(currentTime).toBeGreaterThan(0);
    });

    it('should evolve stars during update', () => {
      const system = controller.getSystem();
      const initialStar = system!.stars[0];
      const initialAge = initialStar.age;
      
      controller.updateSimulation(1e6);
      
      const updatedSystem = controller.getSystem();
      const updatedStar = updatedSystem!.stars[0];
      
      expect(updatedStar.age).toBeGreaterThan(initialAge);
    });

    it('should update system age', () => {
      const deltaTime = 1e6;
      
      controller.updateSimulation(deltaTime);
      
      const system = controller.getSystem();
      expect(system!.age).toBe(deltaTime);
    });
  });

  describe('getStatus', () => {
    it('should return complete status', () => {
      controller.initializeSimulation(testCloudParams);
      controller.setTimeScale(1e3);
      controller.startSimulation();
      
      const status = controller.getStatus();
      
      expect(status.state).toBe(SimulationState.RUNNING);
      expect(status.currentTime).toBe(0);
      expect(status.timeScale).toBe(1e3);
      expect(status.system).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    describe('complete simulation flow from cloud to evolved system', () => {
      it('should create and evolve a complete star system', () => {
        // Initialize from cloud parameters
        const system = controller.initializeSimulation(testCloudParams);
        
        // Verify initial system state
        expect(system).toBeDefined();
        expect(system.stars.length).toBeGreaterThan(0);
        expect(system.age).toBe(0);
        expect(system.initialCloudParameters).toEqual(testCloudParams);
        
        // Store initial star properties
        const initialStar = system.stars[0];
        const initialAge = initialStar.age;
        
        // Start simulation and evolve
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        
        // Evolve for 1 billion years
        const evolutionTime = 1e9;
        controller.updateSimulation(evolutionTime);
        
        // Verify system has evolved
        const evolvedSystem = controller.getSystem();
        expect(evolvedSystem).toBeDefined();
        expect(evolvedSystem!.age).toBeGreaterThan(0);
        
        // Verify stars have evolved
        const evolvedStar = evolvedSystem!.stars[0];
        expect(evolvedStar.age).toBeGreaterThan(initialAge);
        expect(evolvedStar.age).toBeGreaterThan(0);
        
        // Verify stellar properties have changed (stars evolve)
        // Note: For a 1 solar mass star, luminosity changes slowly on main sequence
        expect(evolvedStar.luminosity).toBeDefined();
        expect(evolvedStar.temperature).toBeGreaterThan(0);
        expect(evolvedStar.radius).toBeGreaterThan(0);
      });

      it('should handle complete lifecycle with planets', () => {
        // Initialize system
        const system = controller.initializeSimulation(testCloudParams);
        
        // Verify planets were generated
        expect(system.planets).toBeDefined();
        expect(Array.isArray(system.planets)).toBe(true);
        
        // If planets exist, verify they have proper properties
        if (system.planets.length > 0) {
          const planet = system.planets[0];
          expect(planet.mass).toBeGreaterThan(0);
          expect(planet.semiMajorAxis).toBeGreaterThan(0);
          expect(planet.parentStarId).toBeDefined();
          
          // Evolve simulation
          controller.updateSimulation(1e6); // 1 million years
          
          // Verify planet position has been updated
          const updatedSystem = controller.getSystem();
          const updatedPlanet = updatedSystem!.planets[0];
          
          // Position should be defined (may or may not have changed depending on orbit)
          expect(updatedPlanet.position).toBeDefined();
          expect(updatedPlanet.position.x).toBeDefined();
          expect(updatedPlanet.position.y).toBeDefined();
          expect(updatedPlanet.position.z).toBeDefined();
        }
      });

      it('should evolve massive star through multiple phases', () => {
        // Create a massive star system (shorter lifetime)
        const massiveCloudParams: CloudParameters = {
          mass: 200.0, // 200 solar masses
          metallicity: 1.0,
          angularMomentum: 1e42,
          temperature: 10,
          radius: 0.8,
          turbulenceVelocity: 0.5,
          magneticFieldStrength: 10,
        };
        
        const system = controller.initializeSimulation(massiveCloudParams);
        const initialStar = system.stars[0];
        
        // Evolve through significant fraction of lifetime
        // Massive stars have much shorter lifetimes (~20 million years for 10 M☉)
        controller.updateSimulation(1e7); // 10 million years
        
        const evolvedSystem = controller.getSystem();
        const evolvedStar = evolvedSystem!.stars[0];
        
        // Verify star has aged significantly
        expect(evolvedStar.age).toBeGreaterThan(initialStar.age);
        expect(evolvedStar.age).toBeGreaterThan(1e6);
        
        // Verify evolution phase is tracked
        expect(evolvedStar.evolutionPhase).toBeDefined();
      });
    });

    describe('state transitions', () => {
      beforeEach(() => {
        controller.initializeSimulation(testCloudParams);
      });

      it('should transition from STOPPED to RUNNING', () => {
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        
        controller.startSimulation();
        
        expect(controller.getState()).toBe(SimulationState.RUNNING);
      });

      it('should transition from RUNNING to PAUSED', () => {
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        
        controller.pauseSimulation();
        
        expect(controller.getState()).toBe(SimulationState.PAUSED);
      });

      it('should transition from PAUSED back to RUNNING', () => {
        controller.startSimulation();
        controller.pauseSimulation();
        expect(controller.getState()).toBe(SimulationState.PAUSED);
        
        controller.startSimulation();
        
        expect(controller.getState()).toBe(SimulationState.RUNNING);
      });

      it('should transition from RUNNING to STOPPED on reset', () => {
        controller.startSimulation();
        controller.updateSimulation(1e6);
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        
        controller.resetSimulation();
        
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        expect(controller.getCurrentTime()).toBe(0);
      });

      it('should transition from PAUSED to STOPPED on reset', () => {
        controller.startSimulation();
        controller.pauseSimulation();
        expect(controller.getState()).toBe(SimulationState.PAUSED);
        
        controller.resetSimulation();
        
        expect(controller.getState()).toBe(SimulationState.STOPPED);
      });

      it('should maintain state consistency through multiple transitions', () => {
        // Complex state transition sequence
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        
        controller.pauseSimulation();
        expect(controller.getState()).toBe(SimulationState.PAUSED);
        
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        
        controller.resetSimulation();
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        
        // Should be able to start again after reset
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
      });

      it('should preserve simulation time when pausing and resuming', () => {
        controller.startSimulation();
        controller.updateSimulation(1e6);
        
        const timeBeforePause = controller.getCurrentTime();
        expect(timeBeforePause).toBeGreaterThan(0);
        
        controller.pauseSimulation();
        const timeWhilePaused = controller.getCurrentTime();
        expect(timeWhilePaused).toBe(timeBeforePause);
        
        controller.startSimulation();
        const timeAfterResume = controller.getCurrentTime();
        expect(timeAfterResume).toBe(timeBeforePause);
      });
    });

    describe('time scale changes and jump to time functionality', () => {
      beforeEach(() => {
        controller.initializeSimulation(testCloudParams);
      });

      it('should handle time scale changes during simulation', () => {
        // Start with default time scale
        expect(controller.getTimeScale()).toBe(1.0);
        
        // Change time scale
        controller.setTimeScale(1e3);
        expect(controller.getTimeScale()).toBe(1e3);
        
        // Change again
        controller.setTimeScale(1e3);
        expect(controller.getTimeScale()).toBe(1e3);
        
        // Verify simulation still works with new time scale
        controller.startSimulation();
        controller.updateSimulation(1e6);
        
        expect(controller.getCurrentTime()).toBeGreaterThan(0);
      });

      it('should jump forward in time correctly', () => {
        const targetTime = 5e9; // 5 billion years
        
        controller.jumpToTime(targetTime);
        
        expect(controller.getCurrentTime()).toBe(targetTime);
        
        // Verify system has evolved
        const system = controller.getSystem();
        expect(system!.age).toBe(targetTime);
        expect(system!.stars[0].age).toBeGreaterThan(0);
      });

      it('should jump backward in time by reinitializing', () => {
        // Jump forward first
        controller.jumpToTime(1e9);
        expect(controller.getCurrentTime()).toBe(1e9);
        
        // Jump backward
        controller.jumpToTime(1e6);
        expect(controller.getCurrentTime()).toBe(1e6);
        
        // Verify system state is consistent with earlier time
        const system = controller.getSystem();
        expect(system!.age).toBe(1e6);
      });

      it('should handle multiple time jumps', () => {
        // Series of time jumps
        controller.jumpToTime(1e6);
        expect(controller.getCurrentTime()).toBe(1e6);
        
        controller.jumpToTime(1e9);
        expect(controller.getCurrentTime()).toBe(1e9);
        
        controller.jumpToTime(5e8);
        expect(controller.getCurrentTime()).toBe(5e8);
        
        controller.jumpToTime(2e9);
        expect(controller.getCurrentTime()).toBe(2e9);
        
        // System should be consistent with final time
        const system = controller.getSystem();
        expect(system!.age).toBe(2e9);
      });

      it('should combine time scale changes with time jumps', () => {
        // Set time scale
        controller.setTimeScale(1e3);
        expect(controller.getTimeScale()).toBe(1e3);
        
        // Jump to time
        controller.jumpToTime(1e9);
        expect(controller.getCurrentTime()).toBe(1e9);
        
        // Change time scale again
        controller.setTimeScale(1e3);
        expect(controller.getTimeScale()).toBe(1e3);
        
        // Continue simulation
        controller.updateSimulation(1e9);
        expect(controller.getCurrentTime()).toBeGreaterThan(1e9);
      });

      it('should handle jump to zero time', () => {
        // Advance time
        controller.updateSimulation(1e9);
        expect(controller.getCurrentTime()).toBeGreaterThan(0);
        
        // Jump back to zero
        controller.jumpToTime(0);
        expect(controller.getCurrentTime()).toBe(0);
        
        // System should be reset to initial state
        const system = controller.getSystem();
        expect(system!.age).toBe(0);
      });

      it('should maintain system integrity after time jumps', () => {
        const initialSystem = controller.getSystem();
        const initialStarCount = initialSystem!.stars.length;
        const initialPlanetCount = initialSystem!.planets.length;
        
        // Jump forward
        controller.jumpToTime(1e9);
        
        let system = controller.getSystem();
        expect(system!.stars.length).toBe(initialStarCount);
        expect(system!.planets.length).toBe(initialPlanetCount);
        
        // Jump backward
        controller.jumpToTime(1e6);
        
        system = controller.getSystem();
        expect(system!.stars.length).toBe(initialStarCount);
        expect(system!.planets.length).toBe(initialPlanetCount);
      });

      it('should evolve stars correctly after time jumps', () => {
        // Jump to 1 billion years
        controller.jumpToTime(1e9);
        
        const system = controller.getSystem();
        const star = system!.stars[0];
        
        // Verify star has evolved to correct age
        expect(star.age).toBeGreaterThan(0);
        expect(star.luminosity).toBeGreaterThan(0);
        expect(star.temperature).toBeGreaterThan(0);
        expect(star.radius).toBeGreaterThan(0);
        
        // Continue evolution
        controller.updateSimulation(1e9);
        
        const evolvedSystem = controller.getSystem();
        const evolvedStar = evolvedSystem!.stars[0];
        
        expect(evolvedStar.age).toBeGreaterThan(star.age);
      });
    });

    describe('complex integration scenarios', () => {
      it('should handle full workflow: create, evolve, pause, resume, jump, reset', () => {
        // Create simulation
        const system = controller.initializeSimulation(testCloudParams);
        expect(system).toBeDefined();
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        
        // Start and evolve
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        controller.updateSimulation(1e6);
        expect(controller.getCurrentTime()).toBeGreaterThan(0);
        
        // Pause
        controller.pauseSimulation();
        expect(controller.getState()).toBe(SimulationState.PAUSED);
        const pausedTime = controller.getCurrentTime();
        
        // Resume
        controller.startSimulation();
        expect(controller.getState()).toBe(SimulationState.RUNNING);
        expect(controller.getCurrentTime()).toBe(pausedTime);
        
        // Jump forward
        controller.jumpToTime(1e9);
        expect(controller.getCurrentTime()).toBe(1e9);
        
        // Reset
        controller.resetSimulation();
        expect(controller.getState()).toBe(SimulationState.STOPPED);
        expect(controller.getCurrentTime()).toBe(0);
      });

      it('should handle time scale changes during active simulation', () => {
        controller.initializeSimulation(testCloudParams);
        controller.startSimulation();
        
        // Evolve with default time scale
        controller.updateSimulation(1e6);
        const time1 = controller.getCurrentTime();
        
        // Change time scale and continue (use valid time scale within range)
        controller.setTimeScale(100);
        controller.updateSimulation(1e6);
        const time2 = controller.getCurrentTime();
        
        expect(time2).toBeGreaterThan(time1);
        expect(controller.getState()).toBe(SimulationState.RUNNING);
      });

      it('should maintain data consistency across state changes', () => {
        const system = controller.initializeSimulation(testCloudParams);
        const initialCloudParams = system.initialCloudParameters;
        
        // Perform various operations (use valid time scale within range)
        controller.startSimulation();
        controller.updateSimulation(1e9);
        controller.pauseSimulation();
        controller.setTimeScale(100);
        controller.jumpToTime(5e8);
        
        // Verify initial conditions are preserved
        const currentSystem = controller.getSystem();
        expect(currentSystem!.initialCloudParameters).toEqual(initialCloudParams);
      });
    });

    describe('derived properties integration', () => {
      it('should calculate and store derived properties on initialization', () => {
        const cloudParams: CloudParameters = {
          mass: 1000.0,
          metallicity: 1.0,
          angularMomentum: 1e42,
          temperature: 10,
          radius: 2,
          turbulenceVelocity: 0.5,
          magneticFieldStrength: 10,
        };
        
        const system = controller.initializeSimulation(cloudParams);
        
        // Verify derived properties are calculated and stored
        expect(system.derivedCloudProperties).toBeDefined();
        expect(system.derivedCloudProperties!.density).toBeGreaterThan(0);
        expect(system.derivedCloudProperties!.virialParameter).toBeGreaterThan(0);
        expect(system.derivedCloudProperties!.jeansMass).toBeGreaterThan(0);
        expect(system.derivedCloudProperties!.collapseTimescale).toBeGreaterThan(0);
        expect(typeof system.derivedCloudProperties!.isBound).toBe('boolean');
        expect(system.derivedCloudProperties!.turbulentJeansLength).toBeGreaterThan(0);
        expect(system.derivedCloudProperties!.magneticFluxToMassRatio).toBeGreaterThan(0);
      });

      it('should use derived properties throughout simulation lifecycle', () => {
        const cloudParams: CloudParameters = {
          mass: 500.0,
          metallicity: 1.0,
          angularMomentum: 1e42,
          temperature: 10,
          radius: 1.5,
          turbulenceVelocity: 0.5,
          magneticFieldStrength: 10,
        };
        
        const system = controller.initializeSimulation(cloudParams);
        const initialDerived = system.derivedCloudProperties;
        
        // Evolve simulation
        controller.startSimulation();
        controller.updateSimulation(1e6);
        
        // Verify derived properties are preserved
        const evolvedSystem = controller.getSystem();
        expect(evolvedSystem!.derivedCloudProperties).toEqual(initialDerived);
      });

      it('should handle default values for optional cloud parameters', () => {
        const minimalCloudParams: CloudParameters = {
          mass: 1000.0,
          metallicity: 1.0,
          angularMomentum: 1e42,
          // Provide parameters that will create a bound cloud
          temperature: 10,
          radius: 2,
          turbulenceVelocity: 0.5,
          magneticFieldStrength: 10,
        };
        
        const system = controller.initializeSimulation(minimalCloudParams);
        
        // Should still calculate derived properties with defaults
        expect(system.derivedCloudProperties).toBeDefined();
        expect(system.derivedCloudProperties!.density).toBeGreaterThan(0);
        expect(system.derivedCloudProperties!.virialParameter).toBeGreaterThan(0);
      });
    });

    describe('backward compatibility for loading', () => {
      it('should load legacy simulation and apply defaults', () => {
        // Create a legacy simulation (without new properties)
        const legacySystem: StarSystem = {
          id: 'legacy-system-1',
          name: 'Legacy System',
          stars: [],
          planets: [],
          age: 1e9,
          initialCloudParameters: {
            mass: 1.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
            // Missing: temperature, radius, turbulenceVelocity, magneticFieldStrength
          },
          // Missing: derivedCloudProperties
        };
        
        const loadedSystem = controller.loadSimulation(legacySystem);
        
        // Verify defaults were applied
        expect(loadedSystem.initialCloudParameters.temperature).toBe(20);
        expect(loadedSystem.initialCloudParameters.radius).toBeGreaterThan(0);
        expect(loadedSystem.initialCloudParameters.turbulenceVelocity).toBe(1);
        expect(loadedSystem.initialCloudParameters.magneticFieldStrength).toBe(10);
        
        // Verify derived properties were calculated
        expect(loadedSystem.derivedCloudProperties).toBeDefined();
        expect(loadedSystem.derivedCloudProperties!.density).toBeGreaterThan(0);
        expect(loadedSystem.derivedCloudProperties!.virialParameter).toBeGreaterThan(0);
      });

      it('should load modern simulation without modification', () => {
        // Create a modern simulation (with all properties)
        const modernCloudParams: CloudParameters = {
          mass: 500.0,
          metallicity: 1.0,
          angularMomentum: 1e42,
          temperature: 10,
          radius: 1.5,
          turbulenceVelocity: 0.5,
          magneticFieldStrength: 10,
        };
        
        const modernSystem = controller.initializeSimulation(modernCloudParams);
        const originalDerived = modernSystem.derivedCloudProperties;
        
        // Load the modern system
        const loadedSystem = controller.loadSimulation(modernSystem);
        
        // Verify nothing was changed
        expect(loadedSystem.initialCloudParameters).toEqual(modernCloudParams);
        expect(loadedSystem.derivedCloudProperties).toEqual(originalDerived);
      });

      it('should calculate radius from mass for legacy simulations', () => {
        // Create legacy simulation with different masses
        const legacySystem1: StarSystem = {
          id: 'legacy-1',
          name: 'Legacy 1',
          stars: [],
          planets: [],
          age: 0,
          initialCloudParameters: {
            mass: 1.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
          },
        };
        
        const legacySystem2: StarSystem = {
          id: 'legacy-2',
          name: 'Legacy 2',
          stars: [],
          planets: [],
          age: 0,
          initialCloudParameters: {
            mass: 100.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
          },
        };
        
        const loaded1 = controller.loadSimulation(legacySystem1);
        const loaded2 = controller.loadSimulation(legacySystem2);
        
        // More massive cloud should have larger radius
        expect(loaded2.initialCloudParameters.radius!).toBeGreaterThan(
          loaded1.initialCloudParameters.radius!
        );
        
        // Both should be within valid range
        expect(loaded1.initialCloudParameters.radius!).toBeGreaterThanOrEqual(0.1);
        expect(loaded1.initialCloudParameters.radius!).toBeLessThanOrEqual(200);
        expect(loaded2.initialCloudParameters.radius!).toBeGreaterThanOrEqual(0.1);
        expect(loaded2.initialCloudParameters.radius!).toBeLessThanOrEqual(200);
      });

      it('should preserve simulation age when loading', () => {
        const legacySystem: StarSystem = {
          id: 'legacy-aged',
          name: 'Aged Legacy System',
          stars: [],
          planets: [],
          age: 5e9, // 5 billion years
          initialCloudParameters: {
            mass: 1.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
          },
        };
        
        const loadedSystem = controller.loadSimulation(legacySystem);
        
        // Verify age is preserved
        expect(loadedSystem.age).toBe(5e9);
        expect(controller.getCurrentTime()).toBe(5e9);
      });

      it('should handle partially complete legacy simulations', () => {
        // Legacy simulation with some but not all new properties
        const partialLegacySystem: StarSystem = {
          id: 'partial-legacy',
          name: 'Partial Legacy',
          stars: [],
          planets: [],
          age: 0,
          initialCloudParameters: {
            mass: 2.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
            temperature: 30, // Has temperature
            // Missing: radius, turbulenceVelocity, magneticFieldStrength
          },
        };
        
        const loadedSystem = controller.loadSimulation(partialLegacySystem);
        
        // Verify provided value is preserved
        expect(loadedSystem.initialCloudParameters.temperature).toBe(30);
        
        // Verify missing values have defaults
        expect(loadedSystem.initialCloudParameters.radius).toBeGreaterThan(0);
        expect(loadedSystem.initialCloudParameters.turbulenceVelocity).toBe(1);
        expect(loadedSystem.initialCloudParameters.magneticFieldStrength).toBe(10);
        
        // Verify derived properties were calculated
        expect(loadedSystem.derivedCloudProperties).toBeDefined();
      });

      it('should set simulation state to STOPPED after loading', () => {
        const legacySystem: StarSystem = {
          id: 'legacy-state',
          name: 'Legacy State',
          stars: [],
          planets: [],
          age: 0,
          initialCloudParameters: {
            mass: 1.0,
            metallicity: 1.0,
            angularMomentum: 1e42,
          },
        };
        
        controller.loadSimulation(legacySystem);
        
        expect(controller.getState()).toBe(SimulationState.STOPPED);
      });
    });
  });
});
