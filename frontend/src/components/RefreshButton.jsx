import React from 'react';
import { RotateCw } from 'lucide-react';
import Button from './Button';

/**
 * RefreshButton - Unified refresh action button with responsive text and loading animation
 */
export const RefreshButton = ({
  onClick,
  loading = false,
  label = 'Refresh Orders',
  title = 'Refresh Orders',
  id = 'refresh-orders-btn',
  style = {},
  className = '',
  ...props
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      id={id}
      title={title}
      aria-label={title}
      className={`refresh-orders-btn ${className}`}
      style={{
        padding: '8px 16px',
        fontSize: '0.84rem',
        fontWeight: '700',
        minHeight: '44px',
        height: '44px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
      {...props}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <RotateCw
          size={16}
          strokeWidth={2.2}
          style={{
            flexShrink: 0,
            display: 'inline-block',
            transition: 'transform 0.5s ease',
            animation: loading ? 'spin 1s linear infinite' : 'none',
          }}
        />
        <span className="refresh-btn-text" style={{ lineHeight: 1 }}>
          {label}
        </span>
      </span>
    </Button>
  );
};

export default RefreshButton;
