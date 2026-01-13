/**
 * Internal Structure Physics Module
 * Calculates stellar internal structure including composition, temperature, pressure, and nuclear reactions
 */

import {
  InternalStructure,
  CoreComposition,
  ActiveReactions,
  ShellBurning,
  LayerStructure,
  NuclearReaction,
  EvolutionPhase,
} from '../types/core';
import { PHYSICS_CONSTANTS } from '../constants/physics';

/**
 * Calculate initial core composition for a newly formed star
 * @param metallicity - Metallicity relative to solar (Z☉)
 * @returns Initial core composition
 */
export function calculateInitialCoreComposition(metallicity: number): CoreComposition {
  // Initial composition is primarily hydrogen with some helium and trace metals
  const metals = metallicity * 0.02; // Metals (everything heavier than He)
  const helium = 0.25; // Primordial helium abundance (~25%)
  const hydrogen = 1.0 - helium - metals;
  
  return {
    hydrogen: Math.max(0, hydrogen),
    helium,
    carbon: metals * 0.3,
    oxygen: metals * 0.5,
    neon: metals * 0.1,
    magnesium: metals * 0.05,
    silicon: metals * 0.04,
    iron: metals * 0.01,
  };
}

/**
 * Calculate core temperature based on mass and evolutionary phase
 * @param mass - Stellar mass in solar masses
 * @param phase - Current evolution phase
 * @param ageRatio - Age relative to main sequence lifetime (0-1+)
 * @returns Core temperature in Kelvin
 */
export function calculateCoreTemperature(
  mass: number,
  phase: EvolutionPhase,
  ageRatio: number
): number {
  // Base core temperature scales with mass
  const baseCoreTemp = 1.5e7 * Math.pow(mass, 0.5); // ~15 million K for Sun
  
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      // Heating up, not yet at main sequence temperature
      return baseCoreTemp * (0.5 + 0.5 * ageRatio / 0.01);
      
    case EvolutionPhase.MAIN_SEQUENCE:
      // Slowly increasing during main sequence
      return baseCoreTemp * (1.0 + 0.2 * ageRatio);
      
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Core contracts and heats up significantly
      return baseCoreTemp * (2.0 + ageRatio * 3.0);
      
    case EvolutionPhase.HORIZONTAL_BRANCH:
      // Helium burning core, very hot
      return baseCoreTemp * 5.0;
      
    case EvolutionPhase.PLANETARY_NEBULA:
      // Exposed hot core
      return baseCoreTemp * 10.0;
      
    case EvolutionPhase.WHITE_DWARF:
      // Cooling degenerate core
      return 1e7 * Math.exp(-ageRatio);
      
    case EvolutionPhase.NEUTRON_STAR:
      return 1e9; // Extremely hot
      
    case EvolutionPhase.BLACK_HOLE:
      return 0; // No temperature (event horizon)
      
    default:
      return baseCoreTemp;
  }
}

/**
 * Calculate core pressure based on mass and radius
 * @param mass - Stellar mass in solar masses
 * @param radius - Stellar radius in solar radii
 * @param phase - Current evolution phase
 * @returns Core pressure in Pascals
 */
export function calculateCorePressure(
  mass: number,
  radius: number,
  phase: EvolutionPhase
): number {
  // Approximate central pressure using virial theorem
  // P_c ≈ G M² / R⁴
  const massSI = mass * PHYSICS_CONSTANTS.SOLAR_MASS;
  const radiusSI = radius * PHYSICS_CONSTANTS.SOLAR_RADIUS;
  
  const basePressure = (PHYSICS_CONSTANTS.GRAVITATIONAL_CONSTANT * massSI * massSI) / 
                       Math.pow(radiusSI, 4);
  
  // Adjust for different phases
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      return basePressure * 0.5;
      
    case EvolutionPhase.MAIN_SEQUENCE:
      return basePressure;
      
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Core contracts, pressure increases dramatically
      return basePressure * 100;
      
    case EvolutionPhase.HORIZONTAL_BRANCH:
      return basePressure * 50;
      
    case EvolutionPhase.WHITE_DWARF:
      // Degenerate matter, extremely high pressure
      return basePressure * 1e6;
      
    case EvolutionPhase.NEUTRON_STAR:
      return basePressure * 1e12;
      
    default:
      return basePressure;
  }
}

/**
 * Determine which nuclear reactions are active based on core temperature and composition
 * @param coreTemp - Core temperature in Kelvin
 * @param composition - Core composition
 * @param phase - Current evolution phase
 * @param mass - Stellar mass in solar masses
 * @returns Active nuclear reactions
 */
export function determineActiveReactions(
  coreTemp: number,
  composition: CoreComposition,
  phase: EvolutionPhase,
  mass: number
): NuclearReaction {
  // Temperature thresholds for different reactions
  const T_PP = 4e6;       // PP chain starts
  const T_CNO = 1.5e7;    // CNO cycle dominates
  const T_He = 1e8;       // Helium burning (triple-alpha)
  const T_C = 6e8;        // Carbon burning
  const T_Ne = 1.2e9;     // Neon burning
  const T_O = 1.5e9;      // Oxygen burning
  const T_Si = 2.7e9;     // Silicon burning
  
  // Check phase and temperature
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      return NuclearReaction.NONE;
      
    case EvolutionPhase.MAIN_SEQUENCE:
      // Hydrogen burning in core
      if (composition.hydrogen > 0.01) {
        // Higher mass stars use CNO cycle, lower mass use PP chain
        if (mass > 1.5 && coreTemp >= T_CNO) {
          return NuclearReaction.CNO_CYCLE;
        } else if (coreTemp >= T_PP) {
          return NuclearReaction.PP_CHAIN;
        }
      }
      return NuclearReaction.NONE;
      
    case EvolutionPhase.RED_GIANT:
      // Core hydrogen depleted, may have helium burning if hot enough
      if (composition.helium > 0.1 && coreTemp >= T_He) {
        return NuclearReaction.TRIPLE_ALPHA;
      }
      return NuclearReaction.NONE; // Inert core
      
    case EvolutionPhase.HORIZONTAL_BRANCH:
      // Helium burning in core
      if (composition.helium > 0.01) {
        if (composition.carbon > 0.01 && coreTemp >= T_He) {
          return NuclearReaction.HELIUM_CARBON; // He + C → O
        }
        return NuclearReaction.TRIPLE_ALPHA;
      }
      return NuclearReaction.NONE;
      
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Alternating shell burning, core mostly inert or carbon burning
      if (mass > 8 && composition.carbon > 0.01 && coreTemp >= T_C) {
        return NuclearReaction.CARBON_BURNING;
      }
      return NuclearReaction.NONE;
      
    case EvolutionPhase.PLANETARY_NEBULA:
    case EvolutionPhase.WHITE_DWARF:
    case EvolutionPhase.NEUTRON_STAR:
    case EvolutionPhase.BLACK_HOLE:
      return NuclearReaction.NONE; // No active fusion
      
    default:
      return NuclearReaction.NONE;
  }
}

/**
 * Determine which shell burning is occurring
 * @param phase - Current evolution phase
 * @param mass - Stellar mass in solar masses
 * @param ageRatio - Age relative to main sequence lifetime
 * @returns Shell burning indicators
 */
export function determineShellBurning(
  phase: EvolutionPhase,
  mass: number,
  ageRatio: number
): ShellBurning {
  switch (phase) {
    case EvolutionPhase.RED_GIANT:
      // Hydrogen shell burning, inert helium core
      return {
        hydrogenShell: true,
        heliumShell: false,
        carbonShell: false,
      };
      
    case EvolutionPhase.HORIZONTAL_BRANCH:
      // Helium core burning, hydrogen shell burning
      return {
        hydrogenShell: true,
        heliumShell: false,
        carbonShell: false,
      };
      
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Both hydrogen and helium shell burning
      return {
        hydrogenShell: true,
        heliumShell: true,
        carbonShell: mass > 8,
      };
      
    default:
      return {
        hydrogenShell: false,
        heliumShell: false,
        carbonShell: false,
      };
  }
}

/**
 * Calculate layer structure (radii as fractions of total radius)
 * @param mass - Stellar mass in solar masses
 * @param phase - Current evolution phase
 * @param ageRatio - Age relative to main sequence lifetime
 * @returns Layer structure
 */
export function calculateLayerStructure(
  mass: number,
  phase: EvolutionPhase,
  ageRatio: number
): LayerStructure {
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      // Mostly convective
      return {
        coreRadius: 0.1,
        radiativeZoneRadius: 0.3,
        convectiveZoneRadius: 1.0,
      };
      
    case EvolutionPhase.MAIN_SEQUENCE:
      // Structure depends on mass
      if (mass < 0.5) {
        // Fully convective low-mass stars
        return {
          coreRadius: 0.2,
          radiativeZoneRadius: 0.2,
          convectiveZoneRadius: 1.0,
        };
      } else if (mass < 1.5) {
        // Sun-like: radiative core, convective envelope
        return {
          coreRadius: 0.25,
          radiativeZoneRadius: 0.7,
          convectiveZoneRadius: 1.0,
        };
      } else {
        // Massive: convective core, radiative envelope
        return {
          coreRadius: 0.3,
          radiativeZoneRadius: 1.0,
          convectiveZoneRadius: 0.3,
        };
      }
      
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      // Small inert core, large convective envelope
      return {
        coreRadius: 0.01 + ageRatio * 0.02,
        radiativeZoneRadius: 0.1,
        convectiveZoneRadius: 1.0,
      };
      
    case EvolutionPhase.HORIZONTAL_BRANCH:
      // Helium-burning core
      return {
        coreRadius: 0.15,
        radiativeZoneRadius: 0.6,
        convectiveZoneRadius: 1.0,
      };
      
    case EvolutionPhase.WHITE_DWARF:
      // Degenerate core (essentially all core)
      return {
        coreRadius: 0.99,
        radiativeZoneRadius: 1.0,
        convectiveZoneRadius: 1.0,
      };
      
    default:
      return {
        coreRadius: 0.25,
        radiativeZoneRadius: 0.7,
        convectiveZoneRadius: 1.0,
      };
  }
}

/**
 * Calculate energy production rate from nuclear reactions
 * @param reaction - Active nuclear reaction
 * @param mass - Stellar mass in solar masses
 * @param luminosity - Stellar luminosity in solar luminosities
 * @returns Energy production rate in solar luminosities
 */
export function calculateEnergyProductionRate(
  reaction: NuclearReaction,
  mass: number,
  luminosity: number
): number {
  // Most energy production comes from core reactions
  switch (reaction) {
    case NuclearReaction.PP_CHAIN:
    case NuclearReaction.CNO_CYCLE:
      // Main sequence hydrogen burning
      return luminosity * 0.99; // Almost all luminosity from core
      
    case NuclearReaction.TRIPLE_ALPHA:
    case NuclearReaction.HELIUM_CARBON:
      // Helium burning
      return luminosity * 0.8; // Shell burning contributes too
      
    case NuclearReaction.CARBON_BURNING:
    case NuclearReaction.NEON_BURNING:
    case NuclearReaction.OXYGEN_BURNING:
    case NuclearReaction.SILICON_BURNING:
      // Advanced burning stages
      return luminosity * 0.5;
      
    case NuclearReaction.NONE:
    default:
      return 0;
  }
}

/**
 * Evolve core composition over time
 * @param composition - Current core composition
 * @param coreReaction - Active nuclear reaction in core
 * @param shellBurning - Shell burning indicators
 * @param deltaTime - Time step in years
 * @param mass - Stellar mass in solar masses
 * @returns Updated core composition
 */
export function evolveCoreComposition(
  composition: CoreComposition,
  coreReaction: NuclearReaction,
  shellBurning: ShellBurning,
  deltaTime: number,
  mass: number
): CoreComposition {
  // Create a copy of the composition
  const newComposition = { ...composition };
  
  // Calculate reaction rates (simplified)
  // Reaction rate depends on mass and available fuel
  const reactionRate = mass * 1e-10; // Fraction per year (very approximate)
  const deltaFraction = reactionRate * deltaTime;
  
  // Process core reactions
  switch (coreReaction) {
    case NuclearReaction.PP_CHAIN:
    case NuclearReaction.CNO_CYCLE:
      // Hydrogen → Helium (4H → He)
      const hydrogenBurned = Math.min(newComposition.hydrogen, deltaFraction * 4);
      newComposition.hydrogen -= hydrogenBurned;
      newComposition.helium += hydrogenBurned * 0.99; // Mass defect
      break;
      
    case NuclearReaction.TRIPLE_ALPHA:
      // Helium → Carbon (3He → C)
      const heliumBurned = Math.min(newComposition.helium, deltaFraction * 3);
      newComposition.helium -= heliumBurned;
      newComposition.carbon += heliumBurned * 0.95;
      break;
      
    case NuclearReaction.HELIUM_CARBON:
      // Helium + Carbon → Oxygen
      const heBurned = Math.min(newComposition.helium, deltaFraction);
      const cBurned = Math.min(newComposition.carbon, deltaFraction * 0.5);
      newComposition.helium -= heBurned;
      newComposition.carbon -= cBurned;
      newComposition.oxygen += (heBurned + cBurned) * 0.9;
      break;
      
    case NuclearReaction.CARBON_BURNING:
      // Carbon → Neon, Magnesium
      const carbonBurned = Math.min(newComposition.carbon, deltaFraction * 2);
      newComposition.carbon -= carbonBurned;
      newComposition.neon += carbonBurned * 0.5;
      newComposition.magnesium += carbonBurned * 0.4;
      break;
  }
  
  // Normalize to ensure sum = 1
  const total = Object.values(newComposition).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(newComposition).forEach(key => {
      newComposition[key as keyof CoreComposition] /= total;
    });
  }
  
  return newComposition;
}

/**
 * Calculate complete internal structure for a star
 * @param mass - Stellar mass in solar masses
 * @param radius - Stellar radius in solar radii
 * @param luminosity - Stellar luminosity in solar luminosities
 * @param phase - Current evolution phase
 * @param ageRatio - Age relative to main sequence lifetime
 * @param metallicity - Metallicity relative to solar
 * @param previousStructure - Previous internal structure (for composition evolution)
 * @param deltaTime - Time step since last update in years
 * @returns Complete internal structure
 */
export function calculateInternalStructure(
  mass: number,
  radius: number,
  luminosity: number,
  phase: EvolutionPhase,
  ageRatio: number,
  metallicity: number,
  previousStructure?: InternalStructure,
  deltaTime?: number
): InternalStructure {
  // Calculate core conditions
  const coreTemperature = calculateCoreTemperature(mass, phase, ageRatio);
  const corePressure = calculateCorePressure(mass, radius, phase);
  
  // Get composition (evolve from previous or calculate initial)
  let coreComposition: CoreComposition;
  if (previousStructure && deltaTime) {
    // Evolve composition
    const shellBurning = determineShellBurning(phase, mass, ageRatio);
    const coreReaction = determineActiveReactions(
      coreTemperature,
      previousStructure.coreComposition,
      phase,
      mass
    );
    coreComposition = evolveCoreComposition(
      previousStructure.coreComposition,
      coreReaction,
      shellBurning,
      deltaTime,
      mass
    );
  } else {
    // Initial composition
    coreComposition = calculateInitialCoreComposition(metallicity);
  }
  
  // Determine active reactions
  const coreReaction = determineActiveReactions(coreTemperature, coreComposition, phase, mass);
  const shellBurning = determineShellBurning(phase, mass, ageRatio);
  
  // Build shell reactions list
  const shellReactions: NuclearReaction[] = [];
  if (shellBurning.hydrogenShell) {
    shellReactions.push(mass > 1.5 ? NuclearReaction.CNO_CYCLE : NuclearReaction.PP_CHAIN);
  }
  if (shellBurning.heliumShell) {
    shellReactions.push(NuclearReaction.TRIPLE_ALPHA);
  }
  if (shellBurning.carbonShell) {
    shellReactions.push(NuclearReaction.CARBON_BURNING);
  }
  
  const energyProductionRate = calculateEnergyProductionRate(coreReaction, mass, luminosity);
  
  const activeReactions: ActiveReactions = {
    coreReaction,
    shellReactions,
    energyProductionRate,
  };
  
  // Calculate layer structure
  const layerStructure = calculateLayerStructure(mass, phase, ageRatio);
  
  return {
    coreComposition,
    coreTemperature,
    corePressure,
    activeReactions,
    shellBurning,
    layerStructure,
  };
}
