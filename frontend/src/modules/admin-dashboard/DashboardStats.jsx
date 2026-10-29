import React from 'react';
import { Package, Pencil } from 'lucide-react';

/**
 * DashboardStats - Renders inventory item totals, in-stock count, out-of-stock count,
 * and unsaved price changes badge.
 */
export const DashboardStats = ({
  totalItems = 0,
  inStockCount = 0,
  outOfStockCount = 0,
  modifiedCount = 0,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
          Price &amp; Inventory
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #6B7280)', margin: '2px 0 0 0' }}>
          Update daily mandi rates and toggle sold-out items
        </p>
      </div>

      {/* Summary Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        {/* Total Items Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-bg-page, #F8FAF5)',
            border: '1px solid var(--color-border, #E5E7EB)',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--color-text-main, #1F2937)',
          }}
        >
          <Package size={14} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
          <span>Total: {totalItems}</span>
        </div>

        {/* In Stock Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--stock-in-bg, #DCFCE7)',
            border: '1px solid var(--stock-in-border, #BBF7D0)',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--stock-in-text, #166534)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #16A34A)' }} />
          <span>In Stock: {inStockCount}</span>
        </div>

        {/* Out of Stock Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--stock-out-bg, #FEE2E2)',
            border: '1px solid var(--stock-out-border, #FECACA)',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--stock-out-text, #991B1B)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--status-cancelled, #DC2626)' }} />
          <span>Out of Stock: {outOfStockCount}</span>
        </div>

        {modifiedCount > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-accent-light, #FFEDD5)',
              border: '1px solid #fed7aa',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--color-accent, #F97316)',
              animation: 'pulseGlow 2s infinite',
            }}
          >
            <Pencil size={14} strokeWidth={1.75} />
            <span>{modifiedCount} Unsaved Changes</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
