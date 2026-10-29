import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { orderApi, authApi, getErrorMessage } from '../services/api';
import Button from '../components/Button';
import {
  TrackingHeader,
  TrackingTimeline,
  TrackingOrderDetails,
  TrackingItemsCard,
  TrackingSupportCard,
} from '../modules/order-tracking';

export const OrderTrackingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ONLY treat as admin view if explicitly opened from admin orders page AND authenticated
  const isAdmin =
    searchParams.get('from') === 'admin' &&
    location.state?.from !== 'customer' &&
    authApi.isAuthenticated();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(
    async (isPolling = false) => {
      if (!token) return;
      try {
        if (!isPolling) setLoading(true);
        setError('');
        const data = await orderApi.trackOrder(token);
        setOrder(data);
        if (data && data.id) {
          try {
            const stored = JSON.parse(localStorage.getItem('greenbasket_recent_orders') || '[]');
            const updated = [
              {
                id: data.id,
                trackingToken: data.trackingToken || token,
                createdAt: data.createdAt,
                total: data.estimatedTotal,
                itemCount: data.items?.length || 0,
              },
              ...stored.filter((o) => o.id !== data.id),
            ].slice(0, 5);
            localStorage.setItem('greenbasket_recent_orders', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if (!isPolling) {
          setError(getErrorMessage(err, 'Unable to find this order. Please verify your tracking link.'));
        }
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchOrder(false);

    // Auto poll status every 30 seconds
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleBackToOrders = () => {
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      navigate('/admin/orders');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-page, #F8FAF5)',
        paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Top Brand Header */}
      <TrackingHeader
        isAdmin={isAdmin}
        onBackToOrders={handleBackToOrders}
      />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '20px var(--page-padding, 16px)' }}>
        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '28px', borderRadius: '999px' }} />
            <div
              style={{
                backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                borderRadius: 'var(--radius-card, 16px)',
                padding: '20px',
                border: '1px solid var(--color-border, #E5E7EB)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton-box" style={{ width: '130px', height: '24px' }} />
                <div className="skeleton-box" style={{ width: '90px', height: '24px', borderRadius: '999px' }} />
              </div>
              <div className="skeleton-box" style={{ width: '180px', height: '16px' }} />
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                borderRadius: 'var(--radius-card, 16px)',
                padding: '20px',
                border: '1px solid var(--color-border, #E5E7EB)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-box" style={{ width: '40%', height: '16px' }} />
                    <div className="skeleton-box" style={{ width: '70%', height: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-card, #FFFFFF)',
              borderRadius: 'var(--radius-card, 16px)',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0,0,0,0.06))',
              border: '1px solid var(--status-cancelled-border, #FECACA)',
              maxWidth: '440px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--status-cancelled, #DC2626)' }}>
              <Search size={28} strokeWidth={1.75} />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-title, 18px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--status-cancelled, #DC2626)', marginBottom: '8px' }}>
              Order Not Found
            </h2>
            <p style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-muted, #6B7280)', lineHeight: 1.5, marginBottom: '20px' }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={() => fetchOrder(false)}
                style={{ minHeight: '44px', padding: '10px 20px' }}
              >
                Try Again
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (isAdmin) {
                    handleBackToOrders();
                  } else {
                    navigate('/');
                  }
                }}
                style={{ minHeight: '44px', padding: '10px 20px' }}
              >
                {isAdmin ? 'Back to Admin Orders' : 'Browse Farm Fresh Vegetables'}
              </Button>
            </div>
          </div>
        )}

        {/* Loaded Order Content */}
        {!loading && !error && order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Live Indicator & Order Header Card */}
            <TrackingOrderDetails order={order} />

            {/* Visual Status Stepper Card */}
            <TrackingTimeline status={order.status} />

            {/* Items Ordered Card */}
            <TrackingItemsCard
              items={order.items || []}
              estimatedTotal={order.estimatedTotal}
            />

            {/* WhatsApp Support Card */}
            <TrackingSupportCard />
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTrackingPage;
