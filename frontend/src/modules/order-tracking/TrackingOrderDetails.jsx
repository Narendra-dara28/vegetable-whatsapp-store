import React from 'react';
import { User, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

/**
 * TrackingOrderDetails - Displays live tracking pill, order header with ID and date,
 * and customer delivery name and address.
 */
export const TrackingOrderDetails = ({ order }) => {
  if (!order) return null;

  return (
    <>
      {/* Live Indicator */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: 'var(--color-primary-light, #DCFCE7)',
          border: '1px solid var(--color-border, #BBF7D0)',
          borderRadius: 'var(--radius-badge, 9999px)',
          fontSize: 'var(--font-size-xs, 12px)',
          color: 'var(--color-primary-dark, #166534)',
          fontWeight: 'var(--font-weight-bold, 700)',
          width: 'fit-content',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--color-primary, #16A34A)',
            borderRadius: '50%',
            display: 'inline-block',
            boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.25)',
          }}
        />
        <span>Live Tracking</span>
      </div>

      {/* Order Header Card */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          borderRadius: 'var(--radius-card, 16px)',
          padding: '20px',
          border: '1px solid var(--color-border, #E5E7EB)',
          boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0,0,0,0.03))',
        }}
      >
        <div
          style={{
            paddingBottom: '14px',
            borderBottom: '1px solid var(--color-border, #E5E7EB)',
          }}
        >
          <h1 style={{ fontSize: 'var(--font-size-title-lg, 20px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
            Order #{order.id}
          </h1>
          <div style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', marginTop: '4px' }}>
            Placed on {formatDate(order.createdAt)}
          </div>
        </div>

        {/* Delivery Details */}
        <div style={{ paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-main, #1F2937)', fontWeight: 'var(--font-weight-bold, 700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
            <span>{order.customerName}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-muted, #6B7280)', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.4 }}>
            <MapPin size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{order.address}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackingOrderDetails;
