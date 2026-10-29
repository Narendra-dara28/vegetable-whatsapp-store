import React from 'react';
import {
  User,
  Phone,
  MapPin,
  Clock,
  Package,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { StatusPill } from '../../components/Chip';
import Button from '../../components/Button';
import {
  formatCurrency,
  formatDate,
  formatFullDateTime,
  buildGoogleMapsUrl,
  buildWhatsAppChatUrl,
  normalizePhone,
  highlightMatch,
} from '../../utils/helpers';

/**
 * AdminOrderCard - Modular, self-contained card component for rendering orders in AdminOrders.
 * Handles compact view for delivered orders, full details view for active orders, and action buttons.
 */
export const AdminOrderCard = ({
  order,
  isDeliveredTab = false,
  isExpanded = false,
  onToggleExpand,
  searchQuery = '',
  updatingId = null,
  onOpenReplyModal,
  onPromptCancel,
}) => {
  const isNew = order.status === 'NEW';
  const phone91 = normalizePhone(order.phone);
  const directChatLink = buildWhatsAppChatUrl(
    phone91,
    `Hello ${order.customerName}, regarding your Green Basket order #${order.id}...`
  );

  // -------------------------------------------------------------
  // COMPACT CARD VIEW FOR COMPLETED / DELIVERED ORDERS
  // -------------------------------------------------------------
  if (isDeliveredTab) {
    const itemsSummaryText = (order.items || [])
      .map((item) => `${item.productName} (${item.unit}) × ${item.quantity}`)
      .join(', ');

    return (
      <div
        key={order.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '14px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Compact Card Header */}
        <div
          onClick={() => onToggleExpand?.(order.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)' }}>
              {highlightMatch(`Order #${order.id}`, searchQuery)}
            </span>
            <StatusPill status={order.status || 'DELIVERED'} />
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-main, #1F2937)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={16} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
              <span>{highlightMatch(order.customerName, searchQuery)}</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #6B7280)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={16} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
              <span>{highlightMatch(order.phone, searchQuery)}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-dark, #166534)' }}>
              {formatCurrency(order.estimatedTotal)}
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--color-primary, #16A34A)', fontWeight: '700' }}>
              {isExpanded ? 'Hide details' : 'Details'}
            </span>
          </div>
        </div>

        {/* Delivered Time & Items Summary Line */}
        <div
          onClick={() => onToggleExpand?.(order.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted, #6B7280)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={16} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
            <span>
              Delivered:{' '}
              <strong style={{ color: 'var(--color-text-main, #1F2937)' }}>
                {formatFullDateTime(order.deliveredAt || order.updatedAt)}
              </strong>
            </span>
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted, #6B7280)',
              maxWidth: '520px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Package size={16} strokeWidth={1.75} />
            <span>{order.items?.length || 0} items: {itemsSummaryText}</span>
          </div>
        </div>

        {/* Expanded Details Area */}
        {isExpanded && (
          <div
            style={{
              marginTop: '4px',
              paddingTop: '10px',
              borderTop: '1px dashed var(--color-border, #E5E7EB)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Address & Google Maps */}
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main, #1F2937)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Delivery Address:</strong> {order.address}
                </div>
              </div>
              <div style={{ marginTop: '6px', marginLeft: '22px' }}>
                <a
                  href={buildGoogleMapsUrl(order.address, order.locationUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-btn, 12px)',
                    backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                    border: '1px solid #a7f3d0',
                    color: 'var(--color-primary-dark, #166534)',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    minHeight: '36px',
                    boxSizing: 'border-box',
                  }}
                >
                  <MapPin size={14} strokeWidth={1.75} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={12} strokeWidth={1.75} />
                </a>
              </div>
            </div>

            {/* Full Items Breakdown */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                borderRadius: 'var(--radius-btn, 12px)',
                padding: '8px 12px',
                border: '1px solid var(--color-border, #E5E7EB)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: 'var(--color-text-muted, #6B7280)',
                  marginBottom: '4px',
                }}
              >
                ITEMS BREAKDOWN ({order.items?.length || 0})
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  maxHeight: order.items?.length > 5 ? '135px' : 'none',
                  overflowY: order.items?.length > 5 ? 'auto' : 'visible',
                  paddingRight: order.items?.length > 5 ? '6px' : '0',
                  scrollbarWidth: 'thin',
                }}
              >
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--color-text-main, #1F2937)' }}>
                        {item.productName}
                      </span>{' '}
                      <span style={{ color: 'var(--color-text-muted, #6B7280)', fontSize: '0.75rem' }}>
                        ({item.unit}) × {item.quantity}
                      </span>
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary-dark, #166534)' }}>
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compact Card Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-border, #E5E7EB)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {order.trackingToken && (
              <a
                href={`/order/${order.trackingToken}?from=admin`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--color-primary, #16A34A)',
                  textDecoration: 'none',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={14} strokeWidth={1.75} />
                <span>View Tracking</span>
                <ExternalLink size={12} strokeWidth={1.75} />
              </a>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #6B7280)' }}>
              Placed: {formatDate(order.createdAt)}
            </span>
          </div>

          <a
            href={directChatLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: '700',
              backgroundColor: 'var(--color-whatsapp, #25D366)',
              color: '#ffffff',
              borderRadius: 'var(--radius-btn, 12px)',
              textDecoration: 'none',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          >
            <MessageCircle size={16} strokeWidth={1.75} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE ORDERS CARD VIEW (ALL, NEW, CONFIRMED, OUT_FOR_DELIVERY, CANCELLED)
  // -------------------------------------------------------------
  return (
    <div
      key={order.id}
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '16px',
        border: '1px solid var(--color-border, #E5E7EB)',
        borderLeft: isNew
          ? '4px solid var(--status-new, #F97316)'
          : '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-card, 0 1px 4px rgba(0,0,0,0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Order Top Bar: Order number + Status Pill + Time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)' }}>
            {highlightMatch(`Order #${order.id}`, searchQuery)}
          </span>
          <StatusPill status={order.status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {order.trackingToken && (
            <a
              href={`/order/${order.trackingToken}?from=admin`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-primary, #16A34A)',
                textDecoration: 'none',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <MapPin size={14} strokeWidth={1.75} />
              <span>View Tracking</span>
              <ExternalLink size={12} strokeWidth={1.75} />
            </a>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #6B7280)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={16} strokeWidth={1.75} />
            <span>{formatDate(order.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* Customer Info & Contact Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--color-text-main, #1F2937)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <User size={16} strokeWidth={1.75} color="var(--color-text-muted, #6B7280)" />
          <span>{highlightMatch(order.customerName, searchQuery)}</span>
        </div>

        {/* Tappable Phone Number (tel: link) */}
        <div>
          <a
            href={`tel:${order.phone}`}
            style={{
              fontSize: '0.84rem',
              fontWeight: '700',
              color: 'var(--color-primary-dark, #166534)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 0',
              minHeight: '36px',
            }}
            title="Tap to call customer"
          >
            <Phone size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            <span>{highlightMatch(order.phone, searchQuery)}</span>
          </a>
        </div>

        {/* Delivery Address */}
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-main, #1F2937)',
            lineHeight: 1.35,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
          }}
        >
          <MapPin size={16} strokeWidth={1.75} color="var(--color-primary, #16A34A)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>{order.address}</span>
        </div>

        {/* Dedicated Open in Google Maps & Chat on WhatsApp Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <a
            href={buildGoogleMapsUrl(order.address, order.locationUrl)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn, 12px)',
              backgroundColor: 'var(--color-bg-card, #FFFFFF)',
              border: '1.5px solid var(--color-primary, #16A34A)',
              color: 'var(--color-primary-dark, #166534)',
              fontSize: '0.78rem',
              fontWeight: '700',
              textDecoration: 'none',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          >
            <MapPin size={14} strokeWidth={1.75} />
            <span>Open in Google Maps</span>
            <ExternalLink size={12} strokeWidth={1.75} />
          </a>

          <a
            href={directChatLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: '700',
              backgroundColor: 'var(--color-whatsapp, #25D366)',
              color: '#ffffff',
              borderRadius: 'var(--radius-btn, 12px)',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          >
            <MessageCircle size={16} strokeWidth={1.75} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-page, #F8FAF5)',
          borderRadius: 'var(--radius-btn, 12px)',
          padding: '8px 12px',
          border: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--color-text-muted, #6B7280)',
            marginBottom: '4px',
          }}
        >
          ITEMS ORDERED ({order.items?.length || 0})
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: order.items?.length > 5 ? '135px' : 'none',
            overflowY: order.items?.length > 5 ? 'auto' : 'visible',
            paddingRight: order.items?.length > 5 ? '6px' : '0',
            scrollbarWidth: 'thin',
          }}
        >
          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <span style={{ fontWeight: '600', color: 'var(--color-text-main, #1F2937)' }}>
                  {item.productName}
                </span>{' '}
                <span style={{ color: 'var(--color-text-muted, #6B7280)', fontSize: '0.75rem' }}>
                  ({item.unit}) × {item.quantity}
                </span>
              </div>
              <span style={{ fontWeight: '700', color: 'var(--color-primary-dark, #166534)' }}>
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Footer: Total & Status Action Buttons (2x2 Grid) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #6B7280)', fontWeight: '600' }}>
            Estimated Total:
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-dark, #166534)' }}>
            {formatCurrency(order.estimatedTotal)}
          </span>
        </div>

        {/* Dedicated Status Action Buttons in a 2x2 Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
          }}
        >
          {/* 1. Confirm & Reply Button */}
          <Button
            variant="primary"
            disabled={updatingId === order.id || order.status !== 'NEW'}
            onClick={() => onOpenReplyModal?.(order, 'CONFIRMED')}
            icon={CheckCircle}
            style={{
              minHeight: '44px',
              fontSize: '0.82rem',
              fontWeight: '700',
              opacity: order.status === 'NEW' ? 1 : 0.45,
            }}
          >
            Confirm &amp; Reply
          </Button>

          {/* 2. Out for Delivery Button */}
          <button
            type="button"
            disabled={updatingId === order.id || (order.status !== 'NEW' && order.status !== 'CONFIRMED')}
            onClick={() => onOpenReplyModal?.(order, 'OUT_FOR_DELIVERY')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-status-out, #0891B2)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-btn, 12px)',
              fontSize: '0.82rem',
              fontWeight: '700',
              minHeight: '44px',
              cursor: (order.status === 'NEW' || order.status === 'CONFIRMED') ? 'pointer' : 'not-allowed',
              opacity: (order.status === 'NEW' || order.status === 'CONFIRMED') ? 1 : 0.45,
              boxShadow: '0 2px 6px rgba(8, 145, 178, 0.25)',
            }}
          >
            <Truck size={16} strokeWidth={1.75} />
            <span>Out for Delivery</span>
          </button>

          {/* 3. Delivered Button */}
          <button
            type="button"
            disabled={updatingId === order.id || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
            onClick={() => onOpenReplyModal?.(order, 'DELIVERED')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-primary-dark, #166534)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-btn, 12px)',
              fontSize: '0.82rem',
              fontWeight: '700',
              minHeight: '44px',
              cursor: (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') ? 'pointer' : 'not-allowed',
              opacity: (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') ? 1 : 0.45,
              boxShadow: '0 2px 6px rgba(22, 101, 52, 0.25)',
            }}
          >
            <CheckCircle size={16} strokeWidth={1.75} />
            <span>Delivered</span>
          </button>

          {/* 4. Cancel Button */}
          <Button
            variant="danger"
            disabled={updatingId === order.id || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
            onClick={() => onPromptCancel?.(order)}
            icon={XCircle}
            style={{
              minHeight: '44px',
              fontSize: '0.82rem',
              fontWeight: '700',
              opacity: (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') ? 1 : 0.45,
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderCard;
