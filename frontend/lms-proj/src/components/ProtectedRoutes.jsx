// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (roles && !hasRole(roles)) {
    // Logged in but lacks required role
    return <Navigate to="/modules" replace />; // or a "Not Authorized" page
  }

  return children;
};

export default ProtectedRoute;
