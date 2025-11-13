/**
 * Toast Notification Component
 * Displays success/error messages to the user
 */

import React, { useEffect, useState } from 'react';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = message.duration || 3000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(message.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getBackgroundColor = () => {
    switch (message.type) {
      case ToastType.SUCCESS:
        return '#27ae60';
      case ToastType.ERROR:
        return '#e74c3c';
      case ToastType.WARNING:
        return '#f39c12';
      case ToastType.INFO:
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case ToastType.SUCCESS:
        return '✓';
      case ToastType.ERROR:
        return '✕';
      case ToastType.WARNING:
        return '⚠';
      case ToastType.INFO:
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: getBackgroundColor(),
        color: '#fff',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '10px',
        minWidth: '300px',
        maxWidth: '500px',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, fontSize: '14px' }}>
        {message.message}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(message.id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
          lineHeight: '1',
        }}
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
};
