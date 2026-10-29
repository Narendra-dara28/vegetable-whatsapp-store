import React from 'react';
import { Pencil } from 'lucide-react';
import Button from '../../components/Button';

/**
 * SaveAllPricesBar - Floating bottom sticky bar prompting admin to save all modified prices
 */
export const SaveAllPricesBar = ({
  hasUnsavedChanges = false,
  modifiedCount = 0,
  savingPrices = false,
  onSaveAllPrices,
}) => {
  return (
    <>
      <div className="admin-sticky-save-bar">
        <div style={{ width: '100%', maxWidth: '540px', pointerEvents: 'auto' }}>
          <Button
            variant="primary"
            fullWidth
            disabled={!hasUnsavedChanges || savingPrices}
            isLoading={savingPrices}
            onClick={onSaveAllPrices}
            style={{
              minHeight: '48px',
              fontSize: '15px',
              fontWeight: '800',
              borderRadius: 'var(--radius-btn, 12px)',
              boxShadow: hasUnsavedChanges
                ? '0 6px 20px rgba(22, 163, 74, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.06)',
              backgroundColor: hasUnsavedChanges
                ? 'var(--color-primary, #16A34A)'
                : '#E5E7EB',
              color: hasUnsavedChanges ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {savingPrices ? (
              'Saving New Prices...'
            ) : hasUnsavedChanges ? (
              <>
                <Pencil size={18} strokeWidth={1.75} />
                <span>Save All Prices ({modifiedCount} changes)</span>
              </>
            ) : (
              <span>Save All Prices (No changes)</span>
            )}
          </Button>
        </div>
      </div>

      <style>{`
        .admin-sticky-save-bar {
          position: fixed;
          bottom: calc(62px + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          z-index: 90;
          display: flex;
          justify-content: center;
          padding: 0 16px;
          pointer-events: none;
        }
        @media (min-width: 769px) {
          .admin-sticky-save-bar {
            bottom: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default SaveAllPricesBar;
