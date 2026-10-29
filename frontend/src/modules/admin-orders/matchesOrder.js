/**
 * matchesOrder - Multi-field case-insensitive partial matcher
 * Supports:
 * - Order number ("325", "#325", "order 325")
 * - Customer / receiver name
 * - Phone number (normalized digits or formatted)
 * - Address text (house, street, area)
 * - Item names (English and Telugu names)
 * - Status text ("cancelled", "new", "delivered", "confirmed", "out for delivery")
 * - Total amount ("83.50", "83.5")
 * - Date text ("22 Oct")
 */
export const matchesOrder = (order, query) => {
  if (!query || !query.trim()) return true;
  if (!order) return false;

  const rawQuery = query.trim().toLowerCase();

  // 1. Order Number: works with "325", "#325", "order 325"
  const cleanOrderNum = rawQuery.replace(/^order\s*#?/i, '').replace('#', '').trim();
  const orderIdStr = String(order.id || '');
  if (cleanOrderNum && orderIdStr.includes(cleanOrderNum)) {
    return true;
  }
  if (
    orderIdStr.includes(rawQuery) ||
    `#${orderIdStr}`.toLowerCase().includes(rawQuery) ||
    `order #${orderIdStr}`.toLowerCase().includes(rawQuery) ||
    `order ${orderIdStr}`.toLowerCase().includes(rawQuery)
  ) {
    return true;
  }

  // 2. Customer / receiver name
  const customerName = (order.customerName || '').toLowerCase();
  if (customerName.includes(rawQuery)) {
    return true;
  }

  // 3. Phone number: ignore spaces, dashes, +91
  const queryDigits = rawQuery.replace(/[^0-9]/g, '');
  const cleanQueryPhone = queryDigits.startsWith('91') && queryDigits.length > 10 ? queryDigits.slice(2) : queryDigits;
  const rawOrderPhone = String(order.phone || '');
  const orderDigits = rawOrderPhone.replace(/[^0-9]/g, '');
  const cleanOrderPhone = orderDigits.startsWith('91') && orderDigits.length > 10 ? orderDigits.slice(2) : orderDigits;

  if (cleanQueryPhone && (orderDigits.includes(cleanQueryPhone) || cleanOrderPhone.includes(cleanQueryPhone))) {
    return true;
  }
  if (rawOrderPhone.toLowerCase().includes(rawQuery)) {
    return true;
  }

  // 4. Address text (house, street, area)
  const address = (order.address || '').toLowerCase();
  if (address.includes(rawQuery)) {
    return true;
  }

  // 5. Item names (e.g. "tomato", "onion", and Telugu names)
  if (Array.isArray(order.items)) {
    const itemMatch = order.items.some((item) => {
      const name = (item.productName || '').toLowerCase();
      const telugu = (item.productNameTelugu || item.teluguName || '').toLowerCase();
      const unit = (item.unit || '').toLowerCase();
      return name.includes(rawQuery) || telugu.includes(rawQuery) || unit.includes(rawQuery);
    });
    if (itemMatch) return true;
  }

  // 6. Status text (e.g. "cancelled", "new", "delivered", "confirmed", "out for delivery")
  if (rawQuery === 'all') {
    return true;
  }
  const isOut = rawQuery.includes('out') || rawQuery.includes('out for') || rawQuery === 'out for delivery';
  if (isOut && order.status === 'OUT_FOR_DELIVERY') {
    return true;
  }
  if (!isOut && (rawQuery.startsWith('del') || rawQuery.includes('deliver') || rawQuery === 'completed') && (order.status === 'DELIVERED' || order.status === 'COMPLETED')) {
    return true;
  }
  if ((rawQuery.startsWith('con') || rawQuery.includes('confirm')) && order.status === 'CONFIRMED') {
    return true;
  }
  if ((rawQuery.startsWith('can') || rawQuery.includes('cancel')) && order.status === 'CANCELLED') {
    return true;
  }
  if (rawQuery === 'new' && order.status === 'NEW') {
    return true;
  }
  const statusStr = (order.status || '').toLowerCase().replace(/_/g, ' ');
  if (!isOut && (statusStr.includes(rawQuery) || (order.status || '').toLowerCase().includes(rawQuery))) {
    return true;
  }

  // 7. Total amount (e.g. "83.50", "83.5")
  const cleanAmountQuery = rawQuery.replace('₹', '').trim();
  const totalStr = order.estimatedTotal != null ? String(order.estimatedTotal) : '';
  const totalFormatted = order.estimatedTotal != null ? Number(order.estimatedTotal).toFixed(2) : '';
  if (cleanAmountQuery && (totalStr.includes(cleanAmountQuery) || totalFormatted.includes(cleanAmountQuery))) {
    return true;
  }

  // 8. Date text (e.g. "22 Oct")
  const dateCandidates = [order.createdAt, order.deliveredAt, order.updatedAt].filter(Boolean);
  for (const dateVal of dateCandidates) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        const fullStr = d.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).toLowerCase();
        if (fullStr.includes(rawQuery)) return true;

        const dayMonth = d.toLocaleString('en-IN', { day: '2-digit', month: 'short' }).toLowerCase();
        if (dayMonth.includes(rawQuery)) return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
};

export default matchesOrder;
