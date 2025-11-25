/**
 * Core type definitions for the Stellar Evolution Simulator
 */

// Vector types for 2D and 3D coordinates
export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Cloud parameters for initial conditions
export interface CloudParameters {
  mass: number;              // Total mass in solar masses (M☉)
  metallicity: number;       // Metallicity relative to solar (Z☉)
  angularMomentum: number;   // Angular momentum in kg⋅m²/s
  temperature?: number;      // Cloud temperature in Kelvin (optional, defaults to 20K)
  radius?: number;           // Cloud radius in parsecs (optional, defaults to 10pc)
  turbulenceVelocity?: number; // Turbulence velocity dispersion in km/s (optional, defaults to 1 km/s)
  magneticFieldStrength?: number; // Magnetic field strength in microgauss (optional, defaults to 10 μG)
}

// Derived cloud properties calculated from input parameters
export interface DerivedCloudProperties {
  density: number;           // Cloud density in particles/cm³
  virialParameter: number;   // Virial parameter (dimensionless)
  jeansMass: number;         // Jeans mass in solar masses
  collapseTimescale: number; // Free-fall collapse timescale in years
  isBound: boolean;          // Whether cloud is gravitationally bound (virialParameter < 2)
  turbulentJeansLength: number; // Turbulent Jeans length in parsecs
  magneticFluxToMassRatio: number; // Magnetic flux-to-mass ratio (normalized)
}

// Stellar evolution phases
export enum EvolutionPhase {
  PROTOSTAR = 'protostar',
  MAIN_SEQUENCE = 'main_sequence',
  RED_GIANT = 'red_giant',
  HORIZONTAL_BRANCH = 'horizontal_branch',
  ASYMPTOTIC_GIANT = 'asymptotic_giant',
  PLANETARY_NEBULA = 'planetary_nebula',
  WHITE_DWARF = 'white_dwarf',
  NEUTRON_STAR = 'neutron_star',
  BLACK_HOLE = 'black_hole'
}

// Spectral types
export enum SpectralType {
  O = 'O',
  B = 'B',
  A = 'A',
  F = 'F',
  G = 'G',
  K = 'K',
  M = 'M'
}

// Star properties
export interface Star {
  id: string;
  name: string;
  mass: number;                    // Mass in solar masses (M☉)
  radius: number;                  // Radius in solar radii (R☉)
  luminosity: number;              // Luminosity in solar luminosities (L☉)
  temperature: number;             // Surface temperature in Kelvin
  age: number;                     // Age in years
  metallicity: number;             // Metallicity relative to solar (Z☉)
  spectralType: SpectralType;      // Spectral classification
  evolutionPhase: EvolutionPhase;  // Current evolution phase
  lifetime: number;                // Total main sequence lifetime in years
  position: Vector3;               // Position in AU
  velocity: Vector3;               // Velocity in AU/year
}

// Planet composition types
export enum PlanetComposition {
  ROCKY = 'rocky',
  ICE_GIANT = 'ice_giant',
  GAS_GIANT = 'gas_giant'
}

// Planet properties
export interface Planet {
  id: string;
  name: string;
  mass: number;                    // Mass in Earth masses (M⊕)
  radius: number;                  // Radius in Earth radii (R⊕)
  composition: PlanetComposition;  // Planet type
  semiMajorAxis: number;           // Orbital semi-major axis in AU
  eccentricity: number;            // Orbital eccentricity
  orbitalPeriod: number;           // Orbital period in years
  parentStarId: string;            // ID of the parent star
  position: Vector3;               // Current position in AU
}

// Orbital parameters
export interface OrbitalParameters {
  semiMajorAxis: number;     // Semi-major axis in AU
  eccentricity: number;      // Eccentricity (0-1)
  inclination: number;       // Inclination in radians
  longitudeOfAscendingNode: number;  // Longitude of ascending node in radians
  argumentOfPeriapsis: number;       // Argument of periapsis in radians
  meanAnomalyAtEpoch: number;        // Mean anomaly at epoch in radians
}

// Star system containing multiple stars and planets
export interface StarSystem {
  id: string;
  name: string;
  stars: Star[];
  planets: Planet[];
  age: number;                // System age in years
  initialCloudParameters: CloudParameters;
  derivedCloudProperties?: DerivedCloudProperties; // Calculated cloud properties (optional for backward compatibility)
}

// Protoplanetary disk properties
export interface ProtoplanetaryDisk {
  starId: string;
  mass: number;               // Disk mass in solar masses
  innerRadius: number;        // Inner radius in AU
  outerRadius: number;        // Outer radius in AU
  metallicity: number;        // Disk metallicity relative to solar
  snowLine: number;           // Snow line distance in AU
  magneticBrakingFactor?: number; // Reduction factor from magnetic braking (0-1, optional for backward compatibility)
}

// Simulation state
export enum SimulationState {
  STOPPED = 'stopped',
  RUNNING = 'running',
  PAUSED = 'paused'
}

export interface SimulationStatus {
  state: SimulationState;
  currentTime: number;        // Current simulation time in years
  timeScale: number;          // Time scale multiplier
  system: StarSystem | null;
}
