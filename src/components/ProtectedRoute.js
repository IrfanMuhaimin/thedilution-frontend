import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // 1. If not logged in at all, go to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. If account is inactive, FREEZE the UI. 
  // We return null here so that the logic in App.js takes over 
  // and renders the InactiveAccountOverlay.
  if (user.status === 'inactive') {
    return null; 
  }

  // 3. If account is active but needs onboarding, force complete-profile
  if (user.isFirstLogin && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  // 4. Otherwise, proceed to the requested page
  return children;
}

export default ProtectedRoute;