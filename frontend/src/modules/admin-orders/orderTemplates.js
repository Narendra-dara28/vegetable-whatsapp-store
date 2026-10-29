/**
 * Green Basket - WhatsApp Notification Templates for Admin Order Updates
 * Centralizes all customer status notification text generation in ONE place.
 */

export const buildMessageTemplate = (targetStatus, order, deliveryTime = '') => {
  if (!order) return '';
  const name = order.customerName || 'Customer';
  const id = order.id;
  const total = order.estimatedTotal || 0;
  const trackingToken = order.trackingToken;
  const trackingUrl = trackingToken ? `${window.location.origin}/order/${trackingToken}` : '';

  switch (targetStatus) {
    case 'CONFIRMED': {
      let msg = `Hi ${name}, your Green Basket Order #${id} (₹${total}) has been CONFIRMED.`;
      if (deliveryTime && deliveryTime.trim()) {
        msg += ` Expected delivery: ${deliveryTime.trim()}.`;
      }
      if (trackingUrl) {
        msg += `\n\nTrack your order live: ${trackingUrl}`;
      }
      return msg;
    }

    case 'OUT_FOR_DELIVERY': {
      let msg = `Hi ${name}, your Order #${id} (₹${total}) is out for delivery.`;
      if (deliveryTime && deliveryTime.trim()) {
        msg += ` Expected around: ${deliveryTime.trim()}.`;
      }
      if (trackingUrl) {
        msg += `\n\nTrack your order live: ${trackingUrl}`;
      }
      return msg;
    }

    case 'DELIVERED': {
      return `Hi ${name}, your Order #${id} is delivered. Thank you for shopping with Green Basket!`;
    }

    case 'CANCELLED': {
      return `Hi ${name}, sorry, your Order #${id} could not be fulfilled. Please contact us.`;
    }

    default:
      return `Hi ${name}, regarding your Green Basket Order #${id}...`;
  }
};

export default buildMessageTemplate;
