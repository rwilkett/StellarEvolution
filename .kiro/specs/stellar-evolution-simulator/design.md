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
  angularMomentum: number;   // Normalized units
}

interface CloudFormationModule {
  calculateStarFormation(params: CloudParameters): StarSystem;
  determineFragmentation(params: CloudParameters): number; // Number of stars
  calculateMassDistribution(totalMass: number, numStars: number): number[];
}
```

**Key Physics Models:**
- Jeans mass criterion for cloud collapse
- Fragmentation based on angular momentum and turbulence
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
}

interface PlanetaryFormationModule {
  calculateDiskProperties(star: Star, cloudMetallicity: number): ProtoplanetaryDisk;
  generatePlanets(disk: ProtoplanetaryDisk, star: Star): Planet[];
  determinePlanetComposition(distance: number, starMass: number): PlanetComposition;
}
```

**Key Physics Models:**
- Minimum Mass Solar Nebula (MMSN) model
- Snow line calculation based on stellar luminosity
- Core accretion model for planet formation
- Planet spacing based on Hill sphere considerations

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
│   ├── CloudParametersInput
│   ├── SimulationControls (Start/Pause/Reset)
│   └── TimeControls (Speed, Jump to Time)
├── VisualizationCanvas
│   ├── StarRenderer
│   ├── OrbitRenderer
│   └── PlanetRenderer
├── DataPanel
│   ├── StellarPropertiesDisplay
│   ├── SystemOverview
│   └── TimelineDisplay
└── MenuBar
    ├── SaveLoadDialog
    └── ExportDialog
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
  ANGULAR_MOMENTUM_MAX: 100,
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
- Solar-mass, solar-metallicity cloud (baseline)
- Low-mass cloud (< 1 M☉) for single low-mass star
- High-mass cloud (> 100 M☉) for massive star formation
- High angular momentum cloud for binary system
- Various metallicities to test planet formation variations

## Implementation Notes

### Simplified Physics Models

For initial implementation, use simplified models:

1. **Stellar Evolution**: Use power-law approximations rather than detailed stellar structure equations
2. **Orbital Mechanics**: Implement two-body solutions; N-body dynamics can be added later
3. **Planet Formation**: Use statistical models rather than detailed accretion simulations
4. **Time Steps**: Use adaptive time stepping based on evolutionary phase

### Extensibility Considerations

Design allows for future enhancements:
- More detailed physics models (stellar structure equations, nucleosynthesis)
- 3D visualization with WebGL
- Spectral analysis and HR diagram plotting
- Supernova explosions and remnant formation
- Stellar populations and cluster simulations
- Integration with real astronomical data

### Performance Optimizations

- Cache calculated values that don't change (e.g., main sequence lifetime)
- Use lookup tables for expensive calculations
- Implement level-of-detail rendering for visualization
- Debounce user input to avoid excessive recalculations
