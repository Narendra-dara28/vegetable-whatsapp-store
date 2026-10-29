import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingBasket, Package, LogOut } from 'lucide-react';
import { authApi, orderApi } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import Button from './Button';

export const Navbar = () => {
  const user = authApi.getCurrentUser();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('admin_new_orders_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const prevCountRef = React.useRef(null);

  // Keep new orders count fresh
  const fetchNewOrdersCount = useCallback(async () => {
    if (!authApi.isAuthenticated()) return;
    try {
      const data = await orderApi.getAllForAdmin({ size: 1, status: 'NEW' });
      const count = data?.statusCounts?.NEW ?? (data?.totalElements ?? 0);
      const newestOrder = (data?.orders && data.orders[0]) || null;

      if (prevCountRef.current !== null && count > prevCountRef.current) {
        window.dispatchEvent(
          new CustomEvent('admin_new_order_arrived', {
            detail: { count, order: newestOrder },
          })
        );
      }
      prevCountRef.current = count;
      setNewOrdersCount(count);
      try {
        localStorage.setItem('admin_new_orders_count', String(count));
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNewOrdersCount();

    // Listen to custom updates from AdminOrders
    const handleOrdersUpdated = (e) => {
      if (e?.detail?.newCount !== undefined) {
        setNewOrdersCount(e.detail.newCount);
      } else {
        fetchNewOrdersCount();
      }
    };

    window.addEventListener('admin_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', fetchNewOrdersCount);

    const interval = setInterval(fetchNewOrdersCount, 25000);
    return () => {
      window.removeEventListener('admin_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', fetchNewOrdersCount);
      clearInterval(interval);
    };
  }, [fetchNewOrdersCount]);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    authApi.logout();
  };

  const isPricesActive = location.pathname === '/admin' || location.pathname === '/admin/';
  const isOrdersActive = location.pathname.startsWith('/admin/orders');

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--color-border, #E5E7EB)',
          padding: '10px var(--page-padding, 16px)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: 'var(--shadow-btn-primary, 0 2px 8px rgba(22, 163, 74, 0.3))',
                flexShrink: 0,
              }}
            >
              <ShoppingBasket size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-title, 18px)', fontWeight: 'var(--font-weight-heavy, 800)', lineHeight: 1.2, color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
                Green Basket <span style={{ color: 'var(--color-primary, #16A34A)' }}>Admin</span>
              </h1>
              <p style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', fontWeight: 500, margin: 0 }}>
                Daily Price &amp; Inventory Control
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="admin-desktop-tabs"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Link
              to="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-btn, 12px)',
                fontSize: 'var(--font-size-body-sm, 14px)',
                fontWeight: isPricesActive ? '700' : '600',
                textDecoration: 'none',
                backgroundColor: isPricesActive ? 'var(--color-primary, #16A34A)' : 'transparent',
                color: isPricesActive ? '#ffffff' : 'var(--color-text-muted, #6B7280)',
                minHeight: '44px',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
              }}
            >
              <ShoppingBasket size={18} strokeWidth={1.75} />
              <span>Price &amp; Inventory</span>
            </Link>

            <Link
              to="/admin/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-btn, 12px)',
                fontSize: 'var(--font-size-body-sm, 14px)',
                fontWeight: isOrdersActive ? '700' : '600',
                textDecoration: 'none',
                backgroundColor: isOrdersActive ? 'var(--color-primary, #16A34A)' : 'transparent',
                color: isOrdersActive ? '#ffffff' : 'var(--color-text-muted, #6B7280)',
                minHeight: '44px',
                boxSizing: 'border-box',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <Package size={18} strokeWidth={1.75} />
              <span>Orders</span>
              {newOrdersCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--status-cancelled, #DC2626)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: '16px',
                    marginLeft: '2px',
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {newOrdersCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right User Pill & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                  border: '1px solid var(--color-border, #E5E7EB)',
                  borderRadius: '9999px',
                  fontSize: 'var(--font-size-xs, 12px)',
                  fontWeight: '600',
                  color: 'var(--color-text-main, #1F2937)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary, #16A34A)',
                  }}
                />
                <span>{user.username}</span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                minHeight: '44px',
                padding: '8px 14px',
                fontSize: 'var(--font-size-body-sm, 14px)',
                borderRadius: 'var(--radius-btn, 12px)',
              }}
              title="Log out"
            >
              <LogOut size={16} strokeWidth={1.75} />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Price & Inventory | Orders with red badge) */}
      <nav
        className="admin-mobile-tab-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          boxSizing: 'border-box',
        }}
      >
        <Link
          to="/admin"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            minHeight: '56px',
            textDecoration: 'none',
            color: isPricesActive ? 'var(--color-primary, #16A34A)' : 'var(--color-text-muted, #6B7280)',
            position: 'relative',
            touchAction: 'manipulation',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingBasket size={22} strokeWidth={isPricesActive ? 2.2 : 1.75} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: isPricesActive ? '800' : '600',
              marginTop: '3px',
              lineHeight: 1.2,
            }}
          >
            Price &amp; Inventory
          </span>
          {isPricesActive && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '36px',
                height: '3px',
                borderRadius: '0 0 3px 3px',
                backgroundColor: 'var(--color-primary, #16A34A)',
              }}
            />
          )}
        </Link>

        <Link
          to="/admin/orders"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            minHeight: '56px',
            textDecoration: 'none',
            color: isOrdersActive ? 'var(--color-primary, #16A34A)' : 'var(--color-text-muted, #6B7280)',
            position: 'relative',
            touchAction: 'manipulation',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Package size={22} strokeWidth={isOrdersActive ? 2.2 : 1.75} />
            {newOrdersCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-14px',
                  backgroundColor: 'var(--status-cancelled, #DC2626)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '9999px',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(220, 38, 38, 0.4)',
                  animation: 'pulseGlow 2s infinite',
                }}
              >
                {newOrdersCount > 99 ? '99+' : newOrdersCount}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: isOrdersActive ? '800' : '600',
              marginTop: '3px',
              lineHeight: 1.2,
            }}
          >
            Orders
          </span>
          {isOrdersActive && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '36px',
                height: '3px',
                borderRadius: '0 0 3px 3px',
                backgroundColor: 'var(--color-primary, #16A34A)',
              }}
            />
          )}
        </Link>
      </nav>

      <style>{`
        @media (min-width: 769px) {
          .admin-desktop-tabs {
            display: flex !important;
          }
          .admin-mobile-tab-bar {
            display: none !important;
          }
        }
      `}</style>

      {/* Centered ConfirmDialog for Logout */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out of Admin"
        cancelText="Stay Logged In"
        type="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;
