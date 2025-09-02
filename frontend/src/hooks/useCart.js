import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadCart,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  optimisticUpdateQuantity,
  setItemLoading,
  clearError,
  clearCart as clearCartLocal,
} from '../store/slices/cartSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error, itemLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useAuth();
  const debounceTimers = useRef({});

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadCart());
    } else {
      dispatch(clearCartLocal());
    }
  }, [isAuthenticated, dispatch]);

  const loadCartData = useCallback(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const addToCart = useCallback(async (plantId, quantity = 1) => {
    dispatch(clearError());
    try {
      const result = await dispatch(addToCartAction({ plantId, quantity })).unwrap();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const updateCartItem = useCallback(async (plantId, quantity, showLoading = true) => {
    dispatch(optimisticUpdateQuantity({ plantId, quantity }));
    
    if (showLoading) {
      dispatch(setItemLoading({ plantId, loading: true }));
    }

    dispatch(clearError());

    try {
      await dispatch(updateCartItemAction({ plantId, quantity })).unwrap();
      return { success: true };
    } catch (error) {
      dispatch(loadCart());
      return { success: false, message: error };
    } finally {
      if (showLoading) {
        dispatch(setItemLoading({ plantId, loading: false }));
      }
    }
  }, [dispatch]);

  const removeFromCart = useCallback(async (plantId) => {
    dispatch(clearError());
    try {
      await dispatch(removeFromCartAction(plantId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const clearCart = useCallback(async () => {
    try {
      await dispatch(clearCartAction()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  }, [dispatch]);

  const getCartItemsCount = useCallback(() => items.length, [items.length]);

  const updateCartItemDebounced = useCallback((plantId, quantity) => {
    if (debounceTimers.current[plantId]) {
      clearTimeout(debounceTimers.current[plantId]);
    }

    dispatch(optimisticUpdateQuantity({ plantId, quantity }));

    debounceTimers.current[plantId] = setTimeout(() => {
      updateCartItem(plantId, quantity, false);
    }, 500);
  }, [updateCartItem, dispatch]);

  const clearCartError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    items,
    total,
    loading,
    error,
    itemLoading,
    addToCart,
    updateCartItem,
    updateCartItemDebounced,
    removeFromCart,
    clearCart,
    loadCart: loadCartData,
    getCartItemsCount,
    clearError: clearCartError,
  };
};
