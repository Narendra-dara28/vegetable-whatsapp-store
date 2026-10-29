import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBasket, XCircle } from 'lucide-react';
import { authApi, getErrorMessage } from '../services/api';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected due to expired token
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isExpired ? 'Your session expired. Please log in again.' : '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      await authApi.login({ username: username.trim(), password: password.trim() });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials. Please verify username and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        backgroundColor: 'var(--color-bg-page, #F8FAF5)',
        backgroundImage: 'radial-gradient(rgba(22, 163, 74, 0.12) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-bg-card, #ffffff)',
          borderRadius: 'var(--radius-card, 16px)',
          padding: '28px 20px',
          boxShadow: 'var(--shadow-modal, 0 20px 25px -5px rgba(0, 0, 0, 0.08))',
          border: '1px solid var(--color-border, #E5E7EB)',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-card, 16px)',
              background: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)',
              marginBottom: '14px',
            }}
          >
            <ShoppingBasket size={28} strokeWidth={1.75} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)', letterSpacing: '-0.02em' }}>
            Green Basket Owner Login
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #6B7280)', marginTop: '4px' }}>
            Manage daily rates, inventory &amp; orders
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-btn, 12px)',
              color: '#991b1b',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <XCircle size={16} strokeWidth={1.75} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#334155',
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: '#16a34a',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '13px',
              fontSize: '1rem',
              borderRadius: '12px',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing In...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
