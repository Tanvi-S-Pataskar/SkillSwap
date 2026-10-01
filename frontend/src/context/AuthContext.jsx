import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);
  const [switchableUsers, setSwitchableUsers] = useState([]);

  // Verify and fetch current logged in student
  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('skillswap_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
      setToken(savedToken);
    } catch (err) {
      console.warn('Session expired or invalid token:', err?.response?.data?.detail || err.message);
      localStorage.removeItem('skillswap_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch demo switchable personas
  const fetchSwitchable = async () => {
    try {
      const res = await api.get('/auth/switchable-users');
      setSwitchableUsers(res.data);
    } catch (err) {
      console.error('Failed to load switchable personas', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchSwitchable();
  }, []);

  // Login handler
  const login = async (emailOrUsername, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', {
        email: emailOrUsername,
        password,
        remember_me: rememberMe,
      });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('skillswap_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: jwtToken, user: newUser } = res.data;
      localStorage.setItem('skillswap_token', jwtToken);
      setToken(jwtToken);
      setUser(newUser);
      fetchSwitchable();
      return { success: true, user: newUser };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Please check your inputs.';
      return { success: false, error: errorMsg };
    }
  };

  // Complete onboarding
  const completeOnboarding = async (onboardingData) => {
    try {
      const res = await api.post('/auth/onboarding', onboardingData);
      setUser(res.data.user);
      return { success: true, user: res.data.user, message: res.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save onboarding details.';
      return { success: false, error: errorMsg };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Failed to process request.' };
    }
  };

  // Check username availability
  const checkUsername = async (username) => {
    try {
      const res = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
      return res.data;
    } catch (err) {
      return { available: false, message: 'Could not verify username' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
  };

  // Fast switch for demo testing
  const switchUser = async (userObjOrEmail) => {
    const email = typeof userObjOrEmail === 'string' ? userObjOrEmail : userObjOrEmail.email;
    return await login(email, 'demo123', true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        completeOnboarding,
        forgotPassword,
        checkUsername,
        logout,
        switchUser,
        refreshUser: fetchCurrentUser,
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
