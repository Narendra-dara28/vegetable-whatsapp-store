import React from 'react';

/**
 * Shared Button Component
 * Mobile-first with minimum 44px touch target height
 * Variants: 'primary' | 'outline' | 'danger' | 'whatsapp' | 'text'
 */
export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  onClick,
  style = {},
  className = '',
  size = 'md',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-primary, #16A34A)',
          border: '1.5px solid var(--color-primary, #16A34A)',
          boxShadow: 'none',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--status-cancelled, #DC2626)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
        };
      case 'whatsapp':
        return {
          backgroundColor: 'var(--color-whatsapp, #25D366)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: 'var(--shadow-btn-whatsapp, 0 2px 8px rgba(37, 211, 102, 0.28))',
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted, #6B7280)',
          border: 'none',
          boxShadow: 'none',
          padding: '8px 12px',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary, #16A34A)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: 'var(--shadow-btn-primary, 0 2px 8px rgba(22, 163, 74, 0.25))',
        };
    }
  };

  const baseStyles = {
    minHeight: '44px',
    borderRadius: 'var(--radius-btn, 12px)',
    padding: variant === 'text' ? '8px 12px' : '10px 18px',
    fontSize: 'var(--font-size-body-sm, 14px)',
    fontWeight: 'var(--font-weight-semibold, 600)',
    fontFamily: 'inherit',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    touchAction: 'manipulation',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={baseStyles}
      className={`btn-base ${className}`}
      {...props}
    >
      {isLoading ? (
        <span
          className="spinner"
          style={{
            width: '18px',
            height: '18px',
            borderWidth: '2px',
            borderTopColor: variant === 'outline' || variant === 'text' ? 'var(--color-primary)' : '#ffffff',
          }}
        />
      ) : (
        <>
          {Icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {React.isValidElement(Icon)
                ? Icon
                : React.createElement(Icon, { size: 20, strokeWidth: 1.75 })}
            </span>
          )}
          {typeof children === 'string' || typeof children === 'number' ? (
            <span>{children}</span>
          ) : (
            children
          )}
          {IconRight && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {React.isValidElement(IconRight)
                ? IconRight
                : React.createElement(IconRight, { size: 16, strokeWidth: 1.75 })}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
