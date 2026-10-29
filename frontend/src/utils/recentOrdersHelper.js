import { orderApi } from '../services/api';

const STORAGE_KEY = 'greenbasket_recent_orders';

/**
 * Read all stored orders from localStorage
 */
export const getStoredRecentOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Get active orders (excluding DELIVERED and CANCELLED)
 */
export const getActiveRecentOrders = () => {
  return getStoredRecentOrders().filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
};

/**
 * Save or prepend a new order, returning updated active orders for instant UI count
 */
export const saveRecentOrder = (order) => {
  try {
    const current = getStoredRecentOrders();
    const updated = [
      order,
      ...current.filter((o) => o.id !== order.id),
    ].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  } catch {
    return [];
  }
};

/**
 * Remove an order by id (e.g. when order is cancelled before sending)
 */
export const removeRecentOrder = (orderId) => {
  try {
    const current = getStoredRecentOrders();
    const updated = current.filter((o) => o.id !== orderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  } catch {
    return [];
  }
};

/**
 * Live verify stored orders against backend API in parallel and persist latest status
 */
export const syncRecentOrders = async () => {
  const stored = getStoredRecentOrders();
  if (stored.length === 0) {
    return { all: [], active: [] };
  }

  try {
    const results = await Promise.allSettled(
      stored.map((ord) => orderApi.trackOrder(ord.trackingToken || ord.id))
    );

    const liveActive = [];
    const updatedStored = [];

    stored.forEach((ord, index) => {
      const res = results[index];
      if (res.status === 'fulfilled' && res.value) {
        const live = res.value;
        const updated = {
          ...ord,
          status: live.status,
          total: live.estimatedTotal || ord.total,
          itemCount: live.items?.length || ord.itemCount,
        };
        updatedStored.push(updated);
        if (live.status !== 'DELIVERED' && live.status !== 'CANCELLED') {
          liveActive.push(updated);
        }
      } else {
        updatedStored.push(ord);
        if (ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED') {
          liveActive.push(ord);
        }
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStored));
    return { all: updatedStored, active: liveActive };
  } catch {
    return { all: stored, active: getActiveRecentOrders() };
  }
};
