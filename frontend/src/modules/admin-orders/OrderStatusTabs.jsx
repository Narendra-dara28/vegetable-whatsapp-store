import React from 'react';
import HorizontalScroller from '../../components/HorizontalScroller';
import { Chip } from '../../components/Chip';

/**
 * OrderStatusTabs - Horizontal scroller containing all order status tabs with real-time badge counts
 */
export const OrderStatusTabs = ({
  statusFilter = 'ALL',
  onTabChange,
  statusCounts = {},
}) => {
  const tabs = [
    { key: 'ALL', label: 'All', count: statusCounts.ALL ?? 0 },
    { key: 'NEW', label: 'New', count: statusCounts.NEW ?? 0 },
    { key: 'CONFIRMED', label: 'Confirmed', count: statusCounts.CONFIRMED ?? 0 },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: statusCounts.OUT_FOR_DELIVERY ?? 0 },
    { key: 'CANCELLED', label: 'Cancelled', count: statusCounts.CANCELLED ?? 0 },
    { key: 'COMPLETED', label: 'Delivered', count: statusCounts.COMPLETED ?? 0 },
  ];

  return (
    <HorizontalScroller style={{ marginBottom: '10px' }}>
      {tabs.map((tab) => (
        <Chip
          key={tab.key}
          active={statusFilter === tab.key}
          onClick={() => onTabChange(tab.key)}
          count={tab.count}
        >
          {tab.label}
        </Chip>
      ))}
    </HorizontalScroller>
  );
};

export default OrderStatusTabs;
