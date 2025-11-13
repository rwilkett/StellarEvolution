/**
 * Control Panel Component
 * Container for simulation input controls
 */

import React from 'react';

interface ControlPanelProps {
  children: React.ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ children }) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '20px',
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Control Panel</h2>
      {children}
    </div>
  );
};
