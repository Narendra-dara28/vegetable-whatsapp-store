import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, settingsApi, orderApi, getErrorMessage, VENDOR_WHATSAPP_NUMBER } from '../services/api';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { Chip } from '../components/Chip';
import SearchBar from '../components/SearchBar';
import HorizontalScroller from '../components/HorizontalScroller';
import {
  CustomerHeader,
  RouteBanner,
  CustomerProductGrid,
  FloatingCartBar,
  WhatsAppOrderModal,
  CartDrawer,
  TrackOrderModal,
} from '../modules/customer';
import {
  getActiveRecentOrders,
  saveRecentOrder,
  removeRecentOrder,
  syncRecentOrders,
} from '../utils/recentOrdersHelper';
import { FALLBACK_PRODUCTS } from '../utils/fallbackProducts';

export const CustomerCatalog = () => {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [routeText, setRouteText] = useState('');
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [orderModalStep, setOrderModalStep] = useState('PENDING'); // 'PENDING' | 'CONFIRMED'
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  // Instant initial count directly from helper
  const [recentOrders, setRecentOrders] = useState(getActiveRecentOrders);
  const { showToast } = useNotification();

  const { cart, totalItemCount, clearCart } = useCart();
  const navigate = useNavigate();

  // Background sync with live backend statuses
  const updateRecentOrders = useCallback(async () => {
    const { active } = await syncRecentOrders();
    setRecentOrders(active);
  }, []);

  useEffect(() => {
    updateRecentOrders();
    // 30 seconds background sync timer to update count if orders are delivered/cancelled
    const interval = setInterval(updateRecentOrders, 30000);
    const handleFocus = () => updateRecentOrders();
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateRecentOrders]);

  const handleTrackOrderClick = useCallback(async () => {
    try {
      const { active } = await syncRecentOrders();
      setRecentOrders(active);

      if (active.length === 0) {
        showToast('No active delivery orders found on this device.', 'info');
        return;
      }
      if (active.length === 1) {
        // Only 1 live order: Directly open that order's tracking page!
        navigate(`/order/${active[0].trackingToken || active[0].id}`, { state: { from: 'customer' } });
        return;
      }
      // If 2 or more live orders: Open clean modal with scrollbar
      setIsTrackModalOpen(true);
    } catch {
      showToast('Could not check orders. Please try again.', 'info');
    }
  }, [navigate, showToast]);

  const handleCloseOrderModal = useCallback(() => {
    setOrderSuccessData(null);
    setOrderModalStep('PENDING');
  }, []);

  const handleGoBackToStore = useCallback(() => {
    // Return to store with cart fully preserved.
    // No order is created or cancelled in DB, sequence is untouched.
    setOrderSuccessData(null);
    setOrderModalStep('PENDING');
  }, []);

  // Secret owner access: 3 rapid taps (< 1.5s) OR 3.5s hold on logo
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const holdTimerRef = useRef(null);

  const triggerAdminAccess = useCallback(() => {
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    tapCountRef.current = 0;
    try {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(80);
      }
    } catch {
      // ignore
    }
    navigate('/admin/login');
  }, [navigate]);

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    } else if (tapCountRef.current >= 3) {
      triggerAdminAccess();
    }
  }, [triggerAdminAccess]);

  const handleHoldStart = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      triggerAdminAccess();
    }, 3500);
  }, [triggerAdminAccess]);

  const handleHoldEnd = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // Load public products and route settings
  const loadCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [productsData, routeData, locationData] = await Promise.all([
        productApi.getPublicCatalog(),
        settingsApi.getRouteAndTiming().catch(() => ({ value: '' })),
        settingsApi.getVehicleLocation().catch(() => ({ value: '' })),
      ]);

      setProducts(Array.isArray(productsData) && productsData.length > 0 ? productsData : FALLBACK_PRODUCTS);
      if (routeData && routeData.value) {
        setRouteText(routeData.value);
      }
      if (locationData && locationData.value) {
        try {
          const parsed = JSON.parse(locationData.value);
          setVehicleLocation(parsed);
        } catch {
          setVehicleLocation(null);
        }
      } else {
        setVehicleLocation(null);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Failed to load catalog. Please check connection.');
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Live location is active only when admin turned it on and coordinates exist
  const hasLiveLocation = Boolean(
    vehicleLocation?.isLive &&
    vehicleLocation?.latitude &&
    vehicleLocation?.longitude
  );

  // Compute Google Maps Navigation URL for customer
  const googleMapsUrl = useMemo(() => {
    if (hasLiveLocation) {
      return `https://www.google.com/maps/dir/?api=1&destination=${vehicleLocation.latitude},${vehicleLocation.longitude}`;
    }
    return '';
  }, [hasLiveLocation, vehicleLocation]);

  useEffect(() => {
    loadCatalogData();

    // Auto-refresh when customer switches back to the tab
    const handleFocus = () => loadCatalogData();
    window.addEventListener('focus', handleFocus);

    // Refresh route banner and catalog every 60s
    const interval = setInterval(loadCatalogData, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadCatalogData]);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    const list = Array.isArray(products) ? products : [];
    list.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nameLocal && p.nameLocal.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculate live estimated total for bottom sticky bar
  const liveEstimatedTotal = useMemo(() => {
    let sum = 0;
    const list = Array.isArray(products) ? products : [];
    Object.entries(cart).forEach(([idStr, qty]) => {
      const prod = list.find((p) => p.id === Number(idStr));
      if (prod && qty > 0) {
        sum += Number(prod.price) * qty;
      }
    });
    return sum.toFixed(2);
  }, [cart, products]);

  const handleSendWhatsAppOrder = useCallback(async () => {
    if (!orderSuccessData || !orderSuccessData.payload) return;

    // Pre-open window synchronously to prevent mobile/desktop popup blockers
    const waWindow = window.open('about:blank', '_blank');

    try {
      setIsSubmittingOrder(true);

      // 1. Submit Order to Spring Boot Backend API ONLY NOW!
      const savedOrder = await orderApi.createOrder(orderSuccessData.payload);

      // 2. Format WhatsApp Message Template
      const now = new Date();
      const orderDateStr = now.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const itemsListText = (orderSuccessData.cartItems || [])
        .map(({ product, quantity, subtotal }, idx) => {
          const itemTotalFormatted = Number(subtotal).toFixed(2);
          const cleanItemTotal = itemTotalFormatted.endsWith('.00')
            ? String(Math.round(subtotal))
            : itemTotalFormatted;
          return `${idx + 1}. *${product.name}* (${product.unit}) × ${quantity} = ₹${cleanItemTotal}`;
        })
        .join('\n');

      const totalNum = Number(savedOrder.estimatedTotal || orderSuccessData.total || 0);
      const formattedTotal = Number.isInteger(totalNum)
        ? String(totalNum)
        : totalNum.toFixed(2);

      const finalMapUrl = savedOrder.locationUrl || orderSuccessData.effectiveLocationUrl;
      const instructionLine = orderSuccessData.savedAddress?.deliveryInstruction
        ? `\n📝 ${orderSuccessData.savedAddress.deliveryInstruction}`
        : '';

      const trackingUrl = savedOrder.trackingToken
        ? `${window.location.origin}/order/${savedOrder.trackingToken}`
        : '';
      const trackingLine = trackingUrl ? `\n🔍 Live Tracking: ${trackingUrl}` : '';

      const whatsappMessage =
        `*Green Basket | Order #${savedOrder.id}*\n` +
        `${orderDateStr}\n\n` +
        `*${savedOrder.customerName}* · +91 ${savedOrder.phone}\n` +
        `${savedOrder.address}\n` +
        `📍 ${finalMapUrl}${instructionLine}\n\n` +
        `${itemsListText}\n` +
        `*Total: ₹${formattedTotal}*${trackingLine}`;

      const whatsappUrl = `https://wa.me/${VENDOR_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      // 3. Navigate the opened tab to WhatsApp
      if (waWindow && !waWindow.closed) {
        waWindow.location.href = whatsappUrl;
      } else {
        window.location.assign(whatsappUrl);
      }

      // 4. Save to Recent Orders for local device tracking
      const active = saveRecentOrder({
        id: savedOrder.id,
        trackingToken: savedOrder.trackingToken,
        createdAt: savedOrder.createdAt || new Date().toISOString(),
        total: formattedTotal,
        itemCount: orderSuccessData.cartItems?.length || 1,
        status: 'NEW',
      });
      setRecentOrders(active);

      // 5. Clear cart now that order is confirmed
      clearCart();

      // 6. Update orderSuccessData with real order details
      setOrderSuccessData({
        id: savedOrder.id,
        trackingToken: savedOrder.trackingToken,
        customerName: savedOrder.customerName,
        whatsappUrl,
        total: formattedTotal,
        itemCount: orderSuccessData.cartItems?.length || 1,
      });

      // 7. Transition modal to Step 2: CONFIRMED
      setOrderModalStep('CONFIRMED');
    } catch (err) {
      if (waWindow && !waWindow.closed) {
        waWindow.close();
      }
      const errMsg = getErrorMessage(
        err,
        'Could not place order. An item might be sold out or unavailable. Please review your cart.'
      );
      showToast(errMsg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [orderSuccessData, clearCart, showToast]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page, #F8FAF5)', paddingBottom: totalItemCount > 0 ? '90px' : '30px' }}>
      {/* Customer Storefront Header */}
      <CustomerHeader
        onLogoTap={handleLogoTap}
        onHoldStart={handleHoldStart}
        onHoldEnd={handleHoldEnd}
        onTrackOrderClick={handleTrackOrderClick}
        recentOrdersCount={recentOrders.length}
      />

      {/* Main Catalog Body */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Route & Live Van Location Banner */}
        <RouteBanner
          routeText={routeText}
          hasLiveLocation={hasLiveLocation}
          googleMapsUrl={googleMapsUrl}
        />

        {/* Sticky Search Bar and Category Filter Bar */}
        <div
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 80,
            backgroundColor: 'var(--color-bg-page, #F8FAF5)',
            paddingTop: '6px',
            paddingBottom: '6px',
            marginBottom: '12px',
          }}
        >
          {/* Unified Search Bar */}
          <div style={{ marginBottom: '10px' }}>
            <SearchBar
              id="customer-catalog-search"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search vegetables & fruits (టమాటా, Potato, etc.)..."
            />
          </div>

          {/* Category Tabs using unified HorizontalScroller */}
          <HorizontalScroller>
            {categories.map((cat) => (
              <Chip
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Chip>
            ))}
          </HorizontalScroller>
        </div>

        {/* Products Grid / Skeletons / Error / Empty Results */}
        <CustomerProductGrid
          loading={loading}
          error={error}
          products={filteredProducts}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          onRetry={loadCatalogData}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedCategory('All');
          }}
          onAddToCart={(prod) => showToast(`Added ${prod.name} to cart`, 'success')}
          onSoldOutClick={(prod) => showToast(`"${prod.name}" is currently sold out`, 'warning')}
        />
      </main>

      {/* Floating Cart Bar fixed at the bottom */}
      <FloatingCartBar
        totalItemCount={totalItemCount}
        cartTotal={liveEstimatedTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(orderData) => {
          setOrderSuccessData(orderData);
          setOrderModalStep('PENDING');
        }}
        products={products}
      />

      {/* WhatsApp Order Dispatch & Confirmation Modal */}
      <WhatsAppOrderModal
        orderData={orderSuccessData}
        step={orderModalStep}
        isSubmitting={isSubmittingOrder}
        onSendWhatsApp={handleSendWhatsAppOrder}
        onGoBackToStore={handleGoBackToStore}
        onClose={handleCloseOrderModal}
      />

      {/* Track Order Modal (only shown if user has multiple orders) */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        orders={recentOrders}
        onClose={() => {
          setIsTrackModalOpen(false);
          updateRecentOrders();
        }}
      />
    </div>
  );
};

export default CustomerCatalog;
