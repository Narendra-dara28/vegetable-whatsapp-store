import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';

/**
 * AdminProductGrid - Handles loading skeletons, error retry, empty states, and product cards grid.
 */
export const AdminProductGrid = ({
  products,
  loading,
  error,
  searchTerm,
  selectedCategory,
  draftPrices,
  togglingIds,
  onRetry,
  onResetFilters,
  onPriceChange,
  onToggleAvailability,
  onEdit,
  onDeactivate,
  onRemoveProduct,
}) => {
  // 1. Loading Skeletons
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--color-bg-card, #FFFFFF)',
              borderRadius: 'var(--radius-card, 16px)',
              padding: '14px',
              border: '1px solid var(--color-border, #E5E7EB)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                className="skeleton-box"
                style={{
                  width: '64px',
                  height: '64px',
                  minWidth: '64px',
                  borderRadius: 'var(--radius-btn, 12px)',
                }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton-box" style={{ width: '75%', height: '18px' }} />
                <div className="skeleton-box" style={{ width: '50%', height: '14px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State with Retry
  if (error) {
    return (
      <ErrorRetry
        title="Failed to Load Inventory"
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // 3. Empty Search / Filter State
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Search size={28} strokeWidth={1.75} />}
        title="No products found"
        description={`No products match "${searchTerm || selectedCategory}". Try clearing your search or filter.`}
        actionLabel="Reset Filters"
        onAction={onResetFilters}
      />
    );
  }

  // 4. Products Grid
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '14px',
      }}
    >
      {products.map((product) => {
        const draftPrice = draftPrices[product.id];
        const isModified =
          draftPrice !== undefined &&
          parseFloat(draftPrice) !== parseFloat(product.price);

        return (
          <ProductCard
            key={product.id}
            product={product}
            currentPrice={draftPrice}
            isModified={isModified}
            onPriceChange={onPriceChange}
            onToggleAvailability={onToggleAvailability}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onRemoveProduct={onRemoveProduct}
            isToggling={togglingIds?.has(product.id)}
          />
        );
      })}
    </div>
  );
};

export default AdminProductGrid;
