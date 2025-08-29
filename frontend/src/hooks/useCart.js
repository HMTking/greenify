import { useEffect, useRef } from 'react';
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

  const loadCartData = async () => {
    dispatch(loadCart());
  };

  const addToCart = async (plantId, quantity = 1) => {
    dispatch(clearError());

    try {
      const result = await dispatch(addToCartAction({ plantId, quantity })).unwrap();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const updateCartItem = async (plantId, quantity, showLoading = true) => {
    // Optimistic update - update UI immediately
    dispatch(optimisticUpdateQuantity({ plantId, quantity }));

    // Set loading for specific item only if requested
    if (showLoading) {
      dispatch(setItemLoading({ plantId, loading: true }));
    }

    dispatch(clearError());

    try {
      await dispatch(updateCartItemAction({ plantId, quantity })).unwrap();
      return { success: true };
    } catch (error) {
      // Revert optimistic update on error by fetching fresh cart data
      dispatch(loadCart());
      return { success: false, message: error };
    } finally {
      // Clear item loading state only if we were showing it
      if (showLoading) {
        dispatch(setItemLoading({ plantId, loading: false }));
      }
    }
  };

  const removeFromCart = async (plantId) => {
    dispatch(clearError());

    try {
      await dispatch(removeFromCartAction(plantId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const clearCart = async () => {
    try {
      await dispatch(clearCartAction()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, message: error };
    }
  };

  const getCartItemsCount = () => {
    return items.length; // Count unique items, not total quantity
  };

  // Debounced update function
  const updateCartItemDebounced = (plantId, quantity) => {
    // Clear existing timer for this item
    if (debounceTimers.current[plantId]) {
      clearTimeout(debounceTimers.current[plantId]);
    }

    // Immediate optimistic update
    dispatch(optimisticUpdateQuantity({ plantId, quantity }));

    // Debounced server update without loading indicators
    debounceTimers.current[plantId] = setTimeout(() => {
      updateCartItem(plantId, quantity, false);
    }, 500); // 500ms delay
  };

  const clearCartError = () => {
    dispatch(clearError());
  };

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
