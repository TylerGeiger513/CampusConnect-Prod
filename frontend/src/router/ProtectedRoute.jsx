import React from 'react';
import { Navigate } from 'react-router-dom';
import useUser from '../hooks/useUser';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  // If no user is authenticated, redirect to the landing page
  if (!user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
