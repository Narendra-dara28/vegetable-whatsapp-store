import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, XCircle, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { StatusPill } from '../../components/Chip';
import Button from '../../components/Button';

export const TrackOrderModal = ({ isOpen, onClose, orders = [] }) => {
  const navigate = useNavigate();

  // Only show active live delivery orders (strictly filter out DELIVERED and CANCELLED)
  const liveOrders = orders.filter(
    (ord) => ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED'
  );

  if (!isOpen || !liveOrders.length) return null;

  const handleSelectOrder = (order) => {
    onClose();
    navigate(`/order/${order.trackingToken || order.id}`, { state: { from: 'customer' } });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 'var(--page-padding, 16px)',
        animation: 'fadeIn 0.2s ease-out',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          borderRadius: 'var(--radius-card, 16px)',
          width: '100%',
          maxWidth: '440px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal, 0 20px 25px -5px rgba(0, 0, 0, 0.2))',
          border: '1px solid var(--color-border, #E5E7EB)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--color-border, #E5E7EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                color: 'var(--color-primary-dark, #166534)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-title, 18px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
                Live Delivery Orders
              </h2>
              <div style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', marginTop: '2px' }}>
                Select an active order to track in real-time
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted, #6B7280)',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Close modal"
          >
            <XCircle size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Orders List with visible scrollbar */}
        <div
          style={{
            padding: '16px',
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
          className="custom-order-scroll"
        >
          {liveOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => handleSelectOrder(ord)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-btn, 12px)',
                border: '1.5px solid var(--color-border, #E5E7EB)',
                backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-soft, 0 1px 3px rgba(0,0,0,0.03))',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)', fontSize: 'var(--font-size-body, 15px)' }}>
                    Order #{ord.id}
                  </span>
                  <StatusPill status={ord.status} size="sm" />
                </div>
                <div style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', marginTop: '4px' }}>
                  {ord.createdAt ? formatDate(ord.createdAt) : 'Recently placed'}
                  {ord.total ? ` · ₹${ord.total}` : ''}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOrder(ord);
                }}
                style={{
                  minHeight: '44px',
                  padding: '8px 14px',
                  fontSize: 'var(--font-size-xs, 12px)',
                  borderRadius: 'var(--radius-btn, 12px)',
                }}
              >
                <span>Track Live</span>
                <ExternalLink size={16} strokeWidth={1.75} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;
