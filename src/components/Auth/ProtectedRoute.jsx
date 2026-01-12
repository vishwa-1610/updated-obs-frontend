import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('access');
  // If no token, redirect to Login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;