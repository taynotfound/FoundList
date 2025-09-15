import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

const API_BASE_URL = 'https://foundlistapiburger.taymaerz.de/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        await verifyToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (authToken, retryOnFailure = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsOnline(true);
        return true;
      } else if (response.status === 401) {
        // Token is definitely invalid (unauthorized)
        console.log('Token is invalid, clearing auth');
        await clearAuth();
        return false;
      } else {
        // Server error or other issue - don't clear auth immediately
        console.warn('Token verification failed with status:', response.status);
        setIsOnline(false);
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setIsOnline(false);
      
      // If this is a network error and we have a retry chance, keep the user logged in
      if (retryOnFailure && (error.message.includes('Network') || error.message.includes('fetch'))) {
        console.log('Network error during token verification, keeping user logged in');
        return false; // Don't clear auth on network errors
      }
      
      // For other errors, still don't clear auth immediately - let user try again
      return false;
    }
  };

  const saveAuth = async (authToken, userData) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('authToken', authToken),
        AsyncStorage.setItem('user', JSON.stringify(userData)),
      ]);
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save auth:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('user'),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  };

  const makeApiRequest = async (endpoint, options = {}, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const config = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
          },
        };

        const response = await fetch(url, config);
        
        // Check if response is valid JSON
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // If we can't parse JSON, the server might be restarting
          if (attempt < retries) {
            console.log(`API request attempt ${attempt + 1} failed (invalid response), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error('Server is temporarily unavailable');
        }

        setIsOnline(true);

        if (!response.ok) {
          // Don't retry on authentication errors
          if (response.status === 401) {
            throw new Error(data.error || 'Authentication failed');
          }
          
          // Retry on server errors (5xx) but not client errors (4xx)
          if (response.status >= 500 && attempt < retries) {
            console.log(`API request attempt ${attempt + 1} failed (${response.status}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          
          throw new Error(data.error || 'Request failed');
        }

        return { success: true, data };
      } catch (error) {
        console.error(`API request attempt ${attempt + 1} failed:`, error);
        
        // Check for network errors
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          setIsOnline(false);
          
          if (attempt < retries) {
            console.log(`Network error on attempt ${attempt + 1}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
          
          throw new Error('No internet connection. Changes will sync when you\'re back online.');
        }
        
        // Don't retry on authentication errors
        if (error.message.includes('Authentication failed')) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await makeApiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      await saveAuth(data.token, data.user);

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: `Welcome, ${data.user.name}!`,
      });

      return { success: true, user: data.user };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message,
      });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await makeApiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await saveAuth(data.token, data.user);

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${data.user.name}!`,
      });

      // The TodoContext will automatically trigger sync when isAuthenticated becomes true
      // due to the useEffect dependency on auth?.isAuthenticated

      return { success: true, user: data.user };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token && isOnline) {
        await makeApiRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.warn('Logout request failed, proceeding with local logout:', error);
    } finally {
      await clearAuth();
      
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
      });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await makeApiRequest('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      await saveAuth(token, data.user);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });

      return { success: true, user: data.user };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message,
      });
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await makeApiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully',
      });

      return { success: true };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Password Change Failed',
        text2: error.message,
      });
      throw error;
    }
  };

  const deleteAccount = async (password) => {
    try {
      await makeApiRequest('/auth/me', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });

      await clearAuth();

      Toast.show({
        type: 'info',
        text1: 'Account Deleted',
        text2: 'Your account has been permanently deleted',
      });

      return { success: true };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Account Deletion Failed',
        text2: error.message,
      });
      throw error;
    }
  };

  const syncTodos = async (localTodos, lastSync) => {
    try {
      const { data } = await makeApiRequest('/todos/sync', {
        method: 'POST',
        body: JSON.stringify({ 
          todos: localTodos, 
          lastSync 
        }),
      });

      return { 
        success: true, 
        ...data 
      };
    } catch (error) {
      if (!isOnline) {
        console.log('Offline: sync will retry when online');
        return { success: false, offline: true };
      }
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isOnline,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    syncTodos,
    makeApiRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};