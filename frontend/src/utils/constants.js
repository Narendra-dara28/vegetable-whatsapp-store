/**
 * Green Basket - Shared Application Constants
 * Single source of truth for categories, order statuses, date presets, and storage keys.
 */

export const CATEGORIES = {
  ALL: 'All',
  VEGETABLES: 'Vegetables',
  FRUITS: 'Fruits',
  LEAFY_GREENS: 'Leafy Greens',
  EXOTIC: 'Exotic',
  HERBS_SPICES: 'Herbs & Spices',
};

export const DEFAULT_CATEGORY_LIST = [
  CATEGORIES.VEGETABLES,
  CATEGORIES.FRUITS,
  CATEGORIES.LEAFY_GREENS,
  CATEGORIES.EXOTIC,
  CATEGORIES.HERBS_SPICES,
];

export const ORDER_STATUS = {
  ALL: 'ALL',
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.ALL]: 'All',
  [ORDER_STATUS.NEW]: 'New',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.COMPLETED]: 'Delivered',
};

export const DATE_PRESETS = {
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  PAST_7_DAYS: 'PAST_7_DAYS',
  PAST_30_DAYS: 'PAST_30_DAYS',
  CUSTOM: 'CUSTOM',
};

export const STORAGE_KEYS = {
  RECENT_ORDERS: 'greenbasket_recent_orders',
  SAVED_ADDRESS: 'greenbasket_saved_address',
  ADMIN_NEW_ORDERS_COUNT: 'admin_new_orders_count',
  SAVED_CUSTOMER: 'greenbasket_customer',
};
