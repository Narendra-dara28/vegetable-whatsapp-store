import React from 'react';
import { ShoppingBasket } from 'lucide-react';
import CustomerProductCard from './CustomerProductCard';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';

/**
 * CustomerProductGrid - Renders product list, loading skeleton cards, error retry card,
 * and empty search results state for the customer catalog.
 */
export const CustomerProductGrid = ({
  loading = false,
  error = '',
  products = [],
  searchTerm = '',
  selectedCategory = 'All',
  onRetry,
  onResetFilters,
  onAddToCart,
  onSoldOutClick,
}) => {
  // 1. Loading State: Skeleton Cards
  if (loading) {
    return (
      <div className="customer-product-grid">
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
              <div className="skeleton-box" style={{ width: '84px', height: '84px', minWidth: '84px', borderRadius: 'var(--radius-btn, 12px)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton-box" style={{ width: '80%', height: '18px' }} />
                <div className="skeleton-box" style={{ width: '50%', height: '14px' }} />
                <div className="skeleton-box" style={{ width: '60px', height: '18px', borderRadius: '999px', marginTop: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-border, #E5E7EB)' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '22px' }} />
              <div className="skeleton-box" style={{ width: '80px', height: '44px', borderRadius: 'var(--radius-btn, 12px)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (error) {
    return (
      <ErrorRetry
        title="Unable to Load Catalog"
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // 3. Empty Search Result
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBasket size={28} strokeWidth={1.75} />}
        title="No items found"
        description={`We couldn't find any produce matching "${searchTerm || selectedCategory}".`}
        actionLabel="Show All Items"
        onAction={onResetFilters}
      />
    );
  }

  // 4. Products Grid
  return (
    <div className="customer-product-grid">
      {products.map((product) => (
        <CustomerProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onSoldOutClick={onSoldOutClick}
        />
      ))}
    </div>
  );
};

export default CustomerProductGrid;
