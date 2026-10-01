import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { role, isAuthenticated, user } = useApp();
  const location = useLocation();

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const effectiveRole = user.role || role;

  // Strictly prevent unauthorized role access:
  // Do not allow a farmer to access buyer/admin pages, or a buyer to access farmer/admin pages
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    const dashboardPath =
      effectiveRole === 'farmer'
        ? '/farmer/dashboard'
        : effectiveRole === 'buyer'
        ? '/buyer/dashboard'
        : '/admin/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};
