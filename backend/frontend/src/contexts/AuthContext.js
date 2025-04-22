// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { verifyAuth, logoutUser } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await verifyAuth();
        if (data && data.user) {
          setUser(data.user);
          setError(null);
        } else {
          setUser(null);
          setError('Invalid authentication data');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setUser(null);
        setError(error.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    if (userData && userData.userid) {
      setUser(userData);
      setError(null);
    } else {
      setError('Invalid user data');
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.message || 'Logout failed');
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
