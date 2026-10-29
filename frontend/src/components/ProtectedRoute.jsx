import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
