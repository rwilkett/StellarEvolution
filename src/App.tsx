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
import { TabbedStellarPropertiesDisplay } from './ui/TabbedStellarPropertiesDisplay';
import { SystemOverview } from './ui/SystemOverview';
import { InternalStructureView } from './ui/InternalStructureView';
import { NuclearSynthesisPanel } from './ui/NuclearSynthesisPanel';
import { InternalStructureInfo } from './ui/InternalStructureInfo';
import { useSimulation } from './context/SimulationContext';

function AppContent() {
  const { system } = useSimulation();
  const primaryStar = system?.stars[0];

  return (
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
          
          {/* Internal Structure Visualization */}
          {primaryStar && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Internal Structure</h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <InternalStructureView star={primaryStar} width={280} height={280} />
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                Cross-section view of stellar layers
              </div>
            </div>
          )}
          
          {/* Nuclear Synthesis Panel */}
          {primaryStar && (
            <NuclearSynthesisPanel star={primaryStar} />
          )}
        </div>
        
        <div>
          <VisualizationCanvas />
          <DataPanel>
            <div style={{ marginBottom: '20px' }}>
              <SystemOverview />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <TabbedStellarPropertiesDisplay />
            </div>
            {primaryStar && (
              <div style={{ marginBottom: '20px' }}>
                <InternalStructureInfo star={primaryStar} />
              </div>
            )}
            <TimelineDisplay />
          </DataPanel>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <SimulationProvider>
        <AppContent />
      </SimulationProvider>
    </ToastProvider>
  );
}

export default App;
