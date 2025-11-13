/**
 * Physical constants and validation ranges for the Stellar Evolution Simulator
 */

// Physical constants
export const PHYSICS_CONSTANTS = {
  // Solar values (reference units)
  SOLAR_MASS: 1.989e30,           // kg
  SOLAR_RADIUS: 6.96e8,           // meters
  SOLAR_LUMINOSITY: 3.828e26,     // watts
  SOLAR_TEMPERATURE: 5778,        // Kelvin
  SOLAR_METALLICITY: 0.0134,      // mass fraction
  
  // Astronomical units
  AU: 1.496e11,                   // meters (Astronomical Unit)
  PARSEC: 3.086e16,               // meters
  LIGHT_YEAR: 9.461e15,           // meters
  
  // Universal constants
  GRAVITATIONAL_CONSTANT: 6.674e-11,  // m³/(kg⋅s²)
  SPEED_OF_LIGHT: 2.998e8,            // m/s
  STEFAN_BOLTZMANN: 5.670e-8,         // W/(m²⋅K⁴)
  WIEN_CONSTANT: 2.898e-3,            // m⋅K
  
  // Time conversions
  SECONDS_PER_YEAR: 3.154e7,      // seconds
  YEARS_PER_GYR: 1e9,             // years per gigayear
  YEARS_PER_MYR: 1e6,             // years per megayear
  
  // Earth values
  EARTH_MASS: 5.972e24,           // kg
  EARTH_RADIUS: 6.371e6,          // meters
  
  // Jeans mass constant (simplified)
  JEANS_MASS_COEFFICIENT: 1.0,    // Dimensionless coefficient for Jeans mass calculation
} as const;

// Validation ranges for input parameters
export const VALIDATION_RANGES = {
  // Cloud parameters
  CLOUD_MASS: {
    min: 0.1,                     // Minimum cloud mass in solar masses
    max: 1000,                    // Maximum cloud mass in solar masses
    unit: 'M☉'
  },
  
  METALLICITY: {
    min: 0.0001,                  // Minimum metallicity (0.01% solar)
    max: 3.0,                     // Maximum metallicity (3x solar)
    unit: 'Z☉'
  },
  
  ANGULAR_MOMENTUM: {
    min: 0,                       // Minimum angular momentum
    max: 1e50,                    // Maximum angular momentum in kg⋅m²/s
    unit: 'kg⋅m²/s'
  },
  
  // Stellar mass ranges
  STELLAR_MASS: {
    min: 0.08,                    // Minimum mass for hydrogen fusion (brown dwarf limit)
    max: 150,                     // Maximum stellar mass in solar masses
    unit: 'M☉'
  },
  
  // Time scale ranges
  TIME_SCALE: {
    min: 0.001,                   // Minimum time scale multiplier
    max: 1000,                    // Maximum time scale multiplier
    unit: 'x'
  },
  
  // Simulation time ranges
  SIMULATION_TIME: {
    min: 0,                       // Minimum simulation time
    max: 1e11,                    // Maximum simulation time (100 Gyr)
    unit: 'years'
  }
} as const;

// Mass-luminosity relation exponents for different mass ranges
export const MASS_LUMINOSITY_EXPONENTS = {
  LOW_MASS: 2.3,      // M < 0.43 M☉
  MID_MASS: 4.0,      // 0.43 M☉ ≤ M < 2 M☉
  HIGH_MASS: 3.5,     // 2 M☉ ≤ M < 55 M☉
  VERY_HIGH_MASS: 1.0 // M ≥ 55 M☉
} as const;

// Stellar lifetime coefficients
export const LIFETIME_CONSTANTS = {
  MAIN_SEQUENCE_COEFFICIENT: 1e10,  // Base lifetime in years for 1 M☉ star
  MASS_EXPONENT: -2.5,              // Exponent for mass-lifetime relation
} as const;

// Planet formation constants
export const PLANET_FORMATION = {
  SNOW_LINE_COEFFICIENT: 2.7,       // AU per sqrt(L☉) for snow line calculation
  MIN_DISK_MASS_FRACTION: 0.01,    // Minimum disk mass as fraction of star mass
  MAX_DISK_MASS_FRACTION: 0.1,     // Maximum disk mass as fraction of star mass
  DISK_LIFETIME: 1e7,              // Typical disk lifetime in years (10 Myr)
} as const;

// Spectral type temperature ranges (Kelvin)
export const SPECTRAL_TYPE_TEMPERATURES = {
  O: { min: 30000, max: Infinity },
  B: { min: 10000, max: 30000 },
  A: { min: 7500, max: 10000 },
  F: { min: 6000, max: 7500 },
  G: { min: 5200, max: 6000 },
  K: { min: 3700, max: 5200 },
  M: { min: 2400, max: 3700 }
} as const;

// Final state mass thresholds
export const FINAL_STATE_THRESHOLDS = {
  WHITE_DWARF_MAX: 8,      // Maximum initial mass for white dwarf (M☉)
  NEUTRON_STAR_MAX: 25,    // Maximum initial mass for neutron star (M☉)
  // Above this becomes black hole
} as const;
