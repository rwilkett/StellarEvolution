/**
 * Toast Context
 * Provides global toast notification management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastMessage, ToastType } from '../ui/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newMessage: ToastMessage = {
      id,
      type,
      message,
      duration,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, ToastType.SUCCESS, duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, ToastType.ERROR, duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, ToastType.INFO, duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, ToastType.WARNING, duration);
  }, [showToast]);

  const handleClose = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer messages={messages} onClose={handleClose} />
    </ToastContext.Provider>
  );
};
