import React from 'react';
import Button from './Button';

/**
 * EmptyState - Shared empty state card across customer and admin views.
 * Displays a soft tinted circular icon, bold heading, helper description, and optional action button.
 */
export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  id,
  style = {},
}) => {
  return (
    <div
      id={id}
      style={{
        textAlign: 'center',
        padding: '56px 20px',
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        border: '1px dashed var(--color-border, #E5E7EB)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light, #DCFCE7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary, #16A34A)',
            marginBottom: '4px',
          }}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: 'var(--color-text-main, #1F2937)',
            margin: 0,
          }}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted, #6B7280)',
            margin: 0,
            maxWidth: '340px',
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          style={{ minHeight: '44px', padding: '8px 24px', marginTop: '6px' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
