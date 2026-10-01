import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token') || 'token-1');
  const [loading, setLoading] = useState(true);
  const [switchableUsers, setSwitchableUsers] = useState([]);

  // Fetch current user details
  const fetchUser = async (userId = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/me?user_id=${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all personas for easy demo switching
  const fetchSwitchable = async () => {
    try {
      const res = await api.get('/auth/switchable-users');
      setSwitchableUsers(res.data);
    } catch (err) {
      console.error('Failed to load switchable personas', err);
    }
  };

  useEffect(() => {
    fetchUser(1);
    fetchSwitchable();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('skillswap_token', res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('skillswap_token', res.data.token);
      fetchSwitchable();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    // Default back to visitor or student 1
    fetchUser(1);
  };

  const switchUser = async (userId) => {
    await fetchUser(userId);
    setToken(`token-${userId}`);
    localStorage.setItem('skillswap_token', `token-${userId}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        logout,
        switchUser,
        refreshUser: () => fetchUser(user?.id || 1),
        switchableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
