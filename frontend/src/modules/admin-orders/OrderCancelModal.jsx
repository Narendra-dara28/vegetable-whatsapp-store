import React from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';

/**
 * OrderCancelModal - Confirmation dialog before cancelling an order
 */
export const OrderCancelModal = ({
  isOpen = false,
  order = null,
  onConfirm,
  onClose,
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen && !!order}
      title={`Cancel Order #${order?.id}?`}
      message={`Are you sure you want to cancel the order for ${order?.customerName}?`}
      confirmText="Yes, cancel order"
      cancelText="Keep Order Active"
      type="danger"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};

export default OrderCancelModal;
