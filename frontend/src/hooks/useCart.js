// object:
// return {
/*
STATE VALUES returned by useCart:
---------------------------------------------------
- items: Array → List of all products currently in the shopping cart
- total: Number → Total price of all items in the cart
- loading: Boolean → Whether the cart is being loaded/updated
- error: String | null → Error message if any operation fails
- itemLoading: Object → Tracks loading state of individual cart items


FUNCTIONS returned by useCart:
---------------------------------------------------

1. addToCart(plantId , quantity)
   - Adds a product to the cart.
   - If product already exists, increases its quantity.
   - Returns { success: Boolean, message: String }

2. updateCartItem(plantId, quantity, showLoading)
   - Updates the quantity of a specific product.
   - Uses optimistic update → UI changes immediately.
   - If API call fails, cart reloads to revert change.
   - Returns { success: Boolean, message?: String }

3. updateCartItemDebounced(plantId, quantity)
   - Updates product quantity with a 500ms debounce (wait).
   - Prevents multiple rapid API calls.
   - UI is still updated immediately (optimistic update).
   - No return (fire-and-forget style).

4. removeFromCart(plantId)
   - Removes a product from the cart.
   - Returns { success: Boolean, message?: String }

5. clearCart()
   - Removes all products from the cart.
   - Returns { success: Boolean, message?: String }

6. loadCart()
   - Fetches the latest cart data from the backend.
   - Useful after login or page refresh.
   - No return (just refreshes state).

7. getCartItemsCount()
   - Returns the number of unique products in the cart (not total quantity).

8. clearError()
   - Clears any error messages stored in the cart state.
   - No return.
*/

// };


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
