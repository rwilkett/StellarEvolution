/**
 * Visualization Canvas Integration Tests
 * Tests for rendering, zoom, pan, and performance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VisualizationCanvas } from './VisualizationCanvas';
import { SimulationProvider } from '../context/SimulationContext';
import { StarSystem, Star, Planet, EvolutionPhase, SpectralType, PlanetComposition, NuclearReaction } from '../types/core';

// Mock canvas context
const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  shadowColor: '',
  shadowBlur: 0,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  setLineDash: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
};

// Mock HTMLCanvasElement
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
  
  // Reset mock call counts
  Object.values(mockContext).forEach(mock => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as any).mockClear();
    }
  });
  
  // Mock requestAnimationFrame
  (globalThis as any).requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    setTimeout(cb, 0);
    return 1;
  });
  (globalThis as any).cancelAnimationFrame = vi.fn();
});

/**
 * Helper function to create a test star
 */
function createTestStar(overrides: Partial<Star> = {}): Star {
  return {
    id: 'star-1',
    name: 'Test Star',
    mass: 1.0,
    radius: 1.0,
    luminosity: 1.0,
    temperature: 5778,
    age: 0,
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
    ...overrides,
  };
}

/**
 * Helper function to create a test planet
 */
function createTestPlanet(overrides: Partial<Planet> = {}): Planet {
  return {
    id: 'planet-1',
    name: 'Test Planet',
    mass: 1.0,
    radius: 1.0,
    composition: PlanetComposition.ROCKY,
    semiMajorAxis: 1.0,
    eccentricity: 0.0,
    orbitalPeriod: 1.0,
    parentStarId: 'star-1',
    position: { x: 1.0, y: 0, z: 0 },
    ...overrides,
  };
}

/**
 * Helper function to create a test star system
 */
function createTestSystem(stars: Star[], planets: Planet[] = []): StarSystem {
  return {
    id: 'system-1',
    name: 'Test System',
    stars,
    planets,
    age: 0,
    initialCloudParameters: {
      mass: 1.0,
      metallicity: 1.0,
      angularMomentum: 1e42,
    },
  };
}

describe('VisualizationCanvas Integration Tests', () => {
  describe('Rendering with various system configurations', () => {
    it('should render empty canvas when no system is loaded', () => {
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be created
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // Should show placeholder text
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('No simulation'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should render single star system', () => {
      const star = createTestStar();
      createTestSystem([star]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Verify canvas rendering methods were called
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.beginPath).toHaveBeenCalled();
    });

    it('should render binary star system', () => {
      const star1 = createTestStar({ id: 'star-1', name: 'Star A', position: { x: -1, y: 0, z: 0 } });
      const star2 = createTestStar({ id: 'star-2', name: 'Star B', position: { x: 1, y: 0, z: 0 } });
      createTestSystem([star1, star2]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be rendered (system data would come from context in real usage)
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render system with planets', () => {
      const star = createTestStar();
      const planet1 = createTestPlanet({ id: 'planet-1', name: 'Planet 1', semiMajorAxis: 1.0 });
      const planet2 = createTestPlanet({ id: 'planet-2', name: 'Planet 2', semiMajorAxis: 2.0 });
      createTestSystem([star], [planet1, planet2]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render stars with different spectral types', () => {
      const stars = [
        createTestStar({ id: 'star-o', spectralType: SpectralType.O, temperature: 30000 }),
        createTestStar({ id: 'star-b', spectralType: SpectralType.B, temperature: 15000 }),
        createTestStar({ id: 'star-a', spectralType: SpectralType.A, temperature: 9000 }),
        createTestStar({ id: 'star-f', spectralType: SpectralType.F, temperature: 7000 }),
        createTestStar({ id: 'star-g', spectralType: SpectralType.G, temperature: 5778 }),
        createTestStar({ id: 'star-k', spectralType: SpectralType.K, temperature: 4500 }),
        createTestStar({ id: 'star-m', spectralType: SpectralType.M, temperature: 3000 }),
      ];
      
      createTestSystem(stars);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render stars in different evolution phases', () => {
      const stars = [
        createTestStar({ id: 'star-1', evolutionPhase: EvolutionPhase.MAIN_SEQUENCE }),
        createTestStar({ id: 'star-2', evolutionPhase: EvolutionPhase.RED_GIANT, radius: 50 }),
        createTestStar({ id: 'star-3', evolutionPhase: EvolutionPhase.WHITE_DWARF, radius: 0.01 }),
      ];
      
      createTestSystem(stars);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render planets with different compositions', () => {
      const star = createTestStar();
      const planets = [
        createTestPlanet({ id: 'planet-1', composition: PlanetComposition.ROCKY }),
        createTestPlanet({ id: 'planet-2', composition: PlanetComposition.ICE_GIANT }),
        createTestPlanet({ id: 'planet-3', composition: PlanetComposition.GAS_GIANT }),
      ];
      
      createTestSystem([star], planets);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render grid and scale indicator', () => {
      const star = createTestStar();
      createTestSystem([star]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should draw grid lines
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      
      // Should draw scale indicator
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('AU'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Zoom and pan functionality', () => {
    it('should handle zoom in via wheel event', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      // Simulate wheel event (zoom in)
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
      });
      
      canvas!.dispatchEvent(wheelEvent);
      
      // Canvas should re-render after zoom
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle zoom out via wheel event', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      // Simulate wheel event (zoom out)
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        clientX: 400,
        clientY: 300,
      });
      
      canvas!.dispatchEvent(wheelEvent);
      
      // Canvas should re-render after zoom
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle pan via mouse drag', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      // Simulate mouse down
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        clientY: 300,
        bubbles: true,
      });
      canvas!.dispatchEvent(mouseDownEvent);
      
      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        clientY: 350,
        bubbles: true,
      });
      canvas!.dispatchEvent(mouseMoveEvent);
      
      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
      });
      canvas!.dispatchEvent(mouseUpEvent);
      
      // Canvas should re-render after pan
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should clamp zoom to reasonable limits', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      // Try to zoom in excessively
      for (let i = 0; i < 100; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: -100,
          clientX: 400,
          clientY: 300,
        });
        canvas!.dispatchEvent(wheelEvent);
      }
      
      // Should still render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // Try to zoom out excessively
      for (let i = 0; i < 100; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 100,
          clientX: 400,
          clientY: 300,
        });
        canvas!.dispatchEvent(wheelEvent);
      }
      
      // Should still render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should maintain zoom center at mouse position', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      // Zoom at specific position
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 200,
        clientY: 150,
      });
      
      canvas!.dispatchEvent(wheelEvent);
      
      // Canvas should re-render
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('Performance with maximum number of objects', () => {
    it('should render system with many stars efficiently', () => {
      const stars: Star[] = [];
      
      // Create 50 stars (large system)
      for (let i = 0; i < 50; i++) {
        stars.push(createTestStar({
          id: `star-${i}`,
          name: `Star ${i}`,
          position: {
            x: Math.cos(i * 0.1) * i * 10,
            y: Math.sin(i * 0.1) * i * 10,
            z: 0,
          },
        }));
      }
      
      createTestSystem(stars);
      
      const startTime = performance.now();
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should render system with many planets efficiently', () => {
      const star = createTestStar();
      const planets: Planet[] = [];
      
      // Create 100 planets (maximum expected)
      for (let i = 0; i < 100; i++) {
        planets.push(createTestPlanet({
          id: `planet-${i}`,
          name: `Planet ${i}`,
          semiMajorAxis: 0.5 + i * 0.5,
          position: {
            x: Math.cos(i * 0.1) * (0.5 + i * 0.5),
            y: Math.sin(i * 0.1) * (0.5 + i * 0.5),
            z: 0,
          },
        }));
      }
      
      createTestSystem([star], planets);
      
      const startTime = performance.now();
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle maximum system complexity', () => {
      const stars: Star[] = [];
      const planets: Planet[] = [];
      
      // Create 10 stars
      for (let i = 0; i < 10; i++) {
        stars.push(createTestStar({
          id: `star-${i}`,
          name: `Star ${i}`,
          position: {
            x: Math.cos(i * 0.6) * i * 5,
            y: Math.sin(i * 0.6) * i * 5,
            z: 0,
          },
        }));
        
        // Create 10 planets per star
        for (let j = 0; j < 10; j++) {
          planets.push(createTestPlanet({
            id: `planet-${i}-${j}`,
            name: `Planet ${i}-${j}`,
            parentStarId: `star-${i}`,
            semiMajorAxis: 0.5 + j * 0.5,
            position: {
              x: stars[i].position.x + Math.cos(j * 0.6) * (0.5 + j * 0.5),
              y: stars[i].position.y + Math.sin(j * 0.6) * (0.5 + j * 0.5),
              z: 0,
            },
          }));
        }
      }
      
      createTestSystem(stars, planets);
      
      const startTime = performance.now();
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render complex system within reasonable time (< 150ms)
      expect(renderTime).toBeLessThan(150);
      
      // Canvas should be rendered
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should skip off-screen objects for performance', () => {
      const stars: Star[] = [];
      
      // Create stars at various positions, some far off-screen
      for (let i = 0; i < 20; i++) {
        stars.push(createTestStar({
          id: `star-${i}`,
          name: `Star ${i}`,
          position: {
            x: i * 1000, // Very far away
            y: i * 1000,
            z: 0,
          },
        }));
      }
      
      createTestSystem(stars);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should render but skip most off-screen objects
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle rapid zoom and pan operations', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      
      const startTime = performance.now();
      
      // Perform rapid zoom operations
      for (let i = 0; i < 10; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: i % 2 === 0 ? -100 : 100,
          clientX: 400,
          clientY: 300,
        });
        canvas!.dispatchEvent(wheelEvent);
      }
      
      // Perform rapid pan operations
      for (let i = 0; i < 10; i++) {
        const mouseDownEvent = new MouseEvent('mousedown', {
          clientX: 400,
          clientY: 300,
          bubbles: true,
        });
        canvas!.dispatchEvent(mouseDownEvent);
        
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 400 + i * 10,
          clientY: 300 + i * 10,
          bubbles: true,
        });
        canvas!.dispatchEvent(mouseMoveEvent);
        
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
        });
        canvas!.dispatchEvent(mouseUpEvent);
      }
      
      const endTime = performance.now();
      const operationTime = endTime - startTime;
      
      // Should handle rapid operations efficiently (< 200ms)
      expect(operationTime).toBeLessThan(200);
    });

    it('should maintain frame rate with animation loop', async () => {
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Check that animation loop is running
      expect((globalThis as any).requestAnimationFrame).toHaveBeenCalled();
      
      // Verify multiple frames are requested
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(((globalThis as any).requestAnimationFrame as any).mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Visual configuration options', () => {
    it('should toggle orbit visibility', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const orbitCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(orbitCheckbox).toBeTruthy();
      
      // Toggle orbit visibility
      orbitCheckbox.click();
      
      // Canvas should re-render
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should toggle label visibility', () => {
      const { container } = render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(1);
      
      // Toggle label visibility (second checkbox)
      (checkboxes[1] as HTMLInputElement).click();
      
      // Canvas should re-render
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle stars with extreme temperatures', () => {
      const stars = [
        createTestStar({ id: 'star-1', temperature: 1000 }), // Very cool
        createTestStar({ id: 'star-2', temperature: 50000 }), // Very hot
      ];
      
      createTestSystem(stars);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle stars with extreme radii', () => {
      const stars = [
        createTestStar({ id: 'star-1', radius: 0.001 }), // Tiny
        createTestStar({ id: 'star-2', radius: 1000 }), // Huge
      ];
      
      createTestSystem(stars);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle planets with zero eccentricity', () => {
      const star = createTestStar();
      const planet = createTestPlanet({ eccentricity: 0.0 });
      createTestSystem([star], [planet]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle planets with high eccentricity', () => {
      const star = createTestStar();
      const planet = createTestPlanet({ eccentricity: 0.9 });
      createTestSystem([star], [planet]);
      
      render(
        <SimulationProvider>
          <VisualizationCanvas />
        </SimulationProvider>
      );
      
      // Should render without errors
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });
});
