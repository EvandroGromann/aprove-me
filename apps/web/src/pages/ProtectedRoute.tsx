import { Navigate, useLocation } from 'react-router-dom';
import { PropsWithChildren, useEffect } from 'react';
import { isTokenExpiringSoon, logout } from '../api/client';

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const location = useLocation();
  
  useEffect(() => {
    if (token && isTokenExpiringSoon(10)) {
      logout('session-expired');
    }
  }, [token]);
  
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  const expiresAtStr = localStorage.getItem('token_expires_at');
  if (expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() >= expiresAt) {
      logout('session-expired');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }
  
  return <>{children}</>;
}
