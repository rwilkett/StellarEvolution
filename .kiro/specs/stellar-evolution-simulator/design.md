# Design Document

## Overview

The Stellar Evolution Simulator is a physics-based simulation application that models star formation and evolution from interstellar clouds. The system uses simplified astrophysical models to calculate stellar properties, orbital dynamics, and planetary formation. The architecture separates the physics engine from the visualization layer, allowing for extensibility and testing.

The application will be built as a web-based interactive simulator using TypeScript for type safety and modern web technologies for visualization. The core physics calculations will be isolated in a simulation engine that can run independently of the UI.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (React Components, Controls, Visualization Canvas)     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│     (State Management, Event Handling, I/O)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Simulation Engine                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Cloud      │  │   Stellar    │  │  Planetary   │ │
│  │  Formation   │  │  Evolution   │  │  Formation   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Physics Models Library                      │
│  (Mass-Luminosity, Stellar Lifetime, Orbital Mechanics) │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **Visualization**: HTML5 Canvas or WebGL for 2D/3D rendering
- **State Management**: React Context or Zustand for application state
- **Physics Calculations**: Custom TypeScript modules
- **Data Export**: Browser-based file generation (CSV)
- **Persistence**: LocalStorage or IndexedDB for save/load functionality

## Components and Interfaces

### 1. Simulation Engine

The core simulation engine manages the physics calculations and state evolution.

#### CloudFormationModule

Handles the initial collapse of the interstellar cloud and determines star formation outcomes.

```typescript
interface CloudParameters {
  mass: number;              // Solar masses
  metallicity: number;       // Z/Z_sun
  angularMomentum: number;   // kg⋅m²/s
  temperature: number;       // Kelvin
  radius: number;            // Parsecs
  turbulenceVelocity: number; // km/s
  magneticFieldStrength: number; // Microgauss (μG)
}

interface DerivedCloudProperties {
  density: number;           // particles/cm³
  virialParameter: number;   // Dimensionless
  jeansMass: number;         // Solar masses
  collapseTimescale: number; // Years
  isBound: boolean;          // Whether cloud is gravitationally bound
  turbulentJeansLength: number; // Parsecs
  magneticFluxToMassRatio: number; // Normalized units
}

interface CloudFormationModule {
  calculateStarFormation(params: CloudParameters): StarSystem;
  calculateDerivedProperties(params: CloudParameters): DerivedCloudProperties;
  determineFragmentation(params: CloudParameters, derived: DerivedCloudProperties): number;
  calculateMassDistribution(totalMass: number, numStars: number): number[];
  calculateJeansMass(temperature: number, density: number): number;
  calculateCollapseTimescale(density: number): number;
  calculateVirialParameter(mass: number, radius: number, turbulenceVelocity: number): number;
}
```

**Key Physics Models:**
- Temperature-dependent Jeans mass criterion: M_J ∝ T^(3/2) / ρ^(1/2)
- Virial parameter calculation: α_vir = 5σ²R / (GM)
- Free-fall collapse timescale: t_ff ∝ ρ^(-1/2)
- Turbulence-modified fragmentation using turbulent Jeans length
- Magnetic flux-to-mass ratio for disk formation
- IMF (Initial Mass Function) approximation for mass distribution

#### StellarEvolutionModule

Calculates stellar properties and evolution over time.

```typescript
interface Star {
  id: string;
  mass: number;              // Solar masses
  metallicity: number;
  age: number;               // Years
  temperature: number;       // Kelvin
  luminosity: number;        // Solar luminosities
  radius: number;            // Solar radii
  spectralType: string;
  evolutionPhase: EvolutionPhase;
}

enum EvolutionPhase {
  PROTOSTAR = 'protostar',
  MAIN_SEQUENCE = 'main_sequence',
  SUBGIANT = 'subgiant',
  RED_GIANT = 'red_giant',
  HORIZONTAL_BRANCH = 'horizontal_branch',
  ASYMPTOTIC_GIANT = 'asymptotic_giant',
  WHITE_DWARF = 'white_dwarf',
  NEUTRON_STAR = 'neutron_star',
  BLACK_HOLE = 'black_hole'
}

interface StellarEvolutionModule {
  calculateInitialProperties(mass: number, metallicity: number): Star;
  evolveStarByTime(star: Star, deltaTime: number): Star;
  calculateMainSequenceLifetime(mass: number): number;
  determineEvolutionPhase(star: Star): EvolutionPhase;
  calculateFinalState(mass: number): EvolutionPhase;
}
```

**Key Physics Models:**
- Mass-luminosity relation: L ∝ M^3.5 (approximate)
- Mass-radius relation for main sequence stars
- Stellar lifetime: t ∝ M/L ∝ M^-2.5
- Temperature-color relationship (Wien's law)
- Evolutionary tracks based on mass ranges

#### OrbitalDynamicsModule

Manages gravitational interactions in multiple-star systems.

```typescript
interface OrbitalParameters {
  semiMajorAxis: number;     // AU
  eccentricity: number;
  inclination: number;       // Radians
  period: number;            // Years
}

interface BinarySystem {
  primary: Star;
  secondary: Star;
  orbitalParams: OrbitalParameters;
}

interface OrbitalDynamicsModule {
  calculateBinaryOrbit(star1: Star, star2: Star, angularMomentum: number): OrbitalParameters;
  calculateOrbitalPositions(system: BinarySystem, time: number): { pos1: Vector3, pos2: Vector3 };
  checkStability(system: StarSystem): boolean;
}
```

**Key Physics Models:**
- Kepler's laws for orbital mechanics
- Two-body problem solutions
- Stability criteria for multiple-star systems

#### PlanetaryFormationModule

Simulates planet formation from protoplanetary disks.

```typescript
interface Planet {
  id: string;
  mass: number;              // Earth masses
  radius: number;            // Earth radii
  orbitalParams: OrbitalParameters;
  composition: PlanetComposition;
  hostStarId: string;
}

interface PlanetComposition {
  rockFraction: number;
  iceFraction: number;
  gasFraction: number;
}

interface ProtoplanetaryDisk {
  innerRadius: number;       // AU
  outerRadius: number;       // AU
  mass: number;              // Earth masses
  metallicity: number;
  magneticBrakingFactor: number; // Reduction factor from magnetic fields
}

interface PlanetaryFormationModule {
  calculateDiskProperties(
    star: Star, 
    cloudMetallicity: number, 
    magneticFieldStrength: number
  ): ProtoplanetaryDisk;
  generatePlanets(disk: ProtoplanetaryDisk, star: Star): Planet[];
  determinePlanetComposition(distance: number, starMass: number): PlanetComposition;
  applyMagneticBraking(baseRadius: number, magneticFieldStrength: number): number;
}
```

**Key Physics Models:**
- Minimum Mass Solar Nebula (MMSN) model
- Snow line calculation based on stellar luminosity
- Core accretion model for planet formation
- Planet spacing based on Hill sphere considerations
- Magnetic braking effects on disk size: R_disk ∝ B^(-α) where α ≈ 0.5-1.0

### 2. Application Layer

#### SimulationController

Manages simulation state and coordinates between UI and engine.

```typescript
interface StarSystem {
  id: string;
  stars: Star[];
  planets: Planet[];
  binarySystems: BinarySystem[];
  initialConditions: CloudParameters;
  derivedCloudProperties: DerivedCloudProperties;
  currentTime: number;       // Years
  creationTime: Date;
}

interface SimulationState {
  system: StarSystem | null;
  isRunning: boolean;
  timeScale: number;         // Simulation speed multiplier
  lastUpdateTime: number;
}

interface SimulationController {
  createSimulation(params: CloudParameters): StarSystem;
  startSimulation(): void;
  pauseSimulation(): void;
  resetSimulation(): void;
  setTimeScale(scale: number): void;
  jumpToTime(time: number): void;
  updateSimulation(deltaTime: number): void;
}
```

#### DataExportService

Handles exporting simulation data to various formats.

```typescript
interface ExportOptions {
  format: 'csv' | 'json';
  includeTimeSeries: boolean;
  timeSeriesInterval: number; // Years between data points
}

interface DataExportService {
  exportStarData(system: StarSystem, options: ExportOptions): Blob;
  exportOrbitalData(system: StarSystem, options: ExportOptions): Blob;
  exportTimeSeriesData(system: StarSystem, options: ExportOptions): Blob;
}
```

#### PersistenceService

Manages saving and loading simulation states.

```typescript
interface SavedSimulation {
  id: string;
  name: string;
  timestamp: Date;
  system: StarSystem;
}

interface PersistenceService {
  saveSimulation(system: StarSystem, name: string): Promise<string>;
  loadSimulation(id: string): Promise<StarSystem>;
  listSavedSimulations(): Promise<SavedSimulation[]>;
  deleteSimulation(id: string): Promise<void>;
}
```

### 3. User Interface Layer

#### Components Structure

```
App
├── ControlPanel
│   ├── CloudParametersInput (Enhanced with new properties)
│   │   ├── BasicPropertiesSection (mass, metallicity, angular momentum)
│   │   ├── PhysicalPropertiesSection (temperature, radius)
│   │   ├── DynamicalPropertiesSection (turbulence velocity, magnetic field)
│   │   └── DerivedPropertiesDisplay (density, virial parameter, Jeans mass)
│   ├── SimulationControls (Start/Pause/Reset)
│   └── TimeControls (Speed, Jump to Time)
├── VisualizationCanvas
│   ├── StarRenderer
│   ├── OrbitRenderer
│   └── PlanetRenderer
├── DataPanel
│   ├── StellarPropertiesDisplay
│   ├── SystemOverview (Enhanced with cloud properties)
│   └── TimelineDisplay (Shows collapse timescale)
└── MenuBar
    ├── SaveLoadDialog
    └── ExportDialog (Enhanced export with new properties)
```

#### VisualizationCanvas

Renders the stellar system using Canvas 2D API or WebGL.

```typescript
interface VisualizationConfig {
  scale: number;             // AU per pixel
  centerPosition: Vector2;
  showOrbits: boolean;
  showLabels: boolean;
  timelinePosition: number;  // 0-1 for animation
}

interface VisualizationCanvas {
  render(system: StarSystem, config: VisualizationConfig): void;
  updateStarAppearance(star: Star): void;
  drawOrbit(params: OrbitalParameters): void;
  handleZoom(delta: number): void;
  handlePan(delta: Vector2): void;
}
```

**Rendering Strategy:**
- Stars rendered as circles with color based on temperature (blackbody radiation)
- Size scaled logarithmically for visibility
- Orbits drawn as ellipses
- Planets as smaller circles on orbital paths
- Labels with star names and key properties

## Data Models

### Core Data Structures

```typescript
// Vector types for positions and velocities
interface Vector2 {
  x: number;
  y: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Physical constants (in SI or astronomical units)
const CONSTANTS = {
  SOLAR_MASS: 1.989e30,      // kg
  SOLAR_RADIUS: 6.96e8,      // m
  SOLAR_LUMINOSITY: 3.828e26, // W
  AU: 1.496e11,              // m
  YEAR: 3.154e7,             // s
  G: 6.674e-11,              // m^3 kg^-1 s^-2
};

// Validation ranges
const VALIDATION = {
  MASS_MIN: 0.1,
  MASS_MAX: 1000,
  METALLICITY_MIN: 0.0001,
  METALLICITY_MAX: 3.0,
  ANGULAR_MOMENTUM_MIN: 0,
  ANGULAR_MOMENTUM_MAX: 1e50,
  TEMPERATURE_MIN: 5,
  TEMPERATURE_MAX: 100,
  RADIUS_MIN: 0.1,
  RADIUS_MAX: 200,
  TURBULENCE_VELOCITY_MIN: 0.1,
  TURBULENCE_VELOCITY_MAX: 10,
  MAGNETIC_FIELD_MIN: 1,
  MAGNETIC_FIELD_MAX: 1000,
};

// Default values for backward compatibility
const DEFAULTS = {
  TEMPERATURE: 20,           // K
  RADIUS: 10,                // pc
  TURBULENCE_VELOCITY: 1,    // km/s
  MAGNETIC_FIELD: 10,        // μG
};
```

### State Management

The application state will be managed using React Context or a lightweight state management library:

```typescript
interface AppState {
  simulation: SimulationState;
  ui: UIState;
  savedSimulations: SavedSimulation[];
}

interface UIState {
  selectedStar: string | null;
  selectedPlanet: string | null;
  visualizationConfig: VisualizationConfig;
  showDataPanel: boolean;
  showControlPanel: boolean;
}
```

## Error Handling

### Input Validation

- Validate all user inputs against defined ranges before simulation creation
- Display clear error messages with valid ranges
- Prevent simulation start with invalid parameters

### Simulation Errors

- Handle numerical instabilities in physics calculations
- Detect and report unstable orbital configurations
- Gracefully handle edge cases (e.g., very low or high mass stars)

### Error Types

```typescript
enum SimulationErrorType {
  INVALID_PARAMETERS = 'invalid_parameters',
  NUMERICAL_INSTABILITY = 'numerical_instability',
  UNSTABLE_SYSTEM = 'unstable_system',
  CALCULATION_TIMEOUT = 'calculation_timeout',
}

interface SimulationError {
  type: SimulationErrorType;
  message: string;
  details?: any;
}
```

### Error Recovery

- Allow users to adjust parameters and retry
- Provide fallback values for edge cases
- Log errors for debugging without crashing the application

## Testing Strategy

### Unit Testing

- Test individual physics calculation functions with known inputs/outputs
- Validate mass-luminosity relations against empirical data
- Test orbital mechanics calculations against analytical solutions
- Verify input validation logic

### Integration Testing

- Test complete simulation flow from cloud parameters to star system
- Verify data export produces correct format and content
- Test save/load functionality preserves simulation state
- Validate UI updates correctly reflect simulation state changes

### Physics Validation

- Compare simulation results against known stellar evolution models
- Validate binary star orbital periods using Kepler's third law
- Check planet formation outcomes against observational statistics
- Verify energy conservation in orbital dynamics

### Performance Testing

- Ensure simulation updates complete within frame budget (16ms for 60fps)
- Test with maximum number of stars and planets
- Verify visualization renders smoothly at different zoom levels
- Measure memory usage for long-running simulations

### Test Data

Create test cases with:
- Solar-mass, solar-metallicity cloud (baseline: M=1, Z=1, T=20K, R=10pc, v_turb=1km/s, B=10μG)
- Low-mass cloud (< 1 M☉) for single low-mass star
- High-mass cloud (> 100 M☉) for massive star formation
- High angular momentum cloud for binary system
- Various metallicities to test planet formation variations
- Cold, dense cloud (T=10K, high density) for efficient star formation
- Warm, diffuse cloud (T=50K, low density) for suppressed star formation
- High turbulence cloud (v_turb > 5 km/s) for multiple fragmentation
- Strong magnetic field cloud (B > 100 μG) for magnetic braking effects
- Unbound cloud (α_vir > 2) to test non-collapse scenarios
- Marginally bound cloud (α_vir ≈ 2) for slow collapse

## Physics Calculations for Enhanced Cloud Properties

### Derived Quantities

**Cloud Density**
```
ρ = (3M) / (4πR³)
```
Where M is mass in solar masses, R is radius in parsecs, converted to particles/cm³

**Virial Parameter**
```
α_vir = (5σ²R) / (GM)
```
Where σ is velocity dispersion (turbulence velocity), R is radius, G is gravitational constant, M is mass
- α_vir < 1: Strongly bound, rapid collapse
- α_vir ≈ 1-2: Marginally bound, slow collapse
- α_vir > 2: Unbound, no collapse

**Jeans Mass**
```
M_J = (5kT / (GμmH))^(3/2) × (3 / (4πρ))^(1/2)
```
Where k is Boltzmann constant, T is temperature, μ is mean molecular weight (≈2.33 for molecular clouds), mH is hydrogen mass, ρ is density

**Free-Fall Collapse Timescale**
```
t_ff = √(3π / (32Gρ))
```
Typically 10⁵ to 10⁶ years for molecular clouds

**Turbulent Jeans Length**
```
λ_J,turb = σ × √(π / (Gρ))
```
Determines characteristic fragment size in turbulent clouds

**Magnetic Flux-to-Mass Ratio**
```
λ = B × πR² / M
```
Normalized to critical value; affects disk formation and angular momentum transport

### Star Formation Efficiency

The fraction of cloud mass converted to stars depends on:
```
ε_SF = f(α_vir, M/M_J)
```
- Higher efficiency when α_vir < 1 (bound)
- Higher efficiency when M >> M_J (supercritical)
- Typical values: 1-30%

### Fragmentation Modifications

Number of fragments influenced by:
```
N_frag ∝ (M/M_J) × (1 + σ/σ_thermal)
```
Where σ_thermal is thermal velocity dispersion

### Magnetic Braking on Disk Size

Disk outer radius reduced by magnetic fields:
```
R_disk = R_disk,0 × (B/B_0)^(-α)
```
Where α ≈ 0.5-1.0, B_0 is reference field strength (10 μG)

## Implementation Notes

### Simplified Physics Models

For initial implementation, use simplified models:

1. **Stellar Evolution**: Use power-law approximations rather than detailed stellar structure equations
2. **Orbital Mechanics**: Implement two-body solutions; N-body dynamics can be added later
3. **Planet Formation**: Use statistical models rather than detailed accretion simulations
4. **Time Steps**: Use adaptive time stepping based on evolutionary phase

### Backward Compatibility Strategy

For simulations created before this enhancement:

1. **Detection**: Check if new properties exist in saved simulation data
2. **Default Assignment**: 
   - temperature = 20 K
   - radius = calculated from mass assuming ρ = 100 particles/cm³
   - turbulenceVelocity = 1 km/s
   - magneticFieldStrength = 10 μG
3. **Recalculation**: Compute derived properties with defaults
4. **User Notification**: Display message indicating defaults were applied
5. **Save Update**: When user saves, include all properties in new format

### Extensibility Considerations

Design allows for future enhancements:
- More detailed physics models (stellar structure equations, nucleosynthesis)
- 3D visualization with WebGL
- Spectral analysis and HR diagram plotting
- Supernova explosions and remnant formation
- Stellar populations and cluster simulations
- Integration with real astronomical data
- Additional cloud properties (UV radiation field, external pressure, rotation profile)
- Time-dependent cloud evolution before collapse

### Performance Optimizations

- Cache calculated values that don't change (e.g., main sequence lifetime)
- Use lookup tables for expensive calculations
- Implement level-of-detail rendering for visualization
- Debounce user input to avoid excessive recalculations
