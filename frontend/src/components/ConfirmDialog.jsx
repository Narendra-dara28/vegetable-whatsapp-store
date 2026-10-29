import React, { useEffect } from 'react';
import Button from './Button';

/**
 * Shared ConfirmDialog Component
 * - Centered card, max width 360px
 * - Dimmed background
 * - Title + one short sentence
 * - Main action button on top (full width, 44px min-height)
 * - Cancel button below (full width, 44px min-height)
 * - Dangerous actions are red, normal actions green
 * - Button text says exactly what happens (never just "OK")
 */
export const ConfirmDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
  isLoading = false,
  zIndex = 2000,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';
  // Enforce never showing just "OK"
  const safeConfirmText = confirmText && confirmText.trim().toLowerCase() === 'ok'
    ? (isDanger ? 'Yes, Proceed' : 'Yes, Confirm')
    : confirmText;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--page-padding, 16px)',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          borderRadius: 'var(--radius-card, 16px)',
          maxWidth: '360px',
          width: '100%',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-modal, 0 10px 30px rgba(0,0,0,0.12))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-size-title, 18px)',
            fontWeight: 'var(--font-weight-heavy, 800)',
            color: 'var(--color-text-main, #1F2937)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* One short sentence */}
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-body-sm, 14px)',
            color: 'var(--color-text-muted, #6B7280)',
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>

        {/* Action Buttons: Main Action on TOP, Cancel BELOW */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '12px',
          }}
        >
          {/* Main Action on TOP (full width) */}
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            fullWidth
            isLoading={isLoading}
            onClick={onConfirm}
            style={{
              minHeight: '44px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-bold, 700)',
              borderRadius: 'var(--radius-btn, 12px)',
            }}
          >
            {safeConfirmText}
          </Button>

          {/* Cancel Button BELOW (full width) */}
          <Button
            variant="outline"
            fullWidth
            disabled={isLoading}
            onClick={onCancel}
            style={{
              minHeight: '44px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              borderRadius: 'var(--radius-btn, 12px)',
              borderColor: 'var(--color-border, #E5E7EB)',
              color: 'var(--color-text-muted, #6B7280)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
