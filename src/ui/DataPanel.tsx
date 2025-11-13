/**
 * Data Panel Component
 * Container for displaying simulation data and information
 */

import React from 'react';

interface DataPanelProps {
  children: React.ReactNode;
}

export const DataPanel: React.FC<DataPanelProps> = ({ children }) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '20px',
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>System Data</h2>
      {children}
    </div>
  );
};
