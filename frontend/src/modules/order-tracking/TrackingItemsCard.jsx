import React from 'react';

/**
 * TrackingItemsCard - Displays list of vegetables ordered with quantities, prices, and total bill
 */
export const TrackingItemsCard = ({ items = [], estimatedTotal = 0 }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '20px',
        border: '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0,0,0,0.03))',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-heavy, 800)',
          color: 'var(--color-text-muted, #6B7280)',
          marginBottom: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Vegetables In Order ({items.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--color-border, #E5E7EB)',
            }}
          >
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-text-main, #1F2937)', fontSize: 'var(--font-size-body, 15px)' }}>
                {item.productName}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)' }}>
                {item.quantity} × {item.unit} @ ₹{item.unitPrice}
              </div>
            </div>
            <div style={{ fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-primary-dark, #166534)', fontSize: 'var(--font-size-body-lg, 16px)' }}>
              ₹{item.subtotal}
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '2px dashed var(--color-border, #E5E7EB)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-size-body-sm, 14px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)' }}>
            Total Amount
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-size-xl, 24px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-primary-dark, #166534)' }}>
          ₹{estimatedTotal}
        </div>
      </div>
    </div>
  );
};

export default TrackingItemsCard;
