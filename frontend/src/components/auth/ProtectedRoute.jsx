import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-400">Verifying student credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user hasn't completed multi-step onboarding, redirect to onboarding
  if (requireOnboarded && user && user.is_onboarded === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
