/**
 * Tooltip Component
 * Displays helpful tooltips for controls
 */

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = containerRect.top - tooltipRect.height - 8;
        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = containerRect.bottom + 8;
        left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = containerRect.top + (containerRect.height - tooltipRect.height) / 2;
        left = containerRect.right + 8;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '250px',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(position === 'top' && {
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '6px 6px 0 6px',
                borderColor: '#2c3e50 transparent transparent transparent',
              }),
              ...(position === 'bottom' && {
                top: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 6px 6px 6px',
                borderColor: 'transparent transparent #2c3e50 transparent',
              }),
              ...(position === 'left' && {
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 0 6px 6px',
                borderColor: 'transparent transparent transparent #2c3e50',
              }),
              ...(position === 'right' && {
                left: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 6px 6px 0',
                borderColor: 'transparent #2c3e50 transparent transparent',
              }),
            }}
          />
        </div>
      )}
    </>
  );
};
