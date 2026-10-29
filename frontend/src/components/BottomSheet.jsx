import React, { useEffect, useState, useRef } from 'react';
import { XCircle } from 'lucide-react';

/**
 * Shared BottomSheet Component
 * - Mobile-first sheet sliding up from bottom
 * - Rounded top corners (20px)
 * - Centered top drag handle
 * - Dimmed backdrop with click-to-close
 * - Swipe-down to close gesture support
 * - Notch safe-area padding at bottom
 */
export const BottomSheet = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  maxHeight = '85vh',
  zIndex = 1000,
}) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Swipe / Drag Handle Handlers
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(0);
  };

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - startY;
    if (deltaY > 80) {
      onClose();
    }
    setCurrentY(0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: zIndex,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={sheetRef}
        style={{
          backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          maxHeight: maxHeight,
          width: '100%',
          maxWidth: '540px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal, 0 -4px 25px rgba(0,0,0,0.15))',
          transform: `translateY(${currentY}px)`,
          transition: currentY === 0 ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          boxSizing: 'border-box',
          paddingBottom: 'calc(var(--spacing-4, 16px) + env(safe-area-inset-bottom, 0px))',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle Area (Touch target for swipe down) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            padding: '10px 0 6px 0',
            cursor: 'grab',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            touchAction: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-border, #E5E7EB)',
            }}
          />
        </div>

        {/* Header Bar */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 16px 12px 16px',
              borderBottom: '1px solid var(--color-border, #E5E7EB)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-size-title, 18px)',
                fontWeight: 'var(--font-weight-heavy, 800)',
                color: 'var(--color-text-main, #1F2937)',
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted, #6B7280)',
                cursor: 'pointer',
                padding: 0,
                borderRadius: '8px',
              }}
              aria-label="Close sheet"
            >
              <XCircle size={20} strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Sheet Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
