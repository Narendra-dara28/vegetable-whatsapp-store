import React from 'react';
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
} from 'lucide-react';

/**
 * 1. Chip - Mobile-first Filter Chip (Category & Status Filters)
 * Minimum 44px touch target height
 */
export const Chip = ({
  children,
  active = false,
  count = null,
  onClick,
  icon: Icon = null,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '44px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-badge, 9999px)',
        fontSize: 'var(--font-size-body-sm, 14px)',
        fontWeight: active ? 'var(--font-weight-bold, 700)' : 'var(--font-weight-medium, 500)',
        border: active
          ? '1.5px solid var(--color-primary, #16A34A)'
          : '1px solid var(--color-border, #E5E7EB)',
        backgroundColor: active
          ? 'var(--color-primary, #16A34A)'
          : 'var(--color-bg-card, #FFFFFF)',
        color: active ? '#FFFFFF' : 'var(--color-text-muted, #6B7280)',
        boxShadow: active ? '0 2px 6px rgba(22, 163, 74, 0.2)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        touchAction: 'manipulation',
        userSelect: 'none',
        transition: 'all 0.15s ease',
        ...style,
      }}
      className={`chip-filter ${className}`}
      {...props}
    >
      {Icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {React.isValidElement(Icon)
            ? Icon
            : React.createElement(Icon, { size: 16, strokeWidth: 1.75 })}
        </span>
      )}
      <span>{children}</span>
      {count !== null && count !== undefined && (
        <span
          style={{
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 'var(--font-weight-bold, 700)',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-bg-page, #F8FAF5)',
            color: active ? '#FFFFFF' : 'var(--color-text-muted, #6B7280)',
            border: active ? 'none' : '1px solid var(--color-border, #E5E7EB)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * 2. StatusPill - Consistent status badge across all customer & admin screens
 * Light tint background with dark text of the exact same status color
 */
export const StatusPill = ({
  status = 'NEW',
  showIcon = true,
  size = 'md',
  style = {},
}) => {
  const normalized = String(status || '').toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          color: 'var(--status-confirmed, #2563EB)',
          bg: 'var(--status-confirmed-bg, #DBEAFE)',
          border: 'var(--status-confirmed-border, #BFDBFE)',
          Icon: CheckCircle,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          color: 'var(--status-out-for-delivery, #0891B2)',
          bg: 'var(--status-out-for-delivery-bg, #CFFAFE)',
          border: 'var(--status-out-for-delivery-border, #A5F3FC)',
          Icon: Truck,
        };
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          label: 'Delivered',
          color: 'var(--status-delivered, #16A34A)',
          bg: 'var(--status-delivered-bg, #DCFCE7)',
          border: 'var(--status-delivered-border, #BBF7D0)',
          Icon: Package,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'var(--status-cancelled, #DC2626)',
          bg: 'var(--status-cancelled-bg, #FEE2E2)',
          border: 'var(--status-cancelled-border, #FECACA)',
          Icon: XCircle,
        };
      case 'NEW':
      default:
        return {
          label: 'New Order',
          color: 'var(--status-new, #F97316)',
          bg: 'var(--status-new-bg, #FFEDD5)',
          border: 'var(--status-new-border, #FED7AA)',
          Icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.Icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        borderRadius: 'var(--radius-badge, 9999px)',
        fontSize: 'var(--font-size-xs, 12px)',
        fontWeight: 'var(--font-weight-bold, 700)',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        flexShrink: 0,
        ...style,
      }}
    >
      {showIcon && IconComponent && (
        <IconComponent size={16} strokeWidth={1.75} color={config.color} />
      )}
      <span>{config.label}</span>
    </span>
  );
};

/**
 * 3. CategoryTag - Tag for Fruits, Vegetables, Leafy Greens
 */
export const CategoryTag = ({ category = '', style = {} }) => {
  const norm = String(category || '').trim().toLowerCase();

  const getTagStyle = () => {
    if (norm.includes('fruit')) {
      return {
        bg: 'var(--cat-fruits-bg, #FFEDD5)',
        color: 'var(--cat-fruits-text, #C2410C)',
        border: 'var(--cat-fruits-border, #FED7AA)',
      };
    }
    if (norm.includes('leaf') || norm.includes('keera') || norm.includes('greens')) {
      return {
        bg: 'var(--cat-leafy-bg, #CCFBF1)',
        color: 'var(--cat-leafy-text, #0F766E)',
        border: 'var(--cat-leafy-border, #99F6E4)',
      };
    }
    // Vegetables default
    return {
      bg: 'var(--cat-vegetables-bg, #DCFCE7)',
      color: 'var(--cat-vegetables-text, #15803D)',
      border: 'var(--cat-vegetables-border, #BBF7D0)',
    };
  };

  const tag = getTagStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-badge, 9999px)',
        fontSize: 'var(--font-size-xs, 12px)',
        fontWeight: 'var(--font-weight-semibold, 600)',
        backgroundColor: tag.bg,
        color: tag.color,
        border: `1px solid ${tag.border}`,
        width: 'fit-content',
        ...style,
      }}
    >
      {category}
    </span>
  );
};

export default Chip;
