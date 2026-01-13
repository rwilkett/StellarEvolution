/**
 * Unit tests for data export service
 */

import { describe, it, expect } from 'vitest';
import {
  exportStellarPropertiesToCSV,
  exportOrbitalParametersToCSV,
  exportTimeSeriesDataToCSV,
  exportSystemToCSV,
  generateFilename,
  createCSVBlob,
  createJSONBlob,
  ExportFormat,
} from './dataExport';
import { StarSystem, Star, Planet, EvolutionPhase, SpectralType, PlanetComposition, NuclearReaction } from '../types/core';

describe('Data Export Service', () => {
  // Create a mock star system for testing
  const mockStar: Star = {
    id: 'star-1',
    name: 'Test Star',
    mass: 1.0,
    radius: 1.0,
    luminosity: 1.0,
    temperature: 5778,
    age: 4.6e9,
    metallicity: 1.0,
    spectralType: SpectralType.G,
    evolutionPhase: EvolutionPhase.MAIN_SEQUENCE,
    lifetime: 1e10,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    internalStructure: {
      coreComposition: {
        hydrogen: 0.73,
        helium: 0.25,
        carbon: 0.005,
        oxygen: 0.01,
        neon: 0.002,
        magnesium: 0.001,
        silicon: 0.001,
        iron: 0.001,
      },
      coreTemperature: 1.5e7,
      corePressure: 2.5e16,
      activeReactions: {
        coreReaction: NuclearReaction.PP_CHAIN,
        shellReactions: [],
        energyProductionRate: 1.0,
      },
      shellBurning: {
        hydrogenShell: false,
        heliumShell: false,
        carbonShell: false,
      },
      layerStructure: {
        coreRadius: 0.25,
        radiativeZoneRadius: 0.7,
        convectiveZoneRadius: 1.0,
      },
    },
  };

  const mockPlanet: Planet = {
    id: 'planet-1',
    name: 'Test Planet',
    mass: 1.0,
    radius: 1.0,
    composition: PlanetComposition.ROCKY,
    semiMajorAxis: 1.0,
    eccentricity: 0.0167,
    orbitalPeriod: 1.0,
    parentStarId: 'star-1',
    position: { x: 1.0, y: 0, z: 0 },
  };

  const mockSystem: StarSystem = {
    id: 'system-1',
    name: 'Test System',
    stars: [mockStar],
    planets: [mockPlanet],
    age: 4.6e9,
    initialCloudParameters: {
      mass: 1.0,
      metallicity: 1.0,
      angularMomentum: 1e48,
    },
  };

  describe('exportStellarPropertiesToCSV', () => {
    it('should export stellar properties with metadata', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, true);
      
      expect(csv).toContain('# Stellar Evolution Simulator - Export Metadata');
      expect(csv).toContain('# System Name: Test System');
      expect(csv).toContain('ID,Name,Mass (M☉)');
      expect(csv).toContain('star-1,Test Star');
      expect(csv).toContain('1.0000');
      expect(csv).toContain('5778.00');
    });

    it('should export stellar properties without metadata', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      
      expect(csv).not.toContain('# Stellar Evolution Simulator');
      expect(csv).toContain('ID,Name,Mass (M☉)');
      expect(csv).toContain('star-1,Test Star');
    });

    it('should include all stellar properties in correct order', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      const lines = csv.split('\n');
      const header = lines[0];
      const dataRow = lines[1];
      
      expect(header).toContain('ID');
      expect(header).toContain('Mass (M☉)');
      expect(header).toContain('Temperature (K)');
      expect(header).toContain('Evolution Phase');
      
      expect(dataRow).toContain('star-1');
      expect(dataRow).toContain('main_sequence');
    });
  });

  describe('exportOrbitalParametersToCSV', () => {
    it('should export orbital parameters with metadata', () => {
      const csv = exportOrbitalParametersToCSV(mockSystem, true);
      
      expect(csv).toContain('# Stellar Evolution Simulator - Export Metadata');
      expect(csv).toContain('ID,Name,Type,Semi-Major Axis (AU)');
      expect(csv).toContain('planet-1,Test Planet,Planet');
      expect(csv).toContain('1.0000');
    });

    it('should export orbital parameters without metadata', () => {
      const csv = exportOrbitalParametersToCSV(mockSystem, false);
      
      expect(csv).not.toContain('# Stellar Evolution Simulator');
      expect(csv).toContain('ID,Name,Type');
      expect(csv).toContain('planet-1');
    });

    it('should include all orbital parameters', () => {
      const csv = exportOrbitalParametersToCSV(mockSystem, false);
      const lines = csv.split('\n');
      const header = lines[0];
      
      expect(header).toContain('Semi-Major Axis (AU)');
      expect(header).toContain('Eccentricity');
      expect(header).toContain('Orbital Period (years)');
      expect(header).toContain('Parent Star ID');
    });
  });

  describe('exportTimeSeriesDataToCSV', () => {
    it('should export time-series data with metadata', () => {
      const csv = exportTimeSeriesDataToCSV(mockSystem, 1e6, true);
      
      expect(csv).toContain('# Stellar Evolution Simulator - Export Metadata');
      expect(csv).toContain('# Time Series Interval');
      expect(csv).toContain('Time (years),Star ID,Star Name');
      expect(csv).toContain('star-1,Test Star');
    });

    it('should export time-series data without metadata', () => {
      const csv = exportTimeSeriesDataToCSV(mockSystem, 1e6, false);
      
      expect(csv).not.toContain('# Stellar Evolution Simulator');
      expect(csv).toContain('Time (years)');
      expect(csv).toContain('star-1');
    });

    it('should include current system age in time-series', () => {
      const csv = exportTimeSeriesDataToCSV(mockSystem, 1e6, false);
      
      expect(csv).toContain('4.6000e+9'); // System age in scientific notation
    });
  });

  describe('exportSystemToCSV', () => {
    it('should export complete system with all sections', () => {
      const csv = exportSystemToCSV(mockSystem, {
        format: ExportFormat.CSV,
        includeMetadata: true,
        includeTimeSeries: false,
      });
      
      expect(csv).toContain('# STELLAR PROPERTIES');
      expect(csv).toContain('# ORBITAL PARAMETERS');
      expect(csv).toContain('star-1');
      expect(csv).toContain('planet-1');
    });

    it('should include time-series when requested', () => {
      const csv = exportSystemToCSV(mockSystem, {
        format: ExportFormat.CSV,
        includeMetadata: true,
        includeTimeSeries: true,
        timeSeriesInterval: 1e6,
      });
      
      expect(csv).toContain('# STELLAR PROPERTIES');
      expect(csv).toContain('# ORBITAL PARAMETERS');
      expect(csv).toContain('# TIME SERIES DATA');
    });

    it('should not include time-series when not requested', () => {
      const csv = exportSystemToCSV(mockSystem, {
        format: ExportFormat.CSV,
        includeMetadata: true,
        includeTimeSeries: false,
      });
      
      expect(csv).not.toContain('# TIME SERIES DATA');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateFilename('test_export', 'csv');
      
      expect(filename).toMatch(/^test_export_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/);
    });

    it('should handle different extensions', () => {
      const csvFilename = generateFilename('export', 'csv');
      const jsonFilename = generateFilename('export', 'json');
      
      expect(csvFilename).toContain('.csv');
      expect(jsonFilename).toContain('.json');
    });
  });

  describe('createCSVBlob', () => {
    it('should create Blob with correct type', () => {
      const csvData = 'ID,Name\n1,Test';
      const blob = createCSVBlob(csvData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should contain the CSV data', async () => {
      const csvData = 'ID,Name\n1,Test';
      const blob = createCSVBlob(csvData);
      const text = await blob.text();
      
      expect(text).toBe(csvData);
    });
  });

  describe('createJSONBlob', () => {
    it('should create Blob with correct type', () => {
      const jsonData = { id: 1, name: 'Test' };
      const blob = createJSONBlob(jsonData);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json;charset=utf-8;');
    });

    it('should contain formatted JSON data', async () => {
      const jsonData = { id: 1, name: 'Test' };
      const blob = createJSONBlob(jsonData);
      const text = await blob.text();
      const parsed = JSON.parse(text);
      
      expect(parsed).toEqual(jsonData);
    });
  });

  describe('CSV Format Correctness', () => {
    it('should produce valid CSV with proper delimiters', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      const lines = csv.split('\n');
      
      // Check that each line has the same number of commas
      const headerCommas = (lines[0].match(/,/g) || []).length;
      const dataCommas = (lines[1].match(/,/g) || []).length;
      
      expect(headerCommas).toBe(dataCommas);
      expect(headerCommas).toBeGreaterThan(0);
    });

    it('should not contain invalid CSV characters in data', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      
      // CSV should not have unescaped newlines in data fields
      const lines = csv.split('\n');
      const dataLines = lines.slice(1); // Skip header
      
      dataLines.forEach(line => {
        if (line.trim()) {
          expect(line).not.toMatch(/\r/);
        }
      });
    });

    it('should format numbers consistently', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      
      // Check that scientific notation is used for large numbers
      expect(csv).toMatch(/\d+\.\d+e[+-]\d+/i);
      
      // Check that fixed decimals are used for smaller numbers
      expect(csv).toMatch(/\d+\.\d{2,4}/);
    });
  });

  describe('Required Data Fields', () => {
    it('should include all required stellar property fields', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      const lines = csv.split('\n');
      const header = lines[0];
      
      // Verify all required fields are present
      const requiredFields = [
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
      ];
      
      requiredFields.forEach(field => {
        expect(header).toContain(field);
      });
    });

    it('should include all required orbital parameter fields', () => {
      const csv = exportOrbitalParametersToCSV(mockSystem, false);
      const lines = csv.split('\n');
      const header = lines[0];
      
      const requiredFields = [
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
      ];
      
      requiredFields.forEach(field => {
        expect(header).toContain(field);
      });
    });

    it('should include all required time-series fields', () => {
      const csv = exportTimeSeriesDataToCSV(mockSystem, 1e6, false);
      const lines = csv.split('\n');
      const header = lines[0];
      
      const requiredFields = [
        'Time (years)',
        'Star ID',
        'Star Name',
        'Mass (M☉)',
        'Radius (R☉)',
        'Luminosity (L☉)',
        'Temperature (K)',
        'Evolution Phase',
      ];
      
      requiredFields.forEach(field => {
        expect(header).toContain(field);
      });
    });

    it('should export data values for all fields', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      const lines = csv.split('\n');
      const dataRow = lines[1].split(',');
      
      // Verify no empty values (except potentially trailing)
      const nonEmptyValues = dataRow.filter(val => val.trim() !== '');
      expect(nonEmptyValues.length).toBeGreaterThanOrEqual(13);
    });
  });

  describe('Metadata Inclusion', () => {
    it('should include all required metadata fields', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, true);
      
      const requiredMetadata = [
        '# Stellar Evolution Simulator - Export Metadata',
        '# Export Date:',
        '# System Name:',
        '# System Age:',
        '# Initial Cloud Mass:',
        '# Initial Metallicity:',
        '# Initial Angular Momentum:',
      ];
      
      requiredMetadata.forEach(field => {
        expect(csv).toContain(field);
      });
    });

    it('should include system name in metadata', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, true);
      expect(csv).toContain('# System Name: Test System');
    });

    it('should include initial cloud parameters in metadata', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, true);
      
      expect(csv).toContain('# Initial Cloud Mass: 1.0000 M☉');
      expect(csv).toContain('# Initial Metallicity: 1.0000 Z☉');
      expect(csv).toContain('# Initial Angular Momentum:');
    });

    it('should include export timestamp in metadata', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, true);
      
      // Should contain ISO timestamp format
      expect(csv).toMatch(/# Export Date: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include time-series interval in time-series metadata', () => {
      const csv = exportTimeSeriesDataToCSV(mockSystem, 5e6, true);
      
      expect(csv).toContain('# Time Series Interval: 5.0000e+6 years');
    });

    it('should not include metadata when disabled', () => {
      const csv = exportStellarPropertiesToCSV(mockSystem, false);
      
      expect(csv).not.toContain('# Stellar Evolution Simulator');
      expect(csv).not.toContain('# Export Date:');
      expect(csv).not.toContain('# System Name:');
    });

    it('should include metadata only once in complete system export', () => {
      const csv = exportSystemToCSV(mockSystem, {
        format: ExportFormat.CSV,
        includeMetadata: true,
      });
      
      // Count occurrences of metadata header
      const matches = csv.match(/# Stellar Evolution Simulator - Export Metadata/g);
      expect(matches).toHaveLength(1);
    });
  });

  describe('Multiple Stars and Planets', () => {
    it('should export multiple stars correctly', () => {
      const multiStarSystem: StarSystem = {
        ...mockSystem,
        stars: [
          mockStar,
          { ...mockStar, id: 'star-2', name: 'Star 2', mass: 2.0 },
          { ...mockStar, id: 'star-3', name: 'Star 3', mass: 0.5 },
        ],
      };
      
      const csv = exportStellarPropertiesToCSV(multiStarSystem, false);
      const lines = csv.split('\n');
      
      // Header + 3 data rows
      expect(lines.length).toBe(4);
      expect(csv).toContain('star-1');
      expect(csv).toContain('star-2');
      expect(csv).toContain('star-3');
    });

    it('should export multiple planets correctly', () => {
      const multiPlanetSystem: StarSystem = {
        ...mockSystem,
        planets: [
          mockPlanet,
          { ...mockPlanet, id: 'planet-2', name: 'Planet 2', semiMajorAxis: 5.2 },
          { ...mockPlanet, id: 'planet-3', name: 'Planet 3', semiMajorAxis: 9.5 },
        ],
      };
      
      const csv = exportOrbitalParametersToCSV(multiPlanetSystem, false);
      const lines = csv.split('\n');
      
      // Header + 3 data rows
      expect(lines.length).toBe(4);
      expect(csv).toContain('planet-1');
      expect(csv).toContain('planet-2');
      expect(csv).toContain('planet-3');
    });
  });
});
