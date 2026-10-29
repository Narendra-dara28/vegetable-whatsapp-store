import React from 'react';
import { ShoppingBasket, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CategoryTag } from '../../components/Chip';

export const CustomerProductCard = ({ product, onAddToCart, onSoldOutClick }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const quantity = cart[product.id] || 0;

  const isSoldOut = !product.available;

  const handleIncrement = () => {
    if (isSoldOut) {
      onSoldOutClick?.(product);
      return;
    }
    addToCart(product.id, 1);
    onAddToCart?.(product);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '14px',
        border: '1px solid var(--color-border, #E5E7EB)',
        boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        opacity: isSoldOut ? 0.6 : 1,
        transition: 'all 0.15s ease',
        boxSizing: 'border-box',
      }}
    >
      {/* Thumbnail + Details Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            minWidth: '84px',
            minHeight: '84px',
            borderRadius: 'var(--radius-btn, 12px)',
            backgroundColor: 'var(--color-bg-page, #F8FAF5)',
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid var(--color-border, #E5E7EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            <ShoppingBasket size={24} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
          )}
        </div>

        {/* Name & Local Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: 'var(--font-size-body-lg, 16px)',
                fontWeight: 'var(--font-weight-bold, 700)',
                color: 'var(--color-text-main, #1F2937)',
                lineHeight: 1.25,
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {product.name}
            </h3>
          </div>

          {/* Telugu Script Name in Muted Text */}
          {product.nameLocal && (
            <p
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-text-muted, #6B7280)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                fontFamily: 'var(--font-family-telugu, inherit)',
                marginTop: '2px',
                marginBottom: 0,
                lineHeight: 1.25,
              }}
            >
              {product.nameLocal}
            </p>
          )}

          <div style={{ marginTop: '6px' }}>
            <CategoryTag category={product.category} />
          </div>
        </div>
      </div>

      {/* Price & Quantity Stepper Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 'var(--font-size-title, 18px)',
              fontWeight: 'var(--font-weight-heavy, 800)',
              color: 'var(--color-primary-dark, #166534)',
            }}
          >
            ₹{product.price}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs, 12px)',
              color: 'var(--color-text-muted, #6B7280)',
              marginLeft: '4px',
            }}
          >
            / {product.unit}
          </span>
        </div>

        <div>
          {isSoldOut ? (
            <span
              onClick={() => onSoldOutClick?.(product)}
              role="button"
              style={{
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: 'var(--font-weight-bold, 700)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-btn, 12px)',
                backgroundColor: 'var(--stock-out-bg, #FEE2E2)',
                color: 'var(--stock-out-text, #991B1B)',
                border: '1px solid var(--stock-out-border, #FECACA)',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '44px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              Sold Out
            </span>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={handleIncrement}
              style={{
                minHeight: '44px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-btn, 12px)',
                border: 'none',
                backgroundColor: 'var(--color-primary, #16A34A)',
                color: '#FFFFFF',
                fontSize: 'var(--font-size-body-sm, 14px)',
                fontWeight: 'var(--font-weight-bold, 700)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-btn-primary, 0 2px 6px rgba(22, 163, 74, 0.25))',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} strokeWidth={1.75} />
              <span>Add</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                border: '1.5px solid var(--color-primary, #16A34A)',
                borderRadius: 'var(--radius-btn, 12px)',
                overflow: 'hidden',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={handleDecrement}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary, #16A34A)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  touchAction: 'manipulation',
                }}
                aria-label="Decrease quantity"
              >
                <Minus size={16} strokeWidth={1.75} />
              </button>
              <span
                style={{
                  minWidth: '28px',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-body, 15px)',
                  fontWeight: 'var(--font-weight-heavy, 800)',
                  color: 'var(--color-primary-dark, #166534)',
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary, #16A34A)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  touchAction: 'manipulation',
                }}
                aria-label="Increase quantity"
              >
                <Plus size={16} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProductCard;
