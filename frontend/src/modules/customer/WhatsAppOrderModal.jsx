import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, ShoppingBasket } from 'lucide-react';

const WhatsAppIcon = ({ size = 28, color = 'currentColor', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: 'block', flexShrink: 0, ...style }}
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.201-.351.226-.652.075-1.954-.979-3.236-2.072-4.52-4.28-.18-.309.18-.288.514-.954.076-.15.038-.282-.019-.395-.057-.113-.477-1.15-.653-1.576-.172-.415-.347-.358-.477-.365l-.407-.008c-.14 0-.368.053-.561.263-.193.21-.738.722-.738 1.761 0 1.039.757 2.043.863 2.185.105.141 1.49 2.274 3.609 3.188 1.488.642 2.079.697 2.82.587.452-.067 1.38-.564 1.576-1.11.196-.546.196-1.014.138-1.11-.058-.096-.214-.15-.515-.301z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.436 5.176L2 22l4.966-1.399A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 01-4.205-1.161l-.301-.179-2.946.83.84-2.868-.195-.312A8.163 8.163 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z"
    />
  </svg>
);

/**
 * WhatsAppOrderModal - Two-step order confirmation modal:
 * Step 1 (PENDING): Send Order on WhatsApp or Cancel & Go Back to Store
 * Step 2 (CONFIRMED): Order Placed confirmation with Live Tracking link and Shop More
 */
export const WhatsAppOrderModal = ({
  orderData,
  step = 'PENDING',
  isSubmitting = false,
  onSendWhatsApp,
  onGoBackToStore,
  onClose,
}) => {
  const navigate = useNavigate();

  // Mobile phone back button support for WhatsApp Order Modal
  useEffect(() => {
    if (!orderData || step !== 'PENDING') return;

    window.history.pushState({ modal: 'whatsappOrder' }, '');
    const handlePopState = () => {
      onGoBackToStore?.();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [orderData, step, onGoBackToStore]);

  if (!orderData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step === 'PENDING') {
          onGoBackToStore?.();
        } else if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px 18px',
          maxWidth: '350px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {step !== 'CONFIRMED' ? (
          <>
            {/* Step 1: Send on WhatsApp Popup */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                border: '2px solid var(--color-border, #BBF7D0)',
                color: 'var(--color-whatsapp, #25D366)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <WhatsAppIcon size={32} color="var(--color-whatsapp, #25D366)" />
            </div>

            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                color: 'var(--color-text-main, #1F2937)',
                marginBottom: '10px',
              }}
            >
              {orderData?.id ? `Order #${orderData.id}` : 'Place Order'}
            </h3>

            <p
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-text-muted, #6B7280)',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              Your fresh vegetable order has been prepared! Tap below to send your order on WhatsApp.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={onSendWhatsApp}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-whatsapp, #25D366)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px 18px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  fontWeight: '700',
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-btn-whatsapp, 0 4px 14px rgba(37, 211, 102, 0.35))',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <WhatsAppIcon size={20} color="#ffffff" />
                <span>{isSubmitting ? 'Placing Order...' : 'Send Order on WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={onGoBackToStore}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                  color: 'var(--color-text-main, #1F2937)',
                  border: '1px solid var(--color-border, #E5E7EB)',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  fontWeight: '600',
                  fontSize: '0.86rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Go Back to Store</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2: Order Placed */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                border: '2px solid #bbf7d0',
                color: 'var(--color-primary, #16A34A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle size={28} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                color: 'var(--color-primary-dark, #166534)',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Order Placed
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: 'var(--color-text-main, #1F2937)',
                marginBottom: '8px',
              }}
            >
              Order #{orderData.id} Placed!
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-text-muted, #6B7280)',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              Thank you! Your order has been placed with Green Basket. We are packing your fresh vegetables and will deliver shortly!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orderData.trackingToken && (
                <button
                  type="button"
                  onClick={() => {
                    const token = orderData.trackingToken;
                    onClose?.();
                    navigate(`/order/${token}`, { state: { from: 'customer' } });
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary, #16A34A)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px 20px',
                    borderRadius: 'var(--radius-btn, 12px)',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                    minHeight: '44px',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <MapPin size={20} strokeWidth={1.75} color="#ffffff" />
                  <span>Track Order Live</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  backgroundColor: orderData.trackingToken ? 'var(--color-bg-page, #F8FAF5)' : 'var(--color-primary, #16A34A)',
                  color: orderData.trackingToken ? 'var(--color-text-main, #1F2937)' : '#ffffff',
                  border: orderData.trackingToken ? '1px solid var(--color-border, #E5E7EB)' : 'none',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
              >
                <ShoppingBasket size={20} strokeWidth={1.75} />
                <span>Shop More</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WhatsAppOrderModal;
