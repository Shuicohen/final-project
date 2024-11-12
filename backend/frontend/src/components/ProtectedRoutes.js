// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;