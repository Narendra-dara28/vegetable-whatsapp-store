import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/**
 * FloatingCartBar - Floating bottom bar showing active cart item count, total price, and "View Cart" action.
 */
export const FloatingCartBar = ({
  totalItemCount = 0,
  cartTotal = 0,
  onOpenCart,
}) => {
  if (totalItemCount <= 0) return null;

  return (
    <div
      onClick={onOpenCart}
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '480px',
        zIndex: 900,
        backgroundColor: 'var(--color-primary, #16A34A)',
        backgroundImage: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
        color: '#ffffff',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '12px 18px',
        boxShadow: 'var(--shadow-modal, 0 10px 25px -4px rgba(22, 163, 74, 0.45))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        minHeight: '48px',
        boxSizing: 'border-box',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      title="Tap to review cart and order"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingCart size={22} strokeWidth={2} />
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              backgroundColor: '#ffffff',
              color: 'var(--color-primary-dark, #166534)',
              borderRadius: '9999px',
              padding: '1px 6px',
              fontSize: '0.72rem',
              fontWeight: 'var(--font-weight-bold, 700)',
              border: '2px solid var(--color-primary, #16A34A)',
            }}
          >
            {totalItemCount}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 'var(--font-size-body-sm, 14px)', fontWeight: 'var(--font-weight-bold, 700)' }}>
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
          <span style={{ margin: '0 6px', opacity: 0.7 }}>•</span>
          <span style={{ fontSize: 'var(--font-size-body-sm, 14px)', fontWeight: 'var(--font-weight-extrabold, 800)' }}>
            {formatCurrency(cartTotal)}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-btn, 12px)',
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-bold, 700)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span>View →</span>
      </div>
    </div>
  );
};

export default FloatingCartBar;
