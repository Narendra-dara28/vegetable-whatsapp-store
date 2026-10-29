import React from 'react';
import { Package, Search } from 'lucide-react';
import AdminOrderCard from './AdminOrderCard';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';

/**
 * AdminOrderList - Handles order presentation, loading skeletons, error state, and empty states.
 */
export const AdminOrderList = ({
  orders,
  loading,
  error,
  searchQuery,
  statusFilter,
  expandedIds,
  updatingId,
  onRetry,
  onClearSearch,
  onToggleExpand,
  onOpenReplyModal,
  onPromptCancel,
}) => {
  // 1. Loading Skeletons
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--color-bg-card, #FFFFFF)',
              borderRadius: 'var(--radius-card, 16px)',
              padding: '16px',
              border: '1px solid var(--color-border, #E5E7EB)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '120px', height: '24px', borderRadius: '999px' }} />
              <div className="skeleton-box" style={{ width: '80px', height: '18px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton-box" style={{ width: '60%', height: '18px' }} />
                <div className="skeleton-box" style={{ width: '40%', height: '14px' }} />
              </div>
            </div>
            <div className="skeleton-box" style={{ width: '100%', height: '54px', borderRadius: 'var(--radius-btn, 12px)' }} />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State with Retry
  if (error) {
    return (
      <ErrorRetry
        title="Unable to Load Orders"
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // 3. Empty Search / Status State
  if (orders.length === 0) {
    if (searchQuery && searchQuery.trim()) {
      return (
        <EmptyState
          id="admin-orders-empty-state"
          icon={<Search size={28} strokeWidth={1.75} />}
          title={`No orders found for "${searchQuery.trim()}"`}
          description="Check the spelling or try searching by order ID, customer name, phone number, item name, or area."
          actionLabel="Clear search"
          onAction={onClearSearch}
        />
      );
    }

    const emptyMsg =
      statusFilter === 'ALL'
        ? 'Active customer orders from WhatsApp & Web will appear here in real-time.'
        : statusFilter === 'COMPLETED'
          ? 'No delivered orders found for the selected date range.'
          : `There are currently no orders in "${statusFilter}".`;

    return (
      <EmptyState
        id="admin-orders-empty-state"
        icon={<Package size={28} strokeWidth={1.75} />}
        title="No orders found"
        description={emptyMsg}
      />
    );
  }

  // 4. Orders List
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {orders.map((order) => (
        <AdminOrderCard
          key={order.id}
          order={order}
          isDeliveredTab={statusFilter === 'COMPLETED'}
          isExpanded={expandedIds.has(order.id)}
          onToggleExpand={onToggleExpand}
          searchQuery={searchQuery}
          updatingId={updatingId}
          onOpenReplyModal={onOpenReplyModal}
          onPromptCancel={onPromptCancel}
        />
      ))}
    </div>
  );
};

export default AdminOrderList;
