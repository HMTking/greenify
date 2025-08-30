// Custom hook for managing user authentication state and operations
// Handles login, register, logout, profile updates and axios token management

// it returns object containing
// {
//   isAuthenticated,   // Boolean → true if user is logged in
//   user,              // User object (with fields like name, email, role, etc.)
//   token,             // JWT or session token
//   loading,           // Boolean → true if auth request is in progress
//   error,             // Error message (if any)

//   // Functions
//   login,             // Function to log in a user
//   register,          // Function to register a user
//   logout: logoutUser,// Function to log out
//   updateProfile,     // Function to update user profile
//   clearError: clearAuthError, // Function to clear errors
// }

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  loadUser,
  loginUser,
  registerUser,
  updateUserProfile,
  logout,
  setLoading,
  clearError,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading, error } = useSelector((state) => state.auth);
  const hasInitialized = useRef(false);

  // Set axios default header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load user on app start (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (token) {
        dispatch(loadUser());
      } else {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, token]);

  const login = useCallback(async (email, password) => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const register = useCallback(async (name, email, password, role = "customer") => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      await dispatch(registerUser({ name, email, password, role })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const updateProfile = useCallback(async (userData) => {
    try {
      await dispatch(updateUserProfile(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    updateProfile,
    clearError: clearAuthError,
  }), [
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    register,
    logoutUser,
    updateProfile,
    clearAuthError
  ]);
};
