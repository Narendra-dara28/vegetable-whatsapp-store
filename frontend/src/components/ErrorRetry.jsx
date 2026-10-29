import React from 'react';
import Button from './Button';

/**
 * ErrorRetry - Shared error alert card with a retry button.
 * Used across Customer and Admin views when data fetching encounters a network or server issue.
 */
export const ErrorRetry = ({
  title = 'Unable to Load Data',
  error,
  onRetry,
  retryLabel = 'Retry',
  id,
  style = {},
}) => {
  return (
    <div
      id={id}
      style={{
        padding: '32px 20px',
        backgroundColor: 'var(--status-cancelled-bg, #FEF2F2)',
        borderRadius: 'var(--radius-card, 16px)',
        border: '1.5px solid var(--status-cancelled-border, #FECACA)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        margin: '32px auto',
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: '800',
          color: 'var(--color-text-main, #1F2937)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {error && (
        <p
          style={{
            color: 'var(--color-text-muted, #6B7280)',
            fontSize: '0.85rem',
            margin: '4px 0 0 0',
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          style={{
            minHeight: '44px',
            padding: '8px 24px',
            borderColor: 'var(--color-border, #E5E7EB)',
          }}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorRetry;
