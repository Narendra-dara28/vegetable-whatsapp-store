import React from 'react';
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

const STATUS_STEPS = [
  {
    key: 'NEW',
    label: 'Order Placed',
    icon: Clock,
    desc: 'Received by Green Basket',
    color: 'var(--status-new, #F97316)',
    bg: 'var(--status-new-bg, #FFEDD5)',
    border: 'var(--status-new-border, #FED7AA)',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: CheckCircle,
    desc: 'Vegetables reserved & packing',
    color: 'var(--status-confirmed, #2563EB)',
    bg: 'var(--status-confirmed-bg, #DBEAFE)',
    border: 'var(--status-confirmed-border, #BFDBFE)',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Truck,
    desc: 'Van is en route to your area',
    color: 'var(--status-out-for-delivery, #0891B2)',
    bg: 'var(--status-out-for-delivery-bg, #CFFAFE)',
    border: 'var(--status-out-for-delivery-border, #A5F3FC)',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: Package,
    desc: 'Handed over fresh to you',
    color: 'var(--status-delivered, #16A34A)',
    bg: 'var(--status-delivered-bg, #DCFCE7)',
    border: 'var(--status-delivered-border, #BBF7D0)',
  },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'NEW':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'OUT_FOR_DELIVERY':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return -1;
  }
};

/**
 * TrackingTimeline - Visual progress timeline showing order status progression or cancellation
 */
export const TrackingTimeline = ({ status = 'NEW' }) => {
  const currentStep = getStepIndex(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '20px',
        border: '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0,0,0,0.03))',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--font-size-body-sm, 14px)',
          fontWeight: 'var(--font-weight-heavy, 800)',
          color: 'var(--color-text-muted, #6B7280)',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Order Timeline
      </h2>

      {isCancelled ? (
        <div
          style={{
            backgroundColor: 'var(--status-cancelled-bg, #FEE2E2)',
            borderRadius: 'var(--radius-btn, 12px)',
            padding: '16px',
            border: '1px solid var(--status-cancelled-border, #FECACA)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--status-cancelled, #DC2626)' }}>
            <XCircle size={24} strokeWidth={1.75} />
          </div>
          <div style={{ fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--status-cancelled, #DC2626)', fontSize: 'var(--font-size-body-lg, 16px)' }}>
            Order Cancelled
          </div>
          <p style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-main, #1F2937)', marginTop: '4px' }}>
            Sorry, this order could not be fulfilled. Please contact our support team on WhatsApp if you have questions.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {STATUS_STEPS.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            const isUpcoming = currentStep < idx;
            const StepIcon = step.icon;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  position: 'relative',
                  paddingBottom: idx === STATUS_STEPS.length - 1 ? '0px' : '28px',
                }}
              >
                {/* Connecting Line */}
                {idx !== STATUS_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '19px',
                      top: '38px',
                      bottom: '0px',
                      width: '2px',
                      backgroundColor: isDone ? step.color : 'var(--color-border, #E5E7EB)',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Step Icon Badge */}
                <div
                  className={isCurrent ? 'step-pulse' : ''}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isDone
                      ? step.color
                      : isCurrent
                        ? step.bg
                        : 'var(--color-bg-page, #F8FAF5)',
                    border: `2px solid ${isDone ? step.color : isCurrent ? step.color : 'var(--color-border, #E5E7EB)'}`,
                    color: isDone ? '#FFFFFF' : isCurrent ? step.color : 'var(--color-text-muted, #6B7280)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <StepIcon size={20} strokeWidth={1.75} />
                </div>

                {/* Step Details */}
                <div style={{ marginLeft: '16px', flex: 1, paddingTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-body, 15px)',
                        fontWeight: isCurrent ? 'var(--font-weight-heavy, 800)' : isDone ? 'var(--font-weight-bold, 700)' : 'var(--font-weight-medium, 500)',
                        color: isCurrent ? step.color : isDone ? 'var(--color-text-main, #1F2937)' : 'var(--color-text-muted, #6B7280)',
                      }}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs, 12px)',
                          fontWeight: 'var(--font-weight-bold, 700)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-badge, 9999px)',
                          backgroundColor: step.bg,
                          color: step.color,
                          border: `1px solid ${step.border}`,
                          letterSpacing: '0.03em',
                        }}
                      >
                        CURRENT STATUS
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-body-sm, 14px)',
                      color: isUpcoming ? 'var(--color-text-muted, #6B7280)' : 'var(--color-text-muted, #6B7280)',
                      marginTop: '2px',
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
