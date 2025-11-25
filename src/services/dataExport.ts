/**
 * Data Export Service
 * Handles exporting simulation data to various formats (CSV, JSON)
 */

import { StarSystem, Star } from '../types/core';

/**
 * Export format options
 */
export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
}

/**
 * Export options configuration
 */
export interface ExportOptions {
  format: ExportFormat;
  includeTimeSeries?: boolean;
  timeSeriesInterval?: number; // Years between data points
  includeMetadata?: boolean;
}

/**
 * Convert a star to CSV row format
 */
function starToCSVRow(star: Star): string {
  return [
    star.id,
    star.name,
    star.mass.toFixed(4),
    star.radius.toFixed(4),
    star.luminosity.toFixed(4),
    star.temperature.toFixed(2),
    star.age.toExponential(4),
    star.metallicity.toFixed(4),
    star.spectralType,
    star.evolutionPhase,
    star.lifetime.toExponential(4),
    star.position.x.toFixed(4),
    star.position.y.toFixed(4),
    star.position.z.toFixed(4),
  ].join(',');
}

/**
 * Generate metadata section for CSV export
 */
function generateMetadataCSV(system: StarSystem): string {
  const metadata: string[] = [];
  metadata.push('# Stellar Evolution Simulator - Export Metadata');
  metadata.push(`# Export Date: ${new Date().toISOString()}`);
  metadata.push(`# System Name: ${system.name}`);
  metadata.push(`# System Age: ${system.age.toExponential(4)} years`);
  metadata.push('');
  
  // Initial cloud parameters
  metadata.push('# Initial Cloud Parameters:');
  metadata.push(`#   Mass: ${system.initialCloudParameters.mass.toFixed(4)} M☉`);
  metadata.push(`#   Metallicity: ${system.initialCloudParameters.metallicity.toFixed(4)} Z☉`);
  metadata.push(`#   Angular Momentum: ${system.initialCloudParameters.angularMomentum.toExponential(4)} kg⋅m²/s`);
  metadata.push(`#   Temperature: ${(system.initialCloudParameters.temperature ?? 20).toFixed(2)} K`);
  metadata.push(`#   Radius: ${(system.initialCloudParameters.radius ?? 10).toFixed(4)} pc`);
  metadata.push(`#   Turbulence Velocity: ${(system.initialCloudParameters.turbulenceVelocity ?? 1).toFixed(4)} km/s`);
  metadata.push(`#   Magnetic Field Strength: ${(system.initialCloudParameters.magneticFieldStrength ?? 10).toFixed(4)} μG`);
  metadata.push('');
  
  // Derived cloud properties (if available)
  if (system.derivedCloudProperties) {
    const derived = system.derivedCloudProperties;
    metadata.push('# Derived Cloud Properties:');
    metadata.push(`#   Density: ${derived.density.toExponential(4)} particles/cm³`);
    metadata.push(`#   Virial Parameter: ${derived.virialParameter.toFixed(4)}`);
    metadata.push(`#   Bound Status: ${derived.isBound ? 'Bound' : 'Unbound'}`);
    metadata.push(`#   Jeans Mass: ${derived.jeansMass.toFixed(4)} M☉`);
    metadata.push(`#   Collapse Timescale: ${derived.collapseTimescale.toExponential(4)} years`);
    metadata.push(`#   Turbulent Jeans Length: ${derived.turbulentJeansLength.toFixed(4)} pc`);
    metadata.push(`#   Magnetic Flux-to-Mass Ratio: ${derived.magneticFluxToMassRatio.toExponential(4)}`);
    metadata.push('');
  }
  
  return metadata.join('\n');
}

/**
 * Export stellar properties to CSV format
 * @param system - Star system to export
 * @param includeMetadata - Whether to include metadata header
 * @returns CSV string with stellar data
 */
export function exportStellarPropertiesToCSV(
  system: StarSystem,
  includeMetadata: boolean = true
): string {
  const lines: string[] = [];
  
  // Add metadata if requested
  if (includeMetadata) {
    lines.push(generateMetadataCSV(system));
  }
  
  // Add header row
  lines.push([
    'ID',
    'Name',
    'Mass (M☉)',
    'Radius (R☉)',
    'Luminosity (L☉)',
    'Temperature (K)',
    'Age (years)',
    'Metallicity (Z☉)',
    'Spectral Type',
    'Evolution Phase',
    'Lifetime (years)',
    'Position X (AU)',
    'Position Y (AU)',
    'Position Z (AU)',
  ].join(','));
  
  // Add data rows
  for (const star of system.stars) {
    lines.push(starToCSVRow(star));
  }
  
  return lines.join('\n');
}

/**
 * Export orbital parameters to CSV format
 * @param system - Star system to export
 * @param includeMetadata - Whether to include metadata header
 * @returns CSV string with orbital data
 */
export function exportOrbitalParametersToCSV(
  system: StarSystem,
  includeMetadata: boolean = true
): string {
  const lines: string[] = [];
  
  // Add metadata if requested
  if (includeMetadata) {
    lines.push(generateMetadataCSV(system));
  }
  
  // Add header row
  lines.push([
    'ID',
    'Name',
    'Type',
    'Semi-Major Axis (AU)',
    'Eccentricity',
    'Orbital Period (years)',
    'Parent Star ID',
    'Position X (AU)',
    'Position Y (AU)',
    'Position Z (AU)',
  ].join(','));
  
  // Add planet data rows
  for (const planet of system.planets) {
    lines.push([
      planet.id,
      planet.name,
      'Planet',
      planet.semiMajorAxis.toFixed(4),
      planet.eccentricity.toFixed(4),
      planet.orbitalPeriod.toFixed(4),
      planet.parentStarId,
      planet.position.x.toFixed(4),
      planet.position.y.toFixed(4),
      planet.position.z.toFixed(4),
    ].join(','));
  }
  
  return lines.join('\n');
}

/**
 * Export time-series data with configurable intervals
 * Note: This function exports the current state. For true time-series,
 * the simulation controller would need to track historical states.
 * @param system - Star system to export
 * @param interval - Time interval between data points (not used in current implementation)
 * @param includeMetadata - Whether to include metadata header
 * @returns CSV string with time-series data
 */
export function exportTimeSeriesDataToCSV(
  system: StarSystem,
  interval: number = 1e6, // Default 1 million years
  includeMetadata: boolean = true
): string {
  const lines: string[] = [];
  
  // Add metadata if requested
  if (includeMetadata) {
    lines.push(generateMetadataCSV(system));
    lines.push(`# Time Series Interval: ${interval.toExponential(4)} years`);
    lines.push('');
  }
  
  // Add header row
  lines.push([
    'Time (years)',
    'Star ID',
    'Star Name',
    'Mass (M☉)',
    'Radius (R☉)',
    'Luminosity (L☉)',
    'Temperature (K)',
    'Evolution Phase',
  ].join(','));
  
  // Add current state data for all stars
  for (const star of system.stars) {
    lines.push([
      system.age.toExponential(4),
      star.id,
      star.name,
      star.mass.toFixed(4),
      star.radius.toFixed(4),
      star.luminosity.toFixed(4),
      star.temperature.toFixed(2),
      star.evolutionPhase,
    ].join(','));
  }
  
  return lines.join('\n');
}

/**
 * Export complete system data to CSV format
 * Combines stellar properties and orbital parameters
 * @param system - Star system to export
 * @param options - Export options
 * @returns CSV string with complete system data
 */
export function exportSystemToCSV(
  system: StarSystem,
  options: ExportOptions = { format: ExportFormat.CSV, includeMetadata: true }
): string {
  const sections: string[] = [];
  
  // Add stellar properties section
  sections.push('# STELLAR PROPERTIES');
  sections.push(exportStellarPropertiesToCSV(system, options.includeMetadata ?? true));
  sections.push('');
  
  // Add orbital parameters section
  sections.push('# ORBITAL PARAMETERS');
  sections.push(exportOrbitalParametersToCSV(system, false)); // Metadata already included
  
  // Add time-series section if requested
  if (options.includeTimeSeries) {
    sections.push('');
    sections.push('# TIME SERIES DATA');
    sections.push(
      exportTimeSeriesDataToCSV(
        system,
        options.timeSeriesInterval ?? 1e6,
        false
      )
    );
  }
  
  return sections.join('\n');
}

/**
 * Generate a filename with timestamp
 * @param baseName - Base name for the file
 * @param extension - File extension (without dot)
 * @returns Filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Create a Blob from CSV data
 * @param csvData - CSV string data
 * @returns Blob object for download
 */
export function createCSVBlob(csvData: string): Blob {
  return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Create a Blob from JSON data
 * @param jsonData - JavaScript object to convert to JSON
 * @returns Blob object for download
 */
export function createJSONBlob(jsonData: any): Blob {
  const jsonString = JSON.stringify(jsonData, null, 2);
  return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
}

/**
 * Trigger browser download of a Blob
 * @param blob - Blob to download
 * @param filename - Filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export stellar properties and trigger download
 * @param system - Star system to export
 * @param options - Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportStellarProperties(
  system: StarSystem,
  options: ExportOptions = { format: ExportFormat.CSV, includeMetadata: true }
): Promise<void> {
  const startTime = performance.now();
  
  try {
    let blob: Blob;
    let filename: string;
    
    if (options.format === ExportFormat.CSV) {
      const csvData = exportStellarPropertiesToCSV(system, options.includeMetadata ?? true);
      blob = createCSVBlob(csvData);
      filename = generateFilename(`${system.name}_stellar_properties`, 'csv');
    } else {
      // JSON format
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          systemName: system.name,
          systemAge: system.age,
          initialConditions: system.initialCloudParameters,
          derivedCloudProperties: system.derivedCloudProperties,
        },
        stars: system.stars,
      };
      blob = createJSONBlob(jsonData);
      filename = generateFilename(`${system.name}_stellar_properties`, 'json');
    }
    
    downloadBlob(blob, filename);
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    
    if (duration > 5) {
      console.warn(`Export took ${duration.toFixed(2)}s, exceeding 5s target`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export stellar properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export orbital parameters and trigger download
 * @param system - Star system to export
 * @param options - Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportOrbitalParameters(
  system: StarSystem,
  options: ExportOptions = { format: ExportFormat.CSV, includeMetadata: true }
): Promise<void> {
  const startTime = performance.now();
  
  try {
    let blob: Blob;
    let filename: string;
    
    if (options.format === ExportFormat.CSV) {
      const csvData = exportOrbitalParametersToCSV(system, options.includeMetadata ?? true);
      blob = createCSVBlob(csvData);
      filename = generateFilename(`${system.name}_orbital_parameters`, 'csv');
    } else {
      // JSON format
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          systemName: system.name,
          systemAge: system.age,
          initialConditions: system.initialCloudParameters,
          derivedCloudProperties: system.derivedCloudProperties,
        },
        planets: system.planets,
      };
      blob = createJSONBlob(jsonData);
      filename = generateFilename(`${system.name}_orbital_parameters`, 'json');
    }
    
    downloadBlob(blob, filename);
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    
    if (duration > 5) {
      console.warn(`Export took ${duration.toFixed(2)}s, exceeding 5s target`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export orbital parameters: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export complete system data and trigger download
 * @param system - Star system to export
 * @param options - Export options
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Promise that resolves when export is complete
 */
export async function exportCompleteSystem(
  system: StarSystem,
  options: ExportOptions = { format: ExportFormat.CSV, includeMetadata: true },
  onProgress?: (progress: number) => void
): Promise<void> {
  const startTime = performance.now();
  
  try {
    if (onProgress) onProgress(10);
    
    let blob: Blob;
    let filename: string;
    
    if (options.format === ExportFormat.CSV) {
      if (onProgress) onProgress(30);
      const csvData = exportSystemToCSV(system, options);
      if (onProgress) onProgress(70);
      blob = createCSVBlob(csvData);
      filename = generateFilename(`${system.name}_complete_system`, 'csv');
    } else {
      // JSON format
      if (onProgress) onProgress(30);
      const jsonData = {
        metadata: {
          exportDate: new Date().toISOString(),
          systemName: system.name,
          systemAge: system.age,
          initialConditions: system.initialCloudParameters,
          derivedCloudProperties: system.derivedCloudProperties,
        },
        stars: system.stars,
        planets: system.planets,
      };
      if (onProgress) onProgress(70);
      blob = createJSONBlob(jsonData);
      filename = generateFilename(`${system.name}_complete_system`, 'json');
    }
    
    if (onProgress) onProgress(90);
    downloadBlob(blob, filename);
    if (onProgress) onProgress(100);
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    
    if (duration > 5) {
      console.warn(`Export took ${duration.toFixed(2)}s, exceeding 5s target`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export complete system: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
