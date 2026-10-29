import React from 'react';
import { Truck, MapPin, Radio, ExternalLink } from 'lucide-react';
import Button from '../../components/Button';

/**
 * RouteSettingsCard - Admin card for managing today's route description and vehicle GPS tracking.
 */
export const RouteSettingsCard = ({
  routeText = '',
  onRouteChange,
  onSaveRoute,
  savingRoute = false,
  isAutoTracking = false,
  onToggleAutoTracking,
  vehicleLocation = null,
  trackingStatusText = '',
  onClearLocation,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #ffffff)',
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
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-btn, 12px)',
              backgroundColor: 'var(--color-primary-light, #DCFCE7)',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Truck size={20} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
              Today's Route &amp; Van GPS
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #6B7280)', margin: 0 }}>
              Broadcast today's schedule and live van position
            </p>
          </div>
        </div>

        {/* Tracking Status Pill */}
        {isAutoTracking ? (
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: 'var(--color-primary-light, #DCFCE7)',
              color: 'var(--color-primary-dark, #166534)',
              border: '1px solid #a7f3d0',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 6px #16a34a',
              }}
            />
            Auto-Tracking ON
          </span>
        ) : vehicleLocation?.isLive ? (
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: 'var(--color-bg-page, #F8FAF5)',
              color: 'var(--color-text-muted, #6B7280)',
              border: '1px solid var(--color-border, #E5E7EB)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
            Tracking Paused
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: 'var(--color-bg-page, #F8FAF5)',
              color: 'var(--color-text-muted, #6B7280)',
              border: '1px solid var(--color-border, #E5E7EB)',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: '600',
            }}
          >
            Auto-Tracking Off
          </span>
        )}
      </div>

      {/* Today's Route Input */}
      <div>
        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-text-main, #1F2937)', marginBottom: '5px' }}>
          Route &amp; Timings Description
        </label>
        <input
          type="text"
          value={routeText}
          onChange={(e) => onRouteChange(e.target.value)}
          placeholder="e.g. Padarupalli 9AM-2PM, Sundarayya Colony 4PM-7PM"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-btn, 12px)',
            border: '1.5px solid var(--color-border, #E5E7EB)',
            fontSize: '0.85rem',
            outline: 'none',
            minHeight: '44px',
            boxSizing: 'border-box',
            backgroundColor: 'var(--color-bg-page, #F8FAF5)',
          }}
        />
      </div>

      {/* Action Buttons in a 2-Column Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px',
          width: '100%',
        }}
      >
        {/* Save Route Button */}
        <Button
          variant="outline"
          onClick={onSaveRoute}
          disabled={savingRoute}
          isLoading={savingRoute}
          style={{ minHeight: '44px', fontSize: '0.82rem', fontWeight: '700' }}
        >
          {savingRoute ? 'Saving...' : 'Save Route'}
        </Button>

        {/* Start / Stop Auto-Live Tracking Button */}
        <Button
          variant={isAutoTracking ? 'danger' : 'primary'}
          onClick={onToggleAutoTracking}
          icon={isAutoTracking ? Radio : MapPin}
          style={{ minHeight: '44px', fontSize: '0.82rem', fontWeight: '700' }}
        >
          {isAutoTracking ? 'Stop Tracking' : 'Start Auto-Live Tracking'}
        </Button>

        {/* Check Location (Google Maps) */}
        {vehicleLocation?.latitude && vehicleLocation?.longitude ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${vehicleLocation.latitude},${vehicleLocation.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-bg-card, #ffffff)',
              border: '1.5px solid var(--color-primary, #16A34A)',
              color: 'var(--color-primary-dark, #166534)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 12px)',
              fontSize: '0.82rem',
              fontWeight: '700',
              textDecoration: 'none',
              minHeight: '44px',
              boxSizing: 'border-box',
              touchAction: 'manipulation',
            }}
          >
            <MapPin size={16} strokeWidth={1.75} />
            <span>Check Location</span>
            <ExternalLink size={12} strokeWidth={1.75} />
          </a>
        ) : (
          <button
            type="button"
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-bg-page, #F8FAF5)',
              border: '1px solid var(--color-border, #E5E7EB)',
              color: 'var(--color-text-muted, #6B7280)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 12px)',
              fontSize: '0.82rem',
              fontWeight: '600',
              minHeight: '44px',
              boxSizing: 'border-box',
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            <MapPin size={16} strokeWidth={1.75} />
            <span>Check Location</span>
          </button>
        )}

        {/* Clear Pin */}
        <Button
          variant="text"
          onClick={onClearLocation}
          disabled={!vehicleLocation?.latitude && !isAutoTracking}
          style={{
            minHeight: '44px',
            fontSize: '0.82rem',
            fontWeight: '600',
            border: '1px solid var(--color-border, #E5E7EB)',
            borderRadius: 'var(--radius-btn, 12px)',
            backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          }}
        >
          Clear Pin
        </Button>
      </div>

      {/* Tracking Broadcast Indicator */}
      {isAutoTracking && trackingStatusText && (
        <div
          style={{
            fontSize: '0.74rem',
            color: 'var(--color-primary-dark, #166534)',
            backgroundColor: 'var(--color-primary-light, #DCFCE7)',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
          <span>Broadcasting live: {trackingStatusText}</span>
        </div>
      )}
    </div>
  );
};

export default RouteSettingsCard;
