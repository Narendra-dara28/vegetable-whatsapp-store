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
          <div
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
              flexShrink: 0,
            }}
          >
            <ShoppingBasket size={20} strokeWidth={1.75} color="#ffffff" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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

              {/* Prominent Top-Left QR Button / Badge */}
              <button
                type="button"
                onClick={onQrClick}
                title="Save / Download Store QR code to open anytime"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  fontSize: '0.70rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(16, 185, 129, 0.15)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <QrCode size={13} strokeWidth={2.2} color="#059669" />
                <span>Save QR</span>
              </button>
            </div>

            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-primary-dark, #166534)',
                fontWeight: '600',
                margin: 0,
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Farm-Fresh Vegetables & Fruits
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* QR Code Action Button for desktop / larger views */}
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
            title="Scan or download store QR code"
          >
            <QrCode size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            <span>Store QR</span>
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
              flexShrink: 0,
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
