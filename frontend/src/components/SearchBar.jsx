import React from 'react';
import { Search, XCircle } from 'lucide-react';

/**
 * SearchBar - Unified, reusable search input component across customer and admin views.
 * Includes search icon, clear button, escape key listener, and mobile-friendly touch targets.
 */
export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  id = 'app-search-input',
  inputMode = 'search',
  style = {},
  inputStyle = {},
  autoFocus = false,
  ...props
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted, #6B7280)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Search size={18} strokeWidth={1.75} />
      </span>

      <input
        type="text"
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          height: '44px',
          minHeight: '44px',
          paddingLeft: '40px',
          paddingRight: value ? '40px' : '14px',
          borderRadius: 'var(--radius-btn, 12px)',
          border: '1.5px solid var(--color-border, #E5E7EB)',
          backgroundColor: 'var(--color-bg-card, #FFFFFF)',
          fontSize: '16px', // 16px font size prevents iOS zoom
          color: 'var(--color-text-main, #1F2937)',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.03))',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...inputStyle,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary, #16A34A)';
          e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.12)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border, #E5E7EB)';
          e.target.style.boxShadow = 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.03))';
        }}
        {...props}
      />

      {Boolean(value) && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted, #6B7280)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            padding: 0,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-main, #1F2937)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted, #6B7280)')}
        >
          <XCircle size={18} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
