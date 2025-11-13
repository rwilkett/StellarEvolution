/**
 * Main Application Component
 * Sets up the application shell with responsive layout
 */

import { SimulationProvider } from './context/SimulationContext';
import { ToastProvider } from './context/ToastContext';
import { MenuBar } from './ui/MenuBar';
import { ControlPanel } from './ui/ControlPanel';
import { VisualizationCanvas } from './ui/VisualizationCanvas';
import { DataPanel } from './ui/DataPanel';
import { CloudParametersInput } from './ui/CloudParametersInput';
import { SimulationControls } from './ui/SimulationControls';
import { TimelineDisplay } from './ui/TimelineDisplay';
import { StellarPropertiesDisplay } from './ui/StellarPropertiesDisplay';
import { SystemOverview } from './ui/SystemOverview';

function App() {
  return (
    <ToastProvider>
      <SimulationProvider>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <MenuBar />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '20px',
        }}>
          <div>
            <ControlPanel>
              <CloudParametersInput />
              <SimulationControls />
            </ControlPanel>
          </div>
          
          <div>
            <VisualizationCanvas />
            <DataPanel>
              <div style={{ marginBottom: '20px' }}>
                <SystemOverview />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <StellarPropertiesDisplay />
              </div>
              <TimelineDisplay />
            </DataPanel>
          </div>
        </div>
      </div>
      </SimulationProvider>
    </ToastProvider>
  );
}

export default App;
