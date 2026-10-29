import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * NotificationProvider - Single centralized notification & toast manager for the entire application.
 * - Handles toast state, auto-dismiss, and swipe-to-dismiss in ONE place
 * - Listens for new background order events with an audio chime
 * - Provides `useNotification()` hook to any component without prop drilling
 */
export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({
    message: '',
    type: 'info',
    title: '',
  });

  const showToast = useCallback((message, type = 'info', title = '') => {
    setToast({ message, type, title });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: '' }));
  }, []);

  // Central listener for new incoming order notifications across the app
  useEffect(() => {
    const handleNewOrder = (e) => {
      const order = e.detail?.order;
      const orderNum = order?.orderNumber || order?.id || 'new';

      // Gentle sound chime for incoming order notification
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        }
      } catch {
        // audio policy or unsupported
      }

      showToast(`New order #${orderNum} received!`, 'warning', 'Incoming Order');
    };

    window.addEventListener('admin_new_order_arrived', handleNewOrder);
    return () => window.removeEventListener('admin_new_order_arrived', handleNewOrder);
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        title={toast.title}
        onClose={hideToast}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
