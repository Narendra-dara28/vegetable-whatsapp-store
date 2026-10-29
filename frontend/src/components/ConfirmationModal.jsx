import React from 'react';
import ConfirmDialog from './ConfirmDialog';

/**
 * Backward-compatible bridge so existing imports of ConfirmationModal
 * seamlessly use the newly created mobile-first ConfirmDialog component.
 */
export const ConfirmationModal = (props) => {
  return <ConfirmDialog {...props} />;
};

export default ConfirmationModal;
