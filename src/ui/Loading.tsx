/**
 * Loading Component
 * Displays loading indicators for long operations
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  color = '#3498db' 
}) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${size / 10}px solid rgba(0, 0, 0, 0.1)`,
        borderTop: `${size / 10}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9998,
      }}
    >
      <LoadingSpinner size={60} color="#fff" />
      <div
        style={{
          marginTop: '20px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {message}
      </div>
    </div>
  );
};

// Add keyframes animation to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
