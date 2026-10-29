import React from 'react';

/**
 * Green Basket - Shared Utility Functions
 * Centralizes duplicate helpers for phone, dates, currency, maps, and status badges.
 */

// Phone number normalization: keep digits only, prefix 91 if 10 digits
export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

// Format date for displays (e.g. "16 Oct, 10:30 pm")
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

// Format full date with year (e.g. "16 Oct 2026, 10:30 pm")
export const formatFullDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

// Format Currency in INR (e.g. "₹45.00" or "₹1,250.00")
export const formatCurrency = (amount, decimals = 2) => {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

// Convert Date object to YYYY-MM-DD
export const toLocalISO = (d) => {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Consistent Status Badge Styles across the entire application
export const getOrderStatusStyle = (status) => {
  switch (status) {
    case 'NEW':
      return {
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
        label: 'New Order',
        icon: '🆕',
      };
    case 'CONFIRMED':
      return {
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
        label: 'Confirmed',
        icon: '✓',
      };
    case 'OUT_FOR_DELIVERY':
      return {
        bg: '#f0f9ff',
        color: '#0369a1',
        border: '#bae6fd',
        label: 'Out for Delivery',
        icon: '🚚',
      };
    case 'DELIVERED':
    case 'COMPLETED':
      return {
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
        label: 'Delivered',
        icon: '📦',
      };
    case 'CANCELLED':
      return {
        bg: '#fef2f2',
        color: '#b91c1c',
        border: '#fecaca',
        label: 'Cancelled',
        icon: '✕',
      };
    default:
      return {
        bg: '#f8fafc',
        color: '#475569',
        border: '#cbd5e1',
        label: status || 'Unknown',
        icon: '•',
      };
  }
};

// Generate Google Maps link
export const buildGoogleMapsUrl = (address, locationUrl = '') => {
  if (locationUrl && locationUrl.trim()) {
    return locationUrl.trim();
  }
  const cleanAddr = address || '';
  const searchAddress = cleanAddr.toLowerCase().includes('nellore')
    ? cleanAddr
    : `${cleanAddr}, Nellore`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchAddress)}`;
};

// Generate WhatsApp chat direct URL
export const buildWhatsAppChatUrl = (phone, message = '') => {
  const norm = normalizePhone(phone);
  if (!norm) return '#';
  return `https://wa.me/${norm}?text=${encodeURIComponent(message)}`;
};

// Highlight matched search text with light yellow background
export const highlightMatch = (text, query) => {
  if (text === null || text === undefined || text === '') return '';
  const str = String(text);
  if (!query || !query.trim()) return str;

  const raw = query.trim();
  const numericCandidate = raw.replace(/^order\s*#?/i, '').replace('#', '').trim();
  const digitsCandidate = raw.replace(/[^0-9]/g, '');

  const candidates = [raw, numericCandidate, digitsCandidate]
    .filter((c) => Boolean(c && (c.length >= 2 || (c.length === 1 && !isNaN(c)))))
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const uniquePatterns = [...new Set(candidates)].sort((a, b) => b.length - a.length);
  if (uniquePatterns.length === 0) return str;

  const regex = new RegExp(`(${uniquePatterns.join('|')})`, 'gi');
  const parts = str.split(regex);
  if (parts.length === 1) return str;

  return parts.map((part, index) => {
    const isMatch = uniquePatterns.some((pattern) =>
      new RegExp(`^${pattern}$`, 'i').test(part)
    );
    if (isMatch) {
      return React.createElement(
        'mark',
        {
          key: index,
          style: {
            backgroundColor: '#fef08a',
            color: 'inherit',
            padding: '1px 3px',
            borderRadius: '3px',
            fontWeight: 'inherit',
          },
        },
        part
      );
    }
    return part;
  });
};

