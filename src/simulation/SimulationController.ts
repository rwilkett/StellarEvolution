/**
 * Simulation Controller
 * Manages simulation state and coordinates between modules
 */

import {
  CloudParameters,
  StarSystem,
  SimulationState,
  SimulationStatus,
  Star,
  Planet,
} from '../types/core';
import { generateStarSystemFromCloud } from './cloudFormation';
import { evolveStar } from './stellarEvolution';
import { createProtoplanetaryDisk, generatePlanets } from './planetaryFormation';
import { calculateOrbitalPosition, calculateOrbitalPeriod } from '../physics/orbitalMechanics';
import {
  validateCloudParameters,
  validateTimeScale,
  validateSimulationTime,
  SimulationError,
  SimulationErrorType,
  errorLogger,
  checkSystemStability,
  checkNumericalStability,
} from '../validation';

/**
 * SimulationController class
 * Manages the complete simulation lifecycle including state management,
 * time evolution, and coordination between all simulation modules
 */
export class SimulationController {
  private system: StarSystem | null = null;
  private state: SimulationState = SimulationState.STOPPED;
  private currentTime: number = 0;
  private timeScale: number = 1.0;
  private animationFrameId: number | null = null;

  /**
   * Initialize a new simulation from cloud parameters
   * Creates a star system and generates planets for each star
   * @param cloudParams - Initial cloud parameters
   * @returns The generated star system
   * @throws SimulationError if parameters are invalid or system is unstable
   */
  public initializeSimulation(cloudParams: CloudParameters): StarSystem {
    // Validate input parameters
    const validation = validateCloudParameters(cloudParams);
    if (!validation.isValid) {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        `Invalid cloud parameters: ${validation.errors.join(', ')}`,
        { errors: validation.errors, params: cloudParams },
        false // Not recoverable
      );
      errorLogger.logError(error);
      throw error;
    }

    try {
      // Generate star system from cloud collapse
      this.system = generateStarSystemFromCloud(cloudParams);
      
      // Check system stability
      const isStable = checkSystemStability(this.system);
      if (!isStable) {
        // Log warning but continue - system may be dynamically unstable but still simulatable
        errorLogger.logError(
          new SimulationError(
            SimulationErrorType.UNSTABLE_SYSTEM,
            'Generated star system may be dynamically unstable',
            { systemId: this.system.id, numStars: this.system.stars.length },
            true // Recoverable
          )
        );
      }
      
      // Generate planets for each star
      const allPlanets: Planet[] = [];
      
      for (const star of this.system.stars) {
        try {
          // Create protoplanetary disk
          const disk = createProtoplanetaryDisk(star);
          
          if (disk) {
            // Generate planets from disk
            const planets = generatePlanets(disk, star);
            allPlanets.push(...planets);
          }
        } catch (error) {
          // Log error but continue with other stars
          errorLogger.logError(
            new SimulationError(
              SimulationErrorType.NUMERICAL_INSTABILITY,
              `Failed to generate planets for star ${star.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              { starId: star.id, starName: star.name },
              true // Recoverable
            )
          );
        }
      }
      
      // Add planets to system
      this.system.planets = allPlanets;
      
      // Reset simulation state
      this.currentTime = 0;
      this.state = SimulationState.STOPPED;
      
      return this.system;
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      const simError = new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        `Failed to initialize simulation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error },
        false
      );
      errorLogger.logError(simError);
      throw simError;
    }
  }

  /**
   * Start the simulation
   * Begins time evolution and updates
   */
  public startSimulation(): void {
    if (!this.system) {
      throw new Error('No simulation initialized. Call initializeSimulation first.');
    }
    
    if (this.state === SimulationState.RUNNING) {
      return; // Already running
    }
    
    this.state = SimulationState.RUNNING;
  }

  /**
   * Pause the simulation
   * Stops time evolution but maintains current state
   */
  public pauseSimulation(): void {
    if (this.state !== SimulationState.RUNNING) {
      return;
    }
    
    this.state = SimulationState.PAUSED;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset the simulation to initial conditions
   * Resets time to zero and restores initial star system state
   */
  public resetSimulation(): void {
    if (!this.system) {
      return;
    }
    
    // Stop the simulation
    this.state = SimulationState.STOPPED;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset time
    this.currentTime = 0;
    
    // Reinitialize the system from original cloud parameters
    const originalParams = this.system.initialCloudParameters;
    this.initializeSimulation(originalParams);
  }

  /**
   * Set the time scale multiplier
   * Controls how fast simulation time advances relative to real time
   * @param scale - Time scale multiplier (e.g., 1e6 = 1 million years per second)
   * @throws SimulationError if time scale is invalid
   */
  public setTimeScale(scale: number): void {
    const validation = validateTimeScale(scale);
    if (!validation.isValid) {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        `Invalid time scale: ${validation.errors.join(', ')}`,
        { errors: validation.errors, scale },
        false
      );
      errorLogger.logError(error);
      throw error;
    }
    
    this.timeScale = scale;
  }

  /**
   * Jump to a specific time in the simulation
   * Advances or rewinds the simulation to the specified time
   * @param targetTime - Target time in years
   * @throws SimulationError if target time is invalid or no simulation is initialized
   */
  public jumpToTime(targetTime: number): void {
    if (!this.system) {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        'No simulation initialized',
        {},
        false
      );
      errorLogger.logError(error);
      throw error;
    }
    
    const validation = validateSimulationTime(targetTime);
    if (!validation.isValid) {
      const error = new SimulationError(
        SimulationErrorType.INVALID_PARAMETERS,
        `Invalid target time: ${validation.errors.join(', ')}`,
        { errors: validation.errors, targetTime },
        false
      );
      errorLogger.logError(error);
      throw error;
    }
    
    // Calculate time delta
    const deltaTime = targetTime - this.currentTime;
    
    if (deltaTime === 0) {
      return; // Already at target time
    }
    
    try {
      if (deltaTime < 0) {
        // Going backwards - need to reinitialize and evolve forward
        const originalParams = this.system.initialCloudParameters;
        this.initializeSimulation(originalParams);
        
        if (targetTime > 0) {
          this.updateSimulation(targetTime);
        }
      } else {
        // Going forward - just evolve
        this.updateSimulation(deltaTime);
      }
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      
      const simError = new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        `Failed to jump to time ${targetTime}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { targetTime, currentTime: this.currentTime, originalError: error },
        true
      );
      errorLogger.logError(simError);
      throw simError;
    }
  }

  /**
   * Get current simulation status
   * @returns Current simulation status including state, time, and system
   */
  public getStatus(): SimulationStatus {
    return {
      state: this.state,
      currentTime: this.currentTime,
      timeScale: this.timeScale,
      system: this.system,
    };
  }

  /**
   * Get current star system
   * @returns Current star system or null if not initialized
   */
  public getSystem(): StarSystem | null {
    return this.system;
  }

  /**
   * Get current simulation time
   * @returns Current time in years
   */
  public getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Get current simulation state
   * @returns Current simulation state (STOPPED, RUNNING, PAUSED)
   */
  public getState(): SimulationState {
    return this.state;
  }

  /**
   * Get current time scale
   * @returns Current time scale multiplier
   */
  public getTimeScale(): number {
    return this.timeScale;
  }

  /**
   * Update simulation by a time delta
   * Advances all stars, updates orbital positions, and evolves planets
   * @param deltaTime - Time step in years
   */
  public updateSimulation(deltaTime: number): void {
    if (!this.system) {
      return;
    }
    
    try {
      // Check for numerical stability of delta time
      checkNumericalStability(deltaTime, 'deltaTime');
      
      if (deltaTime < 0) {
        const error = new SimulationError(
          SimulationErrorType.INVALID_PARAMETERS,
          'Delta time must be non-negative',
          { deltaTime },
          false
        );
        errorLogger.logError(error);
        throw error;
      }
      
      // Use adaptive time stepping based on evolution phase
      const adaptiveDeltaTime = this.calculateAdaptiveTimeStep(deltaTime);
      
      // Update current time
      this.currentTime += adaptiveDeltaTime;
      this.system.age = this.currentTime;
      
      // Check for numerical stability of current time
      checkNumericalStability(this.currentTime, 'currentTime');
      
      // Evolve all stars
      this.system.stars = this.system.stars.map(star => {
        try {
          return this.evolveStarWithOrbitalUpdate(star, adaptiveDeltaTime);
        } catch (error) {
          // Log error but keep original star state
          errorLogger.logError(
            new SimulationError(
              SimulationErrorType.NUMERICAL_INSTABILITY,
              `Failed to evolve star ${star.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              { starId: star.id, starName: star.name, deltaTime: adaptiveDeltaTime },
              true
            )
          );
          return star; // Return unchanged star
        }
      });
      
      // Update planetary positions
      this.system.planets = this.system.planets.map(planet => {
        try {
          return this.updatePlanetPosition(planet, this.currentTime);
        } catch (error) {
          // Log error but keep original planet state
          errorLogger.logError(
            new SimulationError(
              SimulationErrorType.NUMERICAL_INSTABILITY,
              `Failed to update planet ${planet.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              { planetId: planet.id, planetName: planet.name },
              true
            )
          );
          return planet; // Return unchanged planet
        }
      });
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      
      const simError = new SimulationError(
        SimulationErrorType.NUMERICAL_INSTABILITY,
        `Simulation update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { deltaTime, currentTime: this.currentTime, originalError: error },
        true
      );
      errorLogger.logError(simError);
      throw simError;
    }
  }

  /**
   * Calculate adaptive time step based on evolution phase
   * Faster evolution during main sequence, slower during rapid changes
   * @param requestedDeltaTime - Requested time step in years
   * @returns Adjusted time step in years
   */
  private calculateAdaptiveTimeStep(requestedDeltaTime: number): number {
    if (!this.system || this.system.stars.length === 0) {
      return requestedDeltaTime;
    }
    
    // Find the star with the shortest remaining lifetime fraction
    let minTimeScale = 1.0;
    
    for (const star of this.system.stars) {
      const ageRatio = star.age / star.lifetime;
      
      // Slow down near phase transitions
      if (ageRatio > 0.85 && ageRatio < 0.95) {
        // Approaching post-main sequence
        minTimeScale = Math.min(minTimeScale, 0.1);
      } else if (ageRatio > 0.95 && ageRatio < 1.05) {
        // During rapid evolution phases
        minTimeScale = Math.min(minTimeScale, 0.01);
      }
    }
    
    return requestedDeltaTime * minTimeScale;
  }

  /**
   * Evolve a star and update its orbital position
   * @param star - Star to evolve
   * @param deltaTime - Time step in years
   * @returns Updated star
   */
  private evolveStarWithOrbitalUpdate(star: Star, deltaTime: number): Star {
    // Evolve stellar properties
    const evolvedStar = evolveStar(star, deltaTime);
    
    // Update orbital position for binary/multiple systems
    // For now, keep position unchanged (will be enhanced in future)
    // In a real implementation, we would track orbital parameters
    // and update positions based on Kepler's laws
    
    return evolvedStar;
  }

  /**
   * Update planet position based on current simulation time
   * @param planet - Planet to update
   * @param currentTime - Current simulation time in years
   * @returns Updated planet
   */
  private updatePlanetPosition(planet: Planet, currentTime: number): Planet {
    // Find the parent star
    const parentStar = this.system?.stars.find(s => s.id === planet.parentStarId);
    
    if (!parentStar) {
      return planet; // Parent star not found, keep current position
    }
    
    // Calculate orbital period
    const period = calculateOrbitalPeriod(planet.semiMajorAxis, parentStar.mass);
    
    // Create orbital parameters from planet properties
    const orbitalParams = {
      semiMajorAxis: planet.semiMajorAxis,
      eccentricity: planet.eccentricity,
      inclination: 0, // Assume coplanar for simplicity
      longitudeOfAscendingNode: 0,
      argumentOfPeriapsis: 0,
      meanAnomalyAtEpoch: 0,
    };
    
    // Calculate new position
    const newPosition = calculateOrbitalPosition(orbitalParams, currentTime, period);
    
    // Offset by parent star position
    const finalPosition = {
      x: newPosition.x + parentStar.position.x,
      y: newPosition.y + parentStar.position.y,
      z: newPosition.z + parentStar.position.z,
    };
    
    return {
      ...planet,
      position: finalPosition,
    };
  }
}
