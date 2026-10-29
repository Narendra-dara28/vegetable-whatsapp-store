import React from 'react';
import { ShoppingBasket, Package } from 'lucide-react';

/**
 * CustomerHeader - Storefront header with logo, secret admin access triggers,
 * Track Order status button with badge count, and "Open Today" store indicator.
 */
export const CustomerHeader = ({
  onLogoTap,
  onHoldStart,
  onHoldEnd,
  onTrackOrderClick,
  recentOrdersCount = 0,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border, #E5E7EB)',
        padding: '12px var(--page-padding, 16px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Title with Secret Owner Access */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={onLogoTap}
            onTouchStart={onHoldStart}
            onTouchEnd={onHoldEnd}
            onMouseDown={onHoldStart}
            onMouseUp={onHoldEnd}
            onMouseLeave={onHoldEnd}
            title="Green Basket"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-btn, 12px)',
              background: 'linear-gradient(135deg, var(--color-primary, #16a34a), var(--color-primary-dark, #166534))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              transition: 'transform 0.15s ease',
            }}
          >
            <ShoppingBasket size={20} strokeWidth={1.75} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)', lineHeight: 1.2 }}>
              Green Basket
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-primary-dark, #166534)', fontWeight: '600' }}>
              Farm-Fresh Vegetables & Fruits
            </p>
          </div>
        </div>

        {/* Header Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Track Order Button */}
          <button
            type="button"
            onClick={onTrackOrderClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--color-primary-dark, #15803d)',
              fontWeight: '700',
              padding: '6px 14px',
              borderRadius: 'var(--radius-btn, 12px)',
              backgroundColor: 'var(--color-bg-card, #ffffff)',
              border: '1px solid var(--color-border, #E5E7EB)',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            title="Track your order status"
          >
            <Package size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            <span>Track Order</span>
            {recentOrdersCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--color-primary, #16a34a)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  marginLeft: '2px',
                }}
              >
                {recentOrdersCount}
              </span>
            )}
          </button>

          {/* Clean store open indicator dot */}
          <div
            title="Store Open Today"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 6px #16a34a',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
