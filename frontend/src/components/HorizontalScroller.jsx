import React from 'react';

/**
 * HorizontalScroller - Unified horizontal scrolling container for chips, tabs, and filters.
 * Ensures consistent touch scrolling, hidden scrollbars, and touch padding across all screens.
 */
export const HorizontalScroller = ({
  children,
  gap = '8px',
  paddingBottom = '6px',
  style = {},
  className = '',
  ...props
}) => {
  return (
    <div
      className={`horizontal-scroller ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap,
        overflowX: 'auto',
        paddingBottom,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default HorizontalScroller;
