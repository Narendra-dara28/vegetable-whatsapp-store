import axios from 'axios';
import { FALLBACK_PRODUCTS } from '../utils/fallbackProducts';

const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : '';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
export const VENDOR_WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917569479098';

// Create Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // If not already on the login page, redirect to /admin/login
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract clean error message from API response
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.validationErrors) {
      return Object.values(data.validationErrors).join(', ');
    }
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
  }
  if (error.message) {
    return error.message;
  }
  return fallback;
};

// ==========================================
// Auth API Service
// ==========================================
export const authApi = {
  login: async ({ username, password }) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token, tokenType, username: user, role } = response.data;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify({ username: user, role, tokenType }));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  },

  getToken: () => localStorage.getItem('admin_token'),

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    return Boolean(token && token.trim().length > 0);
  },
};

// ==========================================
// Product API Service
// ==========================================
export const productApi = {
  // Admin Inventory List (all items, including unavailable)
  getAllForAdmin: async () => {
    const response = await api.get('/api/admin/products');
    return response.data;
  },

  // Public Catalog (in-stock only)
  getPublicCatalog: async () => {
    try {
      const response = await api.get('/api/products');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return FALLBACK_PRODUCTS;
    } catch {
      return FALLBACK_PRODUCTS;
    }
  },

  // Add new item
  create: async (productData) => {
    const response = await api.post('/api/admin/products', productData);
    return response.data;
  },

  // Update item details
  update: async (id, productData) => {
    const response = await api.put(`/api/admin/products/${id}`, productData);
    return response.data;
  },

  // Toggle availability (in stock / sold out)
  updateAvailability: async (id, available) => {
    const response = await api.patch(`/api/admin/products/${id}/availability`, { available });
    return response.data;
  },

  // Soft delete item
  delete: async (id) => {
    const response = await api.delete(`/api/admin/products/${id}`);
    return response.data;
  },

  // Morning bulk price update
  bulkUpdatePrices: async (items) => {
    const response = await api.put('/api/admin/products/bulk-price', { items });
    return response.data;
  },
};

// ==========================================
// Order API Service
// ==========================================
export const orderApi = {
  // Public order placement
  createOrder: async ({ customerName, phone, address, locationUrl, items }) => {
    try {
      const response = await api.post('/api/orders', {
        customerName,
        phone,
        address,
        locationUrl,
        items,
      });
      return response.data;
    } catch {
      // Offline fallback: generate clean client order so WhatsApp order message dispatches without error
      const randomId = Math.floor(1000 + Math.random() * 9000);
      return {
        id: randomId,
        orderNumber: `ORD-${randomId}`,
        customerName,
        phone,
        address,
        locationUrl,
        status: 'NEW',
        trackingToken: `trk-${Date.now()}`,
      };
    }
  },

  // Admin order list (with status counts, search, date range, pagination)
  getAllForAdmin: async (params = {}) => {
    const response = await api.get('/api/admin/orders', { params });
    return response.data;
  },

  // Admin update order status (NEW, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/api/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Customer public order tracking (by UUID token)
  trackOrder: async (token) => {
    const response = await api.get(`/api/orders/track/${token}`);
    return response.data;
  },

  // Customer cancel order (before sending on WhatsApp or from order modal)
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/api/orders/${orderId}/cancel`);
    return response.data;
  },
};

// ==========================================
// Settings API Service
// ==========================================
export const settingsApi = {
  // Public route & timing info
  getRouteAndTiming: async () => {
    const response = await api.get('/api/settings/route');
    return response.data;
  },

  // Admin update route & timing
  updateRouteAndTiming: async (value) => {
    const response = await api.put('/api/admin/settings/route', { value });
    return response.data;
  },

  // Public vehicle location
  getVehicleLocation: async () => {
    const response = await api.get('/api/settings/vehicle-location');
    return response.data;
  },

  // Admin update vehicle location
  updateVehicleLocation: async (value) => {
    const response = await api.put('/api/admin/settings/vehicle-location', { value });
    return response.data;
  },
};

// ==========================================
// Cloudinary Image Upload Service
// ==========================================
export const hasCloudinaryConfig = Boolean(
  CLOUD_NAME && UPLOAD_PRESET && CLOUD_NAME.trim() && UPLOAD_PRESET.trim()
);

export const uploadImageToCloudinary = async (file) => {
  if (!hasCloudinaryConfig) {
    throw new Error('Cloudinary credentials are not configured in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData
  );

  return res.data.secure_url;
};

export default api;
