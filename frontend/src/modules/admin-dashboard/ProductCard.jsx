import React from 'react';
import { ShoppingBasket, Pencil, Trash2 } from 'lucide-react';
import { CategoryTag } from '../../components/Chip';
import { DeleteButton } from '../../components/DeleteButton';
import { productApi } from '../../services/api';

export const ProductCard = ({
  product,
  currentPrice,
  isModified,
  onPriceChange,
  onToggleAvailability,
  onEdit,
  onRemoveProduct,
  isToggling,
}) => {
  const isAvailable = Boolean(product.available);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-card, #FFFFFF)',
        borderRadius: 'var(--radius-card, 16px)',
        padding: '14px',
        border: isModified
          ? '2px solid var(--color-accent, #F97316)'
          : '1px solid var(--color-border, #E5E7EB)',
        boxShadow: isModified
          ? '0 4px 14px rgba(249, 115, 22, 0.18)'
          : 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'all 0.2s ease',
        opacity: isAvailable ? 1 : 0.52,
        filter: isAvailable ? 'none' : 'grayscale(40%)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner: Unsaved Changes Badge */}
      {isModified && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '12px',
            backgroundColor: 'var(--color-accent, #F97316)',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 'var(--font-weight-bold, 700)',
            padding: '2px 10px',
            borderRadius: 'var(--radius-badge, 9999px)',
            boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 2,
          }}
        >
          <Pencil size={12} strokeWidth={1.75} />
          <span>Unsaved Price</span>
        </div>
      )}

      {/* Main Row: Thumbnail + Info */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Product Image Thumbnail */}
        <div
          style={{
            width: '64px',
            height: '64px',
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

        {/* Product Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
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
            <CategoryTag category={product.category} />
          </div>

          {/* Telugu / Local Name */}
          {product.nameLocal && (
            <p
              style={{
                fontSize: 'var(--font-size-body-sm, 14px)',
                color: 'var(--color-primary-dark, #166534)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                fontFamily: 'var(--font-family-telugu, inherit)',
                margin: '2px 0 4px 0',
                lineHeight: 1.25,
              }}
            >
              {product.nameLocal}
            </p>
          )}

          <span style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)' }}>
            Unit: <strong>{product.unit}</strong>
          </span>
        </div>
      </div>

      {/* Price Edit & Availability Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border, #E5E7EB)',
          flexWrap: 'wrap',
        }}
      >
        {/* Large Editable Price Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1', minWidth: '150px' }}>
          <span style={{ fontSize: 'var(--font-size-title, 18px)', fontWeight: 'var(--font-weight-heavy, 800)', color: 'var(--color-text-main, #1F2937)' }}>
            ₹
          </span>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={currentPrice !== undefined ? currentPrice : product.price}
              onChange={(e) => onPriceChange(product.id, e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '8px 10px',
                fontSize: '18px',
                fontWeight: '800',
                color: isModified ? 'var(--color-accent, #F97316)' : 'var(--color-text-main, #1F2937)',
                backgroundColor: isModified ? 'var(--color-accent-light, #FFEDD5)' : 'var(--color-bg-page, #F8FAF5)',
                border: isModified
                  ? '1.5px solid var(--color-accent, #F97316)'
                  : '1px solid var(--color-border, #E5E7EB)',
                borderRadius: 'var(--radius-input, 12px)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              title="Edit daily price with numeric keyboard"
            />
          </div>
          <span style={{ fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted, #6B7280)', whiteSpace: 'nowrap' }}>
            / {product.unit}
          </span>
        </div>

        {/* Stock Availability Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => onToggleAvailability(product.id, isAvailable)}
            disabled={isToggling}
            style={{
              minHeight: '44px',
              padding: '6px 14px',
              fontSize: 'var(--font-size-xs, 12px)',
              fontWeight: 'var(--font-weight-bold, 700)',
              borderRadius: 'var(--radius-badge, 9999px)',
              border: `1.5px solid ${isAvailable ? 'var(--stock-in-border, #BBF7D0)' : 'var(--stock-out-border, #FECACA)'
                }`,
              cursor: isToggling ? 'wait' : 'pointer',
              backgroundColor: isAvailable
                ? 'var(--stock-in-bg, #DCFCE7)'
                : 'var(--stock-out-bg, #FEE2E2)',
              color: isAvailable
                ? 'var(--stock-in-text, #166534)'
                : 'var(--stock-out-text, #991B1B)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              touchAction: 'manipulation',
              transition: 'all 0.15s ease',
              boxShadow: isAvailable
                ? '0 1px 3px rgba(22, 163, 74, 0.12)'
                : '0 1px 3px rgba(220, 38, 38, 0.12)',
            }}
            title={isAvailable ? 'Click to mark Sold Out' : 'Click to mark In Stock'}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isAvailable
                  ? 'var(--color-primary, #16A34A)'
                  : 'var(--status-cancelled, #DC2626)',
                boxShadow: isAvailable
                  ? '0 0 6px rgba(22, 163, 74, 0.4)'
                  : '0 0 6px rgba(220, 38, 38, 0.4)',
              }}
            />
            <span>{isToggling ? 'Updating...' : isAvailable ? 'In Stock' : 'Sold Out'}</span>
          </button>
        </div>
      </div>

      {/* Action Footer: Edit Details & Deactivate */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => onEdit(product)}
          style={{
            minHeight: '44px',
            background: 'none',
            border: 'none',
            color: 'var(--status-confirmed, #2563EB)',
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-btn, 12px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            touchAction: 'manipulation',
          }}
        >
          <Pencil size={16} strokeWidth={1.75} />
          <span>Edit Details</span>
        </button>

        <DeleteButton
          itemName={product.name}
          confirmTitle="Remove Product"
          confirmMessage={`Are you sure you want to remove "${product.name}"? It will be permanently removed from your catalog.`}
          confirmText="Yes, Remove Product"
          buttonText="Remove"
          onDelete={async () => {
            await productApi.delete(product.id);
          }}
          onSuccess={() => {
            if (onRemoveProduct) {
              onRemoveProduct(product.id);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProductCard;
