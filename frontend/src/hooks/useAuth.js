// Enhanced authentication hook with comprehensive user management and better error handling
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { StorageUtils, ErrorUtils } from '../utils/helpers';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';
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
    api.defaults.headers.common["Authorization"] = token 
      ? `Bearer ${token}` 
      : delete api.defaults.headers.common["Authorization"];
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

  /**
   * Login user with enhanced error handling
   */
  const login = useCallback(async (email, password) => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // Store auth data in localStorage
      StorageUtils.setAuthToken(result.token);
      StorageUtils.setItem(STORAGE_KEYS.USER, result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  /**
   * Register new user with enhanced validation
   */
  const register = useCallback(async (name, email, password, role = "customer") => {
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const result = await dispatch(registerUser({ name, email, password, role })).unwrap();
      
      // Store auth data in localStorage
      StorageUtils.setAuthToken(result.token);
      StorageUtils.setItem(STORAGE_KEYS.USER, result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  /**
   * Logout user and cleanup
   */
  const logoutUser = useCallback(() => {
    // Clear stored auth data
    StorageUtils.removeAuthToken();
    StorageUtils.removeItem(STORAGE_KEYS.USER);
    StorageUtils.removeItem(STORAGE_KEYS.CART);
    
    dispatch(logout());
    
    // Redirect to home page if on protected routes
    if (window.location.pathname.includes('/admin') || 
        window.location.pathname.includes('/profile') ||
        window.location.pathname.includes('/orders')) {
      window.location.href = '/';
    }
  }, [dispatch]);

  /**
   * Clear authentication errors
   */
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      const result = await dispatch(updateUserProfile(userData)).unwrap();
      
      // Update stored user data
      StorageUtils.setItem(STORAGE_KEYS.USER, result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = ErrorUtils.getErrorMessage(error);
      return { success: false, message: errorMessage };
    }
  }, [dispatch]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return user && user.role === role;
  }, [user]);

  /**
   * Check if user is admin
   */
  const isAdmin = useMemo(() => {
    return hasRole(USER_ROLES.ADMIN);
  }, [hasRole]);

  /**
   * Check if user is customer
   */
  const isCustomer = useMemo(() => {
    return hasRole(USER_ROLES.CUSTOMER);
  }, [hasRole]);

  /**
   * Get user display name
   */
  const displayName = useMemo(() => {
    if (!user) return '';
    return user.name || user.email || 'User';
  }, [user]);

  /**
   * Get user initials for avatar
   */
  const userInitials = useMemo(() => {
    if (!user || !user.name) return '';
    
    const names = user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return names[0].charAt(0).toUpperCase() + 
           names[names.length - 1].charAt(0).toUpperCase();
  }, [user]);

  /**
   * Check if user has complete profile
   */
  const hasCompleteProfile = useMemo(() => {
    if (!user) return false;
    
    const requiredFields = ['name', 'email'];
    return requiredFields.every(field => user[field] && user[field].trim() !== '');
  }, [user]);

  /**
   * Check if user has address saved
   */
  const hasAddress = useMemo(() => {
    if (!user || !user.address) return false;
    
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'phone'];
    return requiredAddressFields.every(field => 
      user.address[field] && user.address[field].trim() !== ''
    );
  }, [user]);

  /**
   * Get auth status with detailed info
   */
  const authStatus = useMemo(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (isAuthenticated && user) return 'authenticated';
    return 'unauthenticated';
  }, [loading, error, isAuthenticated, user]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Authentication state
    isAuthenticated,
    user,
    token,
    loading,
    error,
    authStatus,
    
    // User info
    displayName,
    userInitials,
    isAdmin,
    isCustomer,
    hasCompleteProfile,
    hasAddress,
    
    // Methods
    login,
    register,
    logout: logoutUser,
    updateProfile,
    clearError: clearAuthError,
    hasRole,
  }), [
    isAuthenticated,
    user,
    token,
    loading,
    error,
    authStatus,
    displayName,
    userInitials,
    isAdmin,
    isCustomer,
    hasCompleteProfile,
    hasAddress,
    login,
    register,
    logoutUser,
    updateProfile,
    clearAuthError,
    hasRole,
  ]);
};
