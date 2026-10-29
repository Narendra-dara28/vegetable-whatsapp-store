import React from 'react';
import SearchBar from '../../components/SearchBar';
import HorizontalScroller from '../../components/HorizontalScroller';
import { Chip } from '../../components/Chip';

/**
 * InventoryFilters - SearchBar, category chip scroller, and stock status filter tabs.
 */
export const InventoryFilters = ({
  searchTerm = '',
  onSearchChange,
  categories = [],
  selectedCategory = 'All',
  onCategorySelect,
  stockFilter = 'All',
  onStockFilterChange,
  totalItems = 0,
  inStockCount = 0,
  outOfStockCount = 0,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #ffffff)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '14px 16px',
        marginBottom: '16px',
        border: '1px solid var(--color-border, #E5E7EB)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Search Input */}
      <SearchBar
        id="admin-products-search"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search products in English or Telugu (టమాటా, Tomato, etc.)..."
      />

      {/* Category Filter Chips */}
      <HorizontalScroller gap="6px" paddingBottom="4px">
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted, #6B7280)', marginRight: '4px', whiteSpace: 'nowrap' }}>
          Category:
        </span>
        {categories.map((cat) => (
          <Chip
            key={cat}
            active={selectedCategory === cat}
            onClick={() => onCategorySelect(cat)}
          >
            {cat}
          </Chip>
        ))}
      </HorizontalScroller>

      {/* Status Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted, #6B7280)', marginRight: '4px' }}>
          Status:
        </span>
        <Chip
          active={stockFilter === 'All'}
          count={totalItems}
          onClick={() => onStockFilterChange('All')}
        >
          All
        </Chip>
        <Chip
          active={stockFilter === 'InStock'}
          count={inStockCount}
          onClick={() => onStockFilterChange('InStock')}
        >
          In Stock Only
        </Chip>
        <Chip
          active={stockFilter === 'OutOfStock'}
          count={outOfStockCount}
          onClick={() => onStockFilterChange('OutOfStock')}
        >
          Sold Out Only
        </Chip>
      </div>
    </div>
  );
};

export default InventoryFilters;
