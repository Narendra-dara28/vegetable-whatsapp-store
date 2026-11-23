import React from 'react';
import { ShoppingBasket, Package, QrCode } from 'lucide-react';

/**
 * CustomerHeader - Storefront header with logo, secret admin access triggers,
 * Store QR scanner modal trigger, Track Order status button, and "Open Today" indicator.
 */
export const CustomerHeader = ({
  onLogoTap,
  onHoldStart,
  onHoldEnd,
  onTrackOrderClick,
  onQrClick,
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
        padding: '10px var(--page-padding, 16px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Brand Logo & Title with Secret Owner Access & QR Shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <img
            src="/favicon.svg"
            alt="Green Basket Logo"
            onClick={onLogoTap}
            onTouchStart={onHoldStart}
            onTouchEnd={onHoldEnd}
            onMouseDown={onHoldStart}
            onMouseUp={onHoldEnd}
            onMouseLeave={onHoldEnd}
            title="Green Basket (Triple tap for owner login)"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              transition: 'transform 0.15s ease',
              flexShrink: 0,
              display: 'block',
            }}
          />

          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1.05rem',
                fontWeight: '800',
                color: 'var(--color-text-main, #1F2937)',
                lineHeight: 1.2,
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Green Basket
            </h1>

            <p
              style={{
                fontSize: '0.70rem',
                color: 'var(--color-primary-dark, #166534)',
                fontWeight: '600',
                margin: 0,
                marginTop: '2px',
                lineHeight: 1.25,
              }}
            >
              Farm-Fresh Vegetables & Fruits
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* QR Code Action Button */}
          <button
            type="button"
            onClick={onQrClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--color-primary-dark, #15803d)',
              fontWeight: '700',
              padding: '6px 12px',
              borderRadius: 'var(--radius-btn, 12px)',
              backgroundColor: 'var(--color-bg-card, #ffffff)',
              border: '1px solid var(--color-border, #E5E7EB)',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              cursor: 'pointer',
              minHeight: '40px',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            title="Scan or download QR code"
          >
            <QrCode size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            <span>QR</span>
          </button>

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
              padding: '6px 12px',
              borderRadius: 'var(--radius-btn, 12px)',
              backgroundColor: 'var(--color-bg-card, #ffffff)',
              border: '1px solid var(--color-border, #E5E7EB)',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              cursor: 'pointer',
              minHeight: '40px',
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
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
