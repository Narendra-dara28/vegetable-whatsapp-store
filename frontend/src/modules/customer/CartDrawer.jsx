import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  ShoppingBasket,
  XCircle,
  Plus,
  Minus,
  Trash2,
  MapPin,
  User,
  Phone,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderApi, getErrorMessage, VENDOR_WHATSAPP_NUMBER } from '../../services/api';
import LocationPickerModal from './LocationPickerModal';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

export const CartDrawer = ({ isOpen, onClose, onOrderSuccess, products = [] }) => {
  const { cart = {}, removeFromCart, updateQuantity, clearCart } = useCart();

  // Compute cart items by matching product catalog (Single source of truth)
  const cartItems = useMemo(() => {
    const list = [];
    if (!products || !products.length || !cart) return list;
    Object.entries(cart).forEach(([idStr, qty]) => {
      const prod = products.find((p) => Number(p.id) === Number(idStr));
      if (prod && qty > 0) {
        list.push({
          product: prod,
          quantity: qty,
          subtotal: (Number(prod.price) * qty).toFixed(2),
        });
      }
    });
    return list;
  }, [cart, products]);

  const safeCartItems = cartItems || [];

  const clientEstimatedTotal = useMemo(() => {
    return cartItems
      .reduce((sum, item) => sum + Number(item.subtotal), 0)
      .toFixed(2);
  }, [cartItems]);


  // Remove Item Confirmation State
  const [itemToRemove, setItemToRemove] = useState(null);

  // Saved Delivery Address State (Swiggy pattern: loaded from localStorage)
  const [savedAddress, setSavedAddress] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load saved address on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('greenbasket_saved_address');
      if (stored) {
        setSavedAddress(JSON.parse(stored));
      } else {
        // Fallback: check profile name & phone if existed previously
        const profile =
          localStorage.getItem('greenbasket_customer') ||
          localStorage.getItem('freshbasket_customer');
        if (profile) {
          const parsed = JSON.parse(profile);
          if (parsed.name && parsed.phone) {
            setSavedAddress({
              name: parsed.name,
              phone: parsed.phone,
              fullAddress: '',
              lat: null,
              lng: null,
              locationUrl: '',
              tag: 'House',
              deliveryInstruction: '',
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  // Handle Order on WhatsApp - Proceed to WhatsApp confirmation modal
  // Note: Order is NOT saved in DB here. It is created only when customer clicks
  // "Send Order on WhatsApp" inside the confirmation modal.
  const handleOrderOnWhatsApp = () => {
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    // Swiggy pattern validation: Must have saved address with name & phone
    if (!savedAddress || !savedAddress.name?.trim() || !savedAddress.phone?.trim()) {
      setIsLocationModalOpen(true);
      return;
    }

    if (!savedAddress.fullAddress?.trim() && !savedAddress.lat) {
      setIsLocationModalOpen(true);
      return;
    }

    const effectiveAddress =
      savedAddress.fullAddress ||
      `Pin Location: (${savedAddress.lat?.toFixed(5)}, ${savedAddress.lng?.toFixed(5)})`;
    const effectiveLocationUrl =
      savedAddress.locationUrl ||
      (savedAddress.lat && savedAddress.lng
        ? `https://maps.google.com/?q=${savedAddress.lat},${savedAddress.lng}`
        : '');

    // 1. Prepare Order payload for Spring Boot backend
    const payload = {
      customerName: savedAddress.name.trim(),
      phone: savedAddress.phone.trim(),
      address: effectiveAddress,
      locationUrl: effectiveLocationUrl,
      items: cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        quantity: quantity,
      })),
    };

    // 2. Close the cart drawer
    onClose();

    // 3. Trigger WhatsApp confirmation modal with draft data
    if (onOrderSuccess) {
      onOrderSuccess({
        payload,
        cartItems: [...cartItems],
        savedAddress,
        effectiveLocationUrl,
        total: clientEstimatedTotal,
        itemCount: cartItems.length,
      });
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            backgroundColor: 'var(--color-bg-card, #FFFFFF)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-modal, 0 -10px 30px rgba(0,0,0,0.2))',
            boxSizing: 'border-box',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Drag Handle for Bottom Sheet */}
          <div
            style={{
              padding: '10px 0 4px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-border, #E5E7EB)',
              }}
            />
          </div>

          {/* Drawer Header */}
          <div
            style={{
              padding: '12px var(--page-padding, 16px) 14px var(--page-padding, 16px)',
              borderBottom: '1px solid var(--color-border, #E5E7EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-card, #FFFFFF)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                  color: 'var(--color-primary-dark, #166534)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingCart size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-title, 18px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
                  Your Vegetable Cart
                </h2>
                <p style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', margin: '2px 0 0 0' }}>
                  {safeCartItems.length} item{safeCartItems.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                minWidth: '44px',
                minHeight: '44px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted, #6B7280)',
                padding: 0,
              }}
              aria-label="Close cart"
            >
              <XCircle size={20} strokeWidth={1.75} />
            </button>
          </div>

          {/* Drawer Content (Scrollable - ONLY ITEMS) */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--status-cancelled-bg, #FEE2E2)',
                  border: '1px solid var(--status-cancelled-border, #FECACA)',
                  color: 'var(--status-cancelled, #DC2626)',
                  borderRadius: 'var(--radius-btn, 12px)',
                  fontSize: 'var(--font-size-body-sm, 14px)',
                  fontWeight: 'var(--font-weight-bold, 700)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <XCircle size={16} strokeWidth={1.75} />
                <span>{error}</span>
              </div>
            )}

            {safeCartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--color-text-muted, #6B7280)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-primary, #16A34A)' }}>
                  <ShoppingBasket size={24} strokeWidth={1.75} />
                </div>
                <p style={{ fontWeight: 'var(--font-weight-heavy, 800)', fontSize: 'var(--font-size-title, 18px)', color: 'var(--color-text-main, #1F2937)' }}>
                  Your cart is empty
                </p>
                <p style={{ fontSize: 'var(--font-size-body-sm, 14px)', marginTop: '4px' }}>
                  Add fresh vegetables and fruits from the catalog to place an order.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px', paddingBottom: '12px' }}>
                {/* Item Rows */}
                {safeCartItems.map(({ product, quantity, subtotal }) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-card, 16px)',
                      backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                      border: '1px solid var(--color-border, #E5E7EB)',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-btn, 12px)',
                        backgroundColor: '#FFFFFF',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border, #E5E7EB)',
                      }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ShoppingBasket size={20} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
                      )}
                    </div>

                    {/* Name and unit */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: 'var(--font-size-body-sm, 14px)',
                          fontWeight: 'var(--font-weight-bold, 700)',
                          color: 'var(--color-text-main, #1F2937)',
                          lineHeight: 1.25,
                          wordBreak: 'break-word',
                          margin: 0,
                        }}
                      >
                        {product.name}
                      </h4>
                      <p style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', margin: '2px 0 0 0' }}>
                        ₹{product.price} / {product.unit}
                      </p>
                    </div>

                    {/* Stepper with 44px min tap height */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-border, #E5E7EB)',
                        borderRadius: 'var(--radius-btn, 12px)',
                        overflow: 'hidden',
                        minHeight: '44px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity === 1) {
                            setItemToRemove(product);
                          } else {
                            updateQuantity(product.id, quantity - 1);
                          }
                        }}
                        style={{
                          minWidth: '44px',
                          minHeight: '44px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-primary, #16A34A)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} strokeWidth={1.75} />
                      </button>
                      <span
                        style={{
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: 'var(--font-size-body-sm, 14px)',
                          fontWeight: 'var(--font-weight-heavy, 800)',
                          color: 'var(--color-text-main, #1F2937)',
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        style={{
                          minWidth: '44px',
                          minHeight: '44px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-primary, #16A34A)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} strokeWidth={1.75} />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div style={{ textAlign: 'right', minWidth: '70px' }}>
                      <div style={{ fontSize: 'var(--font-size-body, 15px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-primary-dark, #166534)' }}>
                        ₹{subtotal}
                      </div>
                      <button
                        type="button"
                        onClick={() => setItemToRemove(product)}
                        style={{
                          minHeight: '44px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--status-cancelled, #DC2626)',
                          fontSize: 'var(--font-size-xs, 12px)',
                          fontWeight: 'var(--font-weight-bold, 700)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px',
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= FIXED DELIVERY ADDRESS & CHECKOUT FOOTER ================= */}
          {cartItems.length > 0 && (
            <div
              style={{
                borderTop: '1px solid var(--color-border, #E5E7EB)',
                backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                padding: '12px var(--page-padding, 16px) calc(16px + env(safe-area-inset-bottom, 0px)) var(--page-padding, 16px)',
                flexShrink: 0,
                boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Delivery Address Card (Fixed above Total & WhatsApp Button) */}
              {!savedAddress ? (
                /* Case 1: First-time User */
                <div
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                    border: '1.5px dashed var(--color-primary, #16A34A)',
                    borderRadius: 'var(--radius-card, 16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-primary, #16A34A)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--color-border, #BBF7D0)',
                      }}
                    >
                      <MapPin size={18} strokeWidth={1.75} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-size-body-sm, 14px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)' }}>
                        Delivery Address Needed
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', marginTop: '2px' }}>
                        Add location for doorstep delivery
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    style={{
                      minHeight: '36px',
                      padding: '6px 14px',
                      backgroundColor: 'var(--color-primary, #16A34A)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-btn, 12px)',
                      fontSize: 'var(--font-size-xs, 12px)',
                      fontWeight: 'var(--font-weight-bold, 700)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                /* Case 2: Returning User / Saved Address Card (Image 1) */
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-bg-card, #FFFFFF)',
                    border: '1.5px solid var(--color-border, #BBF7D0)',
                    borderRadius: 'var(--radius-card, 16px)',
                    boxShadow: 'var(--shadow-card, 0 3px 10px rgba(22, 163, 74, 0.06))',
                    marginBottom: '10px',
                  }}
                >
                  {/* Header with Tag and Change Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs, 12px)',
                          fontWeight: 'var(--font-weight-heavy, 800)',
                          backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                          color: 'var(--color-primary-dark, #166534)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-btn, 12px)',
                          border: '1px solid var(--color-border, #BBF7D0)',
                          letterSpacing: '0.04em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <MapPin size={15} strokeWidth={1.75} />
                        <span>{(savedAddress.tag || 'House').toUpperCase()}</span>
                      </span>
                      <span style={{ fontSize: 'var(--font-size-xs, 12px)', fontWeight: 'var(--font-weight-bold, 700)', color: 'var(--color-text-muted, #6B7280)' }}>
                        Delivery Address
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      style={{
                        minHeight: '34px',
                        backgroundColor: 'var(--color-bg-page, #F8FAF5)',
                        border: '1px solid var(--color-border, #E5E7EB)',
                        color: 'var(--color-primary, #16A34A)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-btn, 12px)',
                        fontSize: 'var(--font-size-xs, 12px)',
                        fontWeight: 'var(--font-weight-bold, 700)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      CHANGE
                    </button>
                  </div>

                  {/* Full Address String */}
                  <div
                    style={{
                      fontSize: 'var(--font-size-body-sm, 14px)',
                      fontWeight: 'var(--font-weight-bold, 700)',
                      color: 'var(--color-text-main, #1F2937)',
                      lineHeight: 1.35,
                      marginBottom: '6px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={savedAddress.fullAddress}
                  >
                    {savedAddress.fullAddress}
                  </div>

                  {/* Receiver Contact */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: 'var(--font-size-xs, 12px)',
                      color: 'var(--color-text-muted, #6B7280)',
                      marginBottom: savedAddress.deliveryInstruction || savedAddress.locationUrl ? '6px' : '0',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={15} strokeWidth={1.75} />
                      {savedAddress.name}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={15} strokeWidth={1.75} />
                      +91 {savedAddress.phone}
                    </span>
                  </div>

                  {/* Optional Delivery Instruction */}
                  {savedAddress.deliveryInstruction && (
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs, 12px)',
                        color: 'var(--status-confirmed, #2563EB)',
                        backgroundColor: 'var(--status-confirmed-bg, #DBEAFE)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-btn, 12px)',
                        border: '1px solid var(--status-confirmed-border, #BFDBFE)',
                        marginBottom: savedAddress.locationUrl ? '6px' : '0',
                      }}
                    >
                      {savedAddress.deliveryInstruction}
                    </div>
                  )}

                  {/* Google Maps Pin Saved Badge */}
                  {savedAddress.locationUrl && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-xs, 12px)',
                        color: 'var(--color-primary-dark, #166534)',
                        backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-badge, 9999px)',
                        border: '1px solid var(--color-border, #BBF7D0)',
                      }}
                    >
                      <MapPin size={14} strokeWidth={1.75} />
                      <span>Exact Map Pin Attached</span>
                      <a
                        href={savedAddress.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--color-primary, #16A34A)',
                          fontWeight: 'var(--font-weight-bold, 700)',
                          marginLeft: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          textDecoration: 'none',
                        }}
                      >
                        View <ExternalLink size={14} strokeWidth={1.75} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Total Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-body-sm, 14px)', color: 'var(--color-text-muted, #6B7280)', fontWeight: 'var(--font-weight-bold, 700)' }}>
                  Estimated Total
                </span>
                <span style={{ fontSize: 'var(--font-size-xl, 24px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-primary-dark, #166534)' }}>
                  ₹{clientEstimatedTotal}
                </span>
              </div>

              {/* Action Button */}
              <Button
                variant="whatsapp"
                fullWidth
                isLoading={submitting}
                icon={MessageCircle}
                onClick={handleOrderOnWhatsApp}
                style={{
                  minHeight: '48px',
                  fontSize: 'var(--font-size-body-lg, 16px)',
                  fontWeight: 'var(--font-weight-bold, 700)',
                }}
              >
                Order on WhatsApp
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mount LocationPickerModal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSaveAddress={(newAddr) => {
          setSavedAddress(newAddr);
          setError('');
        }}
        initialAddress={savedAddress}
      />
      {/* Remove Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        title="Remove Item from Cart?"
        message={`Are you sure you want to remove "${itemToRemove?.name}" from your cart?`}
        confirmText="Yes, Remove Item"
        cancelText="Cancel"
        type="danger"
        zIndex={2200}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(itemToRemove.id);
            setItemToRemove(null);
          }
        }}
        onCancel={() => setItemToRemove(null)}
      />

      {/* Network Error Toast inside Cart */}
      {error && (
        <Toast
          message={error}
          type="error"
          title="Order Error"
          onClose={() => setError('')}
        />
      )}
    </>
  );
};

export default CartDrawer;
