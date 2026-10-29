import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage } from '../services/api';

/**
 * Centralized Reusable DeleteButton Component
 * - Manages delete trigger, confirm popup, loading state, and notifications in ONE place.
 * - Usable on product cards, modals, tables, and anywhere an item needs to be removed.
 */
export const DeleteButton = ({
  itemName = 'this item',
  onDelete,
  onSuccess,
  buttonText = 'Remove',
  confirmTitle = 'Remove Item',
  confirmMessage,
  confirmText = 'Yes, Remove',
  cancelText = 'Cancel',
  style = {},
  disabled = false,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useNotification();

  const handleOpenConfirm = (e) => {
    e.stopPropagation();
    if (disabled || isDeleting) return;
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    if (isDeleting) return;
    setIsConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) {
      setIsConfirmOpen(false);
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete();
      showToast(`"${itemName}" removed successfully.`, 'success');
      setIsConfirmOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      showToast(getErrorMessage(err, `Failed to remove "${itemName}". Please try again.`), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const finalConfirmMessage =
    confirmMessage ||
    `Are you sure you want to remove "${itemName}"? It will be permanently removed from your catalog.`;

  return (
    <>
      <button
        type="button"
        onClick={handleOpenConfirm}
        disabled={disabled || isDeleting}
        style={{
          minHeight: '44px',
          background: 'none',
          border: 'none',
          color: 'var(--status-cancelled, #DC2626)',
          fontSize: 'var(--font-size-xs, 12px)',
          fontWeight: 'var(--font-weight-semibold, 600)',
          cursor: disabled || isDeleting ? 'not-allowed' : 'pointer',
          padding: '8px 12px',
          borderRadius: 'var(--radius-btn, 12px)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          touchAction: 'manipulation',
          transition: 'all 0.15s ease',
          opacity: disabled || isDeleting ? 0.6 : 1,
          ...style,
        }}
        title={`Remove ${itemName}`}
        aria-label={`Remove ${itemName}`}
      >
        <Trash2 size={16} strokeWidth={1.75} />
        <span>{isDeleting ? 'Removing...' : buttonText}</span>
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={confirmTitle}
        message={finalConfirmMessage}
        confirmText={confirmText}
        cancelText={cancelText}
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseConfirm}
      />
    </>
  );
};

export default DeleteButton;
