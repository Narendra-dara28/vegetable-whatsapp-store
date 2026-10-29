import React from 'react';
import { Truck, MapPin } from 'lucide-react';

/**
 * RouteBanner - Displays today's delivery route message and live delivery van location link
 */
export const RouteBanner = ({
  routeText,
  hasLiveLocation = false,
  googleMapsUrl = '',
}) => {
  if (!routeText) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-primary-light, #DCFCE7)',
        border: '1px solid var(--color-border, #BBF7D0)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: '220px' }}>
        <div style={{ color: 'var(--color-primary-dark, #166534)', marginTop: '2px' }}>
          <Truck size={20} strokeWidth={1.75} />
        </div>
        <div>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs, 12px)', fontWeight: '800', color: 'var(--color-primary-dark, #166534)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {hasLiveLocation ? "Today's Route & Van Live GPS" : "Today's Van Route"}
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-main, #1F2937)', fontWeight: '700', marginTop: '2px', marginBottom: 0, lineHeight: 1.35 }}>
            {routeText}
          </p>
        </div>
      </div>

      {hasLiveLocation && googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-primary, #16A34A)',
            color: '#ffffff',
            minHeight: '44px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-btn, 12px)',
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: '700',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(21, 128, 61, 0.15)',
            transition: 'background-color 0.15s ease',
            boxSizing: 'border-box',
          }}
        >
          <MapPin size={16} strokeWidth={1.75} />
          <span>View Location</span>
        </a>
      )}
    </div>
  );
};

export default RouteBanner;
