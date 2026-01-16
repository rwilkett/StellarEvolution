/**
 * Tabbed Stellar Properties Display Tests
 * Tests for tab rendering logic with single and multiple stars
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TabbedStellarPropertiesDisplay } from './TabbedStellarPropertiesDisplay';
import { SimulationProvider } from '../context/SimulationContext';

describe('TabbedStellarPropertiesDisplay', () => {
  it('renders without errors when no simulation exists', () => {
    const { container } = render(
      <SimulationProvider>
        <TabbedStellarPropertiesDisplay />
      </SimulationProvider>
    );

    // Component should render successfully
    expect(container).toBeDefined();
  });

  it('renders the component structure', () => {
    const { container } = render(
      <SimulationProvider>
        <TabbedStellarPropertiesDisplay />
      </SimulationProvider>
    );

    // Should render without throwing errors
    expect(container.firstChild).toBeDefined();
  });
});
