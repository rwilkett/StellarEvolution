/**
 * Menu Bar Component
 * Top navigation and menu options
 */

import React, { useState } from 'react';
import { SaveLoadDialog } from './SaveLoadDialog';
import { ExportDialog } from './ExportDialog';

export const MenuBar: React.FC = () => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <>
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#2c3e50',
        color: '#fff',
        marginBottom: '20px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Stellar Evolution Simulator</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setSaveDialogOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#34495e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6278'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
          >
            Save
          </button>
          <button
            onClick={() => setLoadDialogOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#34495e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6278'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
          >
            Load
          </button>
          <button
            onClick={() => setExportDialogOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#34495e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6278'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
          >
            Export
          </button>
        </div>
      </div>

      <SaveLoadDialog
        isOpen={saveDialogOpen}
        mode="save"
        onClose={() => setSaveDialogOpen(false)}
      />

      <SaveLoadDialog
        isOpen={loadDialogOpen}
        mode="load"
        onClose={() => setLoadDialogOpen(false)}
      />

      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </>
  );
};
