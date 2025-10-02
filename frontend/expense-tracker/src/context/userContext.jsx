import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear user data and token
  const clearUser = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    delete axiosInstance.defaults.headers.common['Authorization'];
  }, []);

  // Check for existing session on initial load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // If no token, no need to check auth
      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      try {
        // Add a small delay to prevent flash of loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await axiosInstance.get(API_PATHS.AUTH.ME, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (isMounted) {
          if (response.data?.user) {
            setUser(response.data.user);
          } else {
            console.error('Invalid user data received:', response.data);
            clearUser();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          clearUser();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [clearUser]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure email is trimmed and in lowercase
      const trimmedEmail = email.toLowerCase().trim();
      
      const response = await axiosInstance.post(
        API_PATHS.AUTH.LOGIN, 
        { 
          email: trimmedEmail, 
          password: password 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          withCredentials: false // Disable credentials for login
        }
      );
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response format from server');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in context
      setUser(user);
      
      // Set default authorization header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to log in. Please check your credentials and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  // clearUser is already defined above

  const value = {
    user,
    loading,
    error,
    login,
    updateUser,
    clearUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;