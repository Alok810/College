import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getUserProfile();
        if (response.success) {
          setIsAuthenticated(true);
          setAuthData(response.user);
        }
      } catch {
        // You no longer need the 'error' variable here
        setIsAuthenticated(false);
        setAuthData({});
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    authData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};