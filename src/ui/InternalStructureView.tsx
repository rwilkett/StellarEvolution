/**
 * Internal Structure Visualization Component
 * Displays a cross-section view of a star's internal layers
 */

import React, { useEffect, useRef } from 'react';
import { Star, EvolutionPhase } from '../types/core';

interface InternalStructureViewProps {
  star: Star;
  width?: number;
  height?: number;
}

export const InternalStructureView: React.FC<InternalStructureViewProps> = ({
  star,
  width = 300,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw internal structure
    drawInternalStructure(ctx, star, width, height);
  }, [star, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#000',
      }}
    />
  );
};

/**
 * Draw the internal structure of the star
 */
function drawInternalStructure(
  ctx: CanvasRenderingContext2D,
  star: Star,
  width: number,
  height: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 10;

  const { layerStructure, activeReactions, shellBurning } = star.internalStructure;

  // Calculate actual radii in pixels
  const coreRadiusPx = maxRadius * layerStructure.coreRadius;
  const radiativeRadiusPx = maxRadius * layerStructure.radiativeZoneRadius;
  const convectiveRadiusPx = maxRadius * layerStructure.convectiveZoneRadius;

  // Draw outer convective envelope (or atmosphere)
  if (convectiveRadiusPx > radiativeRadiusPx) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, convectiveRadiusPx, 0, 2 * Math.PI);
    ctx.fillStyle = getConvectiveZoneColor(star.evolutionPhase);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw radiative zone
  if (radiativeRadiusPx > coreRadiusPx) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiativeRadiusPx, 0, 2 * Math.PI);
    ctx.fillStyle = getRadiativeZoneColor(star.evolutionPhase);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw core
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadiusPx, 0, 2 * Math.PI);
  ctx.fillStyle = getCoreColor(star.evolutionPhase, activeReactions.coreReaction);
  ctx.fill();
  
  // Add glow effect for active core
  if (activeReactions.coreReaction !== 'none') {
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreRadiusPx
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw shell burning indicators
  if (shellBurning.hydrogenShell) {
    drawShellBurning(ctx, centerX, centerY, coreRadiusPx * 1.2, '#ffff00');
  }
  if (shellBurning.heliumShell) {
    drawShellBurning(ctx, centerX, centerY, coreRadiusPx * 1.5, '#ff9900');
  }
  if (shellBurning.carbonShell) {
    drawShellBurning(ctx, centerX, centerY, coreRadiusPx * 1.8, '#ff6600');
  }

  // Add layer labels
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 4;

  // Core label
  if (coreRadiusPx > 20) {
    ctx.fillText('Core', centerX, centerY + 5);
  }

  // Radiative zone label
  if (radiativeRadiusPx > coreRadiusPx + 20) {
    const radZoneY = centerY - (coreRadiusPx + radiativeRadiusPx) / 2;
    ctx.fillText('Radiative', centerX, radZoneY);
  }

  // Convective zone label
  if (convectiveRadiusPx > radiativeRadiusPx + 20) {
    const convZoneY = centerY - (radiativeRadiusPx + convectiveRadiusPx) / 2;
    ctx.fillText('Convective', centerX, convZoneY);
  }

  ctx.shadowBlur = 0;
}

/**
 * Draw shell burning indicator
 */
function drawShellBurning(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string
): void {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Get core color based on phase and active reaction
 */
function getCoreColor(phase: EvolutionPhase, _reaction: string): string {
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      return 'rgba(255, 100, 0, 0.6)';
    case EvolutionPhase.MAIN_SEQUENCE:
      return 'rgba(255, 255, 100, 0.9)'; // Bright yellow for hydrogen burning
    case EvolutionPhase.RED_GIANT:
      return 'rgba(200, 50, 50, 0.7)'; // Dim red for inert core
    case EvolutionPhase.HORIZONTAL_BRANCH:
      return 'rgba(255, 200, 100, 0.9)'; // Bright for helium burning
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      return 'rgba(255, 150, 50, 0.8)';
    case EvolutionPhase.WHITE_DWARF:
      return 'rgba(200, 200, 255, 0.9)'; // Blue-white
    case EvolutionPhase.NEUTRON_STAR:
      return 'rgba(150, 150, 255, 0.95)';
    case EvolutionPhase.BLACK_HOLE:
      return 'rgba(0, 0, 0, 1.0)';
    default:
      return 'rgba(255, 200, 100, 0.8)';
  }
}

/**
 * Get radiative zone color based on phase
 */
function getRadiativeZoneColor(phase: EvolutionPhase): string {
  switch (phase) {
    case EvolutionPhase.MAIN_SEQUENCE:
      return 'rgba(255, 150, 50, 0.5)';
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      return 'rgba(255, 100, 50, 0.4)';
    default:
      return 'rgba(255, 120, 50, 0.45)';
  }
}

/**
 * Get convective zone color based on phase
 */
function getConvectiveZoneColor(phase: EvolutionPhase): string {
  switch (phase) {
    case EvolutionPhase.PROTOSTAR:
      return 'rgba(200, 50, 0, 0.4)';
    case EvolutionPhase.MAIN_SEQUENCE:
      return 'rgba(200, 100, 50, 0.3)';
    case EvolutionPhase.RED_GIANT:
    case EvolutionPhase.ASYMPTOTIC_GIANT:
      return 'rgba(150, 50, 30, 0.25)'; // Dim outer layers
    default:
      return 'rgba(180, 80, 40, 0.3)';
  }
}
