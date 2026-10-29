import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

/**
 * Shared Toast Notification Component
 * - Placed at top of screen below header (full width minus 16px)
 * - Auto-dismisses in 3 seconds
 * - Swipe up/down/horizontal to dismiss
 * - Types: success green, error red, warning orange, info blue
 * - Each with icon (Lucide 20px, 1.75 stroke), short bold title, one line of text
 */
export const Toast = ({
  message,
  type = 'info',
  title = '',
  onClose,
  duration = 3000,
}) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [translateY, setTranslateY] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef(null);

  // Auto-dismiss in 3 seconds
  useEffect(() => {
    if (!message) return;
    setTranslateY(0);
    setOpacity(1);

    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  // Swipe handling for mobile touch dismiss
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStart.y;
    const deltaX = Math.abs(e.touches[0].clientX - touchStart.x);
    // If swiping upwards, visually drag
    if (deltaY < 0) {
      setTranslateY(deltaY);
      setOpacity(Math.max(0.2, 1 + deltaY / 100));
    } else if (deltaX > 20) {
      setOpacity(Math.max(0.3, 1 - deltaX / 120));
    }
  };

  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStart.x);
    if (deltaY < -35 || deltaX > 50) {
      // Swiped away
      onClose();
    } else {
      // Snap back
      setTranslateY(0);
      setOpacity(1);
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          title: 'Success',
          color: 'var(--status-delivered, #16A34A)',
          bg: 'var(--status-delivered-bg, #DCFCE7)',
          border: 'var(--status-delivered-border, #BBF7D0)',
          Icon: CheckCircle,
        };
      case 'error':
        return {
          title: 'Error',
          color: 'var(--status-cancelled, #DC2626)',
          bg: 'var(--status-cancelled-bg, #FEE2E2)',
          border: 'var(--status-cancelled-border, #FECACA)',
          Icon: XCircle,
        };
      case 'warning':
        return {
          title: 'Notice',
          color: 'var(--status-new, #F97316)',
          bg: 'var(--status-new-bg, #FFEDD5)',
          border: 'var(--status-new-border, #FED7AA)',
          Icon: Clock,
        };
      case 'info':
      default:
        return {
          title: 'Info',
          color: 'var(--status-confirmed, #2563EB)',
          bg: 'var(--status-confirmed-bg, #DBEAFE)',
          border: 'var(--status-confirmed-border, #BFDBFE)',
          Icon: CheckCircle,
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.Icon;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        top: '64px',
        left: '8px',
        right: '8px',
        width: 'calc(100% - 16px)',
        maxWidth: '480px',
        margin: '0 auto',
        zIndex: 9999,
        backgroundColor: config.bg,
        border: `1.5px solid ${config.border}`,
        borderRadius: 'var(--radius-card, 16px)',
        boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.08))',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transform: `translateY(${translateY}px)`,
        opacity: opacity,
        transition: translateY === 0 ? 'transform 0.2s ease, opacity 0.2s ease' : 'none',
        boxSizing: 'border-box',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
      role="alert"
    >
      {/* Icon */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: config.color,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <IconComponent size={20} strokeWidth={1.75} color={config.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 'var(--font-weight-heavy, 800)',
            color: config.color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}
        >
          {title || config.title}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-body-sm, 14px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            color: 'var(--color-text-main, #1F2937)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.35,
            marginTop: '2px',
          }}
        >
          {message}
        </div>
      </div>

      {/* Dismiss Button (min 44px tap target) */}
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
          color: config.color,
          cursor: 'pointer',
          padding: 0,
          borderRadius: '8px',
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        <XCircle size={20} strokeWidth={1.75} color={config.color} />
      </button>
    </div>
  );
};

export default Toast;
