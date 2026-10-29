import React from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/**
 * OrderDateFilters - Delivered orders summary toolbar with aggregate value, CSV export,
 * and date range preset buttons (Today, Yesterday, Last 7 Days, Custom, All Dates).
 */
export const OrderDateFilters = ({
  totalElements = 0,
  totalAmount = 0,
  datePreset = 'TODAY',
  onDatePresetChange,
  customFrom = '',
  customTo = '',
  onCustomFromChange,
  onCustomToChange,
  onExportCSV,
}) => {
  return (
    <>
      {/* Summary Bar */}
      <div
        style={{
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #bbf7d0',
          backgroundColor: '#f0fdf4',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Package size={24} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                color: 'var(--color-primary-dark, #166534)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Delivered Orders Summary (
              {datePreset === 'TODAY'
                ? 'Today'
                : datePreset === 'YESTERDAY'
                  ? 'Yesterday'
                  : datePreset === 'LAST_7_DAYS'
                    ? 'Last 7 Days'
                    : datePreset === 'CUSTOM'
                      ? 'Custom Range'
                      : 'All Dates'}
              )
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-text-main, #1F2937)' }}>
                {totalElements} <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted, #6B7280)' }}>Orders</span>
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--color-primary-dark, #166534)' }}>
                {formatCurrency(totalAmount)}
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-primary, #16A34A)', marginLeft: '4px' }}>
                  Total Value
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          type="button"
          onClick={onExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-btn, 12px)',
            backgroundColor: 'var(--color-bg-card, #ffffff)',
            border: '1px solid var(--color-primary, #16A34A)',
            color: 'var(--color-primary-dark, #166534)',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            minHeight: '44px',
            boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          }}
        >
          <ExternalLink size={16} strokeWidth={1.75} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date Filters Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          borderRadius: 'var(--radius-card, 16px)',
          padding: '12px 16px',
          border: '1px solid var(--color-border, #E5E7EB)',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Date Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted, #6B7280)', marginRight: '4px' }}>
            Delivered Date:
          </span>
          {[
            { key: 'TODAY', label: 'Today' },
            { key: 'YESTERDAY', label: 'Yesterday' },
            { key: 'LAST_7_DAYS', label: 'Last 7 Days' },
            { key: 'CUSTOM', label: 'Custom Range' },
            { key: 'ALL_TIME', label: 'All Dates' },
          ].map((item) => {
            const isActive = datePreset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onDatePresetChange(item.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: isActive ? '1px solid var(--color-primary, #16A34A)' : '1px solid var(--color-border, #E5E7EB)',
                  backgroundColor: isActive ? 'var(--color-primary, #16A34A)' : 'var(--color-bg-page, #F8FAF5)',
                  color: isActive ? '#ffffff' : 'var(--color-text-main, #1F2937)',
                  cursor: 'pointer',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'CUSTOM' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>From:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  border: '1px solid var(--color-border, #E5E7EB)',
                  fontSize: '0.82rem',
                  minHeight: '44px',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569' }}>To:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomToChange(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  border: '1px solid var(--color-border, #E5E7EB)',
                  fontSize: '0.82rem',
                  minHeight: '44px',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderDateFilters;
