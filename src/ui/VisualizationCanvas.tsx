/**
 * Visualization Canvas Component
 * Renders the star system with stars, orbits, and planets
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Vector2 } from '../types/core';

interface VisualizationConfig {
  scale: number;           // AU per pixel
  centerPosition: Vector2; // Center of view in AU
  showOrbits: boolean;
  showLabels: boolean;
  showInternalStructure: boolean;
}

export const VisualizationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { system } = useSimulation();
  
  // Animation state
  const animationFrameRef = useRef<number | null>(null);
  
  // Visualization configuration state
  const [config, setConfig] = useState<VisualizationConfig>({
    scale: 0.05,           // 0.05 AU per pixel (20 pixels per AU)
    centerPosition: { x: 0, y: 0 },
    showOrbits: true,
    showLabels: true,
    showInternalStructure: true, // Default to showing internal structure
  });
  
  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Vector2>({ x: 0, y: 0 });

  /**
   * Convert astronomical units to canvas pixel coordinates
   */
  const auToPixels = useCallback((auPosition: Vector2, canvasWidth: number, canvasHeight: number): Vector2 => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Calculate offset from center in AU
    const offsetX = auPosition.x - config.centerPosition.x;
    const offsetY = auPosition.y - config.centerPosition.y;
    
    // Convert to pixels (flip Y axis for screen coordinates)
    return {
      x: centerX + offsetX / config.scale,
      y: centerY - offsetY / config.scale, // Flip Y
    };
  }, [config.scale, config.centerPosition]);

  /**
   * Convert canvas pixel coordinates to astronomical units
   */
  const pixelsToAu = useCallback((pixelPosition: Vector2, canvasWidth: number, canvasHeight: number): Vector2 => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Calculate offset from center in pixels
    const offsetX = pixelPosition.x - centerX;
    const offsetY = centerY - pixelPosition.y; // Flip Y back
    
    // Convert to AU
    return {
      x: config.centerPosition.x + offsetX * config.scale,
      y: config.centerPosition.y + offsetY * config.scale,
    };
  }, [config.scale, config.centerPosition]);

  /**
   * Handle mouse wheel for zooming
   */
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Get mouse position in AU before zoom
    const mouseAuBefore = pixelsToAu({ x: mouseX, y: mouseY }, canvas.width, canvas.height);
    
    // Calculate zoom factor
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    const newScale = config.scale * zoomFactor;
    
    // Clamp scale to reasonable values
    const clampedScale = Math.max(0.001, Math.min(10, newScale));
    
    // Update scale temporarily to calculate new center
    const tempConfig = { ...config, scale: clampedScale };
    
    // Get mouse position in AU after zoom (with old center)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offsetX = mouseX - centerX;
    const offsetY = centerY - mouseY;
    const mouseAuAfter = {
      x: config.centerPosition.x + offsetX * clampedScale,
      y: config.centerPosition.y + offsetY * clampedScale,
    };
    
    // Adjust center to keep mouse position fixed
    const centerAdjustment = {
      x: mouseAuBefore.x - mouseAuAfter.x,
      y: mouseAuBefore.y - mouseAuAfter.y,
    };
    
    setConfig({
      ...tempConfig,
      centerPosition: {
        x: config.centerPosition.x + centerAdjustment.x,
        y: config.centerPosition.y + centerAdjustment.y,
      },
    });
  }, [config, pixelsToAu]);

  /**
   * Handle mouse down for panning
   */
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: event.clientX, y: event.clientY });
  }, []);

  /**
   * Handle mouse move for panning
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning) return;
    
    const deltaX = event.clientX - panStart.x;
    const deltaY = event.clientY - panStart.y;
    
    // Convert pixel delta to AU delta
    const auDeltaX = -deltaX * config.scale;
    const auDeltaY = deltaY * config.scale; // Flip Y
    
    setConfig(prev => ({
      ...prev,
      centerPosition: {
        x: prev.centerPosition.x + auDeltaX,
        y: prev.centerPosition.y + auDeltaY,
      },
    }));
    
    setPanStart({ x: event.clientX, y: event.clientY });
  }, [isPanning, panStart, config.scale]);

  /**
   * Handle mouse up to stop panning
   */
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  /**
   * Calculate star color based on temperature (blackbody radiation)
   * Uses Wien's displacement law and approximations
   */
  const getStarColor = (temperature: number): string => {
    // Clamp temperature to reasonable range
    const temp = Math.max(1000, Math.min(50000, temperature));
    
    // Approximate RGB values based on temperature
    // This is a simplified model of blackbody radiation
    let r: number, g: number, b: number;
    
    if (temp < 6600) {
      // Red component
      r = 255;
      
      // Green component
      if (temp < 1000) {
        g = 0;
      } else {
        g = 99.4708025861 * Math.log(temp / 100) - 161.1195681661;
        g = Math.max(0, Math.min(255, g));
      }
      
      // Blue component
      if (temp < 2000) {
        b = 0;
      } else {
        b = 138.5177312231 * Math.log(temp / 100 - 10) - 305.0447927307;
        b = Math.max(0, Math.min(255, b));
      }
    } else {
      // Red component
      r = 329.698727446 * Math.pow(temp / 100 - 60, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
      
      // Green component
      g = 288.1221695283 * Math.pow(temp / 100 - 60, -0.0755148492);
      g = Math.max(0, Math.min(255, g));
      
      // Blue component
      b = 255;
    }
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  /**
   * Calculate display radius for a star using logarithmic scaling
   * This makes both small and large stars visible
   */
  const getStarDisplayRadius = (radiusSolarRadii: number): number => {
    // Base size in pixels
    const baseSize = 3;
    
    // Logarithmic scaling to make size differences visible
    // but not overwhelming
    const logRadius = Math.log10(Math.max(0.1, radiusSolarRadii));
    const scaledRadius = baseSize + logRadius * 8;
    
    return Math.max(2, Math.min(50, scaledRadius));
  };

  /**
   * Render an elliptical orbit
   */
  const renderOrbit = (ctx: CanvasRenderingContext2D, planet: any, system: any, width: number, height: number) => {
    // Find parent star
    const parentStar = system.stars.find((s: any) => s.id === planet.parentStarId);
    if (!parentStar) return;
    
    // Convert parent star position to canvas coordinates
    const centerPos = auToPixels({ x: parentStar.position.x, y: parentStar.position.y }, width, height);
    
    // Calculate ellipse parameters in pixels
    const a = planet.semiMajorAxis / config.scale; // Semi-major axis in pixels
    const e = planet.eccentricity;
    const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
    
    // Draw ellipse
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.ellipse(centerPos.x, centerPos.y, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.setLineDash([]);
  };

  /**
   * Get planet color based on composition
   */
  const getPlanetColor = (composition: string): string => {
    switch (composition) {
      case 'rocky':
        return '#8B7355'; // Brown/tan
      case 'ice_giant':
        return '#4A90E2'; // Blue
      case 'gas_giant':
        return '#E8B86D'; // Orange/tan
      default:
        return '#888';
    }
  };

  /**
   * Render a single planet
   */
  const renderPlanet = (ctx: CanvasRenderingContext2D, planet: any, width: number, height: number) => {
    // Convert planet position to canvas coordinates
    const position = auToPixels({ x: planet.position.x, y: planet.position.y }, width, height);
    
    // Check if planet is visible on canvas
    if (position.x < -50 || position.x > width + 50 || 
        position.y < -50 || position.y > height + 50) {
      return; // Skip rendering if off-screen
    }
    
    // Calculate display radius (planets are much smaller than stars)
    // Use logarithmic scaling but with smaller base size
    const logRadius = Math.log10(Math.max(0.1, planet.radius));
    const displayRadius = Math.max(2, 2 + logRadius * 2);
    
    // Get planet color
    const color = getPlanetColor(planet.composition);
    
    // Draw planet
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, displayRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw subtle highlight
    const gradient = ctx.createRadialGradient(
      position.x - displayRadius * 0.3,
      position.y - displayRadius * 0.3,
      0,
      position.x,
      position.y,
      displayRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, displayRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label if enabled and planet is large enough
    if (config.showLabels && displayRadius > 3) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 2;
      
      const labelX = position.x + displayRadius + 5;
      const labelY = position.y;
      
      // Planet name
      ctx.fillText(planet.name, labelX, labelY - 8);
      
      // Planet properties
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${planet.mass.toFixed(1)} M⊕ • ${planet.semiMajorAxis.toFixed(2)} AU`, labelX, labelY + 4);
      
      ctx.shadowBlur = 0;
    }
  };

  /**
   * Render a single star
   */
  const renderStar = (ctx: CanvasRenderingContext2D, star: any, width: number, height: number) => {
    // Convert star position to canvas coordinates
    const position = auToPixels({ x: star.position.x, y: star.position.y }, width, height);
    
    // Check if star is visible on canvas
    if (position.x < -100 || position.x > width + 100 || 
        position.y < -100 || position.y > height + 100) {
      return; // Skip rendering if off-screen
    }
    
    // Calculate display radius
    const displayRadius = getStarDisplayRadius(star.radius);
    
    // Get star color based on temperature
    const color = getStarColor(star.temperature);
    
    // Draw star glow (outer halo)
    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, displayRadius * 2.5
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color.replace('rgb', 'rgba').replace(')', ', 0.3)'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, displayRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw star core
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, displayRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bright center
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(position.x, position.y, displayRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label if enabled
    if (config.showLabels) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      
      const labelX = position.x + displayRadius + 8;
      const labelY = position.y;
      
      // Star name
      ctx.fillText(star.name, labelX, labelY - 15);
      
      // Star properties
      ctx.font = '10px system-ui';
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${star.spectralType} • ${star.evolutionPhase}`, labelX, labelY);
      ctx.fillText(`${star.mass.toFixed(2)} M☉ • ${star.temperature.toFixed(0)} K`, labelX, labelY + 12);
      
      ctx.shadowBlur = 0;
    }
  };

  /**
   * Render the canvas
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw scale indicator
    drawScaleIndicator(ctx, canvas.width, canvas.height);
    
    if (!system) {
      // Draw placeholder text
      ctx.fillStyle = '#666';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No simulation loaded', canvas.width / 2, canvas.height / 2);
      ctx.fillText('Create a simulation to begin', canvas.width / 2, canvas.height / 2 + 25);
      return;
    }
    
    // Draw grid for reference
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Render orbits if enabled
    if (config.showOrbits) {
      system.planets.forEach(planet => {
        renderOrbit(ctx, planet, system, canvas.width, canvas.height);
      });
    }
    
    // Render planets
    system.planets.forEach(planet => {
      renderPlanet(ctx, planet, canvas.width, canvas.height);
    });
    
    // Render stars (on top of planets)
    system.stars.forEach(star => {
      renderStar(ctx, star, canvas.width, canvas.height);
    });
  }, [system, config, auToPixels]);

  /**
   * Draw grid for reference
   */
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    
    // Calculate grid spacing in AU (round to nice numbers)
    const gridSpacingAU = Math.pow(10, Math.floor(Math.log10(config.scale * 100)));
    const gridSpacingPixels = gridSpacingAU / config.scale;
    
    // Draw vertical lines
    const startX = (config.centerPosition.x % gridSpacingAU) / config.scale;
    for (let x = width / 2 + startX; x < width; x += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let x = width / 2 + startX - gridSpacingPixels; x > 0; x -= gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    const startY = (config.centerPosition.y % gridSpacingAU) / config.scale;
    for (let y = height / 2 - startY; y < height; y += gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let y = height / 2 - startY - gridSpacingPixels; y > 0; y -= gridSpacingPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw center crosshair
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    const centerPixel = auToPixels({ x: 0, y: 0 }, width, height);
    ctx.beginPath();
    ctx.moveTo(centerPixel.x - 10, centerPixel.y);
    ctx.lineTo(centerPixel.x + 10, centerPixel.y);
    ctx.moveTo(centerPixel.x, centerPixel.y - 10);
    ctx.lineTo(centerPixel.x, centerPixel.y + 10);
    ctx.stroke();
  };

  /**
   * Draw scale indicator
   */
  const drawScaleIndicator = (ctx: CanvasRenderingContext2D, _width: number, height: number) => {
    // Calculate a nice round number for scale bar
    const scaleBarAU = Math.pow(10, Math.floor(Math.log10(config.scale * 100)));
    const scaleBarPixels = scaleBarAU / config.scale;
    
    // Draw scale bar
    const barX = 20;
    const barY = height - 30;
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + scaleBarPixels, barY);
    ctx.moveTo(barX, barY - 5);
    ctx.lineTo(barX, barY + 5);
    ctx.moveTo(barX + scaleBarPixels, barY - 5);
    ctx.lineTo(barX + scaleBarPixels, barY + 5);
    ctx.stroke();
    
    // Draw scale label
    ctx.fillStyle = '#fff';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${scaleBarAU} AU`, barX + scaleBarPixels / 2, barY + 8);
  };

  /**
   * Setup canvas size
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      render();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [render]);

  /**
   * Setup wheel event listener
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  /**
   * Animation loop for rendering only (simulation updates handled by SimulationControls)
   */
  const animate = useCallback(() => {
    // Render the current state
    render();
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [render]);

  /**
   * Start animation loop for smooth rendering
   */
  useEffect(() => {
    // Always run animation loop for smooth rendering
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [animate]);

  /**
   * Render on config changes
   */
  useEffect(() => {
    render();
  }, [render, config]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        backgroundColor: '#000',
        borderRadius: '8px',
        marginBottom: '20px',
        position: 'relative',
        cursor: isPanning ? 'grabbing' : 'grab',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      
      {/* Controls overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '12px',
      }}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={config.showOrbits}
              onChange={(e) => setConfig(prev => ({ ...prev, showOrbits: e.target.checked }))}
            />
            {' '}Show Orbits
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={config.showLabels}
              onChange={(e) => setConfig(prev => ({ ...prev, showLabels: e.target.checked }))}
            />
            {' '}Show Labels
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={config.showInternalStructure}
              onChange={(e) => setConfig(prev => ({ ...prev, showInternalStructure: e.target.checked }))}
            />
            {' '}Show Internal Structure
          </label>
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#aaa' }}>
          Scroll to zoom • Drag to pan
        </div>
      </div>
    </div>
  );
};
