import React from 'react';
import { MessageCircle } from 'lucide-react';
import { VENDOR_WHATSAPP_NUMBER } from '../../services/api';

/**
 * TrackingSupportCard - Help and WhatsApp contact support card for customers
 */
export const TrackingSupportCard = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '18px',
        border: '1px solid var(--color-border, #E5E7EB)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: 'var(--font-size-body-sm, 14px)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-muted, #6B7280)' }}>
        Need help with your order?
      </div>
      <a
        href={`https://wa.me/${VENDOR_WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-whatsapp, #25D366)',
          color: '#ffffff',
          minHeight: '44px',
          padding: '10px 18px',
          borderRadius: 'var(--radius-btn, 12px)',
          fontWeight: 'var(--font-weight-bold, 700)',
          fontSize: 'var(--font-size-body-sm, 14px)',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-btn-whatsapp, 0 3px 10px rgba(37, 211, 102, 0.3))',
          boxSizing: 'border-box',
        }}
      >
        <MessageCircle size={20} strokeWidth={1.75} />
        <span>Chat with Green Basket on WhatsApp</span>
      </a>
    </div>
  );
};

export default TrackingSupportCard;
