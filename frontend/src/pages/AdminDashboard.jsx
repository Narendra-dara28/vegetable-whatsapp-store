import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { productApi, settingsApi, getErrorMessage } from '../services/api';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/Button';
import {
  RouteSettingsCard,
  DashboardStats,
  InventoryFilters,
  SaveAllPricesBar,
  ProductModal,
  AdminProductGrid,
} from '../modules/admin-dashboard';

export const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useNotification();

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => { },
  });

  // Route and timing text banner
  const [routeText, setRouteText] = useState('');
  const [savingRoute, setSavingRoute] = useState(false);

  // Auto-Live Tracking State
  const [isAutoTracking, setIsAutoTracking] = useState(() => {
    return localStorage.getItem('admin_auto_tracking') === 'true';
  });
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [trackingStatusText, setTrackingStatusText] = useState('');
  const trackingIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // 'All', 'InStock', 'OutOfStock'

  // Daily Morning Workflow: Draft Prices map { [productId]: newPriceString }
  const [draftPrices, setDraftPrices] = useState({});
  const [savingPrices, setSavingPrices] = useState(false);

  // Availability Toggling state: Set of product IDs currently updating
  const [togglingIds, setTogglingIds] = useState(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch all products and route setting for admin
  const fetchProductsAndSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [data, routeRes, locationRes] = await Promise.all([
        productApi.getAllForAdmin(),
        settingsApi.getRouteAndTiming().catch(() => ({ value: '' })),
        settingsApi.getVehicleLocation().catch(() => ({ value: '' })),
      ]);

      setProducts(data);
      if (routeRes && routeRes.value) {
        setRouteText(routeRes.value);
      }
      if (locationRes && locationRes.value) {
        try {
          const parsed = JSON.parse(locationRes.value);
          setVehicleLocation(parsed);
        } catch {
          setVehicleLocation(null);
        }
      }

      // Initialize draft prices
      const initialDrafts = {};
      data.forEach((p) => {
        initialDrafts[p.id] = p.price !== null && p.price !== undefined ? String(p.price) : '0';
      });
      setDraftPrices(initialDrafts);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to load products from server.');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProductsAndSettings();
  }, [fetchProductsAndSettings]);

  // Broadcast current GPS location to server
  const sendGpsPing = useCallback((showNotification = false) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const payload = {
          latitude: lat,
          longitude: lng,
          landmark: '',
          updatedAt: new Date().toISOString(),
          isLive: true,
        };
        try {
          await settingsApi.updateVehicleLocation(JSON.stringify(payload));
          setVehicleLocation(payload);
          setTrackingStatusText(`Updated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
          if (showNotification) {
            showToast('Auto-tracking active! Location broadcasted to customers.', 'success');
          }
        } catch {
          // silently handle background broadcast error
        }
      },
      () => {
        if (showNotification) {
          showToast('Could not access GPS. Please check location permissions in browser.', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [showToast]);

  // Handle toggling continuous background live tracking
  const toggleAutoTracking = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    if (isAutoTracking) {
      setIsAutoTracking(false);
      localStorage.removeItem('admin_auto_tracking');
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTrackingStatusText('Tracking stopped');
      showToast('Auto-tracking stopped.', 'info');
    } else {
      setIsAutoTracking(true);
      localStorage.setItem('admin_auto_tracking', 'true');
      sendGpsPing(true);

      trackingIntervalRef.current = setInterval(() => {
        sendGpsPing(false);
      }, 30000);

      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const payload = {
              latitude: lat,
              longitude: lng,
              landmark: '',
              updatedAt: new Date().toISOString(),
              isLive: true,
            };
            settingsApi.updateVehicleLocation(JSON.stringify(payload))
              .then(() => {
                setVehicleLocation(payload);
                setTrackingStatusText(`Updated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
              })
              .catch(() => { });
          },
          () => { },
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      } catch {
        // fallback to interval
      }
    }
  }, [isAutoTracking, sendGpsPing, showToast]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Save Route text
  const handleSaveRoute = async () => {
    try {
      setSavingRoute(true);
      const res = await settingsApi.updateRouteAndTiming(routeText);
      setRouteText(res.value);
      showToast("Updated today's route for customer catalog!", 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update route text.'), 'error');
    } finally {
      setSavingRoute(false);
    }
  };

  // Clear Van Live Location
  const handleClearLocation = async () => {
    setIsAutoTracking(false);
    localStorage.removeItem('admin_auto_tracking');
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    try {
      const payload = { latitude: null, longitude: null, isLive: false, updatedAt: new Date().toISOString() };
      await settingsApi.updateVehicleLocation(JSON.stringify(payload));
      setVehicleLocation(null);
      setTrackingStatusText('');
      showToast('Live location turned off and cleared.', 'info');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to clear location.'), 'error');
    }
  };

  // Compute modified prices
  const modifiedItems = useMemo(() => {
    const list = [];
    products.forEach((p) => {
      const draft = draftPrices[p.id];
      if (draft !== undefined) {
        const parsedDraft = parseFloat(draft);
        const original = parseFloat(p.price);
        if (!isNaN(parsedDraft) && parsedDraft !== original) {
          list.push({ id: p.id, price: parsedDraft, name: p.name });
        }
      }
    });
    return list;
  }, [products, draftPrices]);

  const hasUnsavedChanges = modifiedItems.length > 0;

  // Handle inline price change in a product row
  const handlePriceChange = (id, newPrice) => {
    setDraftPrices((prev) => ({
      ...prev,
      [id]: newPrice,
    }));
  };

  // Prompt Save All Prices with ConfirmDialog
  const promptSaveAllPrices = () => {
    if (modifiedItems.length === 0) return;
    for (const item of modifiedItems) {
      if (isNaN(item.price) || item.price < 0) {
        showToast(`Invalid price for "${item.name}". Price must be 0 or greater.`, 'error');
        return;
      }
    }
    setConfirmDialog({
      isOpen: true,
      title: `Save ${modifiedItems.length} Price Change${modifiedItems.length > 1 ? 's' : ''}`,
      message: `Are you sure you want to update prices for ${modifiedItems.length} product${modifiedItems.length > 1 ? 's' : ''}? The updated rates will immediately appear in the customer catalog.`,
      confirmText: `Yes, Save ${modifiedItems.length} Price${modifiedItems.length > 1 ? 's' : ''}`,
      cancelText: 'Cancel',
      type: 'primary',
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        handleSaveAllPrices();
      },
    });
  };

  // Single "Save all prices" morning routine update
  const handleSaveAllPrices = async () => {
    if (modifiedItems.length === 0) return;

    for (const item of modifiedItems) {
      if (isNaN(item.price) || item.price < 0) {
        showToast(`Invalid price for "${item.name}". Price must be 0 or greater.`, 'error');
        return;
      }
    }

    try {
      setSavingPrices(true);
      const payload = modifiedItems.map((item) => ({ id: item.id, price: item.price }));
      const updatedList = await productApi.bulkUpdatePrices(payload);

      setProducts((prev) =>
        prev.map((p) => {
          const updated = updatedList.find((u) => u.id === p.id);
          return updated || p;
        })
      );

      const newDrafts = { ...draftPrices };
      updatedList.forEach((u) => {
        newDrafts[u.id] = String(u.price);
      });
      setDraftPrices(newDrafts);

      showToast(`Successfully updated ${updatedList.length} product prices!`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save prices. Please try again.'), 'error');
    } finally {
      setSavingPrices(false);
    }
  };

  // Toggle availability (In Stock / Sold Out)
  const handleToggleAvailability = async (id, currentAvailable) => {
    try {
      setTogglingIds((prev) => new Set(prev).add(id));
      const newStatus = !currentAvailable;
      const updated = await productApi.updateAvailability(id, newStatus);

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: updated.available } : p))
      );

      showToast(
        `"${updated.name}" is now marked as ${updated.available ? 'In Stock' : 'Sold Out'}.`,
        'info'
      );
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update item availability.'), 'error');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Soft delete / deactivate action with styled confirmation modal
  const handleDeactivate = (product) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Product',
      message: `Are you sure you want to deactivate "${product.name}"? It will be removed from customer view.`,
      confirmText: 'Yes, Deactivate Product',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await productApi.delete(product.id);
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, available: false } : p))
          );
          showToast(`"${product.name}" has been deactivated.`, 'warning');
        } catch (err) {
          showToast(getErrorMessage(err, 'Failed to deactivate product.'), 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Remove product from state when deleted via centralized DeleteButton
  const handleRemoveProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setDraftPrices((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleProductSaved = (savedProduct, isEdit) => {
    if (isEdit) {
      setProducts((prev) => prev.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      setDraftPrices((prev) => ({ ...prev, [savedProduct.id]: String(savedProduct.price) }));
      showToast(`"${savedProduct.name}" details updated successfully!`, 'success');
    } else {
      setProducts((prev) => [savedProduct, ...prev]);
      setDraftPrices((prev) => ({ ...prev, [savedProduct.id]: String(savedProduct.price) }));
      showToast(`Added new item "${savedProduct.name}" to inventory!`, 'success');
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nameLocal && p.nameLocal.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'InStock' && p.available) ||
        (stockFilter === 'OutOfStock' && !p.available);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Inventory stats
  const totalItems = products.length;
  const inStockCount = products.filter((p) => p.available).length;
  const outOfStockCount = totalItems - inStockCount;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '140px', backgroundColor: 'var(--color-bg-page, #F8FAF5)' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={handleOpenAddModal}
              icon={Plus}
              style={{ minHeight: '44px', fontSize: '0.82rem', fontWeight: '700' }}
            >
              Add Product
            </Button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-primary-dark, #166534)',
                fontWeight: '700',
                textDecoration: 'none',
                padding: '8px 14px',
                backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                border: '1px solid var(--color-border, #E5E7EB)',
                borderRadius: 'var(--radius-btn, 12px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            >
              <span>View Catalog</span>
              <ExternalLink size={14} strokeWidth={1.75} />
            </a>
          </div>
        </div>

        {/* Route Settings & Live GPS Card */}
        <RouteSettingsCard
          routeText={routeText}
          onRouteChange={setRouteText}
          onSaveRoute={handleSaveRoute}
          savingRoute={savingRoute}
          isAutoTracking={isAutoTracking}
          onToggleAutoTracking={toggleAutoTracking}
          vehicleLocation={vehicleLocation}
          trackingStatusText={trackingStatusText}
          onClearLocation={handleClearLocation}
        />

        {/* Price & Inventory Stats Summary */}
        <DashboardStats
          totalItems={totalItems}
          inStockCount={inStockCount}
          outOfStockCount={outOfStockCount}
          modifiedCount={modifiedItems.length}
        />

        {/* Search & Category / Stock Filters */}
        <InventoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          totalItems={totalItems}
          inStockCount={inStockCount}
          outOfStockCount={outOfStockCount}
        />

        {/* Inventory Presentation: Loading Skeletons, Error Retry, Empty State, and Product Grid */}
        <AdminProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          draftPrices={draftPrices}
          togglingIds={togglingIds}
          onRetry={fetchProductsAndSettings}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setStockFilter('All');
          }}
          onPriceChange={handlePriceChange}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleOpenEditModal}
          onDeactivate={handleDeactivate}
          onRemoveProduct={handleRemoveProduct}
        />
      </main>

      {/* Floating Save All Prices Bar */}
      <SaveAllPricesBar
        hasUnsavedChanges={hasUnsavedChanges}
        modifiedCount={modifiedItems.length}
        savingPrices={savingPrices}
        onSaveAllPrices={promptSaveAllPrices}
      />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleProductSaved}
        editingProduct={editingProduct}
      />

      {/* Centered ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminDashboard;
