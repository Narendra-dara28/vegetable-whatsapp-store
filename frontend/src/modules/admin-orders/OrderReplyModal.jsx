import React from 'react';
import { Clock, MessageCircle, Phone, ExternalLink } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import { StatusPill } from '../../components/Chip';
import { normalizePhone } from '../../utils/helpers';

/**
 * OrderReplyModal - BottomSheet modal for updating order status and preparing WhatsApp confirmation message
 */
export const OrderReplyModal = ({
  isOpen = false,
  order = null,
  targetStatus = null,
  deliveryTime = '',
  messageText = '',
  updating = false,
  onDeliveryTimeChange,
  onMessageTextChange,
  onResetTemplate,
  onConfirmStatusChange,
  onClose,
}) => {
  if (!order) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Order #${order.id}`}
      maxHeight="90vh"
    >
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto',
        }}
      >
        {/* Status Info Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #6B7280)', fontWeight: '600' }}>
            Changing status to:
          </span>
          <StatusPill status={targetStatus} />
        </div>

        {/* Optional Delivery Time Field */}
        {(targetStatus === 'CONFIRMED' || targetStatus === 'OUT_FOR_DELIVERY') && (
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--color-text-main, #1F2937)',
                marginBottom: '6px',
              }}
            >
              <Clock size={16} strokeWidth={1.75} />
              <span>Estimated Delivery Time (Optional):</span>
            </label>
            <input
              type="text"
              placeholder="e.g. in 30 mins, by 5:30 PM"
              value={deliveryTime}
              onChange={(e) => onDeliveryTimeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-btn, 12px)',
                border: '1.5px solid var(--color-border, #E5E7EB)',
                fontSize: '0.88rem',
                minHeight: '44px',
                boxSizing: 'border-box',
                backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Editable WhatsApp Message Preview */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--color-text-main, #1F2937)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageCircle size={16} strokeWidth={1.75} />
              <span>WhatsApp Message Preview:</span>
            </label>
            <button
              type="button"
              onClick={onResetTemplate}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #16A34A)',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              Reset Template
            </button>
          </div>

          <textarea
            rows={4}
            value={messageText}
            onChange={(e) => onMessageTextChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-btn, 12px)',
              border: '1.5px solid var(--color-border, #E5E7EB)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              lineHeight: 1.45,
              boxSizing: 'border-box',
              resize: 'vertical',
              backgroundColor: 'var(--color-bg-page, #F8FAF5)',
              outline: 'none',
            }}
          />
          <span
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-text-muted, #6B7280)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <Phone size={14} strokeWidth={1.75} />
            <span>Sending to: +{normalizePhone(order.phone)}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
          <Button
            variant="whatsapp"
            fullWidth
            onClick={() => onConfirmStatusChange(true)}
            disabled={updating}
            icon={MessageCircle}
            iconRight={ExternalLink}
            style={{
              minHeight: '44px',
              fontWeight: '700',
              fontSize: '0.88rem',
            }}
          >
            Update Status &amp; Open WhatsApp
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => onConfirmStatusChange(false)}
            disabled={updating}
            style={{
              minHeight: '44px',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}
          >
            Update Status Only
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={onClose}
            style={{
              minHeight: '44px',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default OrderReplyModal;
