import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_PATHS } from '../utils/apiPaths';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Set the default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data
        const response = await axios.get(API_PATHS.AUTH.GET_USER_INFO);
        setUser(response.data);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      await axios.post(API_PATHS.AUTH.REGISTER, userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
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

export default AuthContext;
