import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage user authentication state, tokens, and authorization.
 * Synchronizes across tabs using browser localStorage events.
 */
export function useAuth() {
  const navigate = useNavigate();

  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  // Initialize JWT access token
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        setUser(null);
      }
      setToken(localStorage.getItem('token') || null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'admin');

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    logout,
  };
}

