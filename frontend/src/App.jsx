import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerCatalog from './pages/CustomerCatalog';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Public Catalog & Cart */}
          <Route path="/" element={<CustomerCatalog />} />

          {/* Customer Public Order Tracking via Secure Token */}
          <Route path="/order/:token" element={<OrderTrackingPage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Dashboard (Prices & Inventory) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Orders Management */}
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to public catalog */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </NotificationProvider>
  );
}

export default App;
