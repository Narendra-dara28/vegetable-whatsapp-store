import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import Button from '../../components/Button';

/**
 * TrackingHeader - Brand header with back navigation to store or admin orders
 */
export const TrackingHeader = ({ isAdmin = false, onBackToOrders }) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderBottom: '1px solid var(--color-border, #E5E7EB)',
        padding: '12px var(--page-padding, 16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-soft, 0 1px 4px rgba(0,0,0,0.03))',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <Link
          to={isAdmin ? '/admin/orders' : '/'}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-btn-primary, 0 2px 8px rgba(22, 163, 74, 0.3))',
              flexShrink: 0,
            }}
          >
            <ShoppingBasket size={20} strokeWidth={1.75} />
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--font-size-title, 18px)',
                fontWeight: 'var(--font-weight-heavy, 800)',
                color: 'var(--color-text-main, #1F2937)',
                lineHeight: 1.2,
              }}
            >
              Green Basket
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--font-size-xs, 12px)',
                color: 'var(--color-primary, #16A34A)',
                fontWeight: 'var(--font-weight-semibold, 600)',
              }}
            >
              {isAdmin ? 'Admin Order Tracking' : 'Farm-Fresh Vegetables'}
            </span>
          </div>
        </Link>

        {isAdmin ? (
          <Button
            variant="outline"
            onClick={onBackToOrders}
            style={{
              minHeight: '44px',
              padding: '8px 14px',
              fontSize: 'var(--font-size-body-sm, 14px)',
              borderRadius: 'var(--radius-btn, 12px)',
            }}
          >
            <span>←</span>
            <span>Back to Orders</span>
          </Button>
        ) : (
          <Link
            to="/"
            style={{
              fontSize: 'var(--font-size-body-sm, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-primary-dark, #166534)',
              backgroundColor: 'var(--color-primary-light, #DCFCE7)',
              border: '1px solid var(--color-border, #E5E7EB)',
              minHeight: '44px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-btn, 12px)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease',
            }}
          >
            <span>←</span>
            <span>Back to Store</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default TrackingHeader;
