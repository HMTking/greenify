import { useEffect, useRef } from 'react';
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

  const login = async (email, password) => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const register = async (name, email, password, role = "customer") => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const result = await dispatch(registerUser({ name, email, password, role })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const updateProfile = async (userData) => {
    try {
      await dispatch(updateUserProfile(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
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
  };
};
