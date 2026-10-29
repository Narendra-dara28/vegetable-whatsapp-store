import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { orderApi, getErrorMessage } from '../services/api';
import Navbar from '../components/Navbar';
import { useNotification } from '../context/NotificationContext';
import SearchBar from '../components/SearchBar';
import RefreshButton from '../components/RefreshButton';
import {
  OrderStatusTabs,
  OrderDateFilters,
  OrderReplyModal,
  OrderCancelModal,
  AdminOrderCard,
  AdminOrderList,
  matchesOrder,
  buildMessageTemplate,
} from '../modules/admin-orders';
import {
  normalizePhone,
  formatFullDateTime,
  toLocalISO,
  buildWhatsAppChatUrl,
} from '../utils/helpers';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotification();
  const [updatingId, setUpdatingId] = useState(null);

  // Tabs: ALL, NEW, CONFIRMED, OUT_FOR_DELIVERY, CANCELLED, COMPLETED
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status counts for badge counters
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    NEW: 0,
    CONFIRMED: 0,
    OUT_FOR_DELIVERY: 0,
    CANCELLED: 0,
    COMPLETED: 0,
  });

  // Pagination & summary totals
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Global Search State with 250ms debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Completed Tab Filters
  const [datePreset, setDatePreset] = useState('TODAY');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Expandable compact cards state
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Reply Modal State
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    order: null,
    targetStatus: null,
    deliveryTime: '',
    messageText: '',
  });

  // Cancel Confirmation Modal State
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
  });

  // Helper: compute from and to dates based on preset
  const getDateRange = useCallback((preset, fromDate, toDate) => {
    const today = new Date();
    if (preset === 'TODAY') {
      const todayStr = toLocalISO(today);
      return { from: todayStr, to: todayStr };
    } else if (preset === 'YESTERDAY') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yestStr = toLocalISO(yest);
      return { from: yestStr, to: yestStr };
    } else if (preset === 'LAST_7_DAYS') {
      const past = new Date();
      past.setDate(past.getDate() - 6);
      return { from: toLocalISO(past), to: toLocalISO(today) };
    } else if (preset === 'CUSTOM') {
      return { from: fromDate || null, to: toDate || null };
    }
    return { from: null, to: null };
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(
    async (tab = statusFilter, page = 0, isAppend = false) => {
      try {
        if (isAppend) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError('');

        const params = {
          page,
          size: 20,
        };

        if (tab === 'COMPLETED') {
          params.status = 'COMPLETED';
          const range = getDateRange(datePreset, customFrom, customTo);
          if (range.from) params.from = range.from;
          if (range.to) params.to = range.to;
        } else if (tab !== 'ALL') {
          params.status = tab;
        } else {
          params.status = 'ALL';
        }

        // Send debounced search parameter to backend
        if (debouncedSearch && debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const data = await orderApi.getAllForAdmin(params);
        const orderList = Array.isArray(data) ? data : data.orders || [];

        if (isAppend) {
          setOrders((prev) => [...prev, ...orderList]);
        } else {
          setOrders(orderList);
        }

        if (data.statusCounts) {
          setStatusCounts(data.statusCounts);
          try {
            localStorage.setItem('admin_new_orders_count', String(data.statusCounts.NEW || 0));
            window.dispatchEvent(new CustomEvent('admin_orders_updated', { detail: { newCount: data.statusCounts.NEW || 0 } }));
          } catch {
            // ignore
          }
        }
        setTotalElements(data.totalElements ?? orderList.length);
        setTotalPages(data.totalPages ?? 1);
        setCurrentPage(data.currentPage ?? page);
        setTotalAmount(data.totalAmount ?? 0);
      } catch (err) {
        const msg = getErrorMessage(err, 'Failed to fetch customer orders.');
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, debouncedSearch, datePreset, customFrom, customTo, getDateRange, showToast]
  );

  // Initial load, tab switch, and debounced search triggers
  useEffect(() => {
    fetchOrders(statusFilter, 0, false);
  }, [statusFilter, debouncedSearch, fetchOrders]);

  // Listen to incoming new orders to auto-refresh list
  useEffect(() => {
    const handleNewOrder = () => {
      fetchOrders(statusFilter, 0, false);
    };
    window.addEventListener('admin_new_order_arrived', handleNewOrder);
    return () => window.removeEventListener('admin_new_order_arrived', handleNewOrder);
  }, [statusFilter, fetchOrders]);

  // Handle date filters on COMPLETED tab
  useEffect(() => {
    if (statusFilter === 'COMPLETED') {
      fetchOrders('COMPLETED', 0, false);
    }
  }, [datePreset, customFrom, customTo, statusFilter, fetchOrders]);

  // Filter loaded orders client-side for instantaneous feedback
  const filteredOrders = useMemo(() => {
    const activeSearch = debouncedSearch.trim() || searchQuery.trim();
    if (!activeSearch) {
      return orders;
    }
    return orders.filter((order) => matchesOrder(order, activeSearch));
  }, [orders, debouncedSearch, searchQuery]);

  // Dynamic chip counts reflecting current search
  const displayStatusCounts = useMemo(() => {
    const activeSearch = searchQuery.trim();
    if (!activeSearch) {
      return statusCounts;
    }
    if (debouncedSearch.trim() === activeSearch && statusCounts) {
      return statusCounts;
    }
    const counts = {
      ALL: filteredOrders.length,
      NEW: 0,
      CONFIRMED: 0,
      OUT_FOR_DELIVERY: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };
    filteredOrders.forEach((o) => {
      if (o.status === 'NEW') counts.NEW += 1;
      else if (o.status === 'CONFIRMED') counts.CONFIRMED += 1;
      else if (o.status === 'OUT_FOR_DELIVERY') counts.OUT_FOR_DELIVERY += 1;
      else if (o.status === 'CANCELLED') counts.CANCELLED += 1;
      else if (o.status === 'DELIVERED' || o.status === 'COMPLETED') counts.COMPLETED += 1;
    });
    return counts;
  }, [searchQuery, debouncedSearch, statusCounts, filteredOrders]);

  const handleTabChange = (newTab) => {
    setStatusFilter(newTab);
    setCurrentPage(0);
  };

  const handleOpenReplyModal = (order, targetStatus) => {
    const initialText = buildMessageTemplate(targetStatus, order, '');
    setReplyModal({
      isOpen: true,
      order,
      targetStatus,
      deliveryTime: '',
      messageText: initialText,
    });
  };

  const handlePromptCancel = (order) => {
    setCancelModal({
      isOpen: true,
      order,
    });
  };

  const handleConfirmCancel = () => {
    const orderToCancel = cancelModal.order;
    setCancelModal({ isOpen: false, order: null });
    if (orderToCancel) {
      handleOpenReplyModal(orderToCancel, 'CANCELLED');
    }
  };

  const handleDeliveryTimeChange = (newTime) => {
    const updatedText = buildMessageTemplate(replyModal.targetStatus, replyModal.order, newTime);
    setReplyModal((prev) => ({
      ...prev,
      deliveryTime: newTime,
      messageText: updatedText,
    }));
  };

  const handleConfirmStatusChange = async (openWhatsApp = true) => {
    const { order, targetStatus, messageText } = replyModal;
    if (!order || !targetStatus) return;

    try {
      setUpdatingId(order.id);
      const updated = await orderApi.updateStatus(order.id, targetStatus);

      if (targetStatus === 'DELIVERED') {
        if (statusFilter === 'ALL') {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                  ...o,
                  status: 'DELIVERED',
                  deliveredAt: updated.deliveredAt || new Date().toISOString(),
                }
                : o
            )
          );
        } else if (statusFilter !== 'COMPLETED') {
          setOrders((prev) => prev.filter((o) => o.id !== order.id));
        } else {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? {
                  ...o,
                  status: 'DELIVERED',
                  deliveredAt: updated.deliveredAt || new Date().toISOString(),
                }
                : o
            )
          );
        }

        setStatusCounts((prev) => {
          const oldStatus = order.status;
          return {
            ...prev,
            [oldStatus]: Math.max(0, (prev[oldStatus] || 1) - 1),
            COMPLETED: (prev.COMPLETED || 0) + 1,
          };
        });
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o))
        );
        if (order.status !== targetStatus) {
          setStatusCounts((prev) => ({
            ...prev,
            [order.status]: Math.max(0, (prev[order.status] || 1) - 1),
            [targetStatus]: (prev[targetStatus] || 0) + 1,
          }));
        }
      }

      setReplyModal({
        isOpen: false,
        order: null,
        targetStatus: null,
        deliveryTime: '',
        messageText: '',
      });

      if (openWhatsApp) {
        const phone91 = normalizePhone(order.phone);
        const waUrl = buildWhatsAppChatUrl(phone91, messageText);
        window.open(waUrl, '_blank');
        showToast(
          `Order #${order.id} marked as ${targetStatus === 'DELIVERED' ? 'Delivered' : targetStatus} & WhatsApp opened`,
          'success'
        );
      } else {
        showToast(
          targetStatus === 'DELIVERED'
            ? `Order #${order.id} marked as Delivered`
            : `Order #${order.id} status updated to ${targetStatus}`,
          'success'
        );
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update order status.'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleCardExpand = (orderId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleExportCSV = async () => {
    try {
      const range = getDateRange(datePreset, customFrom, customTo);
      const params = {
        status: 'COMPLETED',
        size: 1000,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (range.from) params.from = range.from;
      if (range.to) params.to = range.to;

      const data = await orderApi.getAllForAdmin(params);
      const exportList = data.orders || [];

      if (exportList.length === 0) {
        showToast('No delivered orders found for this range to export.', 'info');
        return;
      }

      const headers = [
        'Order No',
        'Delivered Date & Time',
        'Customer Name',
        'Phone',
        'Address',
        'Items Summary',
        'Total (INR)',
      ];

      const rows = exportList.map((o) => {
        const deliveredStr = o.deliveredAt
          ? formatFullDateTime(o.deliveredAt)
          : o.updatedAt
            ? formatFullDateTime(o.updatedAt)
            : '';
        const itemsSummary = (o.items || [])
          .map((i) => `${i.productName} (${i.unit}) x ${i.quantity}`)
          .join('; ');

        return [
          `"#${o.id}"`,
          `"${deliveredStr}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${o.phone || ''}"`,
          `"${(o.address || '').replace(/"/g, '""')}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          o.estimatedTotal || 0,
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateTag = datePreset.toLowerCase();
      link.setAttribute(
        'download',
        `delivered_orders_${dateTag}_${toLocalISO(new Date())}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${exportList.length} orders to CSV successfully!`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to export CSV.'), 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page, #F8FAF5)', paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        {/* Sticky Search Bar & Refresh Row */}
        <div
          style={{
            position: 'sticky',
            top: '58px',
            zIndex: 40,
            backgroundColor: 'var(--color-bg-page, #F8FAF5)',
            paddingTop: '6px',
            paddingBottom: '10px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchBar
              id="admin-orders-search"
              placeholder="Search by order no, name, phone, item, area..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <RefreshButton
            onClick={() => fetchOrders(statusFilter, 0, false)}
            loading={loading}
          />
        </div>

        {/* Clean Horizontally Scrolling Status Filter Chips */}
        <OrderStatusTabs
          statusFilter={statusFilter}
          onTabChange={handleTabChange}
          statusCounts={displayStatusCounts}
        />

        {/* Result Count Indicator when search is active */}
        {(searchQuery.trim() || debouncedSearch.trim()) && (
          <div
            id="search-results-count"
            style={{
              fontSize: '0.82rem',
              fontWeight: '600',
              color: 'var(--color-text-muted, #6B7280)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
            }}
          >
            <span>
              <strong style={{ color: 'var(--color-text-main, #1F2937)' }}>
                {debouncedSearch.trim() === searchQuery.trim() && totalElements !== undefined
                  ? totalElements
                  : filteredOrders.length}
              </strong>{' '}
              {(debouncedSearch.trim() === searchQuery.trim() && totalElements !== undefined ? totalElements : filteredOrders.length) === 1 ? 'order found' : 'orders found'}
              {statusFilter !== 'ALL' && (
                <span> in <strong style={{ textTransform: 'capitalize' }}>{statusFilter.toLowerCase().replace('_', ' ')}</strong></span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #16A34A)',
                fontWeight: '700',
                fontSize: '0.78rem',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* COMPLETED TAB: Summary Bar & Date Filter Controls */}
        {statusFilter === 'COMPLETED' && (
          <OrderDateFilters
            totalElements={totalElements}
            totalAmount={totalAmount}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* Orders Presentation: Loading Skeletons, Error Retry, Empty States, and List */}
        <AdminOrderList
          orders={filteredOrders}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          expandedIds={expandedIds}
          updatingId={updatingId}
          onRetry={() => fetchOrders(statusFilter, 0, false)}
          onClearSearch={() => setSearchQuery('')}
          onToggleExpand={toggleCardExpand}
          onOpenReplyModal={handleOpenReplyModal}
          onPromptCancel={handlePromptCancel}
        />

        {/* Pagination on Completed Tab */}
        {statusFilter === 'COMPLETED' && totalPages > 1 && (
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Showing {filteredOrders.length} of {totalElements} delivered orders (Page {currentPage + 1} of {totalPages})
            </div>
            {currentPage + 1 < totalPages && (
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => fetchOrders(statusFilter, currentPage + 1, true)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 24px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  minHeight: '44px',
                }}
              >
                {loadingMore ? 'Loading more...' : 'Load More Delivered Orders'}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Cancel Order Confirmation Dialog */}
      <OrderCancelModal
        isOpen={cancelModal.isOpen}
        order={cancelModal.order}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModal({ isOpen: false, order: null })}
      />

      {/* Reply & WhatsApp Notification BottomSheet */}
      <OrderReplyModal
        isOpen={replyModal.isOpen}
        order={replyModal.order}
        targetStatus={replyModal.targetStatus}
        deliveryTime={replyModal.deliveryTime}
        messageText={replyModal.messageText}
        updating={updatingId === replyModal.order?.id}
        onDeliveryTimeChange={handleDeliveryTimeChange}
        onMessageTextChange={(text) => setReplyModal((prev) => ({ ...prev, messageText: text }))}
        onResetTemplate={() =>
          setReplyModal((prev) => ({
            ...prev,
            messageText: buildMessageTemplate(prev.targetStatus, prev.order, prev.deliveryTime),
          }))
        }
        onConfirmStatusChange={handleConfirmStatusChange}
        onClose={() =>
          setReplyModal({
            isOpen: false,
            order: null,
            targetStatus: null,
            deliveryTime: '',
            messageText: '',
          })
        }
      />
    </div>
  );
};

export default AdminOrders;
