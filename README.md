# Stellar Evolution Simulator

A React TypeScript application for simulating stellar evolution from molecular cloud collapse through planetary system formation.

## Project Structure

```
src/
├── physics/       # Physics calculation modules (stellar, orbital, planetary)
├── simulation/    # Simulation controller and state management
├── ui/            # React UI components
├── services/      # Data export and persistence services
├── types/         # TypeScript type definitions
├── constants/     # Physical constants and validation ranges
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Core Types

The application uses strongly-typed TypeScript interfaces defined in `src/types/core.ts`:

- `CloudParameters` - Initial molecular cloud conditions
- `Star` - Stellar properties and evolution state
- `Planet` - Planetary properties and orbital parameters
- `StarSystem` - Complete star system with stars and planets
- `SimulationStatus` - Current simulation state

## Physical Constants

Physical constants and validation ranges are defined in `src/constants/physics.ts`:

- Solar reference values
- Universal constants
- Input validation ranges
- Mass-luminosity relation coefficients
- Spectral type classifications

## Using the Simulation Controller

The `SimulationController` class manages the complete simulation lifecycle:

```typescript
import { SimulationController } from './simulation';
import { CloudParameters } from './types/core';

// Create a new controller
const controller = new SimulationController();

// Define initial cloud parameters
const cloudParams: CloudParameters = {
  mass: 1.0,              // 1 solar mass
  metallicity: 1.0,       // Solar metallicity
  angularMomentum: 1e42   // kg⋅m²/s
};

// Initialize the simulation
const system = controller.initializeSimulation(cloudParams);
console.log(`Created system with ${system.stars.length} stars and ${system.planets.length} planets`);

// Control simulation
controller.setTimeScale(1e6);      // 1 million years per second
controller.startSimulation();       // Start time evolution
controller.pauseSimulation();       // Pause
controller.resetSimulation();       // Reset to initial state

// Time navigation
controller.jumpToTime(1e9);         // Jump to 1 billion years

// Manual updates
controller.updateSimulation(1e6);   // Advance by 1 million years

// Get current state
const status = controller.getStatus();
console.log(`Time: ${status.currentTime} years`);
console.log(`State: ${status.state}`);
```

## Data Export Service

The data export service provides functionality to export simulation data in CSV or JSON formats:

```typescript
import {
  exportStellarProperties,
  exportOrbitalParameters,
  exportCompleteSystem,
  ExportFormat,
  ExportOptions
} from './services';

// Get the current star system
const system = controller.getSystem();

// Export stellar properties to CSV
await exportStellarProperties(system, {
  format: ExportFormat.CSV,
  includeMetadata: true
});

// Export orbital parameters to JSON
await exportOrbitalParameters(system, {
  format: ExportFormat.JSON,
  includeMetadata: true
});

// Export complete system with time-series data
await exportCompleteSystem(
  system,
  {
    format: ExportFormat.CSV,
    includeMetadata: true,
    includeTimeSeries: true,
    timeSeriesInterval: 1e6  // 1 million years between data points
  },
  (progress) => {
    console.log(`Export progress: ${progress}%`);
  }
);
```

### Export Features

- **CSV Format**: Human-readable comma-separated values with headers
- **JSON Format**: Structured data with metadata
- **Metadata**: Includes export date, system name, age, and initial conditions
- **Time-Series**: Optional time-series data with configurable intervals
- **Progress Tracking**: Optional progress callback for large exports
- **Performance**: Exports complete within 5 seconds for typical simulations
- **Browser Download**: Automatic file download with timestamped filenames

### Export Functions

- `exportStellarProperties()` - Export star properties (mass, luminosity, temperature, etc.)
- `exportOrbitalParameters()` - Export planetary orbital data
- `exportCompleteSystem()` - Export complete system with all data
- `exportStellarPropertiesToCSV()` - Generate CSV string for stellar data
- `exportOrbitalParametersToCSV()` - Generate CSV string for orbital data
- `exportTimeSeriesDataToCSV()` - Generate CSV string for time-series data
```
